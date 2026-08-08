-- Server-authoritative Google Play entitlement journal.
-- Raw purchase tokens, Integrity tokens and Google responses are never stored.

create schema if not exists private;

-- Do not revoke the narrowly restored authenticated USAGE privilege: existing
-- public admin wrappers need it to traverse private guarded functions. This
-- migration grants no app-client table or function access.
grant usage on schema private to service_role;

create table private.glowletter_play_entitlements (
  token_hash text primary key
    check (token_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_name text not null
    check (package_name ~ '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$'),
  product_id text not null
    check (product_id ~ '^[A-Za-z0-9._-]{1,128}$'),
  product_type text not null
    check (product_type in ('subs', 'inapp')),
  state text not null
    check (state in (
      'active',
      'verified_pending_ack',
      'pending',
      'cancelled',
      'consumed',
      'ack_failed',
      'replaced'
    )),
  subscription_state text
    check (subscription_state is null or subscription_state in (
      'SUBSCRIPTION_STATE_PENDING',
      'SUBSCRIPTION_STATE_ACTIVE',
      'SUBSCRIPTION_STATE_PAUSED',
      'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
      'SUBSCRIPTION_STATE_ON_HOLD',
      'SUBSCRIPTION_STATE_CANCELED',
      'SUBSCRIPTION_STATE_EXPIRED',
      'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED'
    )),
  expiry_time timestamptz,
  base_plan_id text,
  offer_id text,
  auto_renew_enabled boolean,
  linked_purchase_token_hash text
    check (
      linked_purchase_token_hash is null
      or linked_purchase_token_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    ),
  purchase_time timestamptz,
  order_id_hash text
    check (
      order_id_hash is null
      or order_id_hash ~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
    ),
  purchase_state_code smallint
    check (purchase_state_code is null or purchase_state_code between 0 and 2),
  consumption_state_code smallint
    check (consumption_state_code is null or consumption_state_code between 0 and 1),
  acknowledgement_state_code smallint not null
    check (acknowledgement_state_code between 0 and 1),
  integrity_verified boolean not null
    check (integrity_verified = true),
  app_version_code bigint not null
    check (app_version_code > 0),
  certificate_sha256_digest text not null
    check (certificate_sha256_digest ~ '^[A-Za-z0-9_-]{43}$'),
  is_test_purchase boolean not null default false,
  first_seen_at timestamptz not null default now(),
  first_active_at timestamptz,
  last_verified_at timestamptz not null default now(),
  last_integrity_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  updated_at timestamptz not null default now(),
  record_revision bigint not null default 1 check (record_revision > 0),
  check (
    (product_type = 'subs' and subscription_state is not null and base_plan_id is not null)
    or
    (product_type = 'inapp' and subscription_state is null and expiry_time is null and base_plan_id is null)
  )
);

comment on table private.glowletter_play_entitlements is
  'HMAC-pseudonymised Google Play verification journal. Raw purchase and Integrity tokens are never persisted.';
comment on column private.glowletter_play_entitlements.token_hash is
  'Key-id-prefixed HMAC-SHA256 of the Google Play purchase token.';
comment on column private.glowletter_play_entitlements.linked_purchase_token_hash is
  'HMAC in the same domain as token_hash, allowing an older replaced entitlement to be revoked atomically.';

create index glowletter_play_entitlements_product_state_idx
  on private.glowletter_play_entitlements (product_id, state, last_verified_at desc);
create index glowletter_play_entitlements_expiry_idx
  on private.glowletter_play_entitlements (expiry_time)
  where expiry_time is not null;
create index glowletter_play_entitlements_linked_token_idx
  on private.glowletter_play_entitlements (linked_purchase_token_hash)
  where linked_purchase_token_hash is not null;
create index glowletter_play_entitlements_user_idx
  on private.glowletter_play_entitlements (user_id, state, last_verified_at desc);

alter table private.glowletter_play_entitlements enable row level security;

create policy "Play entitlements are never available to app clients"
  on private.glowletter_play_entitlements
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table private.glowletter_play_entitlements
  from public, anon, authenticated;
grant select, insert, update on table private.glowletter_play_entitlements
  to service_role;

-- Fixed-window abuse controls run before any Google API call. Network
-- identities are HMAC-pseudonymised by the Edge Function; raw IP addresses are
-- never stored. The global bucket also limits abuse if a forwarding header is
-- absent or manipulated.
create table private.glowletter_play_verification_limits (
  scope text not null check (scope in ('global', 'network')),
  subject_hash text not null,
  bucket_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (scope, subject_hash, bucket_start)
);

alter table private.glowletter_play_verification_limits enable row level security;

create policy "Play verification limits are never available to app clients"
  on private.glowletter_play_verification_limits
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table private.glowletter_play_verification_limits
  from public, anon, authenticated;
grant select, insert, update, delete
  on table private.glowletter_play_verification_limits
  to service_role;

create or replace function public.glowletter_consume_play_verification_quota(
  p_network_hash text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  checked_at timestamptz := clock_timestamp();
  global_bucket timestamptz;
  network_bucket timestamptz;
  global_count integer;
  network_count integer;
begin
  if p_network_hash is null
    or p_network_hash !~ '^[a-z0-9_-]{1,16}\.[A-Za-z0-9_-]{43}$'
  then
    raise exception 'a valid pseudonymous network key is required'
      using errcode = '22023';
  end if;

  global_bucket := date_trunc('minute', checked_at);
  insert into private.glowletter_play_verification_limits as quota (
    scope, subject_hash, bucket_start, request_count, updated_at
  ) values (
    'global', 'all', global_bucket, 1, checked_at
  )
  on conflict (scope, subject_hash, bucket_start) do update
  set request_count = quota.request_count + 1,
      updated_at = checked_at
  returning request_count into global_count;

  if global_count > 120 then
    return false;
  end if;

  network_bucket := to_timestamp(
    floor(extract(epoch from checked_at) / 300) * 300
  );
  insert into private.glowletter_play_verification_limits as quota (
    scope, subject_hash, bucket_start, request_count, updated_at
  ) values (
    'network', p_network_hash, network_bucket, 1, checked_at
  )
  on conflict (scope, subject_hash, bucket_start) do update
  set request_count = quota.request_count + 1,
      updated_at = checked_at
  returning request_count into network_count;

  -- Bound storage without a separate scheduler. Only requests admitted by the
  -- global bucket reach this cleanup.
  delete from private.glowletter_play_verification_limits
  where bucket_start < checked_at - interval '1 day';

  return network_count <= 20;
end;
$$;

revoke all on function public.glowletter_consume_play_verification_quota(text)
  from public, anon, authenticated;
grant execute on function public.glowletter_consume_play_verification_quota(text)
  to service_role;

-- The Edge Function calls this service-role-only RPC through PostgREST. It is
-- deliberately SECURITY INVOKER: the caller must already hold explicit table
-- privileges, and no browser role can execute it.
create or replace function public.glowletter_record_play_entitlement(
  p_token_hash text,
  p_user_id uuid,
  p_package_name text,
  p_product_id text,
  p_product_type text,
  p_state text,
  p_subscription_state text,
  p_expiry_time timestamptz,
  p_base_plan_id text,
  p_offer_id text,
  p_auto_renew_enabled boolean,
  p_linked_purchase_token_hash text,
  p_purchase_time timestamptz,
  p_order_id_hash text,
  p_purchase_state_code smallint,
  p_consumption_state_code smallint,
  p_acknowledgement_state_code smallint,
  p_integrity_verified boolean,
  p_app_version_code bigint,
  p_certificate_sha256_digest text,
  p_is_test_purchase boolean
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recorded_at timestamptz := now();
  affected_rows integer;
begin
  if p_integrity_verified is distinct from true then
    raise exception 'verified Play Integrity evidence is required'
      using errcode = '22023';
  end if;

  if p_product_type = 'subs'
    and p_state in ('active', 'verified_pending_ack')
    and (p_expiry_time is null or p_expiry_time <= recorded_at)
  then
    raise exception 'an active subscription must have a future expiry time'
      using errcode = '22023';
  end if;

  insert into private.glowletter_play_entitlements as entitlement (
    token_hash,
    user_id,
    package_name,
    product_id,
    product_type,
    state,
    subscription_state,
    expiry_time,
    base_plan_id,
    offer_id,
    auto_renew_enabled,
    linked_purchase_token_hash,
    purchase_time,
    order_id_hash,
    purchase_state_code,
    consumption_state_code,
    acknowledgement_state_code,
    integrity_verified,
    app_version_code,
    certificate_sha256_digest,
    is_test_purchase,
    first_active_at,
    acknowledged_at
  ) values (
    p_token_hash,
    p_user_id,
    p_package_name,
    p_product_id,
    p_product_type,
    p_state,
    p_subscription_state,
    p_expiry_time,
    p_base_plan_id,
    p_offer_id,
    p_auto_renew_enabled,
    p_linked_purchase_token_hash,
    p_purchase_time,
    p_order_id_hash,
    p_purchase_state_code,
    p_consumption_state_code,
    p_acknowledgement_state_code,
    p_integrity_verified,
    p_app_version_code,
    p_certificate_sha256_digest,
    coalesce(p_is_test_purchase, false),
    case when p_state = 'active' then recorded_at else null end,
    case when p_acknowledgement_state_code = 1 then recorded_at else null end
  )
  on conflict (token_hash) do update
  set package_name = excluded.package_name,
      product_id = excluded.product_id,
      product_type = excluded.product_type,
      state = excluded.state,
      subscription_state = excluded.subscription_state,
      expiry_time = excluded.expiry_time,
      base_plan_id = excluded.base_plan_id,
      offer_id = excluded.offer_id,
      auto_renew_enabled = excluded.auto_renew_enabled,
      linked_purchase_token_hash = coalesce(
        excluded.linked_purchase_token_hash,
        entitlement.linked_purchase_token_hash
      ),
      purchase_time = coalesce(entitlement.purchase_time, excluded.purchase_time),
      order_id_hash = coalesce(excluded.order_id_hash, entitlement.order_id_hash),
      purchase_state_code = excluded.purchase_state_code,
      consumption_state_code = excluded.consumption_state_code,
      acknowledgement_state_code = excluded.acknowledgement_state_code,
      integrity_verified = excluded.integrity_verified,
      app_version_code = excluded.app_version_code,
      certificate_sha256_digest = excluded.certificate_sha256_digest,
      is_test_purchase = excluded.is_test_purchase,
      first_active_at = coalesce(
        entitlement.first_active_at,
        case when excluded.state = 'active' then recorded_at else null end
      ),
      last_verified_at = recorded_at,
      last_integrity_at = recorded_at,
      acknowledged_at = coalesce(
        entitlement.acknowledged_at,
        case when excluded.acknowledgement_state_code = 1 then recorded_at else null end
      ),
      updated_at = recorded_at,
      record_revision = entitlement.record_revision + 1
  where entitlement.user_id = excluded.user_id;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'purchase token is already bound to another account'
      using errcode = '42501';
  end if;

  -- Google recommends removing access attached to linkedPurchaseToken after
  -- an upgrade, downgrade or re-signup. Do this only after the new purchase is
  -- both active and acknowledged, so an acknowledgement outage cannot revoke
  -- the user's previous valid access prematurely.
  if p_state = 'active'
    and p_acknowledgement_state_code = 1
    and p_linked_purchase_token_hash is not null
    and p_linked_purchase_token_hash <> p_token_hash
  then
    update private.glowletter_play_entitlements
    set state = 'replaced',
        updated_at = recorded_at,
        last_verified_at = recorded_at,
        record_revision = record_revision + 1
    where token_hash = p_linked_purchase_token_hash
      and user_id = p_user_id
      and state <> 'replaced';
  end if;

  return true;
end;
$$;

revoke all on function public.glowletter_record_play_entitlement(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  timestamptz,
  text,
  smallint,
  smallint,
  smallint,
  boolean,
  bigint,
  text,
  boolean
) from public, anon, authenticated;
grant execute on function public.glowletter_record_play_entitlement(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  text,
  text,
  boolean,
  text,
  timestamptz,
  text,
  smallint,
  smallint,
  smallint,
  boolean,
  bigint,
  text,
  boolean
) to service_role;
