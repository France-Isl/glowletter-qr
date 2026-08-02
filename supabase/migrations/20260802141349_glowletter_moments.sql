-- GlowLetter Moments: private people, dates, finished letters, and opaque QR links.
-- Personal content is never exposed through table grants or URL query values.

create table public.glowletter_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name varchar(36) not null check (char_length(btrim(display_name)) between 1 and 36),
  relationship text not null default 'universal'
    check (relationship in ('mother','father','spouse','child','sibling','grandparent','teacher','friend','universal')),
  language text not null default 'ru' check (language in ('ru','en','fr')),
  tone text not null default 'auto'
    check (tone in ('auto','loving','romantic','classic','support','gratitude')),
  default_length text not null default 'auto'
    check (default_length in ('auto','short','standard','detailed')),
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.glowletter_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  person_id uuid not null,
  title varchar(80) not null check (char_length(btrim(title)) between 1 and 80),
  kind text not null default 'custom'
    check (kind in ('birthday','anniversary','holiday','gratitude','custom')),
  event_date date not null,
  recurrence text not null default 'yearly' check (recurrence in ('none','yearly')),
  time_zone varchar(64) not null default 'Europe/Paris'
    check (char_length(time_zone) between 1 and 64 and time_zone ~ '^[A-Za-z_+-]+(?:/[A-Za-z0-9_+-]+){0,3}$'),
  remind_7d boolean not null default true,
  remind_3d boolean not null default true,
  remind_1d boolean not null default true,
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (person_id, user_id)
    references public.glowletter_people(id, user_id) on delete cascade
);

create table public.glowletter_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  person_id uuid,
  moment_id uuid,
  source text not null default 'custom' check (source in ('ai','custom','template','florist')),
  text text not null check (char_length(btrim(text)) between 1 and 4000),
  language text not null default 'ru' check (language in ('ru','en','fr')),
  tone text not null default 'auto'
    check (tone in ('auto','loving','romantic','classic','support','gratitude')),
  sender_name_snapshot varchar(36) not null default '' check (char_length(sender_name_snapshot) <= 36),
  recipient_name_snapshot varchar(36) not null default '' check (char_length(recipient_name_snapshot) <= 36),
  occasion_snapshot varchar(80) not null default '' check (char_length(occasion_snapshot) <= 80),
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (person_id, user_id)
    references public.glowletter_people(id, user_id) on delete set null (person_id),
  foreign key (moment_id, user_id)
    references public.glowletter_moments(id, user_id) on delete set null (moment_id)
);

create table public.glowletter_qr_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  public_id uuid not null default gen_random_uuid() unique,
  kind text not null default 'letter' check (kind in ('letter','person_permanent')),
  letter_id uuid,
  person_id uuid,
  status text not null default 'active' check (status in ('active','revoked')),
  unlock_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (letter_id, user_id)
    references public.glowletter_letters(id, user_id) on delete cascade,
  foreign key (person_id, user_id)
    references public.glowletter_people(id, user_id) on delete cascade,
  check (
    (kind = 'letter' and letter_id is not null and person_id is null)
    or (kind = 'person_permanent' and person_id is not null and letter_id is null)
  ),
  check (expires_at is null or expires_at > created_at),
  check (unlock_at is null or unlock_at <= created_at + interval '365 days'),
  check ((status = 'revoked') = (revoked_at is not null))
);

create unique index glowletter_qr_links_person_active_unique
  on public.glowletter_qr_links (user_id, person_id)
  where kind = 'person_permanent' and status = 'active';
create index glowletter_people_user_updated_idx on public.glowletter_people (user_id, updated_at desc);
create index glowletter_moments_user_date_idx on public.glowletter_moments (user_id, event_date);
create index glowletter_moments_user_updated_idx on public.glowletter_moments (user_id, updated_at desc);
create index glowletter_letters_user_created_idx on public.glowletter_letters (user_id, created_at desc);
create index glowletter_qr_links_user_created_idx on public.glowletter_qr_links (user_id, created_at desc);

comment on table public.glowletter_people is 'Private recipient profiles owned by one authenticated GlowLetter user.';
comment on table public.glowletter_moments is 'Private important dates and reminder preferences.';
comment on table public.glowletter_letters is 'Private final letter history; raw prompts are intentionally not stored.';
comment on table public.glowletter_qr_links is 'Owner-managed opaque capability links; letter text never appears in the URL.';

create or replace function public.glowletter_touch_owned_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
    raise exception 'immutable_owner_metadata' using errcode = '22023';
  end if;
  new.updated_at := now();
  new.revision := old.revision + 1;
  return new;
end;
$$;

create or replace function public.glowletter_enforce_content_quota()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  used_count integer;
  allowed_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('glowletter-content:' || new.user_id::text, 0)
  );
  case tg_table_name
    when 'glowletter_people' then
      select count(*) into used_count from public.glowletter_people where user_id = new.user_id;
      allowed_count := 100;
    when 'glowletter_moments' then
      select count(*) into used_count from public.glowletter_moments where user_id = new.user_id;
      allowed_count := 300;
    when 'glowletter_letters' then
      select count(*) into used_count from public.glowletter_letters where user_id = new.user_id;
      allowed_count := 250;
    when 'glowletter_qr_links' then
      select count(*) into used_count from public.glowletter_qr_links where user_id = new.user_id;
      allowed_count := 500;
    else
      raise exception 'unsupported_content_table';
  end case;
  if used_count >= allowed_count then
    raise exception 'content_quota_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function public.glowletter_keep_shared_letter_immutable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (new.text, new.sender_name_snapshot, new.recipient_name_snapshot, new.language, new.tone)
       is distinct from
     (old.text, old.sender_name_snapshot, old.recipient_name_snapshot, old.language, old.tone)
     and exists (
       select 1 from public.glowletter_qr_links
       where user_id = old.user_id and letter_id = old.id and status = 'active'
     ) then
    raise exception 'shared_letter_is_immutable' using errcode = '55000';
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['glowletter_people','glowletter_moments','glowletter_letters','glowletter_qr_links'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to service_role', table_name);
    execute format('create trigger %I_quota before insert on public.%I for each row execute function public.glowletter_enforce_content_quota()', table_name, table_name);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.glowletter_touch_owned_row()', table_name, table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_owner_select', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_owner_insert', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_owner_update', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_owner_delete', table_name);
  end loop;
end;
$$;

create trigger glowletter_letters_shared_immutable
  before update on public.glowletter_letters
  for each row execute function public.glowletter_keep_shared_letter_immutable();

create or replace function public.glowletter_create_qr_link(
  p_kind text default 'letter',
  p_letter_id uuid default null,
  p_person_id uuid default null,
  p_unlock_at timestamptz default null,
  p_expires_at timestamptz default null
)
returns table (id uuid, public_id uuid, unlock_at timestamptz, expires_at timestamptz)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  if p_unlock_at is not null and (p_unlock_at < now() - interval '5 minutes' or p_unlock_at > now() + interval '365 days') then
    raise exception 'invalid_unlock_time' using errcode = '22023';
  end if;
  if p_expires_at is not null and (p_expires_at <= now() or p_expires_at > now() + interval '366 days') then
    raise exception 'invalid_expiry_time' using errcode = '22023';
  end if;
  if p_kind = 'letter' then
    if p_letter_id is null or p_person_id is not null or not exists (
      select 1 from public.glowletter_letters where glowletter_letters.id = p_letter_id and user_id = owner_id
    ) then raise exception 'letter_not_found' using errcode = '22023'; end if;
  elsif p_kind = 'person_permanent' then
    if p_person_id is null or p_letter_id is not null or not exists (
      select 1 from public.glowletter_people where glowletter_people.id = p_person_id and user_id = owner_id
    ) then raise exception 'person_not_found' using errcode = '22023'; end if;
  else
    raise exception 'invalid_qr_kind' using errcode = '22023';
  end if;

  return query
  insert into public.glowletter_qr_links (user_id, kind, letter_id, person_id, unlock_at, expires_at)
  values (owner_id, p_kind, p_letter_id, p_person_id, p_unlock_at, p_expires_at)
  returning glowletter_qr_links.id, glowletter_qr_links.public_id,
            glowletter_qr_links.unlock_at, glowletter_qr_links.expires_at;
end;
$$;

create or replace function public.glowletter_revoke_qr_link(p_id uuid)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare changed integer;
begin
  update public.glowletter_qr_links
  set status = 'revoked', revoked_at = now()
  where id = p_id and user_id = auth.uid() and status = 'active';
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create or replace function public.glowletter_resolve_qr_link(p_public_id uuid)
returns table (
  state text,
  unlock_at timestamptz,
  expires_at timestamptz,
  sender_name text,
  recipient_name text,
  language text,
  title text,
  letter_text text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    case
      when link.status <> 'active' then 'revoked'
      when link.expires_at is not null and link.expires_at <= now() then 'expired'
      when link.unlock_at is not null and link.unlock_at > now() then 'locked'
      else 'ready'
    end,
    link.unlock_at,
    link.expires_at,
    case when link.status = 'active' and (link.expires_at is null or link.expires_at > now()) and (link.unlock_at is null or link.unlock_at <= now()) then letter.sender_name_snapshot else null end,
    case when link.status = 'active' and (link.expires_at is null or link.expires_at > now()) and (link.unlock_at is null or link.unlock_at <= now()) then coalesce(letter.recipient_name_snapshot, person.display_name) else null end,
    case when link.status = 'active' and (link.expires_at is null or link.expires_at > now()) and (link.unlock_at is null or link.unlock_at <= now()) then coalesce(letter.language, person.language) else null end,
    case when link.status = 'active' and (link.expires_at is null or link.expires_at > now()) and (link.unlock_at is null or link.unlock_at <= now()) then letter.occasion_snapshot else null end,
    case when link.status = 'active' and (link.expires_at is null or link.expires_at > now()) and (link.unlock_at is null or link.unlock_at <= now()) then letter.text else null end
  from public.glowletter_qr_links as link
  left join public.glowletter_letters as letter on letter.id = link.letter_id and letter.user_id = link.user_id
  left join public.glowletter_people as person on person.id = link.person_id and person.user_id = link.user_id
  where link.public_id = p_public_id
  limit 1;
$$;

revoke all on function public.glowletter_touch_owned_row() from public, anon, authenticated, service_role;
revoke all on function public.glowletter_enforce_content_quota() from public, anon, authenticated, service_role;
revoke all on function public.glowletter_keep_shared_letter_immutable() from public, anon, authenticated, service_role;
revoke all on function public.glowletter_create_qr_link(text,uuid,uuid,timestamptz,timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.glowletter_revoke_qr_link(uuid) from public, anon, authenticated, service_role;
revoke all on function public.glowletter_resolve_qr_link(uuid) from public, anon, authenticated, service_role;
grant execute on function public.glowletter_create_qr_link(text,uuid,uuid,timestamptz,timestamptz) to authenticated, service_role;
grant execute on function public.glowletter_revoke_qr_link(uuid) to authenticated, service_role;
grant execute on function public.glowletter_resolve_qr_link(uuid) to service_role;

notify pgrst, 'reload schema';
