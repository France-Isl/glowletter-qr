-- Игра «Да или нет» (живая, вдвоём онлайн). Автор с полным доступом создаёт
-- комнату и отправляет ссылку; партнёр открывает её без входа. Сам ход игры
-- идёт через Realtime Broadcast на канале с номером комнаты (его не угадать),
-- а здесь хранится только то, что комната существует, кто её создал и до
-- какого времени она открыта.

create table public.glowletter_game_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_id uuid not null unique default gen_random_uuid(),
  kind text not null default 'yesno' check (kind in ('yesno')),
  host_name text not null check (pg_catalog.char_length(host_name) between 1 and 36),
  guest_name text check (guest_name is null or pg_catalog.char_length(guest_name) between 1 and 36),
  language text check (language is null or language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

comment on table public.glowletter_game_rooms is
  'Live couple game rooms («Да или нет»). Created by paid users through glowletter_create_game_room; the game itself runs over Realtime Broadcast.';

create index glowletter_game_rooms_user_idx on public.glowletter_game_rooms (user_id, created_at desc);

alter table public.glowletter_game_rooms enable row level security;
revoke all on table public.glowletter_game_rooms from public, anon, authenticated;
grant select, delete on table public.glowletter_game_rooms to authenticated;
grant select, insert, update, delete on table public.glowletter_game_rooms to service_role;

create policy "Owners read their game rooms"
  on public.glowletter_game_rooms for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners delete their game rooms"
  on public.glowletter_game_rooms for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.glowletter_create_game_room(
  p_kind text,
  p_host_name text,
  p_guest_name text,
  p_language text
)
returns table (id uuid, public_id uuid, expires_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  host text;
  guest text;
  clean_language text := nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(p_language, ''))), '');
begin
  if owner_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not private.glowletter_has_paid_access(owner_id) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  if coalesce(p_kind, '') <> 'yesno' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  host := private.glowletter_clean_quiz_name(p_host_name);
  guest := private.glowletter_clean_quiz_name(p_guest_name);
  if host is null then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if clean_language is not null and clean_language not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi') then
    clean_language := null;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text || ':room', 0));
  if (select count(*) from public.glowletter_game_rooms as r where r.user_id = owner_id and r.created_at >= now() - interval '24 hours') >= 40 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  delete from public.glowletter_game_rooms as r where r.user_id = owner_id and r.expires_at <= now();

  return query
  insert into public.glowletter_game_rooms (user_id, kind, host_name, guest_name, language)
  values (owner_id, 'yesno', host, guest, clean_language)
  returning glowletter_game_rooms.id, glowletter_game_rooms.public_id, glowletter_game_rooms.expires_at;
end;
$$;

revoke all on function public.glowletter_create_game_room(text, text, text, text) from public, anon;
grant execute on function public.glowletter_create_game_room(text, text, text, text) to authenticated;

-- Комната для партнёра: только имена и вид игры. Вызывает функция couple-quiz.
create or replace function public.glowletter_get_game_room(p_public_id uuid)
returns table (kind text, host_name text, guest_name text, language text)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.kind, r.host_name, r.guest_name, r.language
  from public.glowletter_game_rooms as r
  where r.public_id = p_public_id and r.expires_at > now();
$$;

revoke all on function public.glowletter_get_game_room(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_get_game_room(uuid) to service_role;

notify pgrst, 'reload schema';
