-- Authenticated Google Play RTDN delivery journal and monotonic entitlement
-- reconciliation. Raw purchase tokens and Pub/Sub payloads are never stored.

alter table private.glowletter_play_entitlements
  drop constraint if exists glowletter_play_entitlements_state_check;

alter table private.glowletter_play_entitlements
  add constraint glowletter_play_entitlements_state_check
  check (state in (
    'active',
    'verified_pending_ack',
    'pending',
    'cancelled',
    'consumed',
    'ack_failed',
    'replaced',
    'expired',
    'revoked',
    'on_hold',
    'paused'
  ));

alter table private.glowletter_play_entitlements
  add column if not exists last_rtdn_event_time timestamptz,
  add column if not exists last_rtdn_message_id text,
  add column if not exists last_rtdn_notification_type smallint;

create index if not exists glowletter_play_entitlements_rtdn_time_idx
  on private.glowletter_play_entitlements (last_rtdn_event_time desc)
  where last_rtdn_event_time is not null;

-- A durable pseudonymous claim survives auth.users deletion. It prevents a
-- historical non-consumable token from being attached to a different account
-- after the account-owned entitlement row is removed by ON DELETE CASCADE.
-- The owner marker is SHA-256 of the random Supabase UUID with the same domain
-- used for Play's obfuscatedExternalAccountId; no user UUID is retained here.
create table private.glowletter_play_purchase_token_claims (
  token_hash text primary key
    check (token_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'),
  owner_binding_hash text not null
    check (owner_binding_hash ~ '^[A-Za-z0-9_-]{43}$'),
  package_name text not null
    check (package_name ~ '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$'),
  product_id text not null
    check (product_id ~ '^[A-Za-z0-9._-]{1,128}$'),
  product_type text not null check (product_type in ('subs', 'inapp')),
  first_claimed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  claim_revision bigint not null default 1 check (claim_revision > 0)
);

comment on table private.glowletter_play_purchase_token_claims is
  'Durable HMAC-token tombstones with a one-way account marker. Contains neither raw purchase tokens nor auth user ids.';

alter table private.glowletter_play_purchase_token_claims enable row level security;

create policy "Play token claims are never available to app clients"
  on private.glowletter_play_purchase_token_claims
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table private.glowletter_play_purchase_token_claims
  from public, anon, authenticated;
grant select, insert, update on table private.glowletter_play_purchase_token_claims
  to service_role;

insert into private.glowletter_play_purchase_token_claims (
  token_hash,
  owner_binding_hash,
  package_name,
  product_id,
  product_type,
  first_claimed_at,
  last_seen_at
)
select
  entitlement.token_hash,
  rtrim(
    translate(
      encode(
        extensions.digest(
          convert_to(
            'glowletter/play-account/v1' || chr(10) || lower(entitlement.user_id::text),
            'UTF8'
          ),
          'sha256'
        ),
        'base64'
      ),
      '+/',
      '-_'
    ),
    '='
  ),
  entitlement.package_name,
  entitlement.product_id,
  entitlement.product_type,
  entitlement.first_seen_at,
  entitlement.last_verified_at
from private.glowletter_play_entitlements as entitlement
on conflict (token_hash) do nothing;

create or replace function private.glowletter_guard_play_token_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_owner_hash text;
  claimed_token_hash text;
begin
  expected_owner_hash := rtrim(
    translate(
      encode(
        extensions.digest(
          convert_to(
            'glowletter/play-account/v1' || chr(10) || lower(new.user_id::text),
            'UTF8'
          ),
          'sha256'
        ),
        'base64'
      ),
      '+/',
      '-_'
    ),
    '='
  );

  insert into private.glowletter_play_purchase_token_claims as claim (
    token_hash,
    owner_binding_hash,
    package_name,
    product_id,
    product_type
  ) values (
    new.token_hash,
    expected_owner_hash,
    new.package_name,
    new.product_id,
    new.product_type
  )
  on conflict (token_hash) do update
  set last_seen_at = clock_timestamp(),
      claim_revision = claim.claim_revision + 1
  where claim.owner_binding_hash = excluded.owner_binding_hash
    and claim.package_name = excluded.package_name
    and claim.product_id = excluded.product_id
    and claim.product_type = excluded.product_type
  returning token_hash into claimed_token_hash;

  if claimed_token_hash is null then
    raise exception 'purchase token is permanently bound to another account'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.glowletter_guard_play_token_claim()
  from public, anon, authenticated, service_role;

create trigger glowletter_guard_play_token_claim
before insert or update of token_hash, user_id, package_name, product_id, product_type
on private.glowletter_play_entitlements
for each row execute function private.glowletter_guard_play_token_claim();

create table private.glowletter_play_rtdn_events (
  message_id text primary key
    check (
      char_length(message_id) between 1 and 256
      and message_id !~ '[[:cntrl:]]'
    ),
  payload_hash text not null
    check (payload_hash ~ '^[A-Za-z0-9_-]{43}$'),
  package_name text not null
    check (package_name ~ '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$'),
  event_time timestamptz not null,
  notification_kind text not null
    check (notification_kind in (
      'subscription',
      'one_time_product',
      'voided_purchase',
      'pending_refund_review',
      'test'
    )),
  notification_type smallint,
  token_hash text
    check (
      token_hash is null
      or token_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    ),
  status text not null
    check (status in (
      'processing',
      'completed',
      'unmatched',
      'ignored',
      'retryable',
      'stale',
      'rejected'
    )),
  attempt_count integer not null default 1 check (attempt_count > 0),
  last_error_code text
    check (
      last_error_code is null
      or last_error_code ~ '^[a-z0-9_]{1,64}$'
    ),
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

comment on table private.glowletter_play_rtdn_events is
  'Deduplication journal for authenticated Google Play RTDN. Contains only message metadata and cryptographic hashes.';
comment on column private.glowletter_play_rtdn_events.payload_hash is
  'Unpadded Base64URL SHA-256 of the decoded DeveloperNotification bytes; the payload itself is never persisted.';
comment on column private.glowletter_play_rtdn_events.token_hash is
  'Key-id-prefixed HMAC-SHA256 matching the entitlement journal; never the raw Google purchase token.';

create index glowletter_play_rtdn_events_status_idx
  on private.glowletter_play_rtdn_events (status, updated_at);
create index glowletter_play_rtdn_events_token_idx
  on private.glowletter_play_rtdn_events (token_hash, event_time desc)
  where token_hash is not null;

alter table private.glowletter_play_rtdn_events enable row level security;

create policy "Play RTDN events are never available to app clients"
  on private.glowletter_play_rtdn_events
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table private.glowletter_play_rtdn_events
  from public, anon, authenticated;
grant select, insert, update, delete on table private.glowletter_play_rtdn_events
  to service_role;

create table private.glowletter_play_refund_reviews (
  message_id text primary key
    references private.glowletter_play_rtdn_events(message_id) on delete restrict,
  pending_refund_token_hash text not null
    check (pending_refund_token_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'),
  order_id_hash text not null
    check (order_id_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'),
  account_binding_hash text
    check (
      account_binding_hash is null
      or account_binding_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    ),
  refund_reason smallint not null check (refund_reason > 0),
  encrypted_details text,
  encryption_iv text,
  event_time timestamptz not null,
  review_due_at timestamptz not null,
  status text not null default 'needs_review'
    check (status in ('needs_review', 'reviewed', 'dismissed', 'expired')),
  alert_sent_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (review_due_at > event_time),
  check (
    (
      status = 'needs_review'
      and encrypted_details is not null
      and char_length(encrypted_details) between 32 and 16384
      and encrypted_details ~ '^[A-Za-z0-9_-]+$'
      and encryption_iv is not null
      and encryption_iv ~ '^[A-Za-z0-9_-]{16}$'
      and resolved_at is null
    )
    or (
      status in ('reviewed', 'dismissed', 'expired')
      and encrypted_details is null
      and encryption_iv is null
      and resolved_at is not null
    )
  )
);

comment on table private.glowletter_play_refund_reviews is
  'Private 24-hour chargeback-review queue. Pending token and order id are stored only inside AES-GCM ciphertext; searchable fields are HMACs.';

create index glowletter_play_refund_reviews_due_idx
  on private.glowletter_play_refund_reviews (status, review_due_at)
  where status = 'needs_review';

alter table private.glowletter_play_refund_reviews enable row level security;

create policy "Play refund reviews are never available to app clients"
  on private.glowletter_play_refund_reviews
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table private.glowletter_play_refund_reviews
  from public, anon, authenticated;
grant select, insert, update, delete on table private.glowletter_play_refund_reviews
  to service_role;

create or replace function public.glowletter_begin_play_rtdn_event(
  p_event jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  event_message_id text := btrim(coalesce(p_event->>'message_id', ''));
  event_payload_hash text := btrim(coalesce(p_event->>'payload_hash', ''));
  event_package_name text := btrim(coalesce(p_event->>'package_name', ''));
  event_time_value timestamptz;
  event_kind text := btrim(coalesce(p_event->>'notification_kind', ''));
  event_type smallint;
  event_token_hash text := nullif(btrim(coalesce(p_event->>'token_hash', '')), '');
  recorded private.glowletter_play_rtdn_events%rowtype;
  affected_rows integer;
  checked_at timestamptz := clock_timestamp();
begin
  begin
    event_time_value := (p_event->>'event_time')::timestamptz;
    event_type := nullif(p_event->>'notification_type', '')::smallint;
  exception when others then
    raise exception 'invalid RTDN event fields' using errcode = '22023';
  end;

  if char_length(event_message_id) not between 1 and 256
    or event_message_id ~ '[[:cntrl:]]'
    or event_payload_hash !~ '^[A-Za-z0-9_-]{43}$'
    or event_package_name !~ '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$'
    or event_time_value is null
    or event_kind not in (
      'subscription',
      'one_time_product',
      'voided_purchase',
      'pending_refund_review',
      'test'
    )
    or (
      event_token_hash is not null
      and event_token_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    )
  then
    raise exception 'invalid RTDN event' using errcode = '22023';
  end if;

  insert into private.glowletter_play_rtdn_events (
    message_id,
    payload_hash,
    package_name,
    event_time,
    notification_kind,
    notification_type,
    token_hash,
    status
  ) values (
    event_message_id,
    event_payload_hash,
    event_package_name,
    event_time_value,
    event_kind,
    event_type,
    event_token_hash,
    'processing'
  )
  on conflict (message_id) do nothing;

  get diagnostics affected_rows = row_count;
  if affected_rows = 1 then
    return 'acquired';
  end if;

  select * into recorded
  from private.glowletter_play_rtdn_events
  where message_id = event_message_id
  for update;

  if recorded.payload_hash <> event_payload_hash
    or recorded.package_name <> event_package_name
  then
    return 'payload_mismatch';
  end if;

  if recorded.status in ('completed', 'unmatched', 'ignored', 'stale', 'rejected') then
    return 'duplicate';
  end if;

  if recorded.status = 'processing'
    and recorded.updated_at > checked_at - interval '5 minutes'
  then
    return 'busy';
  end if;

  update private.glowletter_play_rtdn_events
  set status = 'processing',
      attempt_count = attempt_count + 1,
      last_error_code = null,
      updated_at = checked_at,
      completed_at = null
  where message_id = event_message_id;

  return 'acquired';
end;
$$;

create or replace function public.glowletter_get_play_entitlement_for_rtdn(
  p_token_hash text
)
returns table (
  user_id uuid,
  package_name text,
  product_id text,
  product_type text,
  state text,
  subscription_state text,
  expiry_time timestamptz,
  base_plan_id text,
  offer_id text,
  auto_renew_enabled boolean,
  linked_purchase_token_hash text,
  purchase_time timestamptz,
  order_id_hash text,
  purchase_state_code smallint,
  consumption_state_code smallint,
  acknowledgement_state_code smallint,
  is_test_purchase boolean,
  last_rtdn_event_time timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select
    entitlement.user_id,
    entitlement.package_name,
    entitlement.product_id,
    entitlement.product_type,
    entitlement.state,
    entitlement.subscription_state,
    entitlement.expiry_time,
    entitlement.base_plan_id,
    entitlement.offer_id,
    entitlement.auto_renew_enabled,
    entitlement.linked_purchase_token_hash,
    entitlement.purchase_time,
    entitlement.order_id_hash,
    entitlement.purchase_state_code,
    entitlement.consumption_state_code,
    entitlement.acknowledgement_state_code,
    entitlement.is_test_purchase,
    entitlement.last_rtdn_event_time
  from private.glowletter_play_entitlements as entitlement
  where entitlement.token_hash = p_token_hash
  limit 1
$$;

create or replace function public.glowletter_finish_play_rtdn_event(
  p_result jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result_message_id text := btrim(coalesce(p_result->>'message_id', ''));
  result_payload_hash text := btrim(coalesce(p_result->>'payload_hash', ''));
  result_status text := btrim(coalesce(p_result->>'status', ''));
  result_error text := nullif(btrim(coalesce(p_result->>'error_code', '')), '');
  affected_rows integer;
begin
  if result_payload_hash !~ '^[A-Za-z0-9_-]{43}$'
    or result_status not in ('unmatched', 'ignored', 'retryable', 'rejected')
    or (result_error is not null and result_error !~ '^[a-z0-9_]{1,64}$')
  then
    raise exception 'invalid RTDN result' using errcode = '22023';
  end if;

  update private.glowletter_play_rtdn_events
  set status = result_status,
      last_error_code = result_error,
      updated_at = clock_timestamp(),
      completed_at = case
        when result_status = 'retryable' then null
        else clock_timestamp()
      end
  where message_id = result_message_id
    and payload_hash = result_payload_hash
    and status = 'processing';

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

create or replace function public.glowletter_queue_play_refund_review(
  p_review jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  review_message_id text := btrim(coalesce(p_review->>'message_id', ''));
  review_payload_hash text := btrim(coalesce(p_review->>'payload_hash', ''));
  review_token_hash text := btrim(coalesce(p_review->>'pending_refund_token_hash', ''));
  review_order_hash text := btrim(coalesce(p_review->>'order_id_hash', ''));
  review_account_hash text := nullif(btrim(coalesce(p_review->>'account_binding_hash', '')), '');
  review_ciphertext text := btrim(coalesce(p_review->>'encrypted_details', ''));
  review_iv text := btrim(coalesce(p_review->>'encryption_iv', ''));
  review_reason smallint;
  review_event_time timestamptz;
  review_due_at timestamptz;
  event_status text;
  existing private.glowletter_play_refund_reviews%rowtype;
  affected_rows integer;
begin
  begin
    review_reason := (p_review->>'refund_reason')::smallint;
    review_event_time := (p_review->>'event_time')::timestamptz;
    review_due_at := (p_review->>'review_due_at')::timestamptz;
  exception when others then
    raise exception 'invalid pending refund review fields' using errcode = '22023';
  end;

  if review_payload_hash !~ '^[A-Za-z0-9_-]{43}$'
    or review_token_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    or review_order_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    or (
      review_account_hash is not null
      and review_account_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    )
    or review_reason is null
    or review_reason <= 0
    or review_event_time is null
    or review_due_at is null
    or review_due_at <= review_event_time
    or char_length(review_ciphertext) not between 32 and 16384
    or review_ciphertext !~ '^[A-Za-z0-9_-]+$'
    or review_iv !~ '^[A-Za-z0-9_-]{16}$'
  then
    raise exception 'invalid pending refund review' using errcode = '22023';
  end if;

  select rtdn.status into event_status
  from private.glowletter_play_rtdn_events as rtdn
  where rtdn.message_id = review_message_id
    and rtdn.payload_hash = review_payload_hash
  for update;

  if event_status is distinct from 'processing' then
    raise exception 'pending refund review event is not claimed'
      using errcode = '22023';
  end if;

  insert into private.glowletter_play_refund_reviews (
    message_id,
    pending_refund_token_hash,
    order_id_hash,
    account_binding_hash,
    refund_reason,
    encrypted_details,
    encryption_iv,
    event_time,
    review_due_at
  ) values (
    review_message_id,
    review_token_hash,
    review_order_hash,
    review_account_hash,
    review_reason,
    review_ciphertext,
    review_iv,
    review_event_time,
    review_due_at
  )
  on conflict (message_id) do nothing;

  get diagnostics affected_rows = row_count;
  if affected_rows = 1 then
    return 'queued';
  end if;

  select * into existing
  from private.glowletter_play_refund_reviews
  where message_id = review_message_id;

  if existing.pending_refund_token_hash <> review_token_hash
    or existing.order_id_hash <> review_order_hash
    or existing.account_binding_hash is distinct from review_account_hash
    or existing.refund_reason <> review_reason
    or existing.event_time <> review_event_time
    or existing.review_due_at <> review_due_at
  then
    raise exception 'pending refund review replay mismatch'
      using errcode = '22023';
  end if;

  return 'already_queued';
end;
$$;

create or replace function public.glowletter_complete_play_refund_review_alert(
  p_result jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result_message_id text := btrim(coalesce(p_result->>'message_id', ''));
  result_payload_hash text := btrim(coalesce(p_result->>'payload_hash', ''));
  completed_at timestamptz := clock_timestamp();
  affected_rows integer;
begin
  if result_payload_hash !~ '^[A-Za-z0-9_-]{43}$' then
    raise exception 'invalid refund alert result' using errcode = '22023';
  end if;

  update private.glowletter_play_refund_reviews as review
  set alert_sent_at = coalesce(review.alert_sent_at, completed_at),
      updated_at = completed_at
  from private.glowletter_play_rtdn_events as rtdn
  where review.message_id = result_message_id
    and rtdn.message_id = review.message_id
    and rtdn.payload_hash = result_payload_hash
    and rtdn.status = 'processing';

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    return false;
  end if;

  update private.glowletter_play_rtdn_events
  set status = 'completed',
      last_error_code = null,
      updated_at = completed_at,
      completed_at = completed_at
  where message_id = result_message_id
    and payload_hash = result_payload_hash
    and status = 'processing';

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

create or replace function public.glowletter_resolve_play_refund_review(
  p_message_id text,
  p_resolution text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  review_message_id text := btrim(coalesce(p_message_id, ''));
  review_resolution text := lower(btrim(coalesce(p_resolution, '')));
  existing_status text;
  resolved_time timestamptz := clock_timestamp();
  affected_rows integer;
begin
  if char_length(review_message_id) not between 1 and 256
    or review_message_id ~ '[[:cntrl:]]'
    or review_resolution not in ('reviewed', 'dismissed')
  then
    raise exception 'invalid refund review resolution' using errcode = '22023';
  end if;

  update private.glowletter_play_refund_reviews
  set status = review_resolution,
      encrypted_details = null,
      encryption_iv = null,
      resolved_at = resolved_time,
      updated_at = resolved_time
  where message_id = review_message_id
    and status = 'needs_review';

  get diagnostics affected_rows = row_count;
  if affected_rows = 1 then
    return true;
  end if;

  select review.status into existing_status
  from private.glowletter_play_refund_reviews as review
  where review.message_id = review_message_id;

  return existing_status = review_resolution;
end;
$$;

create or replace function public.glowletter_cleanup_play_rtdn()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cleanup_time timestamptz := clock_timestamp();
  expired_reviews integer := 0;
  deleted_reviews integer := 0;
  deleted_events integer := 0;
begin
  -- A missed review remains visible as overdue for seven days. It is then
  -- closed and its decryptable payload is cryptographically shredded.
  update private.glowletter_play_refund_reviews
  set status = 'expired',
      encrypted_details = null,
      encryption_iv = null,
      resolved_at = cleanup_time,
      updated_at = cleanup_time
  where status = 'needs_review'
    and (
      review_due_at < cleanup_time - interval '7 days'
      or created_at < cleanup_time - interval '180 days'
    );
  get diagnostics expired_reviews = row_count;

  -- No encrypted review payload or review metadata survives for 180 days.
  delete from private.glowletter_play_refund_reviews
  where created_at < cleanup_time - interval '180 days';
  get diagnostics deleted_reviews = row_count;

  delete from private.glowletter_play_rtdn_events as old_event
  where old_event.completed_at < cleanup_time - interval '90 days'
    and old_event.status in (
      'completed',
      'unmatched',
      'ignored',
      'stale',
      'rejected'
    )
    and not exists (
      select 1
      from private.glowletter_play_refund_reviews as review
      where review.message_id = old_event.message_id
    );
  get diagnostics deleted_events = row_count;

  return pg_catalog.jsonb_build_object(
    'expired_reviews', expired_reviews,
    'deleted_reviews', deleted_reviews,
    'deleted_events', deleted_events
  );
end;
$$;

create or replace function public.glowletter_apply_play_rtdn_event(
  p_update jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  update_message_id text := btrim(coalesce(p_update->>'message_id', ''));
  update_payload_hash text := btrim(coalesce(p_update->>'payload_hash', ''));
  update_token_hash text := btrim(coalesce(p_update->>'token_hash', ''));
  update_package_name text := btrim(coalesce(p_update->>'package_name', ''));
  update_product_id text := btrim(coalesce(p_update->>'product_id', ''));
  update_product_type text := btrim(coalesce(p_update->>'product_type', ''));
  update_state text := btrim(coalesce(p_update->>'state', ''));
  update_event_time timestamptz;
  update_subscription_state text := nullif(btrim(coalesce(p_update->>'subscription_state', '')), '');
  update_expiry_time timestamptz;
  update_base_plan_id text := nullif(btrim(coalesce(p_update->>'base_plan_id', '')), '');
  update_offer_id text := nullif(btrim(coalesce(p_update->>'offer_id', '')), '');
  update_auto_renew boolean;
  update_linked_hash text := nullif(btrim(coalesce(p_update->>'linked_purchase_token_hash', '')), '');
  update_purchase_time timestamptz;
  update_order_hash text := nullif(btrim(coalesce(p_update->>'order_id_hash', '')), '');
  update_purchase_state smallint;
  update_consumption_state smallint;
  update_acknowledgement_state smallint;
  update_is_test boolean;
  update_notification_type smallint;
  entitlement private.glowletter_play_entitlements%rowtype;
  event_status text;
  processed_at timestamptz := clock_timestamp();
begin
  begin
    update_event_time := (p_update->>'event_time')::timestamptz;
    update_expiry_time := nullif(p_update->>'expiry_time', '')::timestamptz;
    update_purchase_time := nullif(p_update->>'purchase_time', '')::timestamptz;
    update_auto_renew := nullif(p_update->>'auto_renew_enabled', '')::boolean;
    update_purchase_state := nullif(p_update->>'purchase_state_code', '')::smallint;
    update_consumption_state := nullif(p_update->>'consumption_state_code', '')::smallint;
    update_acknowledgement_state := (p_update->>'acknowledgement_state_code')::smallint;
    update_is_test := coalesce((p_update->>'is_test_purchase')::boolean, false);
    update_notification_type := nullif(p_update->>'notification_type', '')::smallint;
  exception when others then
    raise exception 'invalid RTDN entitlement update fields' using errcode = '22023';
  end;

  if update_payload_hash !~ '^[A-Za-z0-9_-]{43}$'
    or update_token_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    or update_event_time is null
    or update_product_type not in ('subs', 'inapp')
    or update_state not in (
      'active',
      'verified_pending_ack',
      'pending',
      'cancelled',
      'consumed',
      'expired',
      'revoked',
      'on_hold',
      'paused'
    )
    or update_acknowledgement_state is null
    or update_acknowledgement_state not between 0 and 1
    or update_purchase_state is null
    or update_purchase_state not between 0 and 2
    or update_consumption_state is null
    or update_consumption_state not between 0 and 1
    or (
      update_linked_hash is not null
      and update_linked_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    )
    or (
      update_order_hash is not null
      and update_order_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    )
  then
    raise exception 'invalid RTDN entitlement update' using errcode = '22023';
  end if;

  select rtdn.status into event_status
  from private.glowletter_play_rtdn_events as rtdn
  where rtdn.message_id = update_message_id
    and rtdn.payload_hash = update_payload_hash
  for update;

  if event_status is null then
    raise exception 'RTDN event claim was not found' using errcode = '22023';
  end if;
  if event_status <> 'processing' then
    return 'duplicate';
  end if;

  select * into entitlement
  from private.glowletter_play_entitlements as current_entitlement
  where current_entitlement.token_hash = update_token_hash
  for update;

  if not found then
    update private.glowletter_play_rtdn_events
    set status = 'unmatched',
        updated_at = processed_at,
        completed_at = processed_at
    where message_id = update_message_id;
    return 'unmatched';
  end if;

  if entitlement.package_name <> update_package_name
    or entitlement.product_id <> update_product_id
    or entitlement.product_type <> update_product_type
  then
    raise exception 'RTDN product does not match entitlement'
      using errcode = '22023';
  end if;

  if entitlement.last_rtdn_event_time is not null
    and update_event_time < entitlement.last_rtdn_event_time
  then
    update private.glowletter_play_rtdn_events
    set status = 'stale',
        updated_at = processed_at,
        completed_at = processed_at
    where message_id = update_message_id;
    return 'stale';
  end if;

  if update_product_type = 'subs'
    and update_state in ('active', 'verified_pending_ack')
    and (update_expiry_time is null or update_expiry_time <= processed_at)
  then
    raise exception 'active RTDN subscription requires future expiry'
      using errcode = '22023';
  end if;

  update private.glowletter_play_entitlements
  set state = update_state,
      subscription_state = update_subscription_state,
      expiry_time = update_expiry_time,
      base_plan_id = update_base_plan_id,
      offer_id = update_offer_id,
      auto_renew_enabled = update_auto_renew,
      linked_purchase_token_hash = coalesce(
        update_linked_hash,
        linked_purchase_token_hash
      ),
      purchase_time = coalesce(purchase_time, update_purchase_time),
      order_id_hash = coalesce(update_order_hash, order_id_hash),
      purchase_state_code = update_purchase_state,
      consumption_state_code = update_consumption_state,
      acknowledgement_state_code = update_acknowledgement_state,
      is_test_purchase = update_is_test,
      first_active_at = coalesce(
        first_active_at,
        case when update_state = 'active' then processed_at else null end
      ),
      acknowledged_at = coalesce(
        acknowledged_at,
        case when update_acknowledgement_state = 1 then processed_at else null end
      ),
      last_verified_at = processed_at,
      last_rtdn_event_time = update_event_time,
      last_rtdn_message_id = update_message_id,
      last_rtdn_notification_type = update_notification_type,
      updated_at = processed_at,
      record_revision = record_revision + 1
  where token_hash = update_token_hash;

  if update_state = 'active'
    and update_acknowledgement_state = 1
    and update_linked_hash is not null
    and update_linked_hash <> update_token_hash
  then
    update private.glowletter_play_entitlements
    set state = 'replaced',
        updated_at = processed_at,
        last_verified_at = processed_at,
        record_revision = record_revision + 1
    where token_hash = update_linked_hash
      and user_id = entitlement.user_id
      and state <> 'replaced';
  end if;

  update private.glowletter_play_rtdn_events
  set status = 'completed',
      last_error_code = null,
      updated_at = processed_at,
      completed_at = processed_at
  where message_id = update_message_id;

  -- Pub/Sub message retention is at most 31 days. Ninety days keeps a safe
  -- dedupe margin while bounding metadata growth.
  delete from private.glowletter_play_rtdn_events as old_event
  where old_event.completed_at < processed_at - interval '90 days'
    and old_event.status in ('completed', 'unmatched', 'ignored', 'stale', 'rejected')
    and not exists (
      select 1
      from private.glowletter_play_refund_reviews as review
      where review.message_id = old_event.message_id
    );

  return 'applied';
end;
$$;

revoke all on function public.glowletter_begin_play_rtdn_event(jsonb)
  from public, anon, authenticated;
revoke all on function public.glowletter_get_play_entitlement_for_rtdn(text)
  from public, anon, authenticated;
revoke all on function public.glowletter_finish_play_rtdn_event(jsonb)
  from public, anon, authenticated;
revoke all on function public.glowletter_queue_play_refund_review(jsonb)
  from public, anon, authenticated;
revoke all on function public.glowletter_complete_play_refund_review_alert(jsonb)
  from public, anon, authenticated;
revoke all on function public.glowletter_resolve_play_refund_review(text, text)
  from public, anon, authenticated;
revoke all on function public.glowletter_cleanup_play_rtdn()
  from public, anon, authenticated;
revoke all on function public.glowletter_apply_play_rtdn_event(jsonb)
  from public, anon, authenticated;

grant execute on function public.glowletter_begin_play_rtdn_event(jsonb)
  to service_role;
grant execute on function public.glowletter_get_play_entitlement_for_rtdn(text)
  to service_role;
grant execute on function public.glowletter_finish_play_rtdn_event(jsonb)
  to service_role;
grant execute on function public.glowletter_queue_play_refund_review(jsonb)
  to service_role;
grant execute on function public.glowletter_complete_play_refund_review_alert(jsonb)
  to service_role;
grant execute on function public.glowletter_resolve_play_refund_review(text, text)
  to service_role;
grant execute on function public.glowletter_cleanup_play_rtdn()
  to service_role;
grant execute on function public.glowletter_apply_play_rtdn_event(jsonb)
  to service_role;

-- pg_cron is installed and owned by the earlier audit-retention migration.
-- This job enforces the refund-review and Pub/Sub journal retention bounds even
-- during periods with no incoming Google Play notifications.
do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-cleanup-play-rtdn'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'glowletter-cleanup-play-rtdn',
    '17 4 * * *',
    $command$select public.glowletter_cleanup_play_rtdn()$command$
  );
end
$migration$;

notify pgrst, 'reload schema';
