-- Игра «Что мы любим»: та же живая комната, что у «Да или нет», другой вид.

alter table public.glowletter_game_rooms
  drop constraint glowletter_game_rooms_kind_check,
  add constraint glowletter_game_rooms_kind_check check (kind in ('yesno', 'loves'));

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
  clean_kind text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_kind, '')));
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
  if clean_kind not in ('yesno', 'loves') then
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
  values (owner_id, clean_kind, host, guest, clean_language)
  returning glowletter_game_rooms.id, glowletter_game_rooms.public_id, glowletter_game_rooms.expires_at;
end;
$$;

revoke all on function public.glowletter_create_game_room(text, text, text, text) from public, anon;
grant execute on function public.glowletter_create_game_room(text, text, text, text) to authenticated;
