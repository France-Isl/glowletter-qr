-- Большая админ-панель (31.10): блокировка, предупреждения, жалобы на людей,
-- поиск накрутки, журнал действий, статистика по дням. Заблокированный не
-- получает ни доступа, ни опыта, ни места в рейтинге и не может войти.

create table if not exists public.glowletter_bans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  until timestamptz,
  reason text not null default '' check (pg_catalog.char_length(reason) <= 200),
  admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.glowletter_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (pg_catalog.char_length(pg_catalog.btrim(message)) between 1 and 300),
  admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);
create index if not exists glowletter_warnings_user_idx on public.glowletter_warnings (user_id, created_at desc);

create table if not exists public.glowletter_user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references auth.users(id) on delete cascade,
  target uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('abuse', 'adult', 'spam', 'cheat', 'other')),
  note text not null default '' check (pg_catalog.char_length(note) <= 300),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution text check (resolution is null or resolution in ('dismissed', 'warned', 'banned', 'reset'))
);
create unique index if not exists glowletter_user_reports_open_idx on public.glowletter_user_reports (reporter, target) where resolved_at is null;
create index if not exists glowletter_user_reports_target_idx on public.glowletter_user_reports (target, created_at desc);
create index if not exists glowletter_admin_log_created_idx on public.glowletter_admin_log (created_at desc);

alter table public.glowletter_bans enable row level security;
alter table public.glowletter_warnings enable row level security;
alter table public.glowletter_user_reports enable row level security;
revoke all on public.glowletter_bans, public.glowletter_warnings, public.glowletter_user_reports from public, anon, authenticated;
grant all on public.glowletter_bans, public.glowletter_warnings, public.glowletter_user_reports to service_role;

comment on table public.glowletter_bans is 'Admin blocks. until null = forever. Mirrored into auth.users.banned_until so the user cannot sign in.';
comment on table public.glowletter_warnings is 'Admin warnings shown to the user inside the app.';
comment on table public.glowletter_user_reports is 'User-to-user reports (abuse, cheating). Read only by the admin.';

create or replace function private.glowletter_is_banned(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select p_user is not null and exists (select 1 from public.glowletter_bans where user_id = p_user and (until is null or until > now())) $$;

-- ——— Заблокированный ничего не получает ———

create or replace function private.glowletter_has_paid_access(p_user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_user_id is not null and not private.glowletter_is_banned(p_user_id) and (
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

-- Опыт: потолок по источнику на пару (как раньше) и общий потолок 300 в день на человека.
create or replace function private.glowletter_award(p_me uuid, p_friend uuid, p_source text, p_points integer)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  pa uuid := least(p_me, p_friend);
  pb uuid := greatest(p_me, p_friend);
  cap integer := case p_source when 'game' then 120 when 'streak' then 10 when 'pet' then 30 when 'word' then 12 else 0 end;
  day_start timestamptz := private.glowletter_today()::timestamp at time zone 'UTC';
  used integer;
  mine integer;
  give integer;
begin
  if p_me is null or coalesce(p_points, 0) <= 0 or private.glowletter_is_banned(p_me) then return 0; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(pa::text || pb::text || ':points', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_me::text || ':points-day', 0));
  select coalesce(sum(points), 0) into used from public.glowletter_points
  where a = pa and b = pb and source = p_source and created_at >= day_start;
  select coalesce(sum(points), 0) into mine from public.glowletter_points
  where user_id = p_me and created_at >= day_start;
  give := least(p_points, cap - used, 300 - mine);
  if give <= 0 then return 0; end if;
  insert into public.glowletter_points (a, b, user_id, source, points) values (pa, pb, p_me, p_source, give);
  return give;
end;
$$;

-- Рейтинг сезона без заблокированных.
create or replace function private.glowletter_season_points(p_season integer)
returns table(user_id uuid, points bigint, last_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select pt.user_id, sum(pt.points)::bigint, max(pt.created_at)
  from public.glowletter_points as pt
  where pt.created_at >= private.glowletter_season_start(p_season)
    and pt.created_at < private.glowletter_season_start(p_season + 1)
    and pt.created_at > coalesce((
      select max(r.created_at) from public.glowletter_point_resets as r
      where r.user_id = pt.user_id and r.season = p_season), '-infinity'::timestamptz)
    and not exists (select 1 from public.glowletter_bans as b where b.user_id = pt.user_id and (b.until is null or b.until > now()))
  group by pt.user_id
$$;

create or replace function private.glowletter_require_friend(p_me uuid, p_friend uuid)
returns void language plpgsql stable set search_path = ''
as $$
begin
  if p_me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(p_me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_friend is null or p_friend = p_me or not private.glowletter_are_friends(p_me, p_friend) or private.glowletter_is_blocked(p_me, p_friend) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
end;
$$;

-- ——— Для пользователя ———

create or replace function public.glowletter_my_status()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  ban public.glowletter_bans;
begin
  if me is null then return pg_catalog.jsonb_build_object('blocked', false, 'warnings', '[]'::jsonb); end if;
  select * into ban from public.glowletter_bans where user_id = me and (until is null or until > now());
  return pg_catalog.jsonb_build_object(
    'blocked', found,
    'until', ban.until,
    'reason', coalesce(ban.reason, ''),
    'warnings', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id', id, 'message', message, 'at', created_at) order by created_at)
                          from public.glowletter_warnings where user_id = me and seen_at is null), '[]'::jsonb));
end;
$$;

create or replace function public.glowletter_warning_seen(p_id uuid)
returns void language sql volatile security definer set search_path = ''
as $$ update public.glowletter_warnings set seen_at = now() where id = p_id and user_id = auth.uid() and seen_at is null $$;

create or replace function public.glowletter_report_user(p_target uuid, p_reason text, p_note text default '')
returns boolean language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_target is null or p_target = me or not exists (select 1 from auth.users where id = p_target) then
    raise exception using errcode = '22023', message = 'invalid_target';
  end if;
  if p_reason is null or p_reason not in ('abuse', 'adult', 'spam', 'cheat', 'other') then
    raise exception using errcode = '22023', message = 'invalid_reason';
  end if;
  if (select count(*) from public.glowletter_user_reports where reporter = me and created_at > now() - interval '24 hours') >= 10 then
    raise exception using errcode = '54000', message = 'too_many_reports';
  end if;
  insert into public.glowletter_user_reports (reporter, target, reason, note)
  values (me, p_target, p_reason, pg_catalog.left(pg_catalog.btrim(coalesce(p_note, '')), 300))
  on conflict do nothing;
  return true;
end;
$$;

-- ——— Админ ———

create or replace function private.glowletter_admin_target(p_user uuid)
returns void language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
end;
$$;

create or replace function private.glowletter_admin_write(p_admin uuid, p_action text, p_target uuid, p_details jsonb)
returns void language sql volatile security definer set search_path = ''
as $$ insert into public.glowletter_admin_log (admin_id, action, target, details) values (p_admin, p_action, p_target, coalesce(p_details, '{}'::jsonb)) $$;

-- Карточка для вкладки «Защита»: блок, предупреждения, жалобы, опыт за сутки.
create or replace function public.glowletter_admin_guard_card(p_query text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  uid uuid := private.glowletter_admin_find(p_query);
begin
  if uid is null then return null; end if;
  return pg_catalog.jsonb_build_object(
    'user_id', uid,
    'name', (select display_name from public.glowletter_profiles where user_id = uid),
    'friend_code', (select friend_code from public.glowletter_profiles where user_id = uid),
    'support_id', (select support_id from public.glowletter_accounts where user_id = uid),
    'email', (select email from auth.users where id = uid),
    'created_at', (select created_at from auth.users where id = uid),
    'last_sign_in', (select last_sign_in_at from auth.users where id = uid),
    'last_seen', (select last_seen from public.glowletter_profiles where user_id = uid),
    'is_admin', coalesce((select is_admin from public.glowletter_accounts where user_id = uid), false),
    'paid', private.glowletter_has_paid_access(uid),
    'premium_forever', coalesce((select premium_forever from public.glowletter_accounts where user_id = uid), false),
    'vip_until', (select vip_until from public.glowletter_accounts where user_id = uid),
    'play_active', exists (select 1 from private.glowletter_play_entitlements where user_id = uid and state in ('active', 'verified_pending_ack') and (expiry_time is null or expiry_time > now())),
    'ban', (select pg_catalog.jsonb_build_object('until', until, 'reason', reason, 'at', created_at) from public.glowletter_bans where user_id = uid and (until is null or until > now())),
    'points_today', coalesce((select sum(points) from public.glowletter_points where user_id = uid and created_at >= now() - interval '24 hours'), 0),
    'points_total', coalesce((select sum(points) from public.glowletter_points where user_id = uid), 0),
    'friends', (select count(*) from public.glowletter_friendships where status = 'accepted' and uid in (requester, addressee)),
    'messages_7d', (select count(*) from public.glowletter_messages where sender = uid and created_at > now() - interval '7 days'),
    'photos', (select count(*) from public.glowletter_photos where sender = uid),
    'reports', (select count(*) from public.glowletter_user_reports as r where r.target = uid and r.resolved_at is null),
    'warnings', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('message', message, 'at', created_at, 'seen', seen_at is not null) order by created_at desc)
                          from (select * from public.glowletter_warnings where user_id = uid order by created_at desc limit 5) as w), '[]'::jsonb));
end;
$$;

create or replace function public.glowletter_admin_ban(p_user uuid, p_days integer, p_reason text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  until_at timestamptz := case when p_days is null or p_days <= 0 then null else now() + pg_catalog.make_interval(days => least(p_days, 3650)) end;
  why text := pg_catalog.left(pg_catalog.btrim(coalesce(p_reason, '')), 200);
begin
  perform private.glowletter_admin_target(p_user);
  if p_user = admin or coalesce((select is_admin from public.glowletter_accounts where user_id = p_user), false) then
    raise exception using errcode = '42501', message = 'cannot_block_admin';
  end if;
  insert into public.glowletter_bans (user_id, until, reason, admin_id) values (p_user, until_at, why, admin)
  on conflict (user_id) do update set until = excluded.until, reason = excluded.reason, admin_id = excluded.admin_id, created_at = now();
  update auth.users set banned_until = coalesce(until_at, now() + interval '100 years') where id = p_user;
  delete from auth.sessions where user_id = p_user;
  perform private.glowletter_admin_write(admin, 'ban', p_user, pg_catalog.jsonb_build_object('days', p_days, 'until', until_at, 'reason', why));
  return pg_catalog.jsonb_build_object('until', until_at);
end;
$$;

create or replace function public.glowletter_admin_unban(p_user uuid)
returns boolean language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
begin
  perform private.glowletter_admin_target(p_user);
  delete from public.glowletter_bans where user_id = p_user;
  update auth.users set banned_until = null where id = p_user;
  perform private.glowletter_admin_write(admin, 'unban', p_user, '{}'::jsonb);
  return true;
end;
$$;

create or replace function public.glowletter_admin_warn(p_user uuid, p_message text)
returns boolean language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  text_value text := pg_catalog.left(pg_catalog.btrim(coalesce(p_message, '')), 300);
begin
  perform private.glowletter_admin_target(p_user);
  if text_value = '' then raise exception using errcode = '22023', message = 'empty_message'; end if;
  insert into public.glowletter_warnings (user_id, message, admin_id) values (p_user, text_value, admin);
  perform private.glowletter_admin_write(admin, 'warn', p_user, pg_catalog.jsonb_build_object('message', text_value));
  return true;
end;
$$;

-- Модерация: имя, фото для виджета, голосовые, личные сообщения.
create or replace function public.glowletter_admin_moderate(p_user uuid, p_what text)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  changed integer := 0;
begin
  perform private.glowletter_admin_target(p_user);
  if p_what = 'name' then
    update public.glowletter_profiles set display_name = null where user_id = p_user;
  elsif p_what = 'photos' then
    delete from public.glowletter_photos where sender = p_user;
  elsif p_what = 'voice' then
    delete from public.glowletter_voice_notes where sender = p_user;
  elsif p_what = 'messages' then
    delete from public.glowletter_messages where sender = p_user;
  else
    raise exception using errcode = '22023', message = 'invalid_kind';
  end if;
  get diagnostics changed = row_count;
  perform private.glowletter_admin_write(admin, 'moderate', p_user, pg_catalog.jsonb_build_object('what', p_what, 'rows', changed));
  return changed;
end;
$$;

-- Полный сброс статистики мошенника: опыт, игры, слова, медали.
create or replace function public.glowletter_admin_reset_stats(p_user uuid, p_reason text, p_medals boolean default true)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  why text := pg_catalog.left(pg_catalog.btrim(coalesce(p_reason, '')), 200);
  cur integer := private.glowletter_season_at(now());
  n_points integer; n_games integer; n_words integer; n_medals integer := 0; total integer;
begin
  perform private.glowletter_admin_target(p_user);
  total := coalesce((select sum(points) from public.glowletter_points where user_id = p_user), 0);
  insert into public.glowletter_point_resets (user_id, season, admin_id, points_before, reason)
  values (p_user, cur, admin, coalesce((select points from private.glowletter_season_points(cur) where user_id = p_user), 0), why);
  delete from public.glowletter_points where user_id = p_user;
  get diagnostics n_points = row_count;
  delete from public.glowletter_play_results where user_id = p_user;
  get diagnostics n_games = row_count;
  delete from public.glowletter_word_results where user_id = p_user;
  get diagnostics n_words = row_count;
  if coalesce(p_medals, true) then
    delete from public.glowletter_medals where user_id = p_user;
    get diagnostics n_medals = row_count;
  end if;
  perform private.glowletter_admin_write(admin, 'reset_stats', p_user, pg_catalog.jsonb_build_object(
    'reason', why, 'points', total, 'point_rows', n_points, 'games', n_games, 'words', n_words, 'medals', n_medals));
  return pg_catalog.jsonb_build_object('points', total, 'games', n_games, 'words', n_words, 'medals', n_medals);
end;
$$;

-- Подозрительные: много опыта, много свежих напарников, жалобы на накрутку.
create or replace function public.glowletter_admin_suspicious()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
begin
  return coalesce((select pg_catalog.jsonb_agg(row_to_json(x)::jsonb order by x.score desc) from (
    select s.user_id,
           p.display_name as name,
           a.support_id,
           s.points_24h, s.partners_24h, s.points_7d, s.new_partners, s.games_24h,
           coalesce(r.reports, 0) as reports,
           private.glowletter_is_banned(s.user_id) as blocked,
           (s.points_24h / 30 + s.partners_24h * 3 + s.new_partners * 4 + coalesce(r.reports, 0) * 5 + s.games_24h / 10) as score
    from (
      select pts.user_id,
             coalesce(sum(pts.points) filter (where pts.created_at > now() - interval '24 hours'), 0)::integer as points_24h,
             (count(distinct pts.partner) filter (where pts.created_at > now() - interval '24 hours'))::integer as partners_24h,
             coalesce(sum(pts.points), 0)::integer as points_7d,
             (count(distinct pts.partner) filter (where u.created_at > now() - interval '3 days'))::integer as new_partners,
             (select count(*) from public.glowletter_play_results as g where g.user_id = pts.user_id and g.created_at > now() - interval '24 hours')::integer as games_24h
      from (select pt.user_id, pt.points, pt.created_at, case when pt.user_id = pt.a then pt.b else pt.a end as partner
            from public.glowletter_points as pt where pt.created_at > now() - interval '7 days') as pts
      left join auth.users as u on u.id = pts.partner
      group by pts.user_id
    ) as s
    left join public.glowletter_profiles as p on p.user_id = s.user_id
    left join public.glowletter_accounts as a on a.user_id = s.user_id
    left join (select target, count(*)::integer as reports from public.glowletter_user_reports where resolved_at is null group by target) as r on r.target = s.user_id
    where s.points_24h >= 250 or s.partners_24h >= 6 or s.new_partners >= 3 or coalesce(r.reports, 0) >= 2 or s.games_24h >= 60
    order by score desc
    limit 50) as x), '[]'::jsonb);
end;
$$;

create or replace function public.glowletter_admin_user_reports()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
begin
  return coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id', r.id, 'reason', r.reason, 'note', r.note, 'at', r.created_at,
      'target', r.target, 'target_name', tp.display_name, 'target_support', ta.support_id,
      'reporter_name', rp.display_name, 'reporter_support', ra.support_id,
      'count', (select count(*) from public.glowletter_user_reports as o where o.target = r.target and o.resolved_at is null),
      'blocked', private.glowletter_is_banned(r.target)) order by r.created_at desc)
    from (select * from public.glowletter_user_reports where resolved_at is null order by created_at desc limit 100) as r
    left join public.glowletter_profiles as tp on tp.user_id = r.target
    left join public.glowletter_accounts as ta on ta.user_id = r.target
    left join public.glowletter_profiles as rp on rp.user_id = r.reporter
    left join public.glowletter_accounts as ra on ra.user_id = r.reporter), '[]'::jsonb);
end;
$$;

create or replace function public.glowletter_admin_resolve_user_report(p_id uuid, p_resolution text)
returns boolean language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  who uuid;
begin
  if p_resolution is null or p_resolution not in ('dismissed', 'warned', 'banned', 'reset') then
    raise exception using errcode = '22023', message = 'invalid_resolution';
  end if;
  select target into who from public.glowletter_user_reports where id = p_id;
  if who is null then return false; end if;
  update public.glowletter_user_reports set resolved_at = now(), resolved_by = admin, resolution = p_resolution
  where target = who and resolved_at is null;
  perform private.glowletter_admin_write(admin, 'report_' || p_resolution, who, pg_catalog.jsonb_build_object('report', p_id));
  return true;
end;
$$;

create or replace function public.glowletter_admin_bans()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
begin
  return coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'user_id', b.user_id, 'until', b.until, 'reason', b.reason, 'at', b.created_at,
      'name', p.display_name, 'support_id', a.support_id) order by b.created_at desc)
    from public.glowletter_bans as b
    left join public.glowletter_profiles as p on p.user_id = b.user_id
    left join public.glowletter_accounts as a on a.user_id = b.user_id
    where b.until is null or b.until > now()), '[]'::jsonb);
end;
$$;

-- Журнал: действия из новой админки и выдачи VIP из старого журнала.
create or replace function public.glowletter_admin_log_list(p_limit integer default 100)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  n integer := least(greatest(coalesce(p_limit, 100), 1), 300);
begin
  return coalesce((select pg_catalog.jsonb_agg(row_to_json(x)::jsonb order by x.at desc) from (
    select * from (
      select l.created_at as at, l.action, l.details, l.target,
             p.display_name as target_name, a.support_id as target_support
      from public.glowletter_admin_log as l
      left join public.glowletter_profiles as p on p.user_id = l.target
      left join public.glowletter_accounts as a on a.user_id = l.target
      union all
      select v.created_at, 'vip_' || v.action, pg_catalog.jsonb_build_object('days', v.granted_days, 'until', v.new_vip_until), v.target_user_id,
             p.display_name, v.target_support_id
      from private.glowletter_vip_audit as v
      left join public.glowletter_profiles as p on p.user_id = v.target_user_id
    ) as all_rows order by at desc limit n) as x), '[]'::jsonb);
end;
$$;

-- Статистика по дням (UTC).
create or replace function public.glowletter_admin_daily_stats(p_days integer default 14)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  n integer := least(greatest(coalesce(p_days, 14), 1), 60);
begin
  return (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'day', d.day,
      'new_users', (select count(*) from auth.users as u where u.created_at >= d.day and u.created_at < d.day + 1),
      'active', (select count(distinct x.uid) from (
                   select pt.user_id as uid from public.glowletter_points as pt where pt.created_at >= d.day and pt.created_at < d.day + 1
                   union select m.sender from public.glowletter_messages as m where m.created_at >= d.day and m.created_at < d.day + 1
                   union select l.user_id from public.glowletter_letters as l where l.created_at >= d.day and l.created_at < d.day + 1) as x),
      'letters', (select count(*) from public.glowletter_letters as l where l.created_at >= d.day and l.created_at < d.day + 1),
      'messages', (select count(*) from public.glowletter_messages as m where m.created_at >= d.day and m.created_at < d.day + 1),
      'games', (select count(*) from public.glowletter_play_results as g where g.created_at >= d.day and g.created_at < d.day + 1),
      'purchases', (select count(*) from private.glowletter_play_entitlements as e where e.first_active_at >= d.day and e.first_active_at < d.day + 1 and not coalesce(e.is_test_purchase, false)),
      'reports', (select count(*) from public.glowletter_user_reports as r where r.created_at >= d.day and r.created_at < d.day + 1)
    ) order by d.day desc)
    from (select (private.glowletter_today() - g)::date as day from pg_catalog.generate_series(0, n - 1) as g) as d);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'private.glowletter_is_banned(uuid)', 'private.glowletter_admin_target(uuid)', 'private.glowletter_admin_write(uuid, text, uuid, jsonb)'
  ] loop
    execute 'revoke all on function ' || f || ' from public, anon, authenticated';
  end loop;
  foreach f in array array[
    'public.glowletter_my_status()', 'public.glowletter_warning_seen(uuid)', 'public.glowletter_report_user(uuid, text, text)',
    'public.glowletter_admin_guard_card(text)', 'public.glowletter_admin_ban(uuid, integer, text)', 'public.glowletter_admin_unban(uuid)',
    'public.glowletter_admin_warn(uuid, text)', 'public.glowletter_admin_moderate(uuid, text)', 'public.glowletter_admin_reset_stats(uuid, text, boolean)',
    'public.glowletter_admin_suspicious()', 'public.glowletter_admin_user_reports()', 'public.glowletter_admin_resolve_user_report(uuid, text)',
    'public.glowletter_admin_bans()', 'public.glowletter_admin_log_list(integer)', 'public.glowletter_admin_daily_stats(integer)'
  ] loop
    execute 'revoke all on function ' || f || ' from public, anon';
    execute 'grant execute on function ' || f || ' to authenticated';
  end loop;
end;
$$;
