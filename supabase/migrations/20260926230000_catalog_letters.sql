-- Стихи и письма, которые владелец добавляет в коллекцию из админ-панели
-- (2.4.16). Опубликованные строки читает любой клиент — и гость, и аккаунт —
-- через glowletter_catalog_letters(); черновики и скрытые тексты видит только
-- администратор. Тексты лежат по языкам в jsonb ({"ru": "…", "en": "…"}):
-- в приложении текст показывается только на тех языках, для которых он есть,
-- переводы дописываются позже той же строкой. Нумерация продолжает
-- встроенные 50 писем (id с 51), номера не переиспользуются.

create or replace function private.glowletter_catalog_texts_valid(p_texts jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.jsonb_typeof(p_texts) = 'object'
    and not exists (
      select 1
      from pg_catalog.jsonb_each(p_texts) as entry(key, value)
      where entry.key not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi')
         or pg_catalog.jsonb_typeof(entry.value) <> 'string'
         or pg_catalog.char_length(entry.value #>> '{}') < 1
         or pg_catalog.char_length(entry.value #>> '{}') > 1500
    );
$$;

revoke all on function private.glowletter_catalog_texts_valid(jsonb) from public, anon, authenticated;

-- Текст письма: единые переносы строк, без управляющих символов, без
-- хвостовых пробелов в строках и без «дыр» больше одной пустой строки.
create or replace function private.glowletter_catalog_clean_text(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.btrim(
    pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(
        pg_catalog.regexp_replace(
          pg_catalog.regexp_replace(
            pg_catalog.normalize(coalesce(p_text, ''), 'NFKC'),
            pg_catalog.chr(13) || pg_catalog.chr(10) || '|' || pg_catalog.chr(13), pg_catalog.chr(10), 'g'
          ),
          '[' || pg_catalog.chr(1) || '-' || pg_catalog.chr(8) || pg_catalog.chr(11) || pg_catalog.chr(12) || pg_catalog.chr(14) || '-' || pg_catalog.chr(31) || pg_catalog.chr(127) || ']', '', 'g'
        ),
        '[ ' || pg_catalog.chr(9) || ']+' || pg_catalog.chr(10), pg_catalog.chr(10), 'g'
      ),
      pg_catalog.chr(10) || '{3,}', pg_catalog.chr(10) || pg_catalog.chr(10), 'g'
    ),
    ' ' || pg_catalog.chr(9) || pg_catalog.chr(10)
  );
$$;

revoke all on function private.glowletter_catalog_clean_text(text) from public, anon, authenticated;

-- Автор: одна строка, до 80 символов.
create or replace function private.glowletter_catalog_clean_line(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.btrim(
    pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.normalize(coalesce(p_text, ''), 'NFKC'), '[[:cntrl:]]', ' ', 'g'),
      '[[:space:]]+', ' ', 'g'
    )
  );
$$;

revoke all on function private.glowletter_catalog_clean_line(text) from public, anon, authenticated;

create table public.glowletter_catalog_letters (
  id bigint generated always as identity (start with 51) primary key,
  category text not null default 'poem'
    check (category in ('warm', 'gratitude', 'support', 'family', 'poem')),
  texts jsonb not null default '{}'::jsonb
    constraint glowletter_catalog_letters_texts_check check (private.glowletter_catalog_texts_valid(texts)),
  source_language text not null
    check (source_language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi')),
  author text check (author is null or pg_catalog.char_length(author) between 1 and 80),
  is_free boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.glowletter_catalog_letters is
  'Owner-curated collection texts (poems and letters) in up to twenty-five languages. Published rows are public through glowletter_catalog_letters(); writes go through admin RPCs only.';

alter table public.glowletter_catalog_letters enable row level security;
revoke all on table public.glowletter_catalog_letters from public, anon, authenticated;
grant select, insert, update, delete on table public.glowletter_catalog_letters to service_role;

create index glowletter_catalog_letters_status_idx
  on public.glowletter_catalog_letters (status, id);

-- Что видят все: только опубликованные тексты.
create or replace function public.glowletter_catalog_letters()
returns table (
  id bigint,
  category text,
  texts jsonb,
  author text,
  is_free boolean,
  published_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.category, l.texts, l.author, l.is_free, l.published_at, l.updated_at
  from public.glowletter_catalog_letters as l
  where l.status = 'published'
  order by l.id
  limit 500;
$$;

revoke all on function public.glowletter_catalog_letters() from public;
grant execute on function public.glowletter_catalog_letters() to anon, authenticated, service_role;

-- Админ-панель: полный список, включая черновики и скрытые.
create or replace function public.glowletter_admin_catalog_list()
returns table (
  id bigint,
  category text,
  texts jsonb,
  source_language text,
  author text,
  is_free boolean,
  status text,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
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
    select l.id, l.category, l.texts, l.source_language, l.author, l.is_free, l.status, l.published_at, l.created_at, l.updated_at
    from public.glowletter_catalog_letters as l
    order by l.id desc
    limit 500;
end;
$$;

-- Добавить новый текст (p_id пуст) или изменить существующий: текст на
-- выбранном языке дописывается к остальным переводам, а не заменяет их.
create or replace function public.glowletter_admin_catalog_save(
  p_id bigint,
  p_language text,
  p_text text,
  p_category text,
  p_author text,
  p_is_free boolean,
  p_status text
)
returns public.glowletter_catalog_letters
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  clean_language text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_language, '')));
  clean_category text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_category, 'poem')));
  clean_status text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_status, 'draft')));
  clean_text text;
  clean_author text;
  result public.glowletter_catalog_letters;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if pg_catalog.octet_length(coalesce(p_text, '')) > 12000 or pg_catalog.octet_length(coalesce(p_author, '')) > 1024 then
    raise exception 'catalog text input is too large' using errcode = '22023';
  end if;
  if clean_language not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi') then
    raise exception 'invalid catalog language' using errcode = '22023';
  end if;
  if clean_category not in ('warm', 'gratitude', 'support', 'family', 'poem') then
    raise exception 'invalid catalog category' using errcode = '22023';
  end if;
  if clean_status not in ('draft', 'published', 'hidden') then
    raise exception 'invalid catalog status' using errcode = '22023';
  end if;

  clean_text := private.glowletter_catalog_clean_text(p_text);
  if pg_catalog.char_length(clean_text) < 10 or pg_catalog.char_length(clean_text) > 1500 then
    raise exception 'catalog text must be between 10 and 1500 characters' using errcode = '22023';
  end if;
  if private.glowletter_notice_message_is_forbidden(clean_text) then
    raise exception 'catalog text contains prohibited content' using errcode = '22023';
  end if;

  clean_author := nullif(private.glowletter_catalog_clean_line(p_author), '');
  if clean_author is not null and pg_catalog.char_length(clean_author) > 80 then
    raise exception 'catalog author must not exceed 80 characters' using errcode = '22023';
  end if;

  if p_id is null then
    insert into public.glowletter_catalog_letters (category, texts, source_language, author, is_free, status, created_by, updated_by, published_at)
    values (
      clean_category,
      pg_catalog.jsonb_build_object(clean_language, clean_text),
      clean_language,
      clean_author,
      coalesce(p_is_free, false),
      clean_status,
      actor_id,
      actor_id,
      case when clean_status = 'published' then now() else null end
    )
    returning * into result;
  else
    update public.glowletter_catalog_letters as l
    set category = clean_category,
        texts = l.texts || pg_catalog.jsonb_build_object(clean_language, clean_text),
        author = clean_author,
        is_free = coalesce(p_is_free, false),
        status = clean_status,
        published_at = case when clean_status = 'published' then coalesce(l.published_at, now()) else l.published_at end,
        updated_by = actor_id,
        updated_at = now()
    where l.id = p_id
    returning * into result;
    if not found then
      raise exception 'catalog letter not found' using errcode = 'P0002';
    end if;
  end if;

  return result;
end;
$$;

-- Скрыть, показать или опубликовать черновик.
create or replace function public.glowletter_admin_catalog_set_status(p_id bigint, p_status text)
returns public.glowletter_catalog_letters
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  clean_status text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_status, '')));
  result public.glowletter_catalog_letters;
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if clean_status not in ('draft', 'published', 'hidden') then
    raise exception 'invalid catalog status' using errcode = '22023';
  end if;

  update public.glowletter_catalog_letters as l
  set status = clean_status,
      published_at = case when clean_status = 'published' then coalesce(l.published_at, now()) else l.published_at end,
      updated_by = actor_id,
      updated_at = now()
  where l.id = p_id
  returning * into result;
  if not found then
    raise exception 'catalog letter not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

create or replace function public.glowletter_admin_catalog_delete(p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  delete from public.glowletter_catalog_letters as l where l.id = p_id;
  return found;
end;
$$;

revoke all on function public.glowletter_admin_catalog_list() from public, anon;
revoke all on function public.glowletter_admin_catalog_save(bigint, text, text, text, text, boolean, text) from public, anon;
revoke all on function public.glowletter_admin_catalog_set_status(bigint, text) from public, anon;
revoke all on function public.glowletter_admin_catalog_delete(bigint) from public, anon;
grant execute on function public.glowletter_admin_catalog_list() to authenticated, service_role;
grant execute on function public.glowletter_admin_catalog_save(bigint, text, text, text, text, boolean, text) to authenticated, service_role;
grant execute on function public.glowletter_admin_catalog_set_status(bigint, text) to authenticated, service_role;
grant execute on function public.glowletter_admin_catalog_delete(bigint) to authenticated, service_role;
