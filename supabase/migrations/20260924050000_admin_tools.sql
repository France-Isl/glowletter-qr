-- Admin tools for the owner: an overview with the latest accounts, lookup by
-- e-mail, VIP for everyone at once and a matching mass revoke. Every function
-- checks private.glowletter_is_admin() and writes the same audit rows and
-- in-app notifications as the single-account actions.

-- A single grant now extends the remaining time instead of resetting it, so a
-- second gift never takes days away.
create or replace function private.glowletter_admin_grant_vip_with_notice(
  p_support_id text,
  p_days integer,
  p_reason text,
  p_message text
)
returns public.glowletter_accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text;
  normalized_reason text;
  normalized_message text;
  previous_until timestamptz;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 365 then
    raise exception 'VIP duration must be between 1 and 365 days' using errcode = '22023';
  end if;
  if pg_catalog.octet_length(coalesce(p_message, '')) > 2048 then
    raise exception 'VIP notification message input is too large' using errcode = '22023';
  end if;

  normalized_support_id := pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  normalized_reason := pg_catalog.lower(pg_catalog.btrim(coalesce(p_reason, '')));
  if normalized_reason not in ('gift', 'compensation', 'promotion', 'other') then
    raise exception 'invalid VIP notification reason' using errcode = '22023';
  end if;

  normalized_message := private.glowletter_normalize_notice_message(p_message);
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
  set vip_until = greatest(coalesce(account.vip_until, now()), now()) + pg_catalog.make_interval(days => p_days),
      updated_at = now()
  where account.support_id = normalized_support_id
  returning account.* into result;

  insert into private.glowletter_vip_audit (
    target_user_id, target_support_id, granted_by, action, granted_days, previous_vip_until, new_vip_until
  ) values (
    result.user_id, result.support_id, actor_id, 'grant', p_days, previous_until, result.vip_until
  );

  insert into public.glowletter_notifications (
    user_id, kind, reason, message, granted_days, vip_until
  ) values (
    result.user_id, 'vip_granted', normalized_reason, normalized_message, p_days, result.vip_until
  );

  return result;
end;
$$;

-- Lookup by e-mail: the owner knows addresses, not support IDs.
create or replace function private.glowletter_admin_lookup_by_email(p_email text)
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean,
  created_at timestamptz,
  email text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_email text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
begin
  if (select auth.uid()) is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or pg_catalog.char_length(normalized_email) > 254 then
    raise exception 'invalid e-mail' using errcode = '22023';
  end if;

  return query
  select account.support_id,
         account.is_admin,
         account.premium_forever,
         account.vip_until,
         account.premium_forever or coalesce(account.vip_until > now(), false),
         account.created_at,
         users.email::text
  from public.glowletter_accounts as account
  join auth.users as users on users.id = account.user_id
  where pg_catalog.lower(users.email) = normalized_email;
end;
$$;

revoke all on function private.glowletter_admin_lookup_by_email(text) from public, anon;
grant execute on function private.glowletter_admin_lookup_by_email(text) to authenticated, service_role;

create or replace function public.glowletter_admin_lookup_by_email(p_email text)
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean,
  created_at timestamptz,
  email text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.glowletter_admin_lookup_by_email(p_email);
$$;

revoke all on function public.glowletter_admin_lookup_by_email(text) from public, anon;
grant execute on function public.glowletter_admin_lookup_by_email(text) to authenticated;

-- Overview: counts plus the latest accounts with their plan.
create or replace function private.glowletter_admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if (select auth.uid()) is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'server_now', now(),
    'total', (select count(*) from public.glowletter_accounts),
    'vip_active', (select count(*) from public.glowletter_accounts as a
                   where not a.premium_forever and a.vip_until > now()),
    'forever', (select count(*) from public.glowletter_accounts as a
                where a.premium_forever and not a.is_admin),
    'new_week', (select count(*) from public.glowletter_accounts as a
                 where a.created_at > now() - interval '7 days'),
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'support_id', recent.support_id,
        'email', recent.email,
        'is_admin', recent.is_admin,
        'premium_forever', recent.premium_forever,
        'vip_until', recent.vip_until,
        'premium_active', recent.premium_active,
        'created_at', recent.created_at,
        'last_sign_in_at', recent.last_sign_in_at
      ) order by recent.created_at desc)
      from (
        select account.support_id,
               users.email::text as email,
               account.is_admin,
               account.premium_forever,
               account.vip_until,
               account.premium_forever or coalesce(account.vip_until > now(), false) as premium_active,
               account.created_at,
               users.last_sign_in_at
        from public.glowletter_accounts as account
        join auth.users as users on users.id = account.user_id
        order by account.created_at desc
        limit 30
      ) as recent
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function private.glowletter_admin_overview() from public, anon;
grant execute on function private.glowletter_admin_overview() to authenticated, service_role;

create or replace function public.glowletter_admin_overview()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.glowletter_admin_overview();
$$;

revoke all on function public.glowletter_admin_overview() from public, anon;
grant execute on function public.glowletter_admin_overview() to authenticated;

-- VIP for everyone: every account except admins and lifetime grants gets the
-- days added to whatever time is left. Returns how many accounts were touched.
create or replace function private.glowletter_admin_grant_vip_all(
  p_days integer,
  p_reason text,
  p_message text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_reason text;
  normalized_message text;
  affected integer := 0;
  target record;
  new_until timestamptz;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 365 then
    raise exception 'VIP duration must be between 1 and 365 days' using errcode = '22023';
  end if;
  if pg_catalog.octet_length(coalesce(p_message, '')) > 2048 then
    raise exception 'VIP notification message input is too large' using errcode = '22023';
  end if;
  normalized_reason := pg_catalog.lower(pg_catalog.btrim(coalesce(p_reason, '')));
  if normalized_reason not in ('gift', 'compensation', 'promotion', 'other') then
    raise exception 'invalid VIP notification reason' using errcode = '22023';
  end if;
  normalized_message := private.glowletter_normalize_notice_message(p_message);
  if normalized_message is not null and pg_catalog.char_length(normalized_message) > 240 then
    raise exception 'VIP notification message must not exceed 240 characters' using errcode = '22023';
  end if;
  if private.glowletter_notice_message_is_forbidden(normalized_message) then
    raise exception 'VIP notification message contains prohibited content' using errcode = '22023';
  end if;

  for target in
    select account.user_id, account.support_id, account.vip_until
    from public.glowletter_accounts as account
    where not account.is_admin and not account.premium_forever
    order by account.created_at
    for update
  loop
    update public.glowletter_accounts as account
    set vip_until = greatest(coalesce(account.vip_until, now()), now()) + pg_catalog.make_interval(days => p_days),
        updated_at = now()
    where account.user_id = target.user_id
    returning account.vip_until into new_until;

    insert into private.glowletter_vip_audit (
      target_user_id, target_support_id, granted_by, action, granted_days, previous_vip_until, new_vip_until
    ) values (
      target.user_id, target.support_id, actor_id, 'grant', p_days, target.vip_until, new_until
    );

    insert into public.glowletter_notifications (
      user_id, kind, reason, message, granted_days, vip_until
    ) values (
      target.user_id, 'vip_granted', normalized_reason, normalized_message, p_days, new_until
    );

    affected := affected + 1;
  end loop;

  return affected;
end;
$$;

revoke all on function private.glowletter_admin_grant_vip_all(integer, text, text) from public, anon;
grant execute on function private.glowletter_admin_grant_vip_all(integer, text, text) to authenticated, service_role;

create or replace function public.glowletter_admin_grant_vip_all(
  p_days integer,
  p_reason text,
  p_message text default null
)
returns integer
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.glowletter_admin_grant_vip_all(p_days, p_reason, p_message);
$$;

revoke all on function public.glowletter_admin_grant_vip_all(integer, text, text) from public, anon;
grant execute on function public.glowletter_admin_grant_vip_all(integer, text, text) to authenticated;

-- Mass revoke of time-limited VIP. Lifetime grants and admins are untouched.
create or replace function private.glowletter_admin_revoke_vip_all()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  affected integer := 0;
  target record;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  for target in
    select account.user_id, account.support_id, account.vip_until
    from public.glowletter_accounts as account
    where not account.is_admin and not account.premium_forever and account.vip_until is not null
    order by account.created_at
    for update
  loop
    update public.glowletter_accounts as account
    set vip_until = null,
        updated_at = now()
    where account.user_id = target.user_id;

    insert into private.glowletter_vip_audit (
      target_user_id, target_support_id, granted_by, action, granted_days, previous_vip_until, new_vip_until
    ) values (
      target.user_id, target.support_id, actor_id, 'revoke', null, target.vip_until, null
    );

    affected := affected + 1;
  end loop;

  return affected;
end;
$$;

revoke all on function private.glowletter_admin_revoke_vip_all() from public, anon;
grant execute on function private.glowletter_admin_revoke_vip_all() to authenticated, service_role;

create or replace function public.glowletter_admin_revoke_vip_all()
returns integer
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.glowletter_admin_revoke_vip_all();
$$;

revoke all on function public.glowletter_admin_revoke_vip_all() from public, anon;
grant execute on function public.glowletter_admin_revoke_vip_all() to authenticated;
