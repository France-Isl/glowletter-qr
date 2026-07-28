-- Keep owner elevation tied to a confirmed identity and evaluate entitlement
-- against the database clock rather than the device wall clock.

update public.glowletter_accounts as account
set is_admin = false,
    premium_forever = false,
    updated_at = now()
from auth.users as auth_user
where auth_user.id = account.user_id
  and lower(auth_user.email) = lower('ggooglov9@gmail.com')
  and auth_user.email_confirmed_at is null;

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
         account.premium_forever,
         account.vip_until,
         account.premium_forever or coalesce(account.vip_until > now(), false),
         account.created_at,
         account.updated_at,
         now()
  from public.glowletter_accounts as account
  where account.user_id = (select auth.uid());
$$;

revoke all on function public.glowletter_my_access() from public, anon;
grant execute on function public.glowletter_my_access() to authenticated;

notify pgrst, 'reload schema';
