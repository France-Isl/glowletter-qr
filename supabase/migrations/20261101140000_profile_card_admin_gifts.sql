-- Профиль по нажатию на имя (владелец 31.10: «при нажатии на ник человека смотреть его полностью
-- профиль»): к стене наград добавлены «Дурак»/«Шашки», подарки, VIP, дата в GlowLetter, «в сети»
-- (последний вход — только друзьям и админу) и отношение к человеку (друг, заявка).
-- Админ из профиля выдаёт или забирает светлячки, игровые доллары, вещи магазина и VIP
-- («мог давать им монеты, вип, всё что хочу»): все проверки — здесь, на сервере, всё в журнал.

create or replace function public.glowletter_medal_wall(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  target uuid := coalesce(p_user, auth.uid());
  cur integer := private.glowletter_season_at(now());
  close_one boolean;
  link public.glowletter_friendships;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if target <> me and not private.glowletter_are_friends(me, target) and not private.glowletter_is_admin()
     and not coalesce((select ranking_public from public.glowletter_profiles where user_id = target), false) then
    raise exception using errcode = '42501', message = 'private';
  end if;
  close_one := target = me or private.glowletter_are_friends(me, target) or private.glowletter_is_admin();
  select * into link from public.glowletter_friendships as f
  where (f.requester = me and f.addressee = target) or (f.requester = target and f.addressee = me)
  limit 1;
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
      where m.user_id = target), '[]'::jsonb),
    'since', (select created_at from public.glowletter_profiles where user_id = target),
    'last_seen', case when close_one then (select last_seen from public.glowletter_profiles where user_id = target) end,
    'vip', private.glowletter_has_paid_access(target),
    'relation', case
      when target = me then 'me'
      when link.status = 'accepted' then 'friend'
      when link.status = 'pending' and link.requester = me then 'outgoing'
      when link.status = 'pending' then 'incoming'
      else 'none' end,
    'cards', coalesce((select pg_catalog.jsonb_build_object('games', d.games, 'wins', d.wins, 'fools', d.fools,
        'best_streak', d.best_streak, 'won_total', d.won_total) from public.glowletter_durak_stats as d where d.user_id = target), '{}'::jsonb),
    'gifts', pg_catalog.jsonb_build_object(
      'total', (select count(*) from public.glowletter_gifts where recipient = target),
      'items', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('item', g.item_id, 'n', g.n) order by g.n desc, g.item_id)
        from (select item_id, count(*) as n from public.glowletter_gifts where recipient = target group by item_id order by count(*) desc limit 12) as g), '[]'::jsonb)));
end;
$$;

-- Что видит только админ в профиле человека: ID поддержки, e-mail, кошелёк, вещи, доступ.
create or replace function public.glowletter_admin_profile(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  return pg_catalog.jsonb_build_object(
    'user_id', p_user,
    'support_id', (select support_id from public.glowletter_accounts where user_id = p_user),
    'email', (select email from auth.users where id = p_user),
    'friend_code', (select friend_code from public.glowletter_profiles where user_id = p_user),
    'is_admin', coalesce((select is_admin from public.glowletter_accounts where user_id = p_user), false),
    'premium_forever', coalesce((select premium_forever from public.glowletter_accounts where user_id = p_user), false),
    'vip_until', (select vip_until from public.glowletter_accounts where user_id = p_user),
    'paid', private.glowletter_has_paid_access(p_user),
    'coins', coalesce((select coins from public.glowletter_wallets where user_id = p_user), 0),
    'dollars', coalesce((select dollars from public.glowletter_wallets where user_id = p_user), 0),
    'inventory', coalesce((select pg_catalog.jsonb_object_agg(item_id, qty) from public.glowletter_inventory where user_id = p_user and qty > 0), '{}'::jsonb),
    'banned', private.glowletter_is_banned(p_user));
end;
$$;

-- Игровые доллары (Дурак, Шашки) — как светлячки в glowletter_admin_coins.
create or replace function public.glowletter_admin_dollars(p_user uuid, p_delta integer, p_reason text)
returns bigint language plpgsql security definer set search_path = ''
as $$
declare admin uuid := private.glowletter_require_admin();
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if p_delta = 0 or abs(p_delta) > 10000000 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_money_add(p_user, 'dollars', p_delta, 'admin', null);
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'dollars', p_user, pg_catalog.jsonb_build_object('delta', p_delta, 'reason', pg_catalog.left(coalesce(p_reason, ''), 200)));
  return (select dollars from public.glowletter_wallets where user_id = p_user);
end;
$$;

-- Вещь из магазина в подарок от админа (или забрать): колоды, сукно, щит, страховка, подарки.
create or replace function public.glowletter_admin_give_item(p_user uuid, p_item text, p_qty integer)
returns integer language plpgsql security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  item public.glowletter_shop_items;
  result integer;
begin
  if p_user is null or not exists (select 1 from auth.users where id = p_user) then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  select * into item from public.glowletter_shop_items where id = p_item;
  if item.id is null or coalesce(p_qty, 0) = 0 or abs(p_qty) > 100 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_wallet_open(p_user);
  insert into public.glowletter_inventory (user_id, item_id, qty)
  values (p_user, item.id, greatest(0, case when item.kind in ('back', 'cloth') then least(p_qty, 1) else p_qty end))
  on conflict (user_id, item_id) do update
    set qty = case when item.kind in ('back', 'cloth') then least(greatest(0, public.glowletter_inventory.qty + p_qty), 1)
                   else greatest(0, public.glowletter_inventory.qty + p_qty) end,
        updated_at = now()
  returning qty into result;
  insert into public.glowletter_admin_log (admin_id, action, target, details)
  values (admin, 'item', p_user, pg_catalog.jsonb_build_object('item', item.id, 'qty', p_qty));
  return result;
end;
$$;

revoke all on function public.glowletter_admin_profile(uuid) from public, anon;
revoke all on function public.glowletter_admin_dollars(uuid, integer, text) from public, anon;
revoke all on function public.glowletter_admin_give_item(uuid, text, integer) from public, anon;
grant execute on function public.glowletter_admin_profile(uuid) to authenticated;
grant execute on function public.glowletter_admin_dollars(uuid, integer, text) to authenticated;
grant execute on function public.glowletter_admin_give_item(uuid, text, integer) to authenticated;
