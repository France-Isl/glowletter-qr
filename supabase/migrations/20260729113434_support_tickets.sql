-- Private support tickets submitted by signed-in GlowLetter accounts.
-- App clients never receive table privileges; the authenticated Edge Function
-- uses service-role-only RPCs after independently verifying the caller's JWT.

create schema if not exists private;

revoke all on schema private from public, anon;
-- Authenticated keeps schema usage for the pre-existing, tightly granted VIP
-- helpers. Table privileges below still deny all app-client ticket access.
grant usage on schema private to authenticated, service_role;

create table private.glowletter_support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  support_id text not null,
  contact_email varchar(254) not null
    check (
      contact_email = lower(btrim(contact_email))
      and char_length(contact_email) between 3 and 254
      and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  category text not null
    check (category in ('technical', 'account', 'subscription', 'content', 'feedback', 'other')),
  message text not null
    check (
      message = btrim(message)
      and char_length(message) between 20 and 2000
    ),
  language text not null
    check (language in ('ru', 'en', 'fr')),
  platform text not null
    check (platform in ('web', 'android', 'ios')),
  app_version varchar(32) not null
    check (
      char_length(app_version) between 1 and 32
      and app_version ~ '^[A-Za-z0-9][A-Za-z0-9._+ -]{0,31}$'
    ),
  email_attempted_at timestamptz,
  email_sent_at timestamptz,
  email_provider_id varchar(200),
  created_at timestamptz not null default now(),
  check (email_sent_at is null or email_attempted_at is not null)
);

comment on table private.glowletter_support_tickets is
  'Support requests accepted from verified GlowLetter accounts; retained for no longer than six months.';
comment on column private.glowletter_support_tickets.support_id is
  'Server-derived support identifier snapshot; never accepted from the browser payload.';
comment on column private.glowletter_support_tickets.contact_email is
  'Server-derived email from the verified Supabase Auth user.';

create index glowletter_support_tickets_user_created_idx
  on private.glowletter_support_tickets (user_id, created_at desc);
create index glowletter_support_tickets_created_at_idx
  on private.glowletter_support_tickets (created_at);

alter table private.glowletter_support_tickets enable row level security;

revoke all on table private.glowletter_support_tickets from public, anon, authenticated;
grant select, insert, update, delete
  on table private.glowletter_support_tickets to service_role;

create policy "Support tickets are never available to app clients"
  on private.glowletter_support_tickets
  for all
  to authenticated
  using (false)
  with check (false);

create or replace function public.glowletter_create_support_ticket(
  p_user_id uuid,
  p_contact_email text,
  p_category text,
  p_message text,
  p_language text,
  p_platform text,
  p_app_version text
)
returns table (
  ticket_id uuid,
  support_id text,
  created_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(coalesce(p_contact_email, '')));
  normalized_category text := lower(btrim(coalesce(p_category, '')));
  normalized_message text := btrim(coalesce(p_message, ''));
  normalized_language text := lower(btrim(coalesce(p_language, '')));
  normalized_platform text := lower(btrim(coalesce(p_platform, '')));
  normalized_app_version text := btrim(coalesce(p_app_version, ''));
  account_support_id text;
  tickets_last_hour integer;
  tickets_last_day integer;
begin
  if p_user_id is null then
    raise exception 'support_user_required' using errcode = '22023';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(normalized_email) not between 3 and 254 then
    raise exception 'support_email_invalid' using errcode = '22023';
  end if;
  if normalized_category not in ('technical', 'account', 'subscription', 'content', 'feedback', 'other') then
    raise exception 'support_category_invalid' using errcode = '22023';
  end if;
  if char_length(normalized_message) not between 20 and 2000 then
    raise exception 'support_message_invalid' using errcode = '22023';
  end if;
  if normalized_language not in ('ru', 'en', 'fr') then
    raise exception 'support_language_invalid' using errcode = '22023';
  end if;
  if normalized_platform not in ('web', 'android', 'ios') then
    raise exception 'support_platform_invalid' using errcode = '22023';
  end if;
  if char_length(normalized_app_version) not between 1 and 32
     or normalized_app_version !~ '^[A-Za-z0-9][A-Za-z0-9._+ -]{0,31}$' then
    raise exception 'support_app_version_invalid' using errcode = '22023';
  end if;

  select account.support_id
  into account_support_id
  from public.glowletter_accounts as account
  where account.user_id = p_user_id;

  if account_support_id is null then
    raise exception 'support_account_unavailable' using errcode = 'P0002';
  end if;

  -- Serialize submissions for one account so concurrent requests cannot race
  -- past either rolling-window limit.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select count(*) filter (where ticket.created_at > now() - interval '1 hour'),
         count(*)
  into tickets_last_hour, tickets_last_day
  from private.glowletter_support_tickets as ticket
  where ticket.user_id = p_user_id
    and ticket.created_at > now() - interval '1 day';

  if tickets_last_hour >= 3 or tickets_last_day >= 10 then
    raise exception 'support_rate_limited' using errcode = 'P0001';
  end if;

  return query
  insert into private.glowletter_support_tickets as ticket (
    user_id,
    support_id,
    contact_email,
    category,
    message,
    language,
    platform,
    app_version
  ) values (
    p_user_id,
    account_support_id,
    normalized_email,
    normalized_category,
    normalized_message,
    normalized_language,
    normalized_platform,
    normalized_app_version
  )
  returning ticket.id, ticket.support_id, ticket.created_at;
end;
$$;

create or replace function public.glowletter_record_support_email_result(
  p_ticket_id uuid,
  p_email_sent boolean,
  p_provider_id text default null
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  if p_ticket_id is null or p_email_sent is null then
    raise exception 'support_email_result_invalid' using errcode = '22023';
  end if;

  update private.glowletter_support_tickets
  set email_attempted_at = now(),
      email_sent_at = case when p_email_sent then now() else null end,
      email_provider_id = case
        when p_email_sent then left(nullif(btrim(coalesce(p_provider_id, '')), ''), 200)
        else null
      end
  where id = p_ticket_id;

  if not found then
    raise exception 'support_ticket_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.glowletter_create_support_ticket(uuid, text, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.glowletter_record_support_email_result(uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function public.glowletter_create_support_ticket(uuid, text, text, text, text, text, text)
  to service_role;
grant execute on function public.glowletter_record_support_email_result(uuid, boolean, text)
  to service_role;

-- pg_cron is installed and owned by the earlier audit-retention migration.
-- Re-running its extension bootstrap here can conflict with Supabase-managed
-- grants, so this migration only adds its own scheduled cleanup job.

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-support-tickets'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'glowletter-purge-support-tickets',
    '29 3 * * *',
    $command$delete from private.glowletter_support_tickets where created_at < now() - interval '6 months'$command$
  );
end
$migration$;

notify pgrst, 'reload schema';
