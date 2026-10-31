-- Комнаты звонков, игрового стола и рисунка (31.10).
-- Начать звонок или стол может только тот, у кого полный доступ; войти в комнату — только
-- приглашённые (приглашение идёт сообщением [[call:…]] / [[play:…]] / [[draw:…]]).
-- Каналы Realtime станут закрытыми, когда новая сборка выйдет в Google Play:
--   update private.glowletter_settings set value = 'true' where key = 'private_rooms';
-- До этого старые приложения и сайт говорят по открытым каналам.

create table if not exists public.glowletter_rooms (
  room uuid primary key,
  kind text not null check (kind in ('call', 'play', 'draw')),
  host uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists glowletter_rooms_created_idx on public.glowletter_rooms (created_at);

create table if not exists public.glowletter_room_members (
  room uuid not null references public.glowletter_rooms (room) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (room, user_id)
);
create index if not exists glowletter_room_members_user_idx on public.glowletter_room_members (user_id);

alter table public.glowletter_rooms enable row level security;
alter table public.glowletter_room_members enable row level security;
revoke all on public.glowletter_rooms, public.glowletter_room_members from anon, authenticated;

create table if not exists private.glowletter_settings (
  key text primary key,
  value jsonb not null
);
insert into private.glowletter_settings (key, value) values ('private_rooms', 'false') on conflict (key) do nothing;
revoke all on private.glowletter_settings from public, anon, authenticated;

-- Завести комнату или добавить в неё человека. Новую комнату звонка или стола заводит только
-- тот, у кого полный доступ; в уже заведённую зовёт только её участник; не больше 10 человек.
create or replace function private.glowletter_room_admit(p_me uuid, p_room uuid, p_kind text, p_guest uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
begin
  if p_me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(p_me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_room is null or p_kind not in ('call', 'play', 'draw') then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room::text || ':room', 0));
  if not exists (select 1 from public.glowletter_rooms where room = p_room) then
    if p_kind <> 'draw' and not private.glowletter_has_paid_access(p_me) then
      raise exception using errcode = '42501', message = 'premium_required';
    end if;
    delete from public.glowletter_rooms where created_at < now() - interval '2 days';
    insert into public.glowletter_rooms (room, kind, host) values (p_room, p_kind, p_me);
    insert into public.glowletter_room_members (room, user_id) values (p_room, p_me);
  elsif not exists (select 1 from public.glowletter_room_members where room = p_room and user_id = p_me) then
    raise exception using errcode = '42501', message = 'not_member';
  end if;
  if p_guest is not null and p_guest <> p_me
     and not exists (select 1 from public.glowletter_room_members where room = p_room and user_id = p_guest) then
    if (select count(*) from public.glowletter_room_members where room = p_room) >= 10 then
      raise exception using errcode = 'P0001', message = 'room_full';
    end if;
    insert into public.glowletter_room_members (room, user_id) values (p_room, p_guest);
  end if;
end;
$$;
revoke all on function private.glowletter_room_admit(uuid, uuid, text, uuid) from public, anon, authenticated;

-- Перед входом в канал: проверить доступ и узнать, закрытый ли канал.
create or replace function public.glowletter_room_open(p_room uuid, p_kind text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform private.glowletter_room_admit(auth.uid(), p_room, p_kind, null);
  return pg_catalog.jsonb_build_object('private',
    coalesce((select value = 'true'::jsonb from private.glowletter_settings where key = 'private_rooms'), false));
end;
$$;
revoke all on function public.glowletter_room_open(uuid, text) from public, anon;
grant execute on function public.glowletter_room_open(uuid, text) to authenticated;

-- Можно ли этому человеку слушать и писать в канал с таким именем.
create or replace function public.glowletter_room_topic_ok(p_topic text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select case when p_topic ~ '^glowletter-(call|table|draw):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    exists (
      select 1
      from public.glowletter_room_members as m
      join public.glowletter_rooms as r on r.room = m.room
      where m.room = pg_catalog.split_part(p_topic, ':', 2)::uuid
        and m.user_id = (select auth.uid())
        and r.created_at > now() - interval '24 hours'
    ) and not private.glowletter_is_banned((select auth.uid()))
  else false end
$$;
revoke all on function public.glowletter_room_topic_ok(text) from public, anon;
grant execute on function public.glowletter_room_topic_ok(text) to authenticated;

drop policy if exists glowletter_rooms_listen on realtime.messages;
create policy glowletter_rooms_listen on realtime.messages for select to authenticated
using (public.glowletter_room_topic_ok((select realtime.topic())));

drop policy if exists glowletter_rooms_send on realtime.messages;
create policy glowletter_rooms_send on realtime.messages for insert to authenticated
with check (public.glowletter_room_topic_ok((select realtime.topic())));

-- Приглашение в звонок, за стол или к рисунку заводит комнату и добавляет в неё друга.
create or replace function public.glowletter_messages_send(p_to uuid, p_body text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  body text := pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_body, ''), '[\u0001-\u0009\u000B-\u001F\u007F]', '', 'g'));
  sticker text;
  invite text[];
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
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
  if body ~ '^\[\[(photo|voice):' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  sticker := (pg_catalog.regexp_match(body, '^\[\[sticker:(s[0-9]{2})\]\]'))[1];
  if sticker is not null and not private.glowletter_owns_item(me, 'sticker:' || sticker) then
    raise exception using errcode = '42501', message = 'locked';
  end if;
  invite := pg_catalog.regexp_match(body, '^\[\[(call|play|draw):([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]$');
  if invite is not null then
    perform private.glowletter_room_admit(me, invite[2]::uuid, invite[1], p_to);
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
