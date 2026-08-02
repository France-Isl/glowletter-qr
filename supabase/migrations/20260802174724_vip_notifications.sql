-- Durable in-app notifications for time-limited VIP grants.
-- Messages remain user-owned through RLS and are removed after 180 days.

create table public.glowletter_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'vip_granted'
    check (kind in ('vip_granted')),
  reason text not null default 'gift'
    check (reason in ('gift', 'compensation', 'promotion', 'other')),
  message text
    check (message is null or (char_length(message) between 1 and 240)),
  granted_days integer not null
    check (granted_days between 1 and 365),
  vip_until timestamptz not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (read_at is null or read_at >= created_at)
);

comment on table public.glowletter_notifications is
  'User-owned in-app notifications. App clients may read their rows and update only read_at.';
comment on column public.glowletter_notifications.reason is
  'Language-independent reason key localized by the GlowLetter client.';
comment on column public.glowletter_notifications.message is
  'Optional normalized administrator note. Forbidden content is rejected before storage.';

create index glowletter_notifications_user_created_idx
  on public.glowletter_notifications (user_id, created_at desc);
create index glowletter_notifications_user_unread_idx
  on public.glowletter_notifications (user_id, created_at desc)
  where read_at is null;
create index glowletter_notifications_created_at_idx
  on public.glowletter_notifications (created_at);

alter table public.glowletter_notifications enable row level security;

revoke all on table public.glowletter_notifications from public, anon, authenticated;
grant select on table public.glowletter_notifications to authenticated;
grant update (read_at) on table public.glowletter_notifications to authenticated;
grant select, insert, update, delete on table public.glowletter_notifications to service_role;

create policy "Users can read only their GlowLetter notifications"
  on public.glowletter_notifications
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can mark only their GlowLetter notifications read"
  on public.glowletter_notifications
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- Postgres Changes respects the SELECT policy above, so each authenticated
-- client receives only notifications belonging to its own account.
do $migration$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime'
  ) then
    execute 'create publication supabase_realtime';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'glowletter_notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.glowletter_notifications';
  end if;
end
$migration$;

-- Normalize administrator notes before validation and storage. Control
-- characters are never persisted, repeated whitespace is collapsed, and an
-- empty note becomes NULL.
create or replace function private.glowletter_normalize_notice_message(p_message text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select nullif(
    btrim(
      pg_catalog.regexp_replace(
        pg_catalog.regexp_replace(coalesce(p_message, ''), '[[:cntrl:]]+', ' ', 'g'),
        '[[:space:]]+',
        ' ',
        'g'
      )
    ),
    ''
  );
$$;

create or replace function private.glowletter_notice_message_is_forbidden(p_message text)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  normalized text := pg_catalog.lower(coalesce(p_message, ''));
begin
  normalized := pg_catalog.replace(normalized, 'ё', 'е');
  normalized := pg_catalog.replace(normalized, 'œ', 'oe');
  normalized := pg_catalog.replace(normalized, 'é', 'e');
  normalized := pg_catalog.replace(normalized, 'è', 'e');
  normalized := pg_catalog.replace(normalized, 'ê', 'e');
  normalized := pg_catalog.replace(normalized, 'ë', 'e');
  normalized := pg_catalog.replace(normalized, 'à', 'a');
  normalized := pg_catalog.replace(normalized, 'â', 'a');
  normalized := pg_catalog.replace(normalized, 'ä', 'a');
  normalized := pg_catalog.replace(normalized, 'î', 'i');
  normalized := pg_catalog.replace(normalized, 'ï', 'i');
  normalized := pg_catalog.replace(normalized, 'ô', 'o');
  normalized := pg_catalog.replace(normalized, 'ö', 'o');
  normalized := pg_catalog.replace(normalized, 'ù', 'u');
  normalized := pg_catalog.replace(normalized, 'û', 'u');
  normalized := pg_catalog.replace(normalized, 'ü', 'u');
  normalized := pg_catalog.replace(normalized, 'ç', 'c');

  if normalized ~ '(^|[^0-9])18[[:space:]]*\+($|[^0-9])' then
    return true;
  end if;

  return normalized ~ (
    '(^|[^[:alnum:]_])('
    || 'секс[[:alnum:]_]*|эрот[[:alnum:]_]*|порн[[:alnum:]_]*|поцелу[[:alnum:]_]*|'
    || 'интим[[:alnum:]_]*|обнаж[[:alnum:]_]*|генитал[[:alnum:]_]*|оргазм[[:alnum:]_]*|'
    || 'возбужд[[:alnum:]_]*|мастурб[[:alnum:]_]*|проститу[[:alnum:]_]*|'
    || 'sex|sexe|sexes|sexuel|sexuelle|sexuels|sexuelles|sexual|sexually|sexuality|sexualized|sexting|'
    || 'erotic[[:alnum:]_]*|porn[[:alnum:]_]*|kiss|kisses|kissed|kissing|'
    || 'intimacy|nude|naked|genital[[:alnum:]_]*|orgasm[[:alnum:]_]*|arous[[:alnum:]_]*|'
    || 'masturb[[:alnum:]_]*|prostitut[[:alnum:]_]*|'
    || 'eroti[[:alnum:]_]*|bais(er|e|es|ons|ez|ent|ait|aient)|'
    || 'embrass(er|e|es|ons|ez|ent|ait|aient|ee|ees)|intimite|nudite|'
    || 'orgasme[[:alnum:]_]*|excite[[:alnum:]_]*|prostitu[[:alnum:]_]*'
    || ')($|[^[:alnum:]_])'
  );
end;
$$;

revoke all on function private.glowletter_normalize_notice_message(text) from public, anon, authenticated;
revoke all on function private.glowletter_notice_message_is_forbidden(text) from public, anon, authenticated;

-- This is the single mutation path for all VIP grants. Account update, audit,
-- and notification insert are one PostgreSQL transaction and therefore either
-- all succeed or all roll back.
create or replace function private.glowletter_admin_grant_vip_with_notice(
  p_support_id text,
  p_days integer,
  p_reason text,
  p_message text
)
returns public.glowletter_accounts
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  normalized_reason text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_reason, '')));
  normalized_message text := private.glowletter_normalize_notice_message(p_message);
  previous_until timestamptz;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 365 then
    raise exception 'VIP duration must be between 1 and 365 days' using errcode = '22023';
  end if;
  if normalized_reason not in ('gift', 'compensation', 'promotion', 'other') then
    raise exception 'invalid VIP notification reason' using errcode = '22023';
  end if;
  if normalized_message is not null and pg_catalog.char_length(normalized_message) > 240 then
    raise exception 'VIP notification message must not exceed 240 characters' using errcode = '22023';
  end if;
  if private.glowletter_notice_message_is_forbidden(normalized_message) then
    raise exception 'VIP notification message contains prohibited content' using errcode = '22023';
  end if;

  select account.vip_until
  into previous_until
  from public.glowletter_accounts as account
  where account.support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  update public.glowletter_accounts as account
  set vip_until = now() + pg_catalog.make_interval(days => p_days),
      updated_at = now()
  where account.support_id = normalized_support_id
  returning account.* into result;

  insert into private.glowletter_vip_audit (
    target_user_id,
    target_support_id,
    granted_by,
    action,
    granted_days,
    previous_vip_until,
    new_vip_until
  ) values (
    result.user_id,
    result.support_id,
    actor_id,
    'grant',
    p_days,
    previous_until,
    result.vip_until
  );

  insert into public.glowletter_notifications (
    user_id,
    kind,
    reason,
    message,
    granted_days,
    vip_until
  ) values (
    result.user_id,
    'vip_granted',
    normalized_reason,
    normalized_message,
    p_days,
    result.vip_until
  );

  return result;
end;
$$;

-- Preserve the original two-argument RPC. Existing clients automatically use
-- the same atomic path with a localized generic "gift" notification.
create or replace function private.glowletter_admin_grant_vip(
  p_support_id text,
  p_days integer
)
returns public.glowletter_accounts
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  result public.glowletter_accounts;
begin
  select account.*
  into result
  from private.glowletter_admin_grant_vip_with_notice(
    p_support_id,
    p_days,
    'gift',
    null
  ) as account;

  return result;
end;
$$;

revoke all on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  from public, anon;
revoke all on function private.glowletter_admin_grant_vip(text, integer)
  from public, anon;
grant execute on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  to authenticated, service_role;
grant execute on function private.glowletter_admin_grant_vip(text, integer)
  to authenticated, service_role;

create or replace function public.glowletter_admin_grant_vip_with_notice(
  p_support_id text,
  p_days integer,
  p_reason text,
  p_message text default null
)
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select account.support_id,
         account.is_admin,
         account.premium_forever,
         account.vip_until,
         account.premium_forever or coalesce(account.vip_until > now(), false)
  from private.glowletter_admin_grant_vip_with_notice(
    p_support_id,
    p_days,
    p_reason,
    p_message
  ) as account;
$$;

revoke all on function public.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  from public, anon;
grant execute on function public.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  to authenticated;

-- pg_cron is installed and owned by the earlier audit-retention migration.
-- Re-running its extension bootstrap here can conflict with Supabase-managed
-- grants, so this migration only owns its idempotently replaced cleanup job.

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-notifications'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'glowletter-purge-notifications',
    '41 3 * * *',
    $command$delete from public.glowletter_notifications where created_at < now() - interval '180 days'$command$
  );
end
$migration$;

notify pgrst, 'reload schema';
