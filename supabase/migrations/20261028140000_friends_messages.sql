-- Друзья и личные сообщения (2.4.22). Человек добавляет друга по короткому
-- коду дружбы; писать можно только принятым друзьям. Онлайн — по отметке
-- last_seen, которую приложение обновляет раз в минуту. Сообщения проходят
-- тот же фильтр слов, что и уведомления, ссылки запрещены; есть блокировка
-- и жалобы. Всё удаляется вместе с аккаунтом.

create table public.glowletter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or pg_catalog.char_length(display_name) between 1 and 36),
  friend_code text not null unique check (friend_code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  last_seen timestamptz,
  created_at timestamptz not null default now()
);

create table public.glowletter_friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester <> addressee)
);
create unique index glowletter_friendships_pair_idx on public.glowletter_friendships (least(requester, addressee), greatest(requester, addressee));
create index glowletter_friendships_addressee_idx on public.glowletter_friendships (addressee, status);
create index glowletter_friendships_requester_idx on public.glowletter_friendships (requester, status);

create table public.glowletter_blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
create index glowletter_blocks_blocked_idx on public.glowletter_blocks (blocked);

create table public.glowletter_messages (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  body text not null check (pg_catalog.char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index glowletter_messages_recipient_idx on public.glowletter_messages (recipient, created_at desc);
create index glowletter_messages_pair_idx on public.glowletter_messages (sender, recipient, created_at desc);

create table public.glowletter_message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.glowletter_messages(id) on delete cascade,
  reporter uuid not null references auth.users(id) on delete cascade,
  reason text not null default 'other' check (reason in ('abuse', 'adult', 'spam', 'other')),
  created_at timestamptz not null default now(),
  unique (message_id, reporter)
);
create index glowletter_message_reports_reporter_idx on public.glowletter_message_reports (reporter);

comment on table public.glowletter_messages is 'Private messages between accepted friends. Written only through glowletter_messages_send.';

alter table public.glowletter_profiles enable row level security;
alter table public.glowletter_friendships enable row level security;
alter table public.glowletter_blocks enable row level security;
alter table public.glowletter_messages enable row level security;
alter table public.glowletter_message_reports enable row level security;
revoke all on table public.glowletter_profiles, public.glowletter_friendships, public.glowletter_blocks, public.glowletter_messages, public.glowletter_message_reports from public, anon, authenticated;
grant select on table public.glowletter_friendships, public.glowletter_messages to authenticated;
grant all on table public.glowletter_profiles, public.glowletter_friendships, public.glowletter_blocks, public.glowletter_messages, public.glowletter_message_reports to service_role;

create policy "Participants read their friendships" on public.glowletter_friendships
  for select to authenticated using ((select auth.uid()) in (requester, addressee));
create policy "Participants read their messages" on public.glowletter_messages
  for select to authenticated using ((select auth.uid()) in (sender, recipient));

do $realtime$
begin
  if not exists (select 1 from pg_catalog.pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'glowletter_messages') then
    execute 'alter publication supabase_realtime add table public.glowletter_messages';
  end if;
  if not exists (select 1 from pg_catalog.pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'glowletter_friendships') then
    execute 'alter publication supabase_realtime add table public.glowletter_friendships';
  end if;
end
$realtime$;

-- Свой профиль: создаётся при первом обращении, с уникальным кодом дружбы.
create or replace function private.glowletter_ensure_profile(p_user uuid)
returns public.glowletter_profiles
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  profile public.glowletter_profiles;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  attempt integer := 0;
begin
  select * into profile from public.glowletter_profiles where user_id = p_user;
  if found then
    return profile;
  end if;
  loop
    attempt := attempt + 1;
    code := '';
    for i in 1 .. 8 loop
      code := code || pg_catalog.substr(alphabet, 1 + pg_catalog.floor(pg_catalog.random() * 32)::int, 1);
    end loop;
    begin
      insert into public.glowletter_profiles (user_id, friend_code) values (p_user, code) returning * into profile;
      return profile;
    exception when unique_violation then
      if attempt > 20 then raise; end if;
      select * into profile from public.glowletter_profiles where user_id = p_user;
      if found then return profile; end if;
    end;
  end loop;
end;
$$;
revoke all on function private.glowletter_ensure_profile(uuid) from public, anon, authenticated;

create or replace function private.glowletter_are_friends(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.glowletter_friendships as f
    where least(f.requester, f.addressee) = least(p_a, p_b)
      and greatest(f.requester, f.addressee) = greatest(p_a, p_b)
      and f.status = 'accepted'
  );
$$;
revoke all on function private.glowletter_are_friends(uuid, uuid) from public, anon, authenticated;

create or replace function private.glowletter_is_blocked(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.glowletter_blocks as b where (b.blocker = p_a and b.blocked = p_b) or (b.blocker = p_b and b.blocked = p_a));
$$;
revoke all on function private.glowletter_is_blocked(uuid, uuid) from public, anon, authenticated;

create or replace function public.glowletter_friends_me()
returns table (display_name text, friend_code text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  profile public.glowletter_profiles;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  profile := private.glowletter_ensure_profile(me);
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return query select profile.display_name, profile.friend_code;
end;
$$;

create or replace function public.glowletter_friends_set_name(p_name text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  name text;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  name := private.glowletter_clean_quiz_name(p_name);
  if name is null then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_ensure_profile(me);
  update public.glowletter_profiles set display_name = name where user_id = me;
  return name;
end;
$$;

create or replace function public.glowletter_friends_touch()
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  update public.glowletter_profiles set last_seen = now() where user_id = auth.uid();
$$;

-- Заявка по коду. Если этот человек уже прислал заявку — сразу дружба.
create or replace function public.glowletter_friends_request(p_code text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  target uuid;
  existing public.glowletter_friendships;
  code text := pg_catalog.upper(pg_catalog.regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_ensure_profile(me);
  select user_id into target from public.glowletter_profiles where friend_code = code;
  if target is null then raise exception using errcode = 'P0002', message = 'not_found'; end if;
  if target = me then raise exception using errcode = '22023', message = 'self'; end if;
  if private.glowletter_is_blocked(me, target) then raise exception using errcode = 'P0002', message = 'not_found'; end if;
  select * into existing from public.glowletter_friendships as f
  where least(f.requester, f.addressee) = least(me, target) and greatest(f.requester, f.addressee) = greatest(me, target);
  if found then
    if existing.status = 'accepted' then return 'already'; end if;
    if existing.addressee = me then
      update public.glowletter_friendships set status = 'accepted', responded_at = now() where id = existing.id;
      return 'accepted';
    end if;
    return 'pending';
  end if;
  if (select count(*) from public.glowletter_friendships as f where f.requester = me and f.created_at >= now() - interval '24 hours') >= 30 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_friendships (requester, addressee) values (me, target);
  return 'sent';
end;
$$;

create or replace function public.glowletter_friends_respond(p_user uuid, p_accept boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_accept then
    update public.glowletter_friendships set status = 'accepted', responded_at = now()
    where requester = p_user and addressee = me and status = 'pending';
  else
    delete from public.glowletter_friendships where requester = p_user and addressee = me and status = 'pending';
  end if;
  return found;
end;
$$;

create or replace function public.glowletter_friends_remove(p_user uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  delete from public.glowletter_friendships as f
  where least(f.requester, f.addressee) = least(me, p_user) and greatest(f.requester, f.addressee) = greatest(me, p_user);
  return found;
end;
$$;

create or replace function public.glowletter_friends_block(p_user uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_user is null or p_user = me then raise exception using errcode = '22023', message = 'invalid'; end if;
  insert into public.glowletter_blocks (blocker, blocked) values (me, p_user) on conflict do nothing;
  delete from public.glowletter_friendships as f
  where least(f.requester, f.addressee) = least(me, p_user) and greatest(f.requester, f.addressee) = greatest(me, p_user);
  return true;
end;
$$;

-- Список: друзья (с онлайном и непрочитанными), входящие и исходящие заявки.
create or replace function public.glowletter_friends_list()
returns table (user_id uuid, display_name text, status text, last_seen timestamptz, unread integer, last_message_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_ensure_profile(me);
  update public.glowletter_profiles set last_seen = now() where glowletter_profiles.user_id = me;
  return query
  select other.id,
         p.display_name,
         case when f.status = 'accepted' then 'friend' when f.addressee = me then 'incoming' else 'outgoing' end,
         case when f.status = 'accepted' then p.last_seen end,
         (select count(*)::int from public.glowletter_messages as m where m.sender = other.id and m.recipient = me and m.read_at is null),
         (select max(m.created_at) from public.glowletter_messages as m where (m.sender = other.id and m.recipient = me) or (m.sender = me and m.recipient = other.id))
  from public.glowletter_friendships as f
  cross join lateral (select case when f.requester = me then f.addressee else f.requester end as id) as other
  left join public.glowletter_profiles as p on p.user_id = other.id
  where me in (f.requester, f.addressee);
end;
$$;

create or replace function public.glowletter_messages_send(p_to uuid, p_body text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  body text := pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_body, ''), '[\u0001-\u0009\u000B-\u001F\u007F]', '', 'g'));
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_to is null or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if pg_catalog.char_length(body) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if body ~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
     or private.glowletter_notice_message_is_forbidden(body) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '24 hours') >= 600 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_messages (sender, recipient, body) values (me, p_to, body) returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return message_id;
end;
$$;

create or replace function public.glowletter_messages_mark_read(p_from uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  changed integer;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  update public.glowletter_messages set read_at = now() where sender = p_from and recipient = me and read_at is null;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

create or replace function public.glowletter_messages_report(p_message uuid, p_reason text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  reason text := case when p_reason in ('abuse', 'adult', 'spam') then p_reason else 'other' end;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if not exists (select 1 from public.glowletter_messages where id = p_message and recipient = me) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if (select count(*) from public.glowletter_message_reports where reporter = me and created_at >= now() - interval '24 hours') >= 30 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_message_reports (message_id, reporter, reason) values (p_message, me, reason) on conflict do nothing;
  return true;
end;
$$;

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'public.glowletter_friends_me()', 'public.glowletter_friends_set_name(text)', 'public.glowletter_friends_touch()',
    'public.glowletter_friends_request(text)', 'public.glowletter_friends_respond(uuid, boolean)', 'public.glowletter_friends_remove(uuid)',
    'public.glowletter_friends_block(uuid)', 'public.glowletter_friends_list()', 'public.glowletter_messages_send(uuid, text)',
    'public.glowletter_messages_mark_read(uuid)', 'public.glowletter_messages_report(uuid, text)'
  ] loop
    execute format('revoke all on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end
$grants$;

notify pgrst, 'reload schema';
