-- The owner/admin account is not a customer: it always has full access by the
-- admin rule, and admin tools (VIP, «без срока», revoke, block, warnings,
-- resets, coins, unlocks) can never be pointed at an admin account.
-- Errors use code 42501 with the message 'admin_target'.

-- 1. Helper: is this user an admin account?
create or replace function private.glowletter_is_admin_account(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user is not null and exists (
    select 1 from public.glowletter_accounts as account
    where account.user_id = p_user and account.is_admin = true
  );
$$;

revoke all on function private.glowletter_is_admin_account(uuid) from public, anon, authenticated;

-- 2. Admins always have full access (no VIP grant needed).
create or replace function private.glowletter_has_paid_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null and (
    private.glowletter_is_admin_account(p_user_id)
    or (
      not private.glowletter_is_banned(p_user_id) and (
        exists (
          select 1 from public.glowletter_accounts as account
          where account.user_id = p_user_id
            and (account.premium_forever or coalesce(account.vip_until > now(), false))
        )
        or exists (
          select 1 from private.glowletter_play_entitlements as entitlement
          where entitlement.user_id = p_user_id
            and entitlement.state in ('active', 'verified_pending_ack')
            and (entitlement.expiry_time is null or entitlement.expiry_time > now())
        )
      )
    )
  );
$$;

-- The app (every installed version) reads premium from glowletter_my_access:
-- an admin is reported as permanent full access without any stored grant.
create or replace function public.glowletter_my_access()
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  server_now timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select account.support_id,
         account.is_admin,
         account.premium_forever or account.is_admin,
         case when account.is_admin then null else account.vip_until end,
         account.is_admin or account.premium_forever or coalesce(account.vip_until > now(), false),
         account.created_at,
         account.updated_at,
         now()
  from public.glowletter_accounts as account
  where account.user_id = (select auth.uid());
$$;

-- 3. Target guard used by block / unblock / warn / moderate / reset statistics.
create or replace function private.glowletter_admin_target(p_user uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if private.glowletter_is_admin_account(p_user) then
    raise exception using errcode = '42501', message = 'admin_target';
  end if;
end;
$$;

revoke all on function private.glowletter_admin_target(uuid) from public, anon, authenticated;

-- 4. VIP for one account: refuse admin accounts.
create or replace function private.glowletter_admin_grant_vip_with_notice(p_support_id text, p_days integer, p_reason text, p_message text)
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
  target_is_admin boolean;
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

  select account.vip_until, account.is_admin
  into previous_until, target_is_admin
  from public.glowletter_accounts as account
  where account.support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;
  if target_is_admin then
    raise exception using errcode = '42501', message = 'admin_target';
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

create or replace function private.glowletter_admin_grant_forever(p_support_id text, p_reason text, p_message text)
returns public.glowletter_accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  normalized_reason text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_reason, '')));
  normalized_message text := private.glowletter_normalize_notice_message(p_message);
  previous_until timestamptz;
  target_is_admin boolean;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
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

  select account.vip_until, account.is_admin
  into previous_until, target_is_admin
  from public.glowletter_accounts as account
  where account.support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;
  if target_is_admin then
    raise exception using errcode = '42501', message = 'admin_target';
  end if;

  update public.glowletter_accounts as account
  set premium_forever = true,
      vip_until = null,
      updated_at = now()
  where account.support_id = normalized_support_id
  returning account.* into result;

  insert into private.glowletter_vip_audit (
    target_user_id, target_support_id, granted_by, action, granted_days, previous_vip_until, new_vip_until
  ) values (
    result.user_id, result.support_id, actor_id, 'grant_forever', null, previous_until, null
  );

  insert into public.glowletter_notifications (
    user_id, kind, reason, message, granted_days, vip_until
  ) values (
    result.user_id, 'vip_forever', normalized_reason, normalized_message, null, null
  );

  return result;
end;
$$;

create or replace function private.glowletter_admin_revoke_vip(p_support_id text)
returns public.glowletter_accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  previous_until timestamptz;
  target_is_admin boolean;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select account.vip_until, account.is_admin
  into previous_until, target_is_admin
  from public.glowletter_accounts as account
  where account.support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;
  if target_is_admin then
    raise exception using errcode = '42501', message = 'admin_target';
  end if;

  update public.glowletter_accounts as account
  set vip_until = null,
      premium_forever = false,
      updated_at = now()
  where account.support_id = normalized_support_id
  returning account.* into result;

  insert into private.glowletter_vip_audit (
    target_user_id, target_support_id, granted_by, action, granted_days, previous_vip_until, new_vip_until
  ) values (
    result.user_id, result.support_id, actor_id, 'revoke', null, previous_until, null
  );

  return result;
end;
$$;

revoke all on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text) from public, anon;
revoke all on function private.glowletter_admin_grant_forever(text, text, text) from public, anon;
revoke all on function private.glowletter_admin_revoke_vip(text) from public, anon;
grant execute on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text) to authenticated;
grant execute on function private.glowletter_admin_grant_forever(text, text, text) to authenticated;
grant execute on function private.glowletter_admin_revoke_vip(text) to authenticated;

-- 5. Season reset and «открыть всё»: refuse admin accounts.
create or replace function public.glowletter_admin_reset_season(p_user uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  cur integer := private.glowletter_season_at(now());
  before integer;
begin
  perform private.glowletter_admin_target(p_user);
  before := coalesce((select points from private.glowletter_season_points(cur) where user_id = p_user), 0);
  insert into public.glowletter_point_resets (user_id, season, admin_id, points_before, reason)
  values (p_user, cur, admin, before, pg_catalog.left(coalesce(p_reason, ''), 200));
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'reset_season', p_user, pg_catalog.jsonb_build_object('season', cur, 'points_before', before, 'reason', pg_catalog.left(coalesce(p_reason, ''), 200)));
  return pg_catalog.jsonb_build_object('season', cur, 'points_before', before);
end;
$$;

create or replace function public.glowletter_admin_unlock_all(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  added integer;
begin
  perform private.glowletter_admin_target(p_user);
  insert into public.glowletter_unlocks (user_id, item, admin_id)
  select p_user, item, admin from (
    select 'sticker:s' || pg_catalog.lpad(n::text, 2, '0') as item from pg_catalog.generate_series(1, 20) as n
    union all select 'frame:f0' || n::text from pg_catalog.generate_series(1, 8) as n
    union all select 'outfit:all'
  ) as all_items
  on conflict (user_id, item) do nothing;
  get diagnostics added = row_count;
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'unlock_all', p_user, pg_catalog.jsonb_build_object('added', added));
  return added;
end;
$$;

-- 6. Catch-all: every admin action is written to the admin log or the VIP
-- audit in the same transaction. A row aimed at an admin account aborts the
-- whole action (this also covers glowletter_admin_coins and report
-- resolutions «warned / banned / reset»). Dismissing a report is allowed.
create or replace function private.glowletter_admin_log_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.target is not null
     and new.action is distinct from 'report_dismissed'
     and private.glowletter_is_admin_account(new.target) then
    raise exception using errcode = '42501', message = 'admin_target';
  end if;
  return new;
end;
$$;

revoke all on function private.glowletter_admin_log_guard() from public, anon, authenticated;

drop trigger if exists glowletter_admin_log_guard on public.glowletter_admin_log;
create trigger glowletter_admin_log_guard
before insert on public.glowletter_admin_log
for each row execute function private.glowletter_admin_log_guard();

create or replace function private.glowletter_vip_audit_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.glowletter_is_admin_account(new.target_user_id) then
    raise exception using errcode = '42501', message = 'admin_target';
  end if;
  return new;
end;
$$;

revoke all on function private.glowletter_vip_audit_guard() from public, anon, authenticated;

drop trigger if exists glowletter_vip_audit_guard on private.glowletter_vip_audit;
create trigger glowletter_vip_audit_guard
before insert on private.glowletter_vip_audit
for each row execute function private.glowletter_vip_audit_guard();

-- 7. No «gift / access opened» notifications for admin accounts.
create or replace function private.glowletter_skip_admin_vip_notice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind in ('vip_granted', 'vip_grant', 'vip', 'vip_forever')
     and private.glowletter_is_admin_account(new.user_id) then
    return null;
  end if;
  return new;
end;
$$;

revoke all on function private.glowletter_skip_admin_vip_notice() from public, anon, authenticated;

drop trigger if exists glowletter_skip_admin_vip_notice on public.glowletter_notifications;
create trigger glowletter_skip_admin_vip_notice
before insert on public.glowletter_notifications
for each row execute function private.glowletter_skip_admin_vip_notice();

update public.glowletter_notifications as notification
set read_at = now()
from public.glowletter_accounts as account
where account.user_id = notification.user_id
  and account.is_admin = true
  and notification.read_at is null;

-- 8. Clean up the self-granted VIP / «без срока» on admin accounts: access now
-- comes from the admin rule above, so the stored grant is not needed.
update public.glowletter_accounts
set premium_forever = false,
    vip_until = null,
    updated_at = now()
where is_admin = true
  and (premium_forever or vip_until is not null);
