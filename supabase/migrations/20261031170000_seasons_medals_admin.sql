-- Владелец 31.10: рейтинг с кубком — друзья и весь мир (топ-100); сезон 15 дней, сброс автоматически;
-- 1-е место — золото, 2-е — серебро, 3-е — бронза; медали копятся (два золота подряд — две золотые);
-- стенка наград в профиле; титулы «Новичок», «Игрок», «Мастер», «Чемпион», «Легенда»; история сезонов
-- не удаляется никогда. Админ: проверить игрока, сбросить его очки сезона (без удаления истории),
-- открыть все наклейки, рамки и наряды Тёпы себе или другому; знак «В комнату зашёл ADMIN».
--
-- Опыт игрока = сумма его очков (glowletter_points.user_id) за сезон. Сезон N начинается
-- 2026-10-31 00:00 UTC + (N-1)*15 дней. Сброс админом не удаляет очки: в сезоне учитываются
-- только очки после последнего сброса.

create or replace function private.glowletter_season_epoch()
returns timestamptz language sql immutable set search_path = ''
as $$ select timestamptz '2026-10-31 00:00:00+00' $$;

create or replace function private.glowletter_season_start(p_season integer)
returns timestamptz language sql immutable set search_path = ''
as $$ select private.glowletter_season_epoch() + pg_catalog.make_interval(days => (greatest(p_season, 1) - 1) * 15) $$;

create or replace function private.glowletter_season_at(p_at timestamptz)
returns integer language sql immutable set search_path = ''
as $$ select greatest(1, pg_catalog.floor(extract(epoch from (p_at - private.glowletter_season_epoch())) / 1296000)::integer + 1) $$;

create table if not exists public.glowletter_seasons (
  season integer primary key check (season >= 1),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  closed_at timestamptz not null default now()
);

create table if not exists public.glowletter_medals (
  season integer not null references public.glowletter_seasons(season),
  place smallint not null check (place between 1 and 3),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null check (points > 0),
  seen_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (season, place)
);
create index if not exists glowletter_medals_user_idx on public.glowletter_medals (user_id, season desc);

create table if not exists public.glowletter_point_resets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  season integer not null,
  admin_id uuid references auth.users(id) on delete set null,
  points_before integer not null default 0,
  reason text not null default '' check (pg_catalog.char_length(reason) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists glowletter_point_resets_user_idx on public.glowletter_point_resets (user_id, season, created_at desc);

create table if not exists public.glowletter_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item text not null check (item ~ '^(sticker:s(0[1-9]|1[0-9]|20)|frame:f0[1-8]|outfit:all)$'),
  admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, item)
);

create table if not exists public.glowletter_admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.glowletter_seasons enable row level security;
alter table public.glowletter_medals enable row level security;
alter table public.glowletter_point_resets enable row level security;
alter table public.glowletter_unlocks enable row level security;
alter table public.glowletter_admin_log enable row level security;
revoke all on public.glowletter_seasons, public.glowletter_medals, public.glowletter_point_resets, public.glowletter_unlocks, public.glowletter_admin_log from anon, authenticated;

comment on table public.glowletter_medals is 'Season medals (1 gold, 2 silver, 3 bronze). History is kept forever.';
comment on table public.glowletter_point_resets is 'Admin resets of a player''s season points; points before the reset stop counting, nothing is deleted.';

-- Опыт всех игроков за сезон (после последнего сброса).
create or replace function private.glowletter_season_points(p_season integer)
returns table (user_id uuid, points bigint, last_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select pt.user_id, sum(pt.points)::bigint, max(pt.created_at)
  from public.glowletter_points as pt
  where pt.created_at >= private.glowletter_season_start(p_season)
    and pt.created_at < private.glowletter_season_start(p_season + 1)
    and pt.created_at > coalesce((
      select max(r.created_at) from public.glowletter_point_resets as r
      where r.user_id = pt.user_id and r.season = p_season), '-infinity'::timestamptz)
  group by pt.user_id
$$;

create or replace function private.glowletter_medal_counts(p_user uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'gold', count(*) filter (where place = 1),
    'silver', count(*) filter (where place = 2),
    'bronze', count(*) filter (where place = 3))
  from public.glowletter_medals where user_id = p_user
$$;

create or replace function private.glowletter_title(p_user uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select case
    when (select count(*) from public.glowletter_medals where user_id = p_user and place = 1) >= 3 then 'legend'
    when exists (select 1 from public.glowletter_medals where user_id = p_user and place = 1) then 'champion'
    when exists (select 1 from public.glowletter_medals where user_id = p_user) then 'master'
    when (select coalesce(sum(points), 0) from public.glowletter_points where user_id = p_user) >= 300 then 'player'
    else 'newbie'
  end
$$;

create or replace function private.glowletter_has_unlock(p_user uuid, p_item text)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.glowletter_unlocks where user_id = p_user and item = p_item) $$;

-- Закрывает прошедшие сезоны: записывает тройку лучших. Повторный вызов ничего не меняет.
create or replace function private.glowletter_close_seasons()
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  current_season integer := private.glowletter_season_at(now());
  s integer;
  closed integer := 0;
begin
  for s in
    select g from pg_catalog.generate_series(1, current_season - 1) as g
    where not exists (select 1 from public.glowletter_seasons where season = g)
    order by g
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('glowletter-season:' || s::text, 0));
    if exists (select 1 from public.glowletter_seasons where season = s) then continue; end if;
    insert into public.glowletter_seasons (season, starts_at, ends_at)
    values (s, private.glowletter_season_start(s), private.glowletter_season_start(s + 1));
    insert into public.glowletter_medals (season, place, user_id, points)
    select s, x.place, x.user_id, x.points
    from (
      select sp.user_id, sp.points::integer as points,
             row_number() over (order by sp.points desc, sp.last_at asc, sp.user_id) as place
      from private.glowletter_season_points(s) as sp
      where sp.points > 0
    ) as x
    where x.place <= 3;
    closed := closed + 1;
  end loop;
  return closed;
end;
$$;

-- p_scope: 'friends' — я и друзья; 'world' — топ-100 мира (имя видно, если игрок разрешил, это я или мой друг).
create or replace function public.glowletter_season_ranking(p_scope text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  cur integer := private.glowletter_season_at(now());
  top jsonb;
  mine jsonb;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_close_seasons();
  if p_scope = 'friends' then
    with people as (
      select me as id
      union
      select case when f.requester = me then f.addressee else f.requester end
      from public.glowletter_friendships as f
      where f.status = 'accepted' and me in (f.requester, f.addressee)
        and not private.glowletter_is_blocked(f.requester, f.addressee)
    ), ranked as (
      select p.id, coalesce(sp.points, 0)::integer as points,
             row_number() over (order by coalesce(sp.points, 0) desc, sp.last_at asc nulls last, p.id) as place
      from people as p
      left join private.glowletter_season_points(cur) as sp on sp.user_id = p.id
    )
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
             'place', r.place, 'user_id', r.id, 'name', coalesce(pr.display_name, ''), 'points', r.points,
             'me', r.id = me, 'title', private.glowletter_title(r.id), 'medals', private.glowletter_medal_counts(r.id)) order by r.place),
           (select pg_catalog.jsonb_build_object('place', x.place, 'points', x.points, 'name', coalesce((select display_name from public.glowletter_profiles where user_id = me), '')) from ranked as x where x.id = me)
      into top, mine
    from ranked as r
    left join public.glowletter_profiles as pr on pr.user_id = r.id;
  else
    with ranked as (
      select sp.user_id as id, sp.points::integer as points,
             row_number() over (order by sp.points desc, sp.last_at asc, sp.user_id) as place
      from private.glowletter_season_points(cur) as sp
      where sp.points > 0
    )
    select (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
               'place', r.place,
               'user_id', case when r.id = me or pr.ranking_public or private.glowletter_are_friends(me, r.id) then r.id end,
               'name', case when r.id = me or pr.ranking_public or private.glowletter_are_friends(me, r.id) then coalesce(pr.display_name, '') end,
               'points', r.points, 'me', r.id = me, 'title', private.glowletter_title(r.id),
               'medals', private.glowletter_medal_counts(r.id)) order by r.place)
            from ranked as r left join public.glowletter_profiles as pr on pr.user_id = r.id
            where r.place <= 100),
           (select pg_catalog.jsonb_build_object('place', x.place, 'points', x.points, 'name', coalesce((select display_name from public.glowletter_profiles where user_id = me), '')) from ranked as x where x.id = me)
      into top, mine;
  end if;
  return pg_catalog.jsonb_build_object(
    'season', cur,
    'starts_at', private.glowletter_season_start(cur),
    'ends_at', private.glowletter_season_start(cur + 1),
    'scope', case when p_scope = 'friends' then 'friends' else 'world' end,
    'public', coalesce((select ranking_public from public.glowletter_profiles where user_id = me), false),
    'title', private.glowletter_title(me),
    'top', coalesce(top, '[]'::jsonb),
    'mine', coalesce(mine, pg_catalog.jsonb_build_object('place', null, 'points', 0, 'name', coalesce((select display_name from public.glowletter_profiles where user_id = me), ''))));
end;
$$;

-- Стенка наград и профиль: свои, друга, открытого игрока (или для админа — любого).
create or replace function public.glowletter_medal_wall(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  target uuid := coalesce(p_user, auth.uid());
  cur integer := private.glowletter_season_at(now());
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if target <> me and not private.glowletter_are_friends(me, target) and not private.glowletter_is_admin()
     and not coalesce((select ranking_public from public.glowletter_profiles where user_id = target), false) then
    raise exception using errcode = '42501', message = 'private';
  end if;
  return pg_catalog.jsonb_build_object(
    'user_id', target,
    'name', coalesce((select display_name from public.glowletter_profiles where user_id = target), ''),
    'me', target = me,
    'title', private.glowletter_title(target),
    'total_points', coalesce((select sum(points) from public.glowletter_points where user_id = target), 0),
    'season', cur,
    'season_points', coalesce((select points from private.glowletter_season_points(cur) where user_id = target), 0),
    'season_place', (select x.place from (select sp.user_id, row_number() over (order by sp.points desc, sp.last_at asc, sp.user_id) as place
                                          from private.glowletter_season_points(cur) as sp where sp.points > 0) as x where x.user_id = target),
    'games', coalesce((select pg_catalog.jsonb_build_object('played', count(*), 'win', count(*) filter (where result = 'win'))
        from public.glowletter_play_results where user_id = target), '{}'::jsonb),
    'friends', (select count(*) from public.glowletter_friendships where status = 'accepted' and target in (requester, addressee)),
    'counts', private.glowletter_medal_counts(target),
    'medals', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
               'season', m.season, 'place', m.place, 'points', m.points,
               'starts_at', s.starts_at, 'ends_at', s.ends_at) order by m.season desc)
      from public.glowletter_medals as m join public.glowletter_seasons as s on s.season = m.season
      where m.user_id = target), '[]'::jsonb));
end;
$$;

-- Новые медали для церемонии вручения (показываются один раз).
create or replace function public.glowletter_medals_unseen()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_close_seasons();
  return coalesce((
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('season', m.season, 'place', m.place, 'points', m.points) order by m.season)
    from public.glowletter_medals as m where m.user_id = me and m.seen_at is null), '[]'::jsonb);
end;
$$;

create or replace function public.glowletter_medals_seen()
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  update public.glowletter_medals set seen_at = now() where user_id = me and seen_at is null;
end;
$$;

-- Знак «В комнату зашёл ADMIN»: другие проверяют, что это правда админ.
create or replace function public.glowletter_is_admin_user(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null and exists (select 1 from public.glowletter_accounts where user_id = p_user and is_admin = true) $$;

-- ——— Админ ———

create or replace function private.glowletter_require_admin()
returns uuid language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not private.glowletter_is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;
  return auth.uid();
end;
$$;

create or replace function private.glowletter_admin_find(p_query text)
returns uuid language plpgsql stable security definer set search_path = ''
as $$
declare
  q text := pg_catalog.btrim(coalesce(p_query, ''));
  found_id uuid;
begin
  if q ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into found_id from auth.users where id = q::uuid;
  elsif q ~* '^GL-' then
    select user_id into found_id from public.glowletter_accounts where support_id = pg_catalog.upper(q);
  elsif q like '%@%' then
    select id into found_id from auth.users where pg_catalog.lower(email) = pg_catalog.lower(q) limit 1;
  else
    select user_id into found_id from public.glowletter_profiles where friend_code = pg_catalog.upper(q);
  end if;
  return found_id;
end;
$$;

create or replace function public.glowletter_admin_player(p_query text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  target uuid := private.glowletter_admin_find(p_query);
  cur integer := private.glowletter_season_at(now());
  since timestamptz;
begin
  if target is null then return null; end if;
  since := coalesce((select max(created_at) from public.glowletter_point_resets where user_id = target and season = cur), '-infinity'::timestamptz);
  return pg_catalog.jsonb_build_object(
    'user_id', target,
    'name', coalesce((select display_name from public.glowletter_profiles where user_id = target), ''),
    'friend_code', (select friend_code from public.glowletter_profiles where user_id = target),
    'support_id', (select support_id from public.glowletter_accounts where user_id = target),
    'email', (select email from auth.users where id = target),
    'is_admin', coalesce((select is_admin from public.glowletter_accounts where user_id = target), false),
    'title', private.glowletter_title(target),
    'season', cur,
    'season_points', coalesce((select points from private.glowletter_season_points(cur) where user_id = target), 0),
    'season_place', (select x.place from (select sp.user_id, row_number() over (order by sp.points desc, sp.last_at asc, sp.user_id) as place
                                          from private.glowletter_season_points(cur) as sp where sp.points > 0) as x where x.user_id = target),
    'total_points', coalesce((select sum(points) from public.glowletter_points where user_id = target), 0),
    'by_source', coalesce((select pg_catalog.jsonb_object_agg(source, total) from (
        select source, sum(points) as total from public.glowletter_points
        where user_id = target and created_at >= private.glowletter_season_start(cur) and created_at > since group by source) as x), '{}'::jsonb),
    'today_points', coalesce((select sum(points) from public.glowletter_points where user_id = target and created_at >= now() - interval '24 hours'), 0),
    'games', coalesce((select pg_catalog.jsonb_build_object('played', count(*), 'win', count(*) filter (where result = 'win'),
        'loss', count(*) filter (where result = 'loss'), 'partners', count(distinct friend_id))
        from public.glowletter_play_results where user_id = target and created_at >= private.glowletter_season_start(cur)), '{}'::jsonb),
    'friends', (select count(*) from public.glowletter_friendships where status = 'accepted' and target in (requester, addressee)),
    'counts', private.glowletter_medal_counts(target),
    'medals', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('season', season, 'place', place, 'points', points) order by season desc)
        from public.glowletter_medals where user_id = target), '[]'::jsonb),
    'resets', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('season', season, 'points_before', points_before, 'reason', reason, 'at', created_at) order by created_at desc)
        from (select * from public.glowletter_point_resets where user_id = target order by created_at desc limit 10) as r), '[]'::jsonb),
    'unlocked', coalesce((select count(*) from public.glowletter_unlocks where user_id = target), 0));
end;
$$;

create or replace function public.glowletter_admin_reset_season(p_user uuid, p_reason text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  cur integer := private.glowletter_season_at(now());
  before integer;
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  before := coalesce((select points from private.glowletter_season_points(cur) where user_id = p_user), 0);
  insert into public.glowletter_point_resets (user_id, season, admin_id, points_before, reason)
  values (p_user, cur, admin, before, pg_catalog.left(coalesce(p_reason, ''), 200));
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'reset_season', p_user, pg_catalog.jsonb_build_object('season', cur, 'points_before', before, 'reason', pg_catalog.left(coalesce(p_reason, ''), 200)));
  return pg_catalog.jsonb_build_object('season', cur, 'points_before', before);
end;
$$;

create or replace function public.glowletter_admin_unlock_all(p_user uuid)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  added integer;
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  insert into public.glowletter_unlocks (user_id, item, admin_id)
  select p_user, item, admin from (
    select 'sticker:s' || pg_catalog.lpad(n::text, 2, '0') as item from pg_catalog.generate_series(1, 20) as n
    union all select 'frame:f0' || n::text from pg_catalog.generate_series(1, 8) as n
    union all select 'outfit:all'
  ) as all_items
  on conflict (user_id, item) do nothing;
  get diagnostics added = row_count;
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'unlock_all', p_user, pg_catalog.jsonb_build_object('added', added));
  return added;
end;
$$;

-- ——— Коллекция и наряды учитывают открытое админом ———

create or replace function public.glowletter_chest_state()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return pg_catalog.jsonb_build_object(
    'today', (select reward from public.glowletter_chests where user_id = me and day = private.glowletter_today()),
    'owned', coalesce((select pg_catalog.jsonb_agg(distinct item) from (
        select reward as item from public.glowletter_chests where user_id = me
        union select item from public.glowletter_unlocks where user_id = me) as owned_items), '[]'::jsonb));
end;
$$;

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
    and r not in (select item from public.glowletter_unlocks where user_id = me)
  order by pg_catalog.random() limit 1;
  if pick is null then
    pick := case when pg_catalog.random() < 0.7 then 'sticker:s' || pg_catalog.lpad((1 + pg_catalog.floor(pg_catalog.random() * 20))::int::text, 2, '0')
                 else 'frame:f0' || (1 + pg_catalog.floor(pg_catalog.random() * 8))::int::text end;
  end if;
  insert into public.glowletter_chests (user_id, day, reward) values (me, d, pick) on conflict (user_id, day) do nothing;
  if not found then
    -- Сундук уже открыли в соседнем запросе — отдаём то, что выпало там.
    select reward into existing from public.glowletter_chests where user_id = me and day = d;
    return pg_catalog.jsonb_build_object('reward', existing, 'opened', true);
  end if;
  return pg_catalog.jsonb_build_object('reward', pick, 'opened', false);
end;
$$;

create or replace function public.glowletter_couple_wear(p_partner uuid, p_outfit text, p_day date)
returns jsonb language plpgsql security definer set search_path = ''
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
  if together < private.glowletter_couple_outfit_days(p_outfit) and not private.glowletter_has_unlock(me, 'outfit:all') then
    raise exception using errcode = '22023', message = 'locked';
  end if;
  if pg_catalog.substr(p_outfit, 2)::integer > 3 and not private.glowletter_has_paid_access(me) and not private.glowletter_has_unlock(me, 'outfit:all') then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  insert into public.glowletter_couple_bears (user_id, partner_id, outfit)
  values (me, p_partner, p_outfit)
  on conflict (user_id, partner_id) do update set outfit = excluded.outfit, updated_at = now();
  return public.glowletter_couple_today(p_partner, v_day);
end;
$$;

revoke all on function private.glowletter_season_points(integer) from public, anon, authenticated;
revoke all on function private.glowletter_close_seasons() from public, anon, authenticated;
revoke all on function private.glowletter_admin_find(text) from public, anon, authenticated;
revoke all on function private.glowletter_require_admin() from public, anon, authenticated;
revoke all on function public.glowletter_season_ranking(text) from public, anon;
revoke all on function public.glowletter_medal_wall(uuid) from public, anon;
revoke all on function public.glowletter_medals_unseen() from public, anon;
revoke all on function public.glowletter_medals_seen() from public, anon;
revoke all on function public.glowletter_is_admin_user(uuid) from public, anon;
revoke all on function public.glowletter_admin_player(text) from public, anon;
revoke all on function public.glowletter_admin_reset_season(uuid, text) from public, anon;
revoke all on function public.glowletter_admin_unlock_all(uuid) from public, anon;
grant execute on function public.glowletter_season_ranking(text) to authenticated;
grant execute on function public.glowletter_medal_wall(uuid) to authenticated;
grant execute on function public.glowletter_medals_unseen() to authenticated;
grant execute on function public.glowletter_medals_seen() to authenticated;
grant execute on function public.glowletter_is_admin_user(uuid) to authenticated;
grant execute on function public.glowletter_admin_player(text) to authenticated;
grant execute on function public.glowletter_admin_reset_season(uuid, text) to authenticated;
grant execute on function public.glowletter_admin_unlock_all(uuid) to authenticated;

-- Сезон закрывается сам каждую ночь (и при первом открытии рейтинга после конца сезона).
do $migration$
declare
  existing_job record;
begin
  for existing_job in select jobid from cron.job where jobname = 'glowletter-close-seasons'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
  perform cron.schedule('glowletter-close-seasons', '5 0 * * *', $command$select private.glowletter_close_seasons()$command$);
end
$migration$;

notify pgrst, 'reload schema';
