-- Ответ получателя и «письмо прочитано» (2.4.17). Получатель QR-письма
-- отвечает одним касанием (реакция и, по желанию, пара слов), а отправитель
-- видит в «Моментах», когда письмо открыли и что ответили. Ответы пишет только
-- серверная функция reply-letter (service_role) с лимитами по источнику и по
-- ссылке; владелец читает свои ответы и помечает их увиденными. Письмо,
-- которое получатель «сохранил себе», лежит в его собственной истории с
-- источником received.

alter table public.glowletter_letters
  drop constraint glowletter_letters_source_check,
  add constraint glowletter_letters_source_check
    check (source in ('ai', 'custom', 'template', 'florist', 'received'));

alter table public.glowletter_qr_links
  add column opened_at timestamptz,
  add column last_opened_at timestamptz,
  add column open_count integer not null default 0 check (open_count >= 0);

comment on column public.glowletter_qr_links.opened_at is 'First time the recipient opened the letter; set by glowletter_record_qr_open.';

create table public.glowletter_letter_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  qr_link_id uuid not null references public.glowletter_qr_links(id) on delete cascade,
  letter_id uuid,
  public_id uuid not null,
  reaction text not null default 'heart' check (reaction in ('heart', 'thanks', 'smile', 'tears')),
  message text check (message is null or pg_catalog.char_length(message) between 1 and 240),
  language text check (language is null or language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi')),
  source_hash text not null check (pg_catalog.char_length(source_hash) = 64),
  created_at timestamptz not null default now(),
  seen_at timestamptz check (seen_at is null or seen_at >= created_at)
);

comment on table public.glowletter_letter_replies is
  'Recipient reactions and short replies to QR letters. Written only by the reply-letter edge function; the letter owner reads them and marks them seen.';

create index glowletter_letter_replies_user_idx on public.glowletter_letter_replies (user_id, created_at desc);
create index glowletter_letter_replies_link_idx on public.glowletter_letter_replies (qr_link_id, created_at desc);
create index glowletter_letter_replies_source_idx on public.glowletter_letter_replies (source_hash, created_at desc);

alter table public.glowletter_letter_replies enable row level security;
revoke all on table public.glowletter_letter_replies from public, anon, authenticated;
grant select on table public.glowletter_letter_replies to authenticated;
grant update (seen_at) on table public.glowletter_letter_replies to authenticated;
grant select, insert, update, delete on table public.glowletter_letter_replies to service_role;

create policy "Owners read replies to their letters"
  on public.glowletter_letter_replies
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners mark replies seen"
  on public.glowletter_letter_replies
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Realtime: отправитель узнаёт об ответе и об открытии письма сразу.
-- Postgres Changes уважает политики select выше.
do $realtime$
begin
  if not exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    execute 'create publication supabase_realtime';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'glowletter_letter_replies'
  ) then
    execute 'alter publication supabase_realtime add table public.glowletter_letter_replies';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'glowletter_qr_links'
  ) then
    execute 'alter publication supabase_realtime add table public.glowletter_qr_links';
  end if;
end
$realtime$;

-- «Письмо прочитано»: resolve-letter вызывает после удачного открытия.
-- Возвращает true при первом открытии ссылки.
create or replace function public.glowletter_record_qr_open(p_public_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  link_id uuid;
  first_open boolean;
begin
  select l.id, l.opened_at is null
  into link_id, first_open
  from public.glowletter_qr_links as l
  where l.public_id = p_public_id
    and l.status = 'active'
    and (l.expires_at is null or l.expires_at > now())
    and (l.unlock_at is null or l.unlock_at <= now())
  for update;
  if link_id is null then
    return false;
  end if;

  update public.glowletter_qr_links as l
  set opened_at = coalesce(l.opened_at, now()),
      last_opened_at = now(),
      open_count = least(l.open_count + 1, 1000000)
  where l.id = link_id;

  return first_open;
end;
$$;

revoke all on function public.glowletter_record_qr_open(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_record_qr_open(uuid) to service_role;

-- Ответ получателя. Лимиты: 10 ответов в час и 40 в день с одного источника,
-- 50 ответов на одну ссылку в сутки; повтор той же реакции и текста в течение
-- суток возвращает прежний ответ. Текст проходит тот же фильтр, что и
-- уведомления.
create or replace function public.glowletter_create_letter_reply(
  p_public_id uuid,
  p_reaction text,
  p_message text,
  p_language text,
  p_source_hash text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  link record;
  clean_reaction text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_reaction, 'heart')));
  clean_language text := nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(p_language, ''))), '');
  clean_message text;
  existing_id uuid;
  reply_id uuid;
begin
  if p_public_id is null or p_source_hash is null or pg_catalog.char_length(p_source_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if clean_reaction not in ('heart', 'thanks', 'smile', 'tears') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if pg_catalog.octet_length(coalesce(p_message, '')) > 2048 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  clean_message := private.glowletter_normalize_notice_message(p_message);
  if clean_message is not null and pg_catalog.char_length(clean_message) > 240 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if private.glowletter_notice_message_is_forbidden(clean_message) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  if clean_language is not null and clean_language not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi') then
    clean_language := null;
  end if;

  select l.id, l.user_id, l.letter_id
  into link
  from public.glowletter_qr_links as l
  where l.public_id = p_public_id
    and l.status = 'active'
    and (l.expires_at is null or l.expires_at > now())
    and (l.unlock_at is null or l.unlock_at <= now())
  limit 1;
  if link.id is null then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;

  -- Старые ответы не хранятся дольше года.
  delete from public.glowletter_letter_replies as r where r.created_at < now() - interval '12 months';

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_source_hash, 0));

  select r.id into existing_id
  from public.glowletter_letter_replies as r
  where r.source_hash = p_source_hash
    and r.qr_link_id = link.id
    and r.reaction = clean_reaction
    and r.message is not distinct from clean_message
    and r.created_at >= now() - interval '24 hours'
  order by r.created_at desc
  limit 1;
  if existing_id is not null then
    return existing_id;
  end if;

  if (select count(*) from public.glowletter_letter_replies as r where r.source_hash = p_source_hash and r.created_at >= now() - interval '1 hour') >= 10
     or (select count(*) from public.glowletter_letter_replies as r where r.source_hash = p_source_hash and r.created_at >= pg_catalog.date_trunc('day', now())) >= 40
     or (select count(*) from public.glowletter_letter_replies as r where r.qr_link_id = link.id and r.created_at >= now() - interval '24 hours') >= 50 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.glowletter_letter_replies (user_id, qr_link_id, letter_id, public_id, reaction, message, language, source_hash)
  values (link.user_id, link.id, link.letter_id, p_public_id, clean_reaction, clean_message, clean_language, p_source_hash)
  returning id into reply_id;
  return reply_id;
end;
$$;

revoke all on function public.glowletter_create_letter_reply(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.glowletter_create_letter_reply(uuid, text, text, text, text) to service_role;
