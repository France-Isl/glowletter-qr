-- Владелец: «вопросов должно быть больше, чтобы игра больше затянула».
-- Список вырос до 60 вопросов, в одном тесте теперь до 20 (по умолчанию 15).

alter table public.glowletter_quizzes
  drop constraint glowletter_quizzes_questions_check,
  add constraint glowletter_quizzes_questions_check
    check (pg_catalog.jsonb_typeof(questions) = 'array' and pg_catalog.jsonb_array_length(questions) between 5 and 20);

alter table public.glowletter_quiz_results
  drop constraint glowletter_quiz_results_check,
  add constraint glowletter_quiz_results_check
    check (total between 5 and 20 and score <= total);

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
     or pg_catalog.jsonb_array_length(p_questions) not between 5 and 20 then
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
  delete from public.glowletter_quizzes as q where q.user_id = owner_id and q.expires_at <= now();

  return query
  insert into public.glowletter_quizzes (user_id, sender_name, recipient_name, language, questions)
  values (owner_id, sender, recipient, clean_language, clean_questions)
  returning glowletter_quizzes.id, glowletter_quizzes.public_id, glowletter_quizzes.expires_at;
end;
$$;

revoke all on function public.glowletter_create_quiz(text, text, text, jsonb) from public, anon;
grant execute on function public.glowletter_create_quiz(text, text, text, jsonb) to authenticated;
