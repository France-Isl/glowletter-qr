-- Полный доступ навсегда: владелец выдаёт его из админ-панели одной операцией.
-- Срочный VIP (1–365 дней) продолжает работать как раньше.

-- 1. Журнал допускает новое действие.
alter table private.glowletter_vip_audit
  drop constraint if exists glowletter_vip_audit_action_check;
alter table private.glowletter_vip_audit
  add constraint glowletter_vip_audit_action_check
  check (action in ('grant', 'revoke', 'grant_forever'));

-- 2. У постоянного доступа нет ни срока, ни числа дней.
alter table public.glowletter_notifications
  alter column granted_days drop not null,
  alter column vip_until drop not null;

alter table public.glowletter_notifications
  drop constraint if exists glowletter_notifications_granted_days_check;
alter table public.glowletter_notifications
  add constraint glowletter_notifications_granted_days_check
  check (granted_days is null or (granted_days >= 1 and granted_days <= 365));

alter table public.glowletter_notifications
  drop constraint if exists glowletter_notifications_kind_check;
alter table public.glowletter_notifications
  add constraint glowletter_notifications_kind_check
  check (kind in ('vip_granted', 'vip_forever'));

-- Срочное уведомление обязано иметь срок, постоянное — не имеет его никогда.
alter table public.glowletter_notifications
  drop constraint if exists glowletter_notifications_shape_check;
alter table public.glowletter_notifications
  add constraint glowletter_notifications_shape_check
  check (
    (kind = 'vip_granted' and granted_days is not null and vip_until is not null)
    or (kind = 'vip_forever' and granted_days is null and vip_until is null)
  );

-- 3. Выдача постоянного доступа: один атомарный шаг вместе с уведомлением.
create or replace function private.glowletter_admin_grant_forever(
  p_support_id text,
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
  set premium_forever = true,
      vip_until = null,
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
    'grant_forever',
    null,
    previous_until,
    null
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
    'vip_forever',
    normalized_reason,
    normalized_message,
    null,
    null
  );

  return result;
end;
$$;

create or replace function public.glowletter_admin_grant_forever(
  p_support_id text,
  p_reason text,
  p_message text default null::text
)
returns table(support_id text, is_admin boolean, premium_forever boolean, vip_until timestamptz, premium_active boolean)
language sql
set search_path = ''
as $$
  select account.support_id,
         account.is_admin,
         account.premium_forever,
         account.vip_until,
         account.premium_forever or coalesce(account.vip_until > now(), false)
  from private.glowletter_admin_grant_forever(
    p_support_id,
    p_reason,
    p_message
  ) as account;
$$;

revoke all on function private.glowletter_admin_grant_forever(text, text, text) from public, anon;
revoke all on function public.glowletter_admin_grant_forever(text, text, text) from public, anon;
grant execute on function private.glowletter_admin_grant_forever(text, text, text) to authenticated, service_role;
grant execute on function public.glowletter_admin_grant_forever(text, text, text) to authenticated, service_role;

-- 4. Отзыв снимает и срочный, и постоянный доступ. Права владельца-администратора
--    при этом не трогаются: иначе он мог бы случайно разжаловать сам себя.
create or replace function private.glowletter_admin_revoke_vip(p_support_id text)
returns public.glowletter_accounts
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  previous_until timestamptz;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
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
  set vip_until = null,
      premium_forever = case when account.is_admin then account.premium_forever else false end,
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
    'revoke',
    null,
    previous_until,
    null
  );

  return result;
end;
$$;
