-- Игра «Насколько хорошо ты меня знаешь?» (2.4.22). Отправитель с полным
-- доступом выбирает вопросы о себе из готового списка приложения и отмечает
-- свои ответы. Получатель открывает ссылку без входа, угадывает, и сервер
-- считает совпадения: правильные ответы не покидают базу до конца игры.
-- Результат видит только автор теста. Своих вопросов нет — только проверенный
-- список, поэтому в игре не бывает недетского текста; имена проходят тот же
-- фильтр слов, что и уведомления.

-- Полный доступ на сервере: VIP или «навсегда» от владельца, либо действующая
-- покупка Google Play (подписка или разовая «Навсегда»).
create or replace function private.glowletter_has_paid_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null and (
    exists (
      select 1 from public.glowletter_accounts as account
      where account.user_id = p_user_id
        and (account.premium_forever or coalesce(account.vip_until > now(), false))
    )
    or exists (
      select 1 from private.glowletter_play_entitlements as entitlement
      where entitlement.user_id = p_user_id
        and entitlement.state in ('active', 'verified_pending_ack')
        and (entitlement.expiry_time is null or entitlement.expiry_time > now())
    )
  );
$$;

revoke all on function private.glowletter_has_paid_access(uuid) from public, anon, authenticated;

create table public.glowletter_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_id uuid not null unique default gen_random_uuid(),
  sender_name text not null check (pg_catalog.char_length(sender_name) between 1 and 36),
  recipient_name text check (recipient_name is null or pg_catalog.char_length(recipient_name) between 1 and 36),
  language text check (language is null or language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi')),
  -- [{"id":"q01","answer":2}, …]: номер вопроса из списка приложения и номер верного варианта.
  questions jsonb not null check (pg_catalog.jsonb_typeof(questions) = 'array' and pg_catalog.jsonb_array_length(questions) between 5 and 12),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '180 days')
);

comment on table public.glowletter_quizzes is
  'Couple quiz «How well do you know me?». Created through glowletter_create_quiz by paid users; answers stay server-side until a player finishes.';

create index glowletter_quizzes_user_idx on public.glowletter_quizzes (user_id, created_at desc);

create table public.glowletter_quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.glowletter_quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text check (player_name is null or pg_catalog.char_length(player_name) between 1 and 36),
  answers jsonb not null check (pg_catalog.jsonb_typeof(answers) = 'array'),
  score smallint not null check (score >= 0),
  total smallint not null check (total between 5 and 12 and score <= total),
  language text,
  source_hash text not null check (pg_catalog.char_length(source_hash) = 64),
  created_at timestamptz not null default now(),
  seen_at timestamptz check (seen_at is null or seen_at >= created_at)
);

comment on table public.glowletter_quiz_results is
  'Finished couple quiz games. Written only by the couple-quiz edge function; the quiz author reads them and marks them seen.';

create index glowletter_quiz_results_user_idx on public.glowletter_quiz_results (user_id, created_at desc);
create index glowletter_quiz_results_quiz_idx on public.glowletter_quiz_results (quiz_id, created_at desc);
create index glowletter_quiz_results_source_idx on public.glowletter_quiz_results (source_hash, created_at desc);

alter table public.glowletter_quizzes enable row level security;
alter table public.glowletter_quiz_results enable row level security;
revoke all on table public.glowletter_quizzes from public, anon, authenticated;
revoke all on table public.glowletter_quiz_results from public, anon, authenticated;
grant select, delete on table public.glowletter_quizzes to authenticated;
grant select on table public.glowletter_quiz_results to authenticated;
grant update (seen_at) on table public.glowletter_quiz_results to authenticated;
grant select, insert, update, delete on table public.glowletter_quizzes to service_role;
grant select, insert, update, delete on table public.glowletter_quiz_results to service_role;

create policy "Owners read their quizzes"
  on public.glowletter_quizzes for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners delete their quizzes"
  on public.glowletter_quizzes for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners read results of their quizzes"
  on public.glowletter_quiz_results for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners mark quiz results seen"
  on public.glowletter_quiz_results for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Автор узнаёт о новом результате сразу.
do $realtime$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'glowletter_quiz_results'
  ) then
    execute 'alter publication supabase_realtime add table public.glowletter_quiz_results';
  end if;
end
$realtime$;

create or replace function private.glowletter_clean_quiz_name(p_name text)
returns text
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  cleaned text := nullif(pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_name, ''), '[[:space:][:cntrl:]]+', ' ', 'g')), '');
begin
  if cleaned is null then
    return null;
  end if;
  if pg_catalog.char_length(cleaned) > 36 or private.glowletter_notice_message_is_forbidden(cleaned) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  return cleaned;
end;
$$;

revoke all on function private.glowletter_clean_quiz_name(text) from public, anon, authenticated;

-- Создание теста. Только с полным доступом; не больше 30 тестов в сутки.
create or replace function public.glowletter_create_quiz(
  p_sender_name text,
  p_recipient_name text,
  p_language text,
  p_questions jsonb
)
returns table (id uuid, public_id uuid, expires_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  sender text;
  recipient text;
  clean_language text := nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(p_language, ''))), '');
  item jsonb;
  question_ids text[] := '{}';
  clean_questions jsonb := '[]'::jsonb;
begin
  if owner_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not private.glowletter_has_paid_access(owner_id) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  sender := private.glowletter_clean_quiz_name(p_sender_name);
  recipient := private.glowletter_clean_quiz_name(p_recipient_name);
  if sender is null then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if clean_language is not null and clean_language not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko', 'zh', 'th', 'ar', 'ind', 'vi') then
    clean_language := null;
  end if;
  if p_questions is null or pg_catalog.jsonb_typeof(p_questions) <> 'array'
     or pg_catalog.jsonb_array_length(p_questions) not between 5 and 12 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  for item in select value from pg_catalog.jsonb_array_elements(p_questions) loop
    if pg_catalog.jsonb_typeof(item) <> 'object'
       or coalesce(item ->> 'id', '') !~ '^q[0-9]{2}$'
       or coalesce(item ->> 'answer', '') !~ '^[0-3]$'
       or (item ->> 'id') = any (question_ids) then
      raise exception using errcode = '22023', message = 'invalid';
    end if;
    question_ids := question_ids || (item ->> 'id');
    clean_questions := clean_questions || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('id', item ->> 'id', 'answer', (item ->> 'answer')::int)
    );
  end loop;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text || ':quiz', 0));
  if (select count(*) from public.glowletter_quizzes as q where q.user_id = owner_id and q.created_at >= now() - interval '24 hours') >= 30 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  -- Просроченные тесты не храним.
  delete from public.glowletter_quizzes as q where q.user_id = owner_id and q.expires_at <= now();

  return query
  insert into public.glowletter_quizzes (user_id, sender_name, recipient_name, language, questions)
  values (owner_id, sender, recipient, clean_language, clean_questions)
  returning glowletter_quizzes.id, glowletter_quizzes.public_id, glowletter_quizzes.expires_at;
end;
$$;

revoke all on function public.glowletter_create_quiz(text, text, text, jsonb) from public, anon;
grant execute on function public.glowletter_create_quiz(text, text, text, jsonb) to authenticated;

-- Тест для игрока: имена и номера вопросов, без ответов. Вызывает только
-- функция couple-quiz.
create or replace function public.glowletter_get_quiz(p_public_id uuid)
returns table (sender_name text, recipient_name text, language text, question_ids text[])
language sql
stable
security invoker
set search_path = ''
as $$
  select q.sender_name, q.recipient_name, q.language,
         array(select element ->> 'id' from pg_catalog.jsonb_array_elements(q.questions) with ordinality as e(element, ord) order by ord)
  from public.glowletter_quizzes as q
  where q.public_id = p_public_id and q.expires_at > now();
$$;

revoke all on function public.glowletter_get_quiz(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_get_quiz(uuid) to service_role;

-- Ответы игрока. Лимиты: 12 игр в час и 40 в день с одного источника,
-- 30 игр на один тест в сутки. Возвращает счёт и верные ответы.
create or replace function public.glowletter_submit_quiz(
  p_public_id uuid,
  p_player_name text,
  p_answers jsonb,
  p_language text,
  p_source_hash text
)
returns table (score integer, total integer, correct integer[])
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  quiz record;
  player text;
  clean_language text := nullif(pg_catalog.lower(pg_catalog.btrim(coalesce(p_language, ''))), '');
  right_answers integer[];
  given integer[];
  points integer := 0;
  idx integer;
begin
  if p_public_id is null or p_source_hash is null or pg_catalog.char_length(p_source_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  select q.id, q.user_id, q.questions into quiz
  from public.glowletter_quizzes as q
  where q.public_id = p_public_id and q.expires_at > now();
  if quiz.id is null then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  player := private.glowletter_clean_quiz_name(p_player_name);

  right_answers := array(select (element ->> 'answer')::int from pg_catalog.jsonb_array_elements(quiz.questions) with ordinality as e(element, ord) order by ord);
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'array'
     or pg_catalog.jsonb_array_length(p_answers) <> pg_catalog.cardinality(right_answers) then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if exists (select 1 from pg_catalog.jsonb_array_elements(p_answers) as a(value) where a.value::text !~ '^[0-3]$') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  given := array(select a.value::text::int from pg_catalog.jsonb_array_elements(p_answers) with ordinality as a(value, ord) order by ord);
  for idx in 1 .. pg_catalog.cardinality(right_answers) loop
    if given[idx] = right_answers[idx] then
      points := points + 1;
    end if;
  end loop;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_source_hash, 0));
  if (select count(*) from public.glowletter_quiz_results as r where r.source_hash = p_source_hash and r.created_at >= now() - interval '1 hour') >= 12
     or (select count(*) from public.glowletter_quiz_results as r where r.source_hash = p_source_hash and r.created_at >= pg_catalog.date_trunc('day', now())) >= 40
     or (select count(*) from public.glowletter_quiz_results as r where r.quiz_id = quiz.id and r.created_at >= now() - interval '24 hours') >= 30 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  if clean_language is not null and clean_language !~ '^[a-z]{2,3}$' then
    clean_language := null;
  end if;

  insert into public.glowletter_quiz_results (quiz_id, user_id, player_name, answers, score, total, language, source_hash)
  values (quiz.id, quiz.user_id, player, pg_catalog.to_jsonb(given), points, pg_catalog.cardinality(right_answers), clean_language, p_source_hash);

  return query select points, pg_catalog.cardinality(right_answers), right_answers;
end;
$$;

revoke all on function public.glowletter_submit_quiz(uuid, text, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.glowletter_submit_quiz(uuid, text, jsonb, text, text) to service_role;

notify pgrst, 'reload schema';
