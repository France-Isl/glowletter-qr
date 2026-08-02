-- Reject unauthorised or oversized requests before normalising administrator
-- notice text. The public RPC and return shape remain unchanged.

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

revoke all on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  from public, anon;
grant execute on function private.glowletter_admin_grant_vip_with_notice(text, integer, text, text)
  to authenticated, service_role;
