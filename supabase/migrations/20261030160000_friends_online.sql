-- Онлайн с друзьями (2.4.25): сердечки в реальном времени, Тёпа в гостях,
-- «Рисуем вместе» и голосовые сообщения. Сердечки, Тёпа и приглашение
-- рисовать — обычные сообщения особого вида ([[react:…]], [[bear:…]],
-- [[draw:…]]), поэтому идут через тот же Realtime, блокировку и лимиты.
-- Сердечки не считаются непрочитанными. Голос хранится 30 дней, отдельно
-- от текста; прослушать его могут только отправитель и получатель.

create table public.glowletter_voice_notes (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  mime_type text not null check (mime_type in ('audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/wav')),
  seconds integer not null check (seconds between 1 and 60),
  audio bytea not null check (pg_catalog.octet_length(audio) between 200 and 600000),
  created_at timestamptz not null default now()
);
create index glowletter_voice_notes_sender_idx on public.glowletter_voice_notes (sender, created_at desc);
create index glowletter_voice_notes_created_idx on public.glowletter_voice_notes (created_at);
comment on table public.glowletter_voice_notes is 'Voice messages between friends, kept 30 days. Read and written only through glowletter_voice_send/get.';

alter table public.glowletter_voice_notes enable row level security;
revoke all on table public.glowletter_voice_notes from public, anon, authenticated;
grant all on table public.glowletter_voice_notes to service_role;

-- Голосовое сообщение: файл и сообщение [[voice:id:секунды]] в одной транзакции.
create or replace function public.glowletter_voice_send(p_to uuid, p_mime text, p_audio text, p_seconds integer)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  mime text := pg_catalog.lower(pg_catalog.split_part(pg_catalog.btrim(coalesce(p_mime, '')), ';', 1));
  data bytea;
  note_id uuid;
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_to is null or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if mime = 'audio/x-m4a' then mime := 'audio/mp4'; end if;
  if mime not in ('audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/wav') or p_seconds is null or p_seconds not between 1 and 60 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  begin
    data := pg_catalog.decode(coalesce(p_audio, ''), 'base64');
  exception when others then
    raise exception using errcode = '22023', message = 'invalid';
  end;
  if pg_catalog.octet_length(data) not between 200 and 600000 then
    raise exception using errcode = '22023', message = 'too_large';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_voice_notes as v where v.sender = me and v.created_at >= now() - interval '1 hour') >= 40
     or (select count(*) from public.glowletter_voice_notes as v where v.sender = me and v.created_at >= now() - interval '24 hours') >= 150
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  delete from public.glowletter_voice_notes where created_at < now() - interval '30 days';
  insert into public.glowletter_voice_notes (sender, recipient, mime_type, seconds, audio)
  values (me, p_to, mime, p_seconds, data) returning id into note_id;
  insert into public.glowletter_messages (sender, recipient, body)
  values (me, p_to, '[[voice:' || note_id::text || ':' || p_seconds::text || ']]') returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return message_id;
end;
$$;

create or replace function public.glowletter_voice_get(p_id uuid)
returns table (mime_type text, audio text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return query
  select v.mime_type, pg_catalog.translate(pg_catalog.encode(v.audio, 'base64'), E'\n', '')
  from public.glowletter_voice_notes as v
  where v.id = p_id and me in (v.sender, v.recipient) and v.created_at >= now() - interval '30 days'
    and not private.glowletter_is_blocked(v.sender, v.recipient);
end;
$$;

-- Список друзей: сердечки ([[react:…]]) не считаются непрочитанными.
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
         (select count(*)::int from public.glowletter_messages as m where m.sender = other.id and m.recipient = me and m.read_at is null and m.body not like '[[react:%'),
         (select max(m.created_at) from public.glowletter_messages as m where (m.sender = other.id and m.recipient = me) or (m.sender = me and m.recipient = other.id))
  from public.glowletter_friendships as f
  cross join lateral (select case when f.requester = me then f.addressee else f.requester end as id) as other
  left join public.glowletter_profiles as p on p.user_id = other.id
  where me in (f.requester, f.addressee);
end;
$$;

revoke all on function public.glowletter_voice_send(uuid, text, text, integer) from public, anon;
grant execute on function public.glowletter_voice_send(uuid, text, text, integer) to authenticated;
revoke all on function public.glowletter_voice_get(uuid) from public, anon;
grant execute on function public.glowletter_voice_get(uuid) to authenticated;

notify pgrst, 'reload schema';
