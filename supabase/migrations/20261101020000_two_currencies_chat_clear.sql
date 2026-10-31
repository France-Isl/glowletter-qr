-- Две валюты (01.11, решение владельца):
--   «Светлячки» (coins) — покупаются за деньги в Google Play, 100 в подарок каждому аккаунту,
--     за победы не начисляются; за них — магазин и доллары; другу можно отправить до 1000 в день.
--   «Доллары» (dollars) — валюта стола в «Дураке»: 5 000 $ в начале, ставки 100 $ – 1 000 000 $.
--     Доллары нельзя обменять обратно на светлячки, передать или потратить в магазине —
--     у выигрыша нет денежной ценности.
-- И очистка личного чата: человек скрывает у себя всю переписку до этой минуты.

alter table public.glowletter_wallets alter column coins set default 100;
alter table public.glowletter_wallets add column if not exists dollars bigint not null default 5000 check (dollars >= 0);
alter table public.glowletter_wallets add column if not exists sent_day date;
alter table public.glowletter_wallets add column if not exists sent_today integer not null default 0;
alter table public.glowletter_wallets add column if not exists shield integer not null default 0;
alter table public.glowletter_wallets add column if not exists insurance integer not null default 0;

alter table public.glowletter_coin_ledger add column if not exists currency text not null default 'coins' check (currency in ('coins', 'dollars'));
alter table public.glowletter_coin_ledger drop constraint if exists glowletter_coin_ledger_reason_check;
alter table public.glowletter_coin_ledger add constraint glowletter_coin_ledger_reason_check
  check (reason in ('welcome', 'daily', 'promo', 'shop', 'durak', 'admin', 'refund', 'purchase', 'exchange', 'transfer', 'bet', 'payout', 'quest', 'invite', 'insurance'));

alter table public.glowletter_durak_stats add column if not exists won_total bigint not null default 0;
alter table public.glowletter_durak_stats add column if not exists best_win bigint not null default 0;
alter table public.glowletter_durak_stats add column if not exists week_start date;
alter table public.glowletter_durak_stats add column if not exists week_won bigint not null default 0;
alter table public.glowletter_durak_stats add column if not exists streak integer not null default 0;
alter table public.glowletter_durak_stats add column if not exists best_streak integer not null default 0;

insert into public.glowletter_shop_items (id, kind, price, sort) values
  ('shield', 'boost', 40, 420), ('insurance', 'boost', 60, 430)
on conflict (id) do update set price = excluded.price, sort = excluded.sort;

-- Подарок при первом кошельке — в журнал, чтобы было видно, откуда 100 светлячков.
create or replace function private.glowletter_wallet_open(p_user uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
begin
  insert into public.glowletter_wallets (user_id) values (p_user) on conflict (user_id) do nothing;
  if found then
    insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency) values (p_user, 100, 100, 'welcome', 'welcome', 'coins');
    insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency) values (p_user, 5000, 5000, 'welcome', 'welcome$', 'dollars');
  end if;
end;
$$;
revoke all on function private.glowletter_wallet_open(uuid) from public, anon, authenticated;

-- Одно место, где меняется баланс любой валюты.
create or replace function private.glowletter_money_add(p_user uuid, p_currency text, p_delta bigint, p_reason text, p_ref text)
returns bigint language plpgsql volatile security definer set search_path = ''
as $$
declare
  balance bigint;
begin
  if p_user is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_wallet_open(p_user);
  perform 1 from public.glowletter_wallets where user_id = p_user for update;
  if p_ref is not null and exists (select 1 from public.glowletter_coin_ledger where user_id = p_user and ref = p_ref) then return null; end if;
  if p_currency = 'coins' then
    update public.glowletter_wallets set coins = coins + p_delta, updated_at = now() where user_id = p_user and coins + p_delta >= 0 returning coins into balance;
  elsif p_currency = 'dollars' then
    update public.glowletter_wallets set dollars = dollars + p_delta, updated_at = now() where user_id = p_user and dollars + p_delta >= 0 returning dollars into balance;
  else
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if balance is null then
    raise exception using errcode = 'P0001', message = case when p_currency = 'coins' then 'not_enough_coins' else 'not_enough_dollars' end;
  end if;
  if p_delta <> 0 then
    insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency) values (p_user, p_delta, balance, p_reason, p_ref, p_currency);
  end if;
  return balance;
end;
$$;
revoke all on function private.glowletter_money_add(uuid, text, bigint, text, text) from public, anon, authenticated;

-- Старое имя оставлено для магазина и пин-кодов: это всегда светлячки.
create or replace function private.glowletter_coins_add(p_user uuid, p_delta integer, p_reason text, p_ref text, p_capped boolean default false)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare result bigint;
begin
  result := private.glowletter_money_add(p_user, 'coins', p_delta, p_reason, p_ref);
  return case when result is null then 0 else p_delta end;
end;
$$;
revoke all on function private.glowletter_coins_add(uuid, integer, text, text, boolean) from public, anon, authenticated;

-- Награда дня: доллары каждый день, на седьмой — ещё 10 светлячков. Щит серии спасает один пропуск.
create or replace function private.glowletter_daily_amount(p_streak integer)
returns integer language sql immutable set search_path = ''
as $$ select (array[1000, 1500, 2000, 3000, 4000, 5000, 10000])[((greatest(p_streak, 1) - 1) % 7) + 1] $$;

create or replace function public.glowletter_wallet()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  w public.glowletter_wallets;
  d public.glowletter_daily_rewards;
  today date := (now() at time zone 'utc')::date;
  next_streak integer;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_wallet_open(me);
  select * into w from public.glowletter_wallets where user_id = me;
  select * into d from public.glowletter_daily_rewards where user_id = me;
  next_streak := case when d.user_id is null then 1 when d.last_day = today then d.streak
                      when d.last_day = today - 1 or (d.last_day = today - 2 and w.shield > 0) then d.streak + 1 else 1 end;
  return pg_catalog.jsonb_build_object(
    'coins', w.coins, 'dollars', w.dollars,
    'boost_until', case when w.boost_until > now() then w.boost_until end,
    'shield', w.shield, 'insurance', w.insurance,
    'card_back', w.card_back, 'cloth', w.cloth,
    'sent_today', case when w.sent_day = today then w.sent_today else 0 end, 'send_limit', 1000,
    'streak', coalesce(case when d.last_day >= today - 1 then d.streak end, 0),
    'claimed_today', coalesce(d.last_day = today, false),
    'daily_next', private.glowletter_daily_amount(next_streak),
    'daily_coins', case when ((next_streak - 1) % 7) + 1 = 7 then 10 else 0 end,
    'daily_day', ((next_streak - 1) % 7) + 1,
    'inventory', coalesce((select pg_catalog.jsonb_object_agg(item_id, qty) from public.glowletter_inventory where user_id = me and qty > 0), '{}'::jsonb),
    'stats', coalesce((select pg_catalog.jsonb_build_object('games', games, 'wins', wins, 'fools', fools, 'draws', draws,
        'won_total', won_total, 'best_win', best_win, 'streak', streak, 'best_streak', best_streak,
        'week_won', case when week_start = date_trunc('week', now())::date then week_won else 0 end)
      from public.glowletter_durak_stats where user_id = me), '{}'::jsonb),
    'exchange', pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('coins', 100, 'dollars', 5000),
      pg_catalog.jsonb_build_object('coins', 300, 'dollars', 16500),
      pg_catalog.jsonb_build_object('coins', 1000, 'dollars', 60000),
      pg_catalog.jsonb_build_object('coins', 3500, 'dollars', 225000),
      pg_catalog.jsonb_build_object('coins', 15000, 'dollars', 1125000))
  );
end;
$$;

create or replace function public.glowletter_daily_claim()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  d public.glowletter_daily_rewards;
  w public.glowletter_wallets;
  today date := (now() at time zone 'utc')::date;
  streak integer;
  amount integer;
  bonus integer := 0;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  perform private.glowletter_wallet_open(me);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':daily', 0));
  select * into d from public.glowletter_daily_rewards where user_id = me;
  select * into w from public.glowletter_wallets where user_id = me;
  if d.last_day = today then raise exception using errcode = 'P0001', message = 'already_claimed'; end if;
  if d.last_day = today - 1 then streak := d.streak + 1;
  elsif d.last_day = today - 2 and w.shield > 0 then
    streak := d.streak + 1;
    update public.glowletter_wallets set shield = shield - 1 where user_id = me;
  else streak := 1; end if;
  amount := private.glowletter_daily_amount(streak);
  if ((streak - 1) % 7) + 1 = 7 then bonus := 10; end if;
  insert into public.glowletter_daily_rewards (user_id, last_day, streak) values (me, today, streak)
    on conflict (user_id) do update set last_day = excluded.last_day, streak = excluded.streak;
  perform private.glowletter_money_add(me, 'dollars', amount, 'daily', 'daily$:' || today::text);
  if bonus > 0 then perform private.glowletter_money_add(me, 'coins', bonus, 'daily', 'daily:' || today::text); end if;
  return pg_catalog.jsonb_build_object('dollars_added', amount, 'coins_added', bonus, 'streak', streak,
    'coins', (select coins from public.glowletter_wallets where user_id = me),
    'dollars', (select dollars from public.glowletter_wallets where user_id = me));
end;
$$;

-- Светлячки → доллары по таблице (чем больше пакет, тем выгоднее). Обратно нельзя.
create or replace function public.glowletter_exchange(p_coins integer)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  got bigint;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  got := case p_coins when 100 then 5000 when 300 then 16500 when 1000 then 60000 when 3500 then 225000 when 15000 then 1125000 end;
  if got is null then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_money_add(me, 'coins', -p_coins, 'exchange', null);
  perform private.glowletter_money_add(me, 'dollars', got, 'exchange', null);
  return pg_catalog.jsonb_build_object('dollars_added', got,
    'coins', (select coins from public.glowletter_wallets where user_id = me),
    'dollars', (select dollars from public.glowletter_wallets where user_id = me));
end;
$$;
revoke all on function public.glowletter_exchange(integer) from public, anon;
grant execute on function public.glowletter_exchange(integer) to authenticated;

-- Отправить светлячки другу: не больше 1000 за день.
create or replace function public.glowletter_coins_send(p_to uuid, p_amount integer)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  w public.glowletter_wallets;
  today date := (now() at time zone 'utc')::date;
  already integer;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_to is null or p_to = me or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if p_amount is null or p_amount not between 1 and 1000 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_wallet_open(me);
  select * into w from public.glowletter_wallets where user_id = me for update;
  already := case when w.sent_day = today then w.sent_today else 0 end;
  if already + p_amount > 1000 then raise exception using errcode = 'P0001', message = 'send_limit'; end if;
  perform private.glowletter_money_add(me, 'coins', -p_amount, 'transfer', null);
  perform private.glowletter_money_add(p_to, 'coins', p_amount, 'transfer', null);
  update public.glowletter_wallets set sent_day = today, sent_today = already + p_amount where user_id = me;
  insert into public.glowletter_messages (sender, recipient, body) values (me, p_to, '[[coins:' || p_amount || ']]');
  return pg_catalog.jsonb_build_object('coins', (select coins from public.glowletter_wallets where user_id = me), 'sent_today', already + p_amount);
end;
$$;
revoke all on function public.glowletter_coins_send(uuid, integer) from public, anon;
grant execute on function public.glowletter_coins_send(uuid, integer) to authenticated;

-- Щит серии и страховка — запас в кошельке; ×2 — на час.
create or replace function public.glowletter_boost_use(p_item text default 'boost_x2')
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_item not in ('boost_x2', 'shield', 'insurance') then raise exception using errcode = '22023', message = 'invalid'; end if;
  update public.glowletter_inventory set qty = qty - 1, updated_at = now() where user_id = me and item_id = p_item and qty > 0;
  if not found then raise exception using errcode = '42501', message = 'locked'; end if;
  perform private.glowletter_wallet_open(me);
  if p_item = 'boost_x2' then
    update public.glowletter_wallets set boost_until = greatest(coalesce(boost_until, now()), now()) + interval '1 hour' where user_id = me;
  elsif p_item = 'shield' then
    update public.glowletter_wallets set shield = shield + 1 where user_id = me;
  else
    update public.glowletter_wallets set insurance = insurance + 1 where user_id = me;
  end if;
  return public.glowletter_wallet();
end;
$$;
drop function if exists public.glowletter_boost_use();
revoke all on function public.glowletter_boost_use(text) from public, anon;
grant execute on function public.glowletter_boost_use(text) to authenticated;

-- ——— Ставки за столом (вызывает только серверная функция durak) ———
-- Взнос всех людей за стол разом; если у кого-то не хватает — никто ничего не платит.
create or replace function public.glowletter_durak_stake(p_game uuid, p_round integer, p_users uuid[], p_stake bigint)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  u uuid;
  poor uuid[] := '{}';
begin
  if p_stake < 0 or p_stake > 1000000 then raise exception using errcode = '22023', message = 'invalid'; end if;
  if p_stake = 0 then return pg_catalog.jsonb_build_object('ok', true); end if;
  foreach u in array p_users loop
    perform private.glowletter_wallet_open(u);
    if (select dollars from public.glowletter_wallets where user_id = u for update) < p_stake then poor := poor || u; end if;
  end loop;
  if pg_catalog.array_length(poor, 1) > 0 then return pg_catalog.jsonb_build_object('ok', false, 'poor', pg_catalog.to_jsonb(poor)); end if;
  foreach u in array p_users loop
    perform private.glowletter_money_add(u, 'dollars', -p_stake, 'bet', 'bet:' || p_game || ':' || p_round);
  end loop;
  return pg_catalog.jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.glowletter_durak_stake(uuid, integer, uuid[], bigint) from public, anon, authenticated;
grant execute on function public.glowletter_durak_stake(uuid, integer, uuid[], bigint) to service_role;

-- Итог: возврат взноса + выигрыш (или 0 у дурака), статистика, рейтинг недели. Выигрыш у ботов
-- в рейтинг и достижения не идёт. Страховка возвращает дураку половину взноса.
create or replace function public.glowletter_durak_settle(p_game uuid, p_round integer, p_user uuid, p_result text, p_stake bigint, p_payout bigint, p_with_bots boolean)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  ref text := 'payout:' || p_game || ':' || p_round;
  net bigint := p_payout - p_stake;
  paid bigint := p_payout;
  insured boolean := false;
  boosted boolean;
  week date := date_trunc('week', now())::date;
begin
  if p_result not in ('win', 'escape', 'fool', 'draw') or p_payout < 0 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_wallet_open(p_user);
  if exists (select 1 from public.glowletter_coin_ledger where user_id = p_user and ref = ref) then return pg_catalog.jsonb_build_object('paid', 0, 'repeat', true); end if;
  boosted := coalesce((select boost_until > now() from public.glowletter_wallets where user_id = p_user), false);
  if boosted and net > 0 then paid := paid + net; net := net * 2; end if;
  if p_result = 'fool' and p_stake > 0 and (select insurance from public.glowletter_wallets where user_id = p_user) > 0 then
    update public.glowletter_wallets set insurance = insurance - 1 where user_id = p_user;
    paid := paid + p_stake / 2;
    net := net + p_stake / 2;
    insured := true;
  end if;
  if paid > 0 then perform private.glowletter_money_add(p_user, 'dollars', paid, 'payout', ref);
  else insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency)
       values (p_user, 0, (select dollars from public.glowletter_wallets where user_id = p_user), 'payout', ref, 'dollars') on conflict do nothing; end if;
  insert into public.glowletter_durak_stats (user_id) values (p_user) on conflict (user_id) do nothing;
  update public.glowletter_durak_stats as s set
    games = s.games + 1,
    wins = s.wins + (p_result = 'win')::integer,
    fools = s.fools + (p_result = 'fool')::integer,
    draws = s.draws + (p_result = 'draw')::integer,
    streak = case when p_result = 'win' then s.streak + 1 when p_result = 'fool' then 0 else s.streak end,
    best_streak = greatest(s.best_streak, case when p_result = 'win' then s.streak + 1 else 0 end),
    won_total = s.won_total + case when not p_with_bots and net > 0 then net else 0 end,
    best_win = greatest(s.best_win, case when not p_with_bots and net > 0 then net else 0 end),
    week_won = case when s.week_start = week then s.week_won else 0 end + case when not p_with_bots and net > 0 then net else 0 end,
    week_start = week,
    updated_at = now()
  where s.user_id = p_user;
  return pg_catalog.jsonb_build_object('paid', paid, 'net', net, 'insured', insured, 'boosted', boosted);
end;
$$;
revoke all on function public.glowletter_durak_settle(uuid, integer, uuid, text, bigint, bigint, boolean) from public, anon, authenticated;
grant execute on function public.glowletter_durak_settle(uuid, integer, uuid, text, bigint, bigint, boolean) to service_role;

drop function if exists public.glowletter_durak_award(uuid, integer, uuid, text, integer);

-- Рейтинг «Дурака»: выигрыш за неделю у живых игроков (без ботов).
create or replace function public.glowletter_durak_ranking()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(pg_catalog.jsonb_agg(row_data order by won desc), '[]'::jsonb) from (
    select pg_catalog.jsonb_build_object('name', coalesce(p.display_name, ''), 'won', s.week_won, 'wins', s.wins, 'games', s.games, 'me', s.user_id = auth.uid()) as row_data, s.week_won as won
    from public.glowletter_durak_stats as s
    left join public.glowletter_profiles as p on p.user_id = s.user_id
    where s.week_start = date_trunc('week', now())::date and s.week_won > 0 and not private.glowletter_is_banned(s.user_id)
    order by s.week_won desc limit 50) as t
$$;
revoke all on function public.glowletter_durak_ranking() from public, anon;
grant execute on function public.glowletter_durak_ranking() to authenticated;

-- ——— Очистка личного чата (только у себя) ———
create table if not exists public.glowletter_chat_clears (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  cleared_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
alter table public.glowletter_chat_clears enable row level security;
revoke all on public.glowletter_chat_clears from public, anon, authenticated;

create or replace function private.glowletter_message_visible(p_sender uuid, p_recipient uuid, p_created timestamptz)
returns boolean language sql stable security definer set search_path = ''
as $$
  select not exists (
    select 1 from public.glowletter_chat_clears as c
    where c.user_id = (select auth.uid())
      and c.friend_id = case when p_sender = (select auth.uid()) then p_recipient else p_sender end
      and c.cleared_at >= p_created)
$$;
revoke all on function private.glowletter_message_visible(uuid, uuid, timestamptz) from public, anon;
grant execute on function private.glowletter_message_visible(uuid, uuid, timestamptz) to authenticated;
grant usage on schema private to authenticated;

drop policy if exists "Participants read their messages" on public.glowletter_messages;
create policy "Participants read their messages" on public.glowletter_messages
  for select to authenticated using ((select auth.uid()) in (sender, recipient) and private.glowletter_message_visible(sender, recipient, created_at));

create or replace function public.glowletter_chat_clear(p_friend uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_friend is null or p_friend = me then raise exception using errcode = '22023', message = 'invalid'; end if;
  insert into public.glowletter_chat_clears (user_id, friend_id, cleared_at) values (me, p_friend, now())
    on conflict (user_id, friend_id) do update set cleared_at = excluded.cleared_at;
  update public.glowletter_messages set read_at = now() where sender = p_friend and recipient = me and read_at is null;
end;
$$;
revoke all on function public.glowletter_chat_clear(uuid) from public, anon;
grant execute on function public.glowletter_chat_clear(uuid) to authenticated;
