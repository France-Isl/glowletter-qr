-- Stable support IDs, owner administration, and time-limited VIP access.
-- Authorization is stored in database-controlled columns, never user_metadata.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.glowletter_support_id()
returns text
language sql
volatile
set search_path = ''
as $$
  with value as (
    select upper(replace(gen_random_uuid()::text, '-', '')) as id
  )
  select 'GL-'
    || substr(id, 1, 4) || '-'
    || substr(id, 5, 4) || '-'
    || substr(id, 9, 4) || '-'
    || substr(id, 13, 4) || '-'
    || substr(id, 17, 4) || '-'
    || substr(id, 21, 4) || '-'
    || substr(id, 25, 4) || '-'
    || substr(id, 29, 4)
  from value;
$$;

revoke all on function private.glowletter_support_id() from public, anon, authenticated;
grant execute on function private.glowletter_support_id() to service_role;

create table public.glowletter_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  support_id text not null unique
    check (support_id ~ '^GL-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$'),
  is_admin boolean not null default false,
  premium_forever boolean not null default false,
  vip_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.glowletter_accounts is
  'Private account support ID and server-authoritative GlowLetter access state.';
comment on column public.glowletter_accounts.support_id is
  'Shareable, non-secret identifier used when contacting GlowLetter support.';

alter table public.glowletter_accounts enable row level security;

revoke all on table public.glowletter_accounts from public, anon, authenticated;
grant select on table public.glowletter_accounts to authenticated;
grant select, insert, update, delete on table public.glowletter_accounts to service_role;

create or replace function private.glowletter_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.glowletter_accounts
    where user_id = (select auth.uid())
      and is_admin = true
  );
$$;

revoke all on function private.glowletter_is_admin() from public, anon;
grant execute on function private.glowletter_is_admin() to authenticated, service_role;

create policy "Users can read only their GlowLetter account"
  on public.glowletter_accounts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table private.glowletter_vip_audit (
  id bigint generated always as identity primary key,
  target_user_id uuid references auth.users(id) on delete set null,
  target_support_id text not null,
  granted_by uuid references auth.users(id) on delete set null,
  action text not null check (action in ('grant', 'revoke')),
  granted_days integer check (granted_days is null or granted_days between 1 and 365),
  previous_vip_until timestamptz,
  new_vip_until timestamptz,
  created_at timestamptz not null default now()
);

alter table private.glowletter_vip_audit enable row level security;
revoke all on table private.glowletter_vip_audit from public, anon, authenticated;
grant select, insert on table private.glowletter_vip_audit to service_role;
create index glowletter_vip_audit_target_user_id_idx
  on private.glowletter_vip_audit (target_user_id)
  where target_user_id is not null;
create index glowletter_vip_audit_granted_by_idx
  on private.glowletter_vip_audit (granted_by)
  where granted_by is not null;

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

drop trigger if exists glowletter_create_account_after_signup on auth.users;
create trigger glowletter_create_account_after_signup
  after insert on auth.users
  for each row execute function private.glowletter_create_account();

drop trigger if exists glowletter_refresh_owner_after_auth_update on auth.users;
create trigger glowletter_refresh_owner_after_auth_update
  after update of email, email_confirmed_at on auth.users
  for each row execute function private.glowletter_create_account();

insert into public.glowletter_accounts (user_id, support_id)
select id, private.glowletter_support_id()
from auth.users
on conflict (user_id) do nothing;

do $$
declare
  owner_count integer;
begin
  select count(*) into owner_count
  from auth.users
  where lower(email) = lower('ggooglov9@gmail.com');

  if owner_count > 1 then
    raise exception 'GlowLetter owner email is not unique';
  end if;

  if owner_count = 1 then
    update public.glowletter_accounts as account
    set is_admin = true,
        premium_forever = true,
        vip_until = null,
        updated_at = now()
    from auth.users as auth_user
    where auth_user.id = account.user_id
      and lower(auth_user.email) = lower('ggooglov9@gmail.com');
  end if;
end;
$$;

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
  actor_id uuid := (select auth.uid());
  normalized_support_id text := upper(btrim(coalesce(p_support_id, '')));
  previous_until timestamptz;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 365 then
    raise exception 'VIP duration must be between 1 and 365 days' using errcode = '22023';
  end if;

  select vip_until
  into previous_until
  from public.glowletter_accounts
  where support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  update public.glowletter_accounts
  set vip_until = now() + make_interval(days => p_days),
      updated_at = now()
  where support_id = normalized_support_id
  returning * into result;

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

  return result;
end;
$$;

create or replace function private.glowletter_admin_revoke_vip(p_support_id text)
returns public.glowletter_accounts
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_support_id text := upper(btrim(coalesce(p_support_id, '')));
  previous_until timestamptz;
  result public.glowletter_accounts;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select vip_until
  into previous_until
  from public.glowletter_accounts
  where support_id = normalized_support_id
  for update;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  update public.glowletter_accounts
  set vip_until = null,
      updated_at = now()
  where support_id = normalized_support_id
  returning * into result;

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

create or replace function private.glowletter_admin_lookup(p_support_id text)
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select account.support_id,
         account.is_admin,
         account.premium_forever,
         account.vip_until,
         account.premium_forever or coalesce(account.vip_until > now(), false),
         account.created_at
  from public.glowletter_accounts as account
  where account.support_id = upper(btrim(coalesce(p_support_id, '')));
end;
$$;

revoke all on function private.glowletter_admin_lookup(text) from public, anon;
revoke all on function private.glowletter_admin_grant_vip(text, integer) from public, anon;
revoke all on function private.glowletter_admin_revoke_vip(text) from public, anon;
grant execute on function private.glowletter_admin_lookup(text) to authenticated, service_role;
grant execute on function private.glowletter_admin_grant_vip(text, integer) to authenticated, service_role;
grant execute on function private.glowletter_admin_revoke_vip(text) to authenticated, service_role;

create or replace function public.glowletter_admin_lookup(p_support_id text)
returns table (
  support_id text,
  is_admin boolean,
  premium_forever boolean,
  vip_until timestamptz,
  premium_active boolean,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.glowletter_admin_lookup(p_support_id);
$$;

create or replace function public.glowletter_admin_grant_vip(
  p_support_id text,
  p_days integer
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
  from private.glowletter_admin_grant_vip(p_support_id, p_days) as account;
$$;

create or replace function public.glowletter_admin_revoke_vip(p_support_id text)
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
  from private.glowletter_admin_revoke_vip(p_support_id) as account;
$$;

revoke all on function public.glowletter_admin_lookup(text) from public, anon;
revoke all on function public.glowletter_admin_grant_vip(text, integer) from public, anon;
revoke all on function public.glowletter_admin_revoke_vip(text) from public, anon;
grant execute on function public.glowletter_admin_lookup(text) to authenticated;
grant execute on function public.glowletter_admin_grant_vip(text, integer) to authenticated;
grant execute on function public.glowletter_admin_revoke_vip(text) to authenticated;

alter default privileges for role postgres in schema private
  revoke select, insert, update, delete on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke usage, select on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated, service_role;

notify pgrst, 'reload schema';
