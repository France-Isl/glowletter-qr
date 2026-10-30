-- «Мы вдвоём» (2.4.24): «Мишка как ты» и лента «Наша история».
-- Каждый выбирает своего Тёпу (наряд) для пары — друг видит его рядом со своим.
-- Наряд открывается от числа дней, когда ответили оба; с четвёртого — полный доступ.
-- «Наша история»: даты дружбы, первые письма и дни-вехи пары.

create table public.glowletter_couple_bears (
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  outfit text not null check (outfit ~ '^o(0[1-9]|1[0-2])$'),
  updated_at timestamptz not null default now(),
  primary key (user_id, partner_id),
  check (user_id <> partner_id)
);

comment on table public.glowletter_couple_bears is 'The bear outfit each person shows to one friend in «Мы вдвоём». Written only through glowletter_couple_wear.';

alter table public.glowletter_couple_bears enable row level security;
revoke all on table public.glowletter_couple_bears from public, anon, authenticated;
grant all on table public.glowletter_couple_bears to service_role;

-- Сколько дней вместе нужно для наряда o01–o12 (как OUTFITS в couple.js).
create or replace function private.glowletter_couple_outfit_days(p_outfit text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select (array[0, 1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 100])[pg_catalog.substr(p_outfit, 2)::integer];
$$;
revoke all on function private.glowletter_couple_outfit_days(text) from public, anon, authenticated;

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
    'theirs', case when mine is not null then theirs end,
    'my_bear', (select b.outfit from public.glowletter_couple_bears as b where b.user_id = me and b.partner_id = p_partner),
    'their_bear', (select b.outfit from public.glowletter_couple_bears as b where b.user_id = p_partner and b.partner_id = me)
  ) || private.glowletter_couple_stats(me, p_partner, v_day);
end;
$$;
revoke all on function public.glowletter_couple_today(uuid, date) from public, anon;
grant execute on function public.glowletter_couple_today(uuid, date) to authenticated;

create or replace function public.glowletter_couple_wear(p_partner uuid, p_outfit text, p_day date)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_day date;
  together integer;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_partner is null or not private.glowletter_are_friends(me, p_partner) or private.glowletter_is_blocked(me, p_partner) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  v_day := private.glowletter_couple_day(p_day);
  if p_outfit is null or p_outfit !~ '^o(0[1-9]|1[0-2])$' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  together := (private.glowletter_couple_stats(me, p_partner, v_day) ->> 'together')::integer;
  if together < private.glowletter_couple_outfit_days(p_outfit) then
    raise exception using errcode = '22023', message = 'locked';
  end if;
  if pg_catalog.substr(p_outfit, 2)::integer > 3 and not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  insert into public.glowletter_couple_bears (user_id, partner_id, outfit)
  values (me, p_partner, p_outfit)
  on conflict (user_id, partner_id) do update set outfit = excluded.outfit, updated_at = now();
  return public.glowletter_couple_today(p_partner, v_day);
end;
$$;
revoke all on function public.glowletter_couple_wear(uuid, text, date) from public, anon;
grant execute on function public.glowletter_couple_wear(uuid, text, date) to authenticated;

-- «Наша история»: когда подружились, первые письма, первый общий ответ и вехи
-- (1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 100 дней вместе — когда открывались наряды).
create or replace function public.glowletter_couple_story(p_partner uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  friends_since timestamptz;
  first_sent timestamptz;
  first_received timestamptz;
  letters integer;
  milestones jsonb;
  best integer := 0;
  run integer := 0;
  previous date;
  together_day date;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_partner is null or not private.glowletter_are_friends(me, p_partner) or private.glowletter_is_blocked(me, p_partner) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  select coalesce(f.responded_at, f.created_at) into friends_since
  from public.glowletter_friendships as f
  where f.status = 'accepted'
    and ((f.requester = me and f.addressee = p_partner) or (f.requester = p_partner and f.addressee = me))
  order by f.created_at
  limit 1;
  select pg_catalog.min(m.created_at) into first_sent from public.glowletter_messages as m where m.sender = me and m.recipient = p_partner;
  select pg_catalog.min(m.created_at) into first_received from public.glowletter_messages as m where m.sender = p_partner and m.recipient = me;
  select count(*) into letters from public.glowletter_messages as m
  where (m.sender = me and m.recipient = p_partner) or (m.sender = p_partner and m.recipient = me);

  with together as (
    select a.day, pg_catalog.row_number() over (order by a.day) as n
    from public.glowletter_couple_answers as a
    join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = me and b.day = a.day
    where a.user_id = me and a.partner_id = p_partner
  )
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('n', t.n, 'day', t.day) order by t.n), '[]'::jsonb) into milestones
  from together as t
  where t.n in (1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 100, 150, 200, 300, 365, 500, 730, 1000);

  -- Самая длинная серия дней подряд.
  for together_day in
    select a.day
    from public.glowletter_couple_answers as a
    join public.glowletter_couple_answers as b on b.user_id = p_partner and b.partner_id = me and b.day = a.day
    where a.user_id = me and a.partner_id = p_partner
    order by a.day
  loop
    run := case when previous is not null and together_day = previous + 1 then run + 1 else 1 end;
    best := greatest(best, run);
    previous := together_day;
  end loop;

  return pg_catalog.jsonb_build_object(
    'friends_since', friends_since,
    'first_sent', first_sent,
    'first_received', first_received,
    'letters', letters,
    'milestones', milestones,
    'best_streak', best
  );
end;
$$;
revoke all on function public.glowletter_couple_story(uuid) from public, anon;
grant execute on function public.glowletter_couple_story(uuid) to authenticated;
