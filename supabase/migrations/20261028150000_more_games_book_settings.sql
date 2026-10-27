-- Три новые живые игры («Кто быстрее», «Кто из нас?», «Закончи фразу»),
-- «Книга пары» и настройки, сохранённые в аккаунте.

alter table public.glowletter_game_rooms
  drop constraint glowletter_game_rooms_kind_check,
  add constraint glowletter_game_rooms_kind_check check (kind in ('yesno', 'loves', 'cards', 'duel', 'who', 'phrase'));

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
  if clean_kind not in ('yesno', 'loves', 'cards', 'duel', 'who', 'phrase') then
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

-- «Закончи фразу»: ответ проверяется тем же фильтром слов до того, как его
-- увидит партнёр. Ничего не сохраняет; доступна и гостю без аккаунта.
create or replace function private.glowletter_phrase_is_forbidden(p_text text)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select coalesce(p_text, '') ~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
      or private.glowletter_notice_message_is_forbidden(p_text);
$$;
revoke all on function private.glowletter_phrase_is_forbidden(text) from public, anon, authenticated;

create or replace function public.glowletter_check_phrase(p_text text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if pg_catalog.char_length(pg_catalog.btrim(coalesce(p_text, ''))) not between 1 and 200 then
    return false;
  end if;
  return not private.glowletter_phrase_is_forbidden(p_text);
end;
$$;
revoke all on function public.glowletter_check_phrase(text) from public;
grant execute on function public.glowletter_check_phrase(text) to anon, authenticated;

-- «Книга пары»: сохранённые ответы из «Закончи фразу». Пишется только через
-- RPC (с фильтром слов и лимитом), читать и удалять может только владелец.
create table public.glowletter_couple_book (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text not null check (prompt_id ~ '^p[0-9]{2}$'),
  language text,
  partner_name text check (partner_name is null or char_length(partner_name) <= 36),
  mine text check (mine is null or char_length(mine) between 1 and 200),
  theirs text check (theirs is null or char_length(theirs) between 1 and 200),
  created_at timestamptz not null default now()
);
create index glowletter_couple_book_user_idx on public.glowletter_couple_book (user_id, created_at desc);
comment on table public.glowletter_couple_book is 'Couple book: saved answers from the live game “Finish the sentence”.';

alter table public.glowletter_couple_book enable row level security;
revoke all on table public.glowletter_couple_book from public, anon, authenticated;
grant select, delete on table public.glowletter_couple_book to authenticated;
grant all on table public.glowletter_couple_book to service_role;
create policy "Owners read their couple book" on public.glowletter_couple_book
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners delete their couple book pages" on public.glowletter_couple_book
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.glowletter_book_add(p_prompt text, p_language text, p_partner text, p_mine text, p_theirs text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  clean_mine text := nullif(pg_catalog.btrim(coalesce(p_mine, '')), '');
  clean_theirs text := nullif(pg_catalog.btrim(coalesce(p_theirs, '')), '');
  page_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if coalesce(p_prompt, '') !~ '^p[0-9]{2}$' or (clean_mine is null and clean_theirs is null)
     or pg_catalog.char_length(coalesce(clean_mine, '')) > 200 or pg_catalog.char_length(coalesce(clean_theirs, '')) > 200 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if private.glowletter_phrase_is_forbidden(clean_mine) or private.glowletter_phrase_is_forbidden(clean_theirs) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  if (select count(*) from public.glowletter_couple_book as b where b.user_id = me) >= 500 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_couple_book (user_id, prompt_id, language, partner_name, mine, theirs)
  values (me, p_prompt,
          case when p_language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi') then p_language end,
          private.glowletter_clean_quiz_name(p_partner), clean_mine, clean_theirs)
  returning id into page_id;
  return page_id;
end;
$$;
revoke all on function public.glowletter_book_add(text, text, text, text, text) from public, anon;
grant execute on function public.glowletter_book_add(text, text, text, text, text) to authenticated;

-- Настройки в аккаунте: тема, фон, стиль письма. Небольшой объект, только свой.
create table public.glowletter_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb
    check (jsonb_typeof(settings) = 'object' and pg_column_size(settings) <= 2048),
  updated_at timestamptz not null default now()
);
comment on table public.glowletter_user_settings is 'Appearance settings that follow the account across devices.';

alter table public.glowletter_user_settings enable row level security;
revoke all on table public.glowletter_user_settings from public, anon, authenticated;
grant select, insert, update on table public.glowletter_user_settings to authenticated;
grant all on table public.glowletter_user_settings to service_role;
create policy "Owners read their settings" on public.glowletter_user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners create their settings" on public.glowletter_user_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners update their settings" on public.glowletter_user_settings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
