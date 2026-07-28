-- Keep the single owner role tied to the confirmed Gmail identity and retain
-- support audit records only for the documented six-month security window.

create or replace function private.glowletter_create_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_account boolean := lower(coalesce(new.email, '')) = lower('ggooglov9@gmail.com')
    and new.email_confirmed_at is not null;
begin
  if exists (select 1 from public.glowletter_accounts where user_id = new.id) then
    if owner_account then
      update public.glowletter_accounts
      set is_admin = true,
          premium_forever = true,
          updated_at = now()
      where user_id = new.id;
    else
      update public.glowletter_accounts
      set premium_forever = case when is_admin then false else premium_forever end,
          is_admin = false,
          updated_at = case when is_admin then now() else updated_at end
      where user_id = new.id;
    end if;
    return new;
  end if;

  for attempt in 1..5 loop
    begin
      insert into public.glowletter_accounts (
        user_id,
        support_id,
        is_admin,
        premium_forever
      ) values (
        new.id,
        private.glowletter_support_id(),
        owner_account,
        owner_account
      )
      on conflict (user_id) do nothing;
      return new;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
  return new;
end;
$$;

revoke all on function private.glowletter_create_account() from public, anon, authenticated;

update public.glowletter_accounts as account
set premium_forever = case when account.is_admin then false else account.premium_forever end,
    is_admin = false,
    updated_at = now()
from auth.users as auth_user
where auth_user.id = account.user_id
  and account.is_admin = true
  and not (
    lower(coalesce(auth_user.email, '')) = lower('ggooglov9@gmail.com')
    and auth_user.email_confirmed_at is not null
  );

create index if not exists glowletter_vip_audit_created_at_idx
  on private.glowletter_vip_audit (created_at);

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-vip-audit'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'glowletter-purge-vip-audit',
    '17 3 * * *',
    $command$delete from private.glowletter_vip_audit where created_at < now() - interval '6 months'$command$
  );
end
$migration$;
