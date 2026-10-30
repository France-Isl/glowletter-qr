-- «Мы вдвоём» (2.4.24): вопрос дня для двух друзей и общий мишка Тёпа.
-- Каждый день у всех один и тот же вопрос (dq001–dq120 по кругу). Свой ответ
-- пишется один раз; ответ друга виден только после своего. Тёпа растёт от
-- числа дней, когда ответили оба. Архив прошлых ответов — для полного доступа.
-- Всё удаляется вместе с аккаунтом.

create table public.glowletter_couple_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  question_id text not null check (question_id ~ '^dq[0-9]{3}$'),
  answer text not null check (pg_catalog.char_length(answer) between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (user_id, partner_id, day),
  check (user_id <> partner_id)
);
create index glowletter_couple_answers_partner_idx on public.glowletter_couple_answers (partner_id, user_id, day desc);

comment on table public.glowletter_couple_answers is 'Daily-question answers between two accepted friends. Written only through glowletter_couple_answer.';

alter table public.glowletter_couple_answers enable row level security;
revoke all on table public.glowletter_couple_answers from public, anon, authenticated;
grant all on table public.glowletter_couple_answers to service_role;

-- Номер вопроса для дня: один и тот же для всех, 120 вопросов по кругу.
create or replace function private.glowletter_couple_question(p_day date)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'dq' || pg_catalog.lpad((((p_day - date '2026-01-01') % 120 + 120) % 120 + 1)::text, 3, '0');
$$;
revoke all on function private.glowletter_couple_question(date) from public, anon, authenticated;

-- День приходит с телефона (местная дата), но не дальше суток от серверной.
create or replace function private.glowletter_couple_day(p_day date)
returns date
language plpgsql
stable
set search_path = ''
as $$
begin
  if p_day is null or p_day not between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1 then
    raise exception using errcode = '22023', message = 'invalid_day';
  end if;
  return p_day;
end;
$$;
revoke all on function private.glowletter_couple_day(date) from public, anon, authenticated;

-- Сводка пары: сколько дней ответили оба и сколько дней подряд.
create or replace function private.glowletter_couple_stats(p_me uuid, p_partner uuid, p_day date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  together integer;
  streak integer := 0;
  cursor_day date := p_day;
begin
  select count(*) into together
  from public.glowletter_couple_answers as a
  join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = p_me and b.day = a.day
  where a.user_id = p_me and a.partner_id = p_partner;

  -- Серия не рвётся, пока сегодняшний день ещё не закрыт.
  if not exists (
    select 1 from public.glowletter_couple_answers as a
    join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = p_me and b.day = a.day
    where a.user_id = p_me and a.partner_id = p_partner and a.day = cursor_day
  ) then
    cursor_day := cursor_day - 1;
  end if;
  loop
    exit when not exists (
      select 1 from public.glowletter_couple_answers as a
      join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = p_me and b.day = a.day
      where a.user_id = p_me and a.partner_id = p_partner and a.day = cursor_day
    );
    streak := streak + 1;
    cursor_day := cursor_day - 1;
    exit when streak >= 1000;
  end loop;
  return pg_catalog.jsonb_build_object('together', together, 'streak', streak);
end;
$$;
revoke all on function private.glowletter_couple_stats(uuid, uuid, date) from public, anon, authenticated;

create or replace function public.glowletter_couple_today(p_partner uuid, p_day date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_day date;
  mine text;
  theirs text;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_partner is null or not private.glowletter_are_friends(me, p_partner) or private.glowletter_is_blocked(me, p_partner) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  v_day := private.glowletter_couple_day(p_day);
  select a.answer into mine from public.glowletter_couple_answers as a where a.user_id = me and a.partner_id = p_partner and a.day = v_day;
  select a.answer into theirs from public.glowletter_couple_answers as a where a.user_id = p_partner and a.partner_id = me and a.day = v_day;
  return pg_catalog.jsonb_build_object(
    'day', v_day,
    'question', private.glowletter_couple_question(v_day),
    'mine', mine,
    'partner_answered', theirs is not null,
    'theirs', case when mine is not null then theirs end
  ) || private.glowletter_couple_stats(me, p_partner, v_day);
end;
$$;
revoke all on function public.glowletter_couple_today(uuid, date) from public, anon;
grant execute on function public.glowletter_couple_today(uuid, date) to authenticated;

create or replace function public.glowletter_couple_answer(p_partner uuid, p_day date, p_answer text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_day date;
  body text := pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_answer, ''), '[\u0001-\u0009\u000B-\u001F\u007F]', '', 'g'));
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_partner is null or not private.glowletter_are_friends(me, p_partner) or private.glowletter_is_blocked(me, p_partner) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  v_day := private.glowletter_couple_day(p_day);
  if pg_catalog.char_length(body) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if body ~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
     or private.glowletter_notice_message_is_forbidden(body) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  insert into public.glowletter_couple_answers (user_id, partner_id, day, question_id, answer)
  values (me, p_partner, v_day, private.glowletter_couple_question(v_day), body)
  on conflict (user_id, partner_id, day) do nothing;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return public.glowletter_couple_today(p_partner, v_day);
end;
$$;
revoke all on function public.glowletter_couple_answer(uuid, date, text) from public, anon;
grant execute on function public.glowletter_couple_answer(uuid, date, text) to authenticated;

-- Архив: прошлые дни, где ответили оба. Только с полным доступом.
create or replace function public.glowletter_couple_history(p_partner uuid, p_before date, p_limit integer default 30)
returns table (day date, question_id text, mine text, theirs text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_partner is null or not private.glowletter_are_friends(me, p_partner) or private.glowletter_is_blocked(me, p_partner) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  return query
    select a.day, a.question_id, a.answer, b.answer
    from public.glowletter_couple_answers as a
    join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = me and b.day = a.day
    where a.user_id = me and a.partner_id = p_partner and a.day < coalesce(p_before, (now() at time zone 'utc')::date + 2)
    order by a.day desc
    limit least(greatest(coalesce(p_limit, 30), 1), 100);
end;
$$;
revoke all on function public.glowletter_couple_history(uuid, date, integer) from public, anon;
grant execute on function public.glowletter_couple_history(uuid, date, integer) to authenticated;

-- Для значка на главной: кто из друзей уже ответил сегодня, а я — ещё нет.
create or replace function public.glowletter_couple_waiting(p_day date)
returns setof uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_day date;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  v_day := private.glowletter_couple_day(p_day);
  return query
    select b.user_id
    from public.glowletter_couple_answers as b
    where b.partner_id = me and b.day = v_day
      and private.glowletter_are_friends(me, b.user_id)
      and not private.glowletter_is_blocked(me, b.user_id)
      and not exists (select 1 from public.glowletter_couple_answers as a where a.user_id = me and a.partner_id = b.user_id and a.day = v_day);
end;
$$;
revoke all on function public.glowletter_couple_waiting(date) from public, anon;
grant execute on function public.glowletter_couple_waiting(date) to authenticated;
