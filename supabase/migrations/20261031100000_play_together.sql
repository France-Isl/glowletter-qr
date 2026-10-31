-- Ультра-обновление (2.4.26): очки пары, рейтинг и лиги, огонёк дней,
-- общий питомец Тёпа, «Слово дня», «Сундук Тёпы» и «Фото на экран друга».
-- Звонок и игры в звонке идут через Realtime (на сервере только приглашение
-- [[call:…]] / [[play:…]] обычным сообщением), сюда приходят лишь итоги игр.
-- Пара всегда хранится упорядоченно: a < b. Неделя — с понедельника по UTC.

alter table public.glowletter_profiles add column if not exists ranking_public boolean not null default false;

create table public.glowletter_points (
  id bigint generated always as identity primary key,
  a uuid not null references auth.users(id) on delete cascade,
  b uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('game', 'streak', 'pet', 'word')),
  points integer not null check (points between 1 and 50),
  created_at timestamptz not null default now(),
  check (a < b)
);
create index glowletter_points_pair_idx on public.glowletter_points (a, b, created_at desc);
create index glowletter_points_created_idx on public.glowletter_points (created_at desc);

create table public.glowletter_play_results (
  room uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  game text not null check (game in ('lost', 'explain', 'sketch', 'sea', 'four', 'checkers', 'talk')),
  result text not null check (result in ('win', 'loss', 'draw', 'done')),
  created_at timestamptz not null default now(),
  primary key (room, user_id)
);
create index glowletter_play_results_user_idx on public.glowletter_play_results (user_id, friend_id, created_at desc);

create table public.glowletter_pair_days (
  a uuid not null references auth.users(id) on delete cascade,
  b uuid not null references auth.users(id) on delete cascade,
  day date not null,
  a_seen boolean not null default false,
  b_seen boolean not null default false,
  primary key (a, b, day),
  check (a < b)
);

create table public.glowletter_pets (
  a uuid not null references auth.users(id) on delete cascade,
  b uuid not null references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a < b)
);

create table public.glowletter_pet_care (
  a uuid not null,
  b uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('feed', 'play', 'wash')),
  at timestamptz not null default now(),
  primary key (a, b, user_id, action),
  foreign key (a, b) references public.glowletter_pets(a, b) on delete cascade
);

create table public.glowletter_word_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  lang text not null check (lang ~ '^[a-z]{2,3}$'),
  solved boolean not null,
  attempts integer not null check (attempts between 1 and 6),
  seconds integer not null check (seconds between 1 and 86400),
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.glowletter_chests (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  reward text not null check (reward ~ '^(sticker:s(0[1-9]|1[0-9]|20)|frame:f0[1-8])$'),
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.glowletter_photos (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/webp', 'image/png')),
  frame text check (frame is null or frame ~ '^f0[1-8]$'),
  image bytea not null check (pg_catalog.octet_length(image) between 500 and 450000),
  created_at timestamptz not null default now()
);
create index glowletter_photos_recipient_idx on public.glowletter_photos (recipient, created_at desc);
create index glowletter_photos_sender_idx on public.glowletter_photos (sender, created_at desc);
create index glowletter_photos_created_idx on public.glowletter_photos (created_at);

comment on table public.glowletter_points is 'Pair points ledger for the weekly ranking and leagues. Written only by security-definer functions.';
comment on table public.glowletter_photos is 'Photos for the friend''s home-screen widget, kept 30 days. Read only by sender, recipient or the recipient''s device key.';

do $$
declare t text;
begin
  foreach t in array array['glowletter_points', 'glowletter_play_results', 'glowletter_pair_days', 'glowletter_pets',
                           'glowletter_pet_care', 'glowletter_word_results', 'glowletter_chests', 'glowletter_photos'] loop
    execute pg_catalog.format('alter table public.%I enable row level security', t);
    execute pg_catalog.format('revoke all on table public.%I from public, anon, authenticated', t);
    execute pg_catalog.format('grant all on table public.%I to service_role', t);
  end loop;
end;
$$;

-- Общие помощники ------------------------------------------------------------

create or replace function private.glowletter_today()
returns date language sql stable set search_path = '' as $$ select (now() at time zone 'UTC')::date $$;

create or replace function private.glowletter_week_start()
returns timestamptz language sql stable set search_path = ''
as $$ select pg_catalog.date_trunc('week', now() at time zone 'UTC') at time zone 'UTC' $$;

create or replace function private.glowletter_league(p_points integer)
returns text language sql immutable set search_path = ''
as $$ select case when p_points >= 900 then 'diamond' when p_points >= 400 then 'gold' when p_points >= 150 then 'silver' else 'bronze' end $$;

-- Друзья и не заблокированы; иначе ошибка.
create or replace function private.glowletter_require_friend(p_me uuid, p_friend uuid)
returns void language plpgsql stable set search_path = ''
as $$
begin
  if p_me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_friend is null or p_friend = p_me or not private.glowletter_are_friends(p_me, p_friend) or private.glowletter_is_blocked(p_me, p_friend) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
end;
$$;

-- Полный доступ хотя бы у одного из двоих: одна подписка открывает игры паре.
create or replace function private.glowletter_pair_paid(p_me uuid, p_friend uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.glowletter_has_paid_access(p_me) or private.glowletter_has_paid_access(p_friend) $$;

-- Очки паре с дневным потолком по источнику.
create or replace function private.glowletter_award(p_me uuid, p_friend uuid, p_source text, p_points integer)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  pa uuid := least(p_me, p_friend);
  pb uuid := greatest(p_me, p_friend);
  cap integer := case p_source when 'game' then 120 when 'streak' then 10 when 'pet' then 30 when 'word' then 12 else 0 end;
  used integer;
  give integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(pa::text || pb::text || ':points', 0));
  select coalesce(sum(points), 0) into used from public.glowletter_points
  where a = pa and b = pb and source = p_source and created_at >= (private.glowletter_today()::timestamp at time zone 'UTC');
  give := least(p_points, cap - used);
  if give <= 0 then return 0; end if;
  insert into public.glowletter_points (a, b, user_id, source, points) values (pa, pb, p_me, p_source, give);
  return give;
end;
$$;

-- Отметка «сегодня я был с этим другом»; когда за день отметились оба — огонёк и очки.
create or replace function private.glowletter_touch_day(p_me uuid, p_friend uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare
  pa uuid := least(p_me, p_friend);
  pb uuid := greatest(p_me, p_friend);
  d date := private.glowletter_today();
  row_before public.glowletter_pair_days;
begin
  select * into row_before from public.glowletter_pair_days where a = pa and b = pb and day = d for update;
  if not found then
    insert into public.glowletter_pair_days (a, b, day, a_seen, b_seen) values (pa, pb, d, p_me = pa, p_me = pb)
    on conflict (a, b, day) do update set a_seen = public.glowletter_pair_days.a_seen or excluded.a_seen,
                                          b_seen = public.glowletter_pair_days.b_seen or excluded.b_seen;
    return;
  end if;
  if (p_me = pa and row_before.a_seen) or (p_me = pb and row_before.b_seen) then return; end if;
  update public.glowletter_pair_days set a_seen = a_seen or p_me = pa, b_seen = b_seen or p_me = pb
  where a = pa and b = pb and day = d;
  -- Второй из пары отметился сегодня — день засчитан.
  if (p_me = pa and row_before.b_seen) or (p_me = pb and row_before.a_seen) then
    perform private.glowletter_award(p_me, p_friend, 'streak', 10);
  end if;
end;
$$;

-- Огонёк: сколько дней подряд (до сегодня или вчера включительно) отмечались оба.
create or replace function private.glowletter_streak(p_a uuid, p_b uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  pa uuid := least(p_a, p_b);
  pb uuid := greatest(p_a, p_b);
  d date := private.glowletter_today();
  current_run integer := 0;
  best integer := 0;
  run integer := 0;
  prev date;
  r record;
begin
  if exists (select 1 from public.glowletter_pair_days where a = pa and b = pb and day = d and a_seen and b_seen) then
    prev := d + 1;
  else
    prev := d;
  end if;
  for r in select day from public.glowletter_pair_days where a = pa and b = pb and a_seen and b_seen and day <= d order by day desc loop
    exit when r.day <> prev - 1;
    current_run := current_run + 1;
    prev := r.day;
  end loop;
  prev := null;
  for r in select day from public.glowletter_pair_days where a = pa and b = pb and a_seen and b_seen order by day loop
    if prev is not null and r.day = prev + 1 then run := run + 1; else run := 1; end if;
    best := greatest(best, run);
    prev := r.day;
  end loop;
  return pg_catalog.jsonb_build_object('current', current_run, 'best', best);
end;
$$;

-- Игры -------------------------------------------------------------------------

-- Итог партии: один раз на партию от каждого игрока. Очки — паре.
create or replace function public.glowletter_play_record(p_friend uuid, p_game text, p_room uuid, p_result text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  gained integer := 0;
begin
  perform private.glowletter_require_friend(me, p_friend);
  if p_room is null or p_game not in ('lost', 'explain', 'sketch', 'sea', 'four', 'checkers', 'talk')
     or p_result not in ('win', 'loss', 'draw', 'done') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if not private.glowletter_pair_paid(me, p_friend) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  if (select count(*) from public.glowletter_play_results where user_id = me and created_at >= now() - interval '1 hour') >= 40 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_play_results (room, user_id, friend_id, game, result)
  values (p_room, me, p_friend, p_game, p_result) on conflict do nothing;
  if found then
    gained := private.glowletter_award(me, p_friend, 'game', case p_result when 'win' then 10 when 'draw' then 6 when 'done' then 6 else 4 end);
  end if;
  perform private.glowletter_touch_day(me, p_friend);
  return pg_catalog.jsonb_build_object('points', gained);
end;
$$;

-- «Мы сегодня вместе»: зовётся при звонке, переписке и в «Нашем мире».
create or replace function public.glowletter_pair_checkin(p_friend uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  perform private.glowletter_require_friend(me, p_friend);
  perform private.glowletter_touch_day(me, p_friend);
end;
$$;

-- Питомец Тёпа ------------------------------------------------------------------

create or replace function public.glowletter_pet_care(p_friend uuid, p_action text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  pa uuid := least(me, p_friend);
  pb uuid := greatest(me, p_friend);
  last_at timestamptz;
  bonus integer := 0;
begin
  perform private.glowletter_require_friend(me, p_friend);
  if p_action not in ('feed', 'play', 'wash') then raise exception using errcode = '22023', message = 'invalid'; end if;
  if not private.glowletter_pair_paid(me, p_friend) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  insert into public.glowletter_pets (a, b) values (pa, pb) on conflict do nothing;
  select at into last_at from public.glowletter_pet_care where a = pa and b = pb and user_id = me and action = p_action for update;
  if last_at is not null and last_at > now() - interval '3 hours' then
    raise exception using errcode = 'P0001', message = 'too_soon';
  end if;
  -- Друг тоже заботился о Тёпе за последние сутки — Тёпа растёт быстрее.
  if exists (select 1 from public.glowletter_pet_care where a = pa and b = pb and user_id = p_friend and at > now() - interval '24 hours') then
    bonus := 5;
  end if;
  insert into public.glowletter_pet_care (a, b, user_id, action, at) values (pa, pb, me, p_action, now())
  on conflict (a, b, user_id, action) do update set at = excluded.at;
  update public.glowletter_pets set xp = xp + 10 + bonus where a = pa and b = pb;
  perform private.glowletter_award(me, p_friend, 'pet', 5);
  perform private.glowletter_touch_day(me, p_friend);
  return public.glowletter_pair_summary(p_friend);
end;
$$;

-- Сводка пары: огонёк, очки, лига, питомец, счёт в играх, слово дня.
create or replace function public.glowletter_pair_summary(p_friend uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  pa uuid := least(me, p_friend);
  pb uuid := greatest(me, p_friend);
  week_points integer;
  total_points integer;
  today_row public.glowletter_pair_days;
begin
  perform private.glowletter_require_friend(me, p_friend);
  select coalesce(sum(points), 0) into week_points from public.glowletter_points where a = pa and b = pb and created_at >= private.glowletter_week_start();
  select coalesce(sum(points), 0) into total_points from public.glowletter_points where a = pa and b = pb;
  select * into today_row from public.glowletter_pair_days where a = pa and b = pb and day = private.glowletter_today();
  return pg_catalog.jsonb_build_object(
    'paid', private.glowletter_pair_paid(me, p_friend),
    'streak', private.glowletter_streak(me, p_friend),
    'today', pg_catalog.jsonb_build_object(
      'me', coalesce(case when me = pa then today_row.a_seen else today_row.b_seen end, false),
      'friend', coalesce(case when me = pa then today_row.b_seen else today_row.a_seen end, false)),
    'week', week_points,
    'total', total_points,
    'league', private.glowletter_league(week_points),
    'pet', pg_catalog.jsonb_build_object(
      'xp', coalesce((select xp from public.glowletter_pets where a = pa and b = pb), 0),
      'mine', coalesce((select pg_catalog.jsonb_object_agg(action, at) from public.glowletter_pet_care where a = pa and b = pb and user_id = me), '{}'::jsonb),
      'friend', coalesce((select pg_catalog.jsonb_object_agg(action, at) from public.glowletter_pet_care where a = pa and b = pb and user_id = p_friend), '{}'::jsonb)),
    'games', coalesce((
      select pg_catalog.jsonb_object_agg(g.game, pg_catalog.jsonb_build_object('win', g.win, 'loss', g.loss, 'draw', g.draw, 'played', g.played))
      from (
        select game,
               count(*) filter (where result = 'win')::int as win,
               count(*) filter (where result = 'loss')::int as loss,
               count(*) filter (where result = 'draw')::int as draw,
               count(*)::int as played
        from public.glowletter_play_results where user_id = me and friend_id = p_friend group by game
      ) as g), '{}'::jsonb),
    'words', (select count(*)::int from public.glowletter_word_results where user_id = me and solved),
    'chests', (select count(*)::int from public.glowletter_chests where user_id = me)
  );
end;
$$;

-- Слово дня ---------------------------------------------------------------------

create or replace function public.glowletter_word_submit(p_day date, p_lang text, p_solved boolean, p_attempts integer, p_seconds integer)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  friend record;
  gained integer := 0;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_day is null or p_day not between private.glowletter_today() - 1 and private.glowletter_today() + 1
     or coalesce(p_lang, '') !~ '^[a-z]{2,3}$' or p_solved is null
     or p_attempts is null or p_attempts not between 1 and 6 or p_seconds is null or p_seconds not between 1 and 86400 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  insert into public.glowletter_word_results (user_id, day, lang, solved, attempts, seconds)
  values (me, p_day, p_lang, p_solved, p_attempts, p_seconds) on conflict do nothing;
  if not found then raise exception using errcode = 'P0001', message = 'already_played'; end if;
  if p_solved then
    -- Друг тоже отгадал сегодняшнее слово — очки вашей паре.
    for friend in
      select w.user_id from public.glowletter_word_results as w
      where w.day = p_day and w.solved and w.user_id <> me
        and private.glowletter_are_friends(me, w.user_id) and not private.glowletter_is_blocked(me, w.user_id)
      limit 50
    loop
      gained := gained + private.glowletter_award(me, friend.user_id, 'word', 6);
      perform private.glowletter_touch_day(me, friend.user_id);
    end loop;
  end if;
  return pg_catalog.jsonb_build_object('points', gained);
end;
$$;

create or replace function public.glowletter_word_friends(p_day date)
returns table (user_id uuid, display_name text, me boolean, solved boolean, attempts integer, seconds integer)
language plpgsql stable security definer set search_path = ''
as $$
declare me_id uuid := auth.uid();
begin
  if me_id is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return query
  select w.user_id, p.display_name, w.user_id = me_id, w.solved, w.attempts, w.seconds
  from public.glowletter_word_results as w
  left join public.glowletter_profiles as p on p.user_id = w.user_id
  where w.day = p_day
    and (w.user_id = me_id or (private.glowletter_are_friends(me_id, w.user_id) and not private.glowletter_is_blocked(me_id, w.user_id)))
  order by w.solved desc, w.attempts, w.seconds
  limit 60;
end;
$$;

-- Сундук Тёпы -------------------------------------------------------------------

create or replace function public.glowletter_chest_open()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  d date := private.glowletter_today();
  pick text;
  existing text;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  select reward into existing from public.glowletter_chests where user_id = me and day = d;
  if found then
    return pg_catalog.jsonb_build_object('reward', existing, 'opened', true);
  end if;
  -- Сначала то, чего ещё нет в коллекции; когда собрано всё — что угодно.
  select r into pick from (
    select 'sticker:s' || pg_catalog.lpad(n::text, 2, '0') as r from pg_catalog.generate_series(1, 20) as n
    union all
    select 'frame:f0' || n::text from pg_catalog.generate_series(1, 8) as n
  ) as all_rewards
  where r not in (select reward from public.glowletter_chests where user_id = me)
  order by pg_catalog.random() limit 1;
  if pick is null then
    pick := case when pg_catalog.random() < 0.7 then 'sticker:s' || pg_catalog.lpad((1 + pg_catalog.floor(pg_catalog.random() * 20))::int::text, 2, '0')
                 else 'frame:f0' || (1 + pg_catalog.floor(pg_catalog.random() * 8))::int::text end;
  end if;
  insert into public.glowletter_chests (user_id, day, reward) values (me, d, pick);
  return pg_catalog.jsonb_build_object('reward', pick, 'opened', false);
end;
$$;

create or replace function public.glowletter_chest_state()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return pg_catalog.jsonb_build_object(
    'today', (select reward from public.glowletter_chests where user_id = me and day = private.glowletter_today()),
    'owned', coalesce((select pg_catalog.jsonb_agg(distinct reward) from public.glowletter_chests where user_id = me), '[]'::jsonb));
end;
$$;

-- Рейтинг -----------------------------------------------------------------------

create or replace function public.glowletter_ranking_visibility(p_public boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_ensure_profile(me);
  update public.glowletter_profiles set ranking_public = coalesce(p_public, false) where user_id = me;
end;
$$;

-- p_scope: 'world' — пары недели (топ-100; имена видны, только если оба согласились),
--          'friends' — я и мои друзья по очкам за неделю.
create or replace function public.glowletter_ranking(p_scope text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  since timestamptz := private.glowletter_week_start();
  result jsonb;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_scope = 'world' then
    with pairs as (
      select a, b, sum(points)::int as points, max(created_at) as last_at
      from public.glowletter_points where created_at >= since group by a, b
    ), ranked as (
      select pairs.*, pg_catalog.row_number() over (order by points desc, last_at) as place from pairs
    )
    select pg_catalog.jsonb_build_object(
      'public', coalesce((select ranking_public from public.glowletter_profiles where user_id = me), false),
      'top', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'place', r.place, 'points', r.points, 'league', private.glowletter_league(r.points), 'mine', me in (r.a, r.b),
          'names', case when me in (r.a, r.b) or (pa.ranking_public and pb.ranking_public)
                        then pg_catalog.jsonb_build_array(coalesce(pa.display_name, ''), coalesce(pb.display_name, '')) end)
          order by r.place)
        from ranked as r
        left join public.glowletter_profiles as pa on pa.user_id = r.a
        left join public.glowletter_profiles as pb on pb.user_id = r.b
        where r.place <= 100), '[]'::jsonb),
      'mine', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'place', r.place, 'points', r.points, 'league', private.glowletter_league(r.points),
          'friend', coalesce(p.display_name, '')) order by r.place)
        from ranked as r
        left join public.glowletter_profiles as p on p.user_id = case when r.a = me then r.b else r.a end
        where me in (r.a, r.b)), '[]'::jsonb)
    ) into result;
  elsif p_scope = 'friends' then
    with people as (
      select me as id
      union
      select case when f.requester = me then f.addressee else f.requester end
      from public.glowletter_friendships as f
      where f.status = 'accepted' and me in (f.requester, f.addressee)
    ), scored as (
      select people.id,
             coalesce((select sum(points) from public.glowletter_points as pt
                       where pt.created_at >= since and people.id in (pt.a, pt.b)), 0)::int as points
      from people
      where people.id = me or not private.glowletter_is_blocked(me, people.id)
    )
    select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'name', coalesce(p.display_name, ''), 'me', s.id = me, 'points', s.points, 'league', private.glowletter_league(s.points))
      order by s.points desc, p.display_name), '[]'::jsonb)
    into result
    from scored as s left join public.glowletter_profiles as p on p.user_id = s.id;
  else
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  return result;
end;
$$;

-- Фото на экран друга -------------------------------------------------------------

create or replace function public.glowletter_photo_send(p_to uuid, p_mime text, p_image text, p_frame text)
returns uuid language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  data bytea;
  photo_id uuid;
  message_id uuid;
begin
  perform private.glowletter_require_friend(me, p_to);
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  if coalesce(p_mime, '') not in ('image/jpeg', 'image/webp', 'image/png') or (p_frame is not null and p_frame !~ '^f0[1-8]$') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  begin
    data := pg_catalog.decode(coalesce(p_image, ''), 'base64');
  exception when others then
    raise exception using errcode = '22023', message = 'invalid';
  end;
  if pg_catalog.octet_length(data) not between 500 and 450000 then
    raise exception using errcode = '22023', message = 'too_large';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_photos where sender = me and created_at >= now() - interval '24 hours') >= 40
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  delete from public.glowletter_photos where created_at < now() - interval '30 days';
  insert into public.glowletter_photos (sender, recipient, mime_type, frame, image)
  values (me, p_to, p_mime, p_frame, data) returning id into photo_id;
  insert into public.glowletter_messages (sender, recipient, body)
  values (me, p_to, '[[photo:' || photo_id::text || ']]') returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  perform private.glowletter_touch_day(me, p_to);
  return message_id;
end;
$$;

create or replace function public.glowletter_photo_get(p_id uuid)
returns table (mime_type text, frame text, image text)
language plpgsql stable security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return query
  select ph.mime_type, ph.frame, pg_catalog.translate(pg_catalog.encode(ph.image, 'base64'), E'\n', '')
  from public.glowletter_photos as ph
  where ph.id = p_id and me in (ph.sender, ph.recipient) and ph.created_at >= now() - interval '30 days'
    and not private.glowletter_is_blocked(ph.sender, ph.recipient);
end;
$$;

-- Виджет на телефоне: последнее фото от друзей по ключу устройства.
create or replace function public.glowletter_widget_photo(p_token text, p_since uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  device public.glowletter_push_devices;
  ph record;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then raise exception using errcode = '22023', message = 'invalid'; end if;
  select * into device from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex');
  if not found then raise exception using errcode = 'P0002', message = 'not_found'; end if;
  select x.id, x.mime_type, x.frame, x.image, x.created_at, coalesce(p.display_name, '') as name into ph
  from public.glowletter_photos as x
  left join public.glowletter_profiles as p on p.user_id = x.sender
  where x.recipient = device.user_id and x.created_at >= now() - interval '30 days'
    and private.glowletter_are_friends(x.sender, x.recipient) and not private.glowletter_is_blocked(x.sender, x.recipient)
  order by x.created_at desc limit 1;
  if not found then return '{}'::jsonb; end if;
  if ph.id = p_since then return pg_catalog.jsonb_build_object('id', ph.id, 'same', true); end if;
  return pg_catalog.jsonb_build_object('id', ph.id, 'name', ph.name, 'mime', ph.mime_type, 'frame', ph.frame,
    'image', pg_catalog.translate(pg_catalog.encode(ph.image, 'base64'), E'\n', ''));
end;
$$;

-- Уведомления на телефон: звонок, фото, приглашение к столу, наклейка.
create or replace function public.glowletter_push_poll(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  device public.glowletter_push_devices;
  since timestamptz;
  result jsonb;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  select * into device from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if device.last_poll is not null and device.last_poll > now() - interval '3 minutes' then
    return '{}'::jsonb;
  end if;
  since := device.cursor_at;
  select pg_catalog.jsonb_build_object(
    'messages', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('name', x.name, 'kind', x.kind, 'text', x.text) order by x.created_at)
      from (
        select m.created_at,
               coalesce(p.display_name, '') as name,
               case
                 when m.body like '[[voice:%' then 'voice'
                 when m.body like '[[bear:%' then 'bear'
                 when m.body like '[[draw:%' then 'draw'
                 when m.body like '[[game:%' then 'game'
                 when m.body like '[[play:%' then 'game'
                 when m.body like '[[call:%' then 'call'
                 when m.body like '[[photo:%' then 'photo'
                 when m.body like '[[sticker:%' then 'sticker'
                 else 'text'
               end as kind,
               case when m.body like '[[%' then '' else pg_catalog.left(m.body, 100) end as text
        from public.glowletter_messages as m
        left join public.glowletter_profiles as p on p.user_id = m.sender
        where m.recipient = device.user_id and m.created_at > since and m.read_at is null
          and m.body not like '[[react:%'
          and private.glowletter_are_friends(m.sender, device.user_id)
          and not private.glowletter_is_blocked(m.sender, device.user_id)
        order by m.created_at desc
        limit 10
      ) as x
    ), '[]'::jsonb),
    'opened', (
      select count(*)::int from public.glowletter_qr_links as l
      where l.user_id = device.user_id and l.opened_at > since
    ),
    'replies', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('reaction', r.reaction, 'message', coalesce(r.message, '')) order by r.created_at)
      from (
        select * from public.glowletter_letter_replies as lr
        where lr.user_id = device.user_id and lr.created_at > since
        order by lr.created_at desc
        limit 5
      ) as r
    ), '[]'::jsonb),
    'photo', (
      select x.id from public.glowletter_photos as x
      where x.recipient = device.user_id and x.created_at > since
      order by x.created_at desc limit 1
    )
  ) into result;
  update public.glowletter_push_devices set cursor_at = now(), last_poll = now() where token_hash = device.token_hash;
  return result;
end;
$$;

-- Права ---------------------------------------------------------------------------

revoke all on function private.glowletter_today() from public, anon, authenticated;
revoke all on function private.glowletter_week_start() from public, anon, authenticated;
revoke all on function private.glowletter_league(integer) from public, anon, authenticated;
revoke all on function private.glowletter_require_friend(uuid, uuid) from public, anon, authenticated;
revoke all on function private.glowletter_pair_paid(uuid, uuid) from public, anon, authenticated;
revoke all on function private.glowletter_award(uuid, uuid, text, integer) from public, anon, authenticated;
revoke all on function private.glowletter_touch_day(uuid, uuid) from public, anon, authenticated;
revoke all on function private.glowletter_streak(uuid, uuid) from public, anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array[
    'glowletter_play_record(uuid, text, uuid, text)', 'glowletter_pair_checkin(uuid)', 'glowletter_pet_care(uuid, text)',
    'glowletter_pair_summary(uuid)', 'glowletter_word_submit(date, text, boolean, integer, integer)', 'glowletter_word_friends(date)',
    'glowletter_chest_open()', 'glowletter_chest_state()', 'glowletter_ranking_visibility(boolean)', 'glowletter_ranking(text)',
    'glowletter_photo_send(uuid, text, text, text)', 'glowletter_photo_get(uuid)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end;
$$;
revoke all on function public.glowletter_widget_photo(text, uuid) from public;
grant execute on function public.glowletter_widget_photo(text, uuid) to anon, authenticated;

notify pgrst, 'reload schema';
