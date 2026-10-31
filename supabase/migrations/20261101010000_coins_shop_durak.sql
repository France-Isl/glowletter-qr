-- Монеты, магазин, пин-коды, ежедневная награда и «Дурак» (01.11).
-- Монеты живут только на сервере: каждое изменение идёт через эти функции и пишется в журнал.
-- Начислить монеты может только сервер (награда дня, пин-код, итог партии) или админ.

create table if not exists public.glowletter_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coins bigint not null default 0 check (coins >= 0),
  earned_day date,
  earned_today integer not null default 0,
  boost_until timestamptz,
  card_back text not null default 'back_classic',
  cloth text not null default 'cloth_green',
  updated_at timestamptz not null default now()
);

create table if not exists public.glowletter_coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  balance bigint not null,
  reason text not null check (reason in ('daily', 'promo', 'shop', 'durak', 'admin', 'refund')),
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists glowletter_coin_ledger_user_idx on public.glowletter_coin_ledger (user_id, created_at desc);
create unique index if not exists glowletter_coin_ledger_ref_idx on public.glowletter_coin_ledger (user_id, ref) where ref is not null;

create table if not exists public.glowletter_promo_codes (
  code text primary key check (code ~ '^[A-Z0-9]{4,24}$'),
  coins integer not null check (coins between 1 and 1000000),
  max_uses integer not null check (max_uses between 1 and 100000),
  uses integer not null default 0 check (uses >= 0),
  note text check (note is null or pg_catalog.char_length(note) <= 120),
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.glowletter_promo_redemptions (
  code text not null references public.glowletter_promo_codes (code) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (code, user_id)
);

create table if not exists public.glowletter_promo_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists glowletter_promo_attempts_user_idx on public.glowletter_promo_attempts (user_id, created_at desc);

create table if not exists public.glowletter_shop_items (
  id text primary key check (id ~ '^[a-z0-9_]{2,32}$'),
  kind text not null check (kind in ('gift', 'back', 'cloth', 'boost')),
  price integer not null check (price between 1 and 1000000),
  sort integer not null default 100,
  active boolean not null default true
);

create table if not exists public.glowletter_inventory (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null references public.glowletter_shop_items (id) on delete cascade,
  qty integer not null default 0 check (qty >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.glowletter_gifts (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users (id) on delete cascade,
  recipient uuid not null references auth.users (id) on delete cascade,
  item_id text not null references public.glowletter_shop_items (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists glowletter_gifts_recipient_idx on public.glowletter_gifts (recipient, created_at desc);

create table if not exists public.glowletter_daily_rewards (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_day date not null,
  streak integer not null default 1 check (streak >= 1)
);

create table if not exists public.glowletter_durak_games (
  id uuid primary key default gen_random_uuid(),
  host uuid not null references auth.users (id) on delete cascade,
  settings jsonb not null,
  seats jsonb not null default '[]'::jsonb,
  state jsonb,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished', 'closed')),
  round integer not null default 0,
  version integer not null default 0,
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists glowletter_durak_games_updated_idx on public.glowletter_durak_games (updated_at);

create table if not exists public.glowletter_durak_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  games integer not null default 0,
  wins integer not null default 0,
  fools integer not null default 0,
  draws integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.glowletter_wallets enable row level security;
alter table public.glowletter_coin_ledger enable row level security;
alter table public.glowletter_promo_codes enable row level security;
alter table public.glowletter_promo_redemptions enable row level security;
alter table public.glowletter_promo_attempts enable row level security;
alter table public.glowletter_shop_items enable row level security;
alter table public.glowletter_inventory enable row level security;
alter table public.glowletter_gifts enable row level security;
alter table public.glowletter_daily_rewards enable row level security;
alter table public.glowletter_durak_games enable row level security;
alter table public.glowletter_durak_stats enable row level security;
revoke all on public.glowletter_wallets, public.glowletter_coin_ledger, public.glowletter_promo_codes, public.glowletter_promo_redemptions,
  public.glowletter_promo_attempts, public.glowletter_shop_items, public.glowletter_inventory, public.glowletter_gifts,
  public.glowletter_daily_rewards, public.glowletter_durak_games, public.glowletter_durak_stats from public, anon, authenticated;
grant select, insert, update, delete on public.glowletter_durak_games to service_role;

insert into public.glowletter_shop_items (id, kind, price, sort) values
  ('rose', 'gift', 25, 10), ('tulips', 'gift', 40, 20), ('sunflower', 'gift', 35, 30), ('lily', 'gift', 45, 40),
  ('bouquet', 'gift', 90, 50), ('bear', 'gift', 60, 60), ('big_bear', 'gift', 150, 70), ('bear_rose', 'gift', 120, 80),
  ('heart_box', 'gift', 50, 90), ('candy', 'gift', 30, 100), ('cake', 'gift', 70, 110), ('cupcake', 'gift', 20, 120),
  ('back_khokhloma', 'back', 150, 200), ('back_gzhel', 'back', 150, 210), ('back_gold', 'back', 300, 220),
  ('cloth_burgundy', 'cloth', 120, 300), ('cloth_wood', 'cloth', 120, 310), ('cloth_night', 'cloth', 200, 320),
  ('boost_x2', 'boost', 100, 400), ('hint', 'boost', 15, 410)
on conflict (id) do update set kind = excluded.kind, price = excluded.price, sort = excluded.sort;

-- ——— Ядро: изменить баланс ———
-- p_capped — игровая награда: не больше 300 монет в день (с ×2 — 600).
create or replace function private.glowletter_coins_add(p_user uuid, p_delta integer, p_reason text, p_ref text, p_capped boolean default false)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  w public.glowletter_wallets;
  amount integer := p_delta;
  today date := (now() at time zone 'utc')::date;
  boosted boolean;
begin
  if p_user is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  insert into public.glowletter_wallets (user_id) values (p_user) on conflict (user_id) do nothing;
  select * into w from public.glowletter_wallets where user_id = p_user for update;
  if p_ref is not null and exists (select 1 from public.glowletter_coin_ledger where user_id = p_user and ref = p_ref) then
    return 0;
  end if;
  if w.earned_day is distinct from today then w.earned_today := 0; end if;
  if p_capped and amount > 0 then
    amount := least(amount, greatest(0, 300 - w.earned_today));
    boosted := coalesce(w.boost_until > now(), false);
    w.earned_today := w.earned_today + amount;
    if boosted then amount := amount * 2; end if;
    if amount = 0 then
      update public.glowletter_wallets set earned_day = today, earned_today = w.earned_today where user_id = p_user;
      return 0;
    end if;
  end if;
  if w.coins + amount < 0 then raise exception using errcode = 'P0001', message = 'not_enough_coins'; end if;
  update public.glowletter_wallets
     set coins = coins + amount, earned_day = today, earned_today = w.earned_today, updated_at = now()
   where user_id = p_user;
  insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref) values (p_user, amount, w.coins + amount, p_reason, p_ref);
  return amount;
end;
$$;
revoke all on function private.glowletter_coins_add(uuid, integer, text, text, boolean) from public, anon, authenticated;

create or replace function private.glowletter_daily_amount(p_streak integer)
returns integer language sql immutable set search_path = ''
as $$ select (array[20, 30, 40, 50, 60, 80, 150])[((greatest(p_streak, 1) - 1) % 7) + 1] $$;

-- ——— Кошелёк ———
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
  insert into public.glowletter_wallets (user_id) values (me) on conflict (user_id) do nothing;
  select * into w from public.glowletter_wallets where user_id = me;
  select * into d from public.glowletter_daily_rewards where user_id = me;
  next_streak := case when d.user_id is null then 1 when d.last_day = today then d.streak when d.last_day = today - 1 then d.streak + 1 else 1 end;
  return pg_catalog.jsonb_build_object(
    'coins', w.coins,
    'earned_today', case when w.earned_day = today then w.earned_today else 0 end,
    'cap', 300,
    'boost_until', case when w.boost_until > now() then w.boost_until end,
    'card_back', w.card_back, 'cloth', w.cloth,
    'streak', coalesce(case when d.last_day >= today - 1 then d.streak end, 0),
    'claimed_today', coalesce(d.last_day = today, false),
    'daily_next', private.glowletter_daily_amount(next_streak),
    'daily_day', ((next_streak - 1) % 7) + 1,
    'inventory', coalesce((select pg_catalog.jsonb_object_agg(item_id, qty) from public.glowletter_inventory where user_id = me and qty > 0), '{}'::jsonb),
    'stats', coalesce((select pg_catalog.jsonb_build_object('games', games, 'wins', wins, 'fools', fools, 'draws', draws) from public.glowletter_durak_stats where user_id = me), '{}'::jsonb)
  );
end;
$$;
revoke all on function public.glowletter_wallet() from public, anon;
grant execute on function public.glowletter_wallet() to authenticated;

create or replace function public.glowletter_daily_claim()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  d public.glowletter_daily_rewards;
  today date := (now() at time zone 'utc')::date;
  streak integer;
  amount integer;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':daily', 0));
  select * into d from public.glowletter_daily_rewards where user_id = me;
  if d.last_day = today then raise exception using errcode = 'P0001', message = 'already_claimed'; end if;
  streak := case when d.last_day = today - 1 then d.streak + 1 else 1 end;
  amount := private.glowletter_daily_amount(streak);
  insert into public.glowletter_daily_rewards (user_id, last_day, streak) values (me, today, streak)
    on conflict (user_id) do update set last_day = excluded.last_day, streak = excluded.streak;
  perform private.glowletter_coins_add(me, amount, 'daily', 'daily:' || today::text, false);
  return pg_catalog.jsonb_build_object('amount', amount, 'streak', streak,
    'coins', (select coins from public.glowletter_wallets where user_id = me));
end;
$$;
revoke all on function public.glowletter_daily_claim() from public, anon;
grant execute on function public.glowletter_daily_claim() to authenticated;

-- ——— Пин-коды ———
create or replace function public.glowletter_promo_redeem(p_code text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  wanted text := pg_catalog.upper(pg_catalog.regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  promo public.glowletter_promo_codes;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if (select count(*) from public.glowletter_promo_attempts where user_id = me and created_at > now() - interval '1 hour') >= 10 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  select * into promo from public.glowletter_promo_codes where code = wanted for update;
  if promo.code is null or not promo.active then
    insert into public.glowletter_promo_attempts (user_id) values (me);
    raise exception using errcode = 'P0001', message = 'code_invalid';
  end if;
  if promo.expires_at is not null and promo.expires_at < now() then raise exception using errcode = 'P0001', message = 'code_expired'; end if;
  if exists (select 1 from public.glowletter_promo_redemptions where code = promo.code and user_id = me) then
    raise exception using errcode = 'P0001', message = 'code_already';
  end if;
  if promo.uses >= promo.max_uses then raise exception using errcode = 'P0001', message = 'code_used_up'; end if;
  update public.glowletter_promo_codes set uses = uses + 1 where code = promo.code;
  insert into public.glowletter_promo_redemptions (code, user_id) values (promo.code, me);
  perform private.glowletter_coins_add(me, promo.coins, 'promo', 'promo:' || promo.code, false);
  return pg_catalog.jsonb_build_object('amount', promo.coins, 'coins', (select coins from public.glowletter_wallets where user_id = me));
end;
$$;
revoke all on function public.glowletter_promo_redeem(text) from public, anon;
grant execute on function public.glowletter_promo_redeem(text) to authenticated;

create or replace function public.glowletter_admin_promo_create(p_code text, p_coins integer, p_max_uses integer, p_note text, p_days integer)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  admin uuid := private.glowletter_require_admin();
  wanted text := pg_catalog.upper(pg_catalog.regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
begin
  if wanted = '' then
    for attempt in 1..20 loop
      wanted := '';
      for i in 1..8 loop
        wanted := wanted || pg_catalog.substr(alphabet, 1 + (pg_catalog.get_byte(extensions.gen_random_bytes(1), 0) % 32), 1);
      end loop;
      exit when not exists (select 1 from public.glowletter_promo_codes where code = wanted);
    end loop;
  end if;
  if wanted !~ '^[A-Z0-9]{4,24}$' then raise exception using errcode = '22023', message = 'invalid_code'; end if;
  if exists (select 1 from public.glowletter_promo_codes where code = wanted) then raise exception using errcode = 'P0001', message = 'code_exists'; end if;
  insert into public.glowletter_promo_codes (code, coins, max_uses, note, expires_at, created_by)
  values (wanted, p_coins, p_max_uses, nullif(pg_catalog.btrim(coalesce(p_note, '')), ''),
          case when coalesce(p_days, 0) > 0 then now() + pg_catalog.make_interval(days => p_days) end, admin);
  insert into public.glowletter_admin_log (admin_id, action, details)
  values (admin, 'promo_create', pg_catalog.jsonb_build_object('code', wanted, 'coins', p_coins, 'max_uses', p_max_uses));
  return pg_catalog.jsonb_build_object('code', wanted, 'coins', p_coins, 'max_uses', p_max_uses);
end;
$$;
revoke all on function public.glowletter_admin_promo_create(text, integer, integer, text, integer) from public, anon;
grant execute on function public.glowletter_admin_promo_create(text, integer, integer, text, integer) to authenticated;

create or replace function public.glowletter_admin_promo_list()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.glowletter_require_admin();
  return coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'code', code, 'coins', coins, 'max_uses', max_uses, 'uses', uses, 'note', note, 'active', active,
      'expires_at', expires_at, 'created_at', created_at) order by created_at desc)
    from (select * from public.glowletter_promo_codes order by created_at desc limit 100) as p), '[]'::jsonb);
end;
$$;
revoke all on function public.glowletter_admin_promo_list() from public, anon;
grant execute on function public.glowletter_admin_promo_list() to authenticated;

create or replace function public.glowletter_admin_promo_toggle(p_code text, p_active boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare admin uuid := private.glowletter_require_admin();
begin
  update public.glowletter_promo_codes set active = p_active where code = pg_catalog.upper(p_code);
  insert into public.glowletter_admin_log (admin_id, action, details) values (admin, 'promo_toggle', pg_catalog.jsonb_build_object('code', p_code, 'active', p_active));
end;
$$;
revoke all on function public.glowletter_admin_promo_toggle(text, boolean) from public, anon;
grant execute on function public.glowletter_admin_promo_toggle(text, boolean) to authenticated;

create or replace function public.glowletter_admin_coins(p_user uuid, p_delta integer, p_reason text)
returns bigint language plpgsql volatile security definer set search_path = ''
as $$
declare admin uuid := private.glowletter_require_admin();
begin
  if p_delta = 0 or abs(p_delta) > 1000000 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_coins_add(p_user, p_delta, 'admin', null, false);
  insert into public.glowletter_admin_log (admin_id, action, target, details) values (admin, 'coins', p_user, pg_catalog.jsonb_build_object('delta', p_delta, 'reason', p_reason));
  return (select coins from public.glowletter_wallets where user_id = p_user);
end;
$$;
revoke all on function public.glowletter_admin_coins(uuid, integer, text) from public, anon;
grant execute on function public.glowletter_admin_coins(uuid, integer, text) to authenticated;

-- ——— Магазин ———
create or replace function public.glowletter_shop_buy(p_item text, p_qty integer default 1)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  item public.glowletter_shop_items;
  n integer := coalesce(p_qty, 1);
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  select * into item from public.glowletter_shop_items where id = p_item and active;
  if item.id is null or n not between 1 and 20 then raise exception using errcode = '22023', message = 'invalid'; end if;
  if item.kind in ('back', 'cloth') then
    n := 1;
    if exists (select 1 from public.glowletter_inventory where user_id = me and item_id = item.id and glowletter_inventory.qty > 0) then
      raise exception using errcode = 'P0001', message = 'already_owned';
    end if;
  end if;
  perform private.glowletter_coins_add(me, -(item.price * n), 'shop', null, false);
  insert into public.glowletter_inventory (user_id, item_id, qty) values (me, item.id, n)
    on conflict (user_id, item_id) do update set qty = public.glowletter_inventory.qty + excluded.qty, updated_at = now();
  return pg_catalog.jsonb_build_object('coins', (select coins from public.glowletter_wallets where user_id = me),
    'qty', (select i.qty from public.glowletter_inventory as i where i.user_id = me and i.item_id = item.id));
end;
$$;
revoke all on function public.glowletter_shop_buy(text, integer) from public, anon;
grant execute on function public.glowletter_shop_buy(text, integer) to authenticated;

create or replace function public.glowletter_shop_items()
returns jsonb language sql stable security definer set search_path = ''
as $$ select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id', id, 'kind', kind, 'price', price) order by sort), '[]'::jsonb)
      from public.glowletter_shop_items where active $$;
revoke all on function public.glowletter_shop_items() from public;
grant execute on function public.glowletter_shop_items() to anon, authenticated;

-- Надеть рубашку колоды или сукно стола (своё или стандартное).
create or replace function public.glowletter_shop_equip(p_item text)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  kind text;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  insert into public.glowletter_wallets (user_id) values (me) on conflict (user_id) do nothing;
  if p_item = 'back_classic' then update public.glowletter_wallets set card_back = p_item where user_id = me; return; end if;
  if p_item = 'cloth_green' then update public.glowletter_wallets set cloth = p_item where user_id = me; return; end if;
  select s.kind into kind from public.glowletter_shop_items as s
    join public.glowletter_inventory as i on i.item_id = s.id and i.user_id = me and i.qty > 0
   where s.id = p_item;
  if kind = 'back' then update public.glowletter_wallets set card_back = p_item where user_id = me;
  elsif kind = 'cloth' then update public.glowletter_wallets set cloth = p_item where user_id = me;
  else raise exception using errcode = '42501', message = 'locked'; end if;
end;
$$;
revoke all on function public.glowletter_shop_equip(text) from public, anon;
grant execute on function public.glowletter_shop_equip(text) to authenticated;

-- Включить ×2 монеты на час (тратит одно усиление).
create or replace function public.glowletter_boost_use()
returns timestamptz language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  until_at timestamptz;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  update public.glowletter_inventory set qty = qty - 1, updated_at = now() where user_id = me and item_id = 'boost_x2' and qty > 0;
  if not found then raise exception using errcode = '42501', message = 'locked'; end if;
  update public.glowletter_wallets set boost_until = greatest(coalesce(boost_until, now()), now()) + interval '1 hour'
   where user_id = me returning boost_until into until_at;
  return until_at;
end;
$$;
revoke all on function public.glowletter_boost_use() from public, anon;
grant execute on function public.glowletter_boost_use() to authenticated;

-- Подарок другу: тратит товар из своих покупок и кладёт открытку в переписку.
create or replace function public.glowletter_gift_send(p_item text, p_to uuid)
returns uuid language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_to is null or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if not exists (select 1 from public.glowletter_shop_items where id = p_item and kind = 'gift') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  update public.glowletter_inventory set qty = qty - 1, updated_at = now() where user_id = me and item_id = p_item and qty > 0;
  if not found then raise exception using errcode = '42501', message = 'locked'; end if;
  insert into public.glowletter_gifts (sender, recipient, item_id) values (me, p_to, p_item);
  insert into public.glowletter_messages (sender, recipient, body) values (me, p_to, '[[gift:' || p_item || ']]') returning id into message_id;
  return message_id;
end;
$$;
revoke all on function public.glowletter_gift_send(text, uuid) from public, anon;
grant execute on function public.glowletter_gift_send(text, uuid) to authenticated;

-- Витрина подарков: сколько каких подарков человек получил.
create or replace function public.glowletter_gift_wall(p_user uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(pg_catalog.jsonb_object_agg(item_id, n), '{}'::jsonb)
  from (select item_id, count(*) as n from public.glowletter_gifts
        where recipient = coalesce(p_user, auth.uid())
          and (recipient = auth.uid() or private.glowletter_are_friends(auth.uid(), recipient))
        group by item_id) as g
$$;
revoke all on function public.glowletter_gift_wall(uuid) from public, anon;
grant execute on function public.glowletter_gift_wall(uuid) to authenticated;

-- ——— «Дурак»: только для серверной функции durak ———
create or replace function public.glowletter_durak_identity(p_user uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'name', coalesce((select display_name from public.glowletter_profiles where user_id = p_user), ''),
    'banned', private.glowletter_is_banned(p_user),
    'back', coalesce((select card_back from public.glowletter_wallets where user_id = p_user), 'back_classic'),
    'cloth', coalesce((select cloth from public.glowletter_wallets where user_id = p_user), 'cloth_green'))
$$;
revoke all on function public.glowletter_durak_identity(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_durak_identity(uuid) to service_role;

-- Итог партии: место → монеты и статистика. Один раз на игрока за раунд.
create or replace function public.glowletter_durak_award(p_game uuid, p_round integer, p_user uuid, p_result text, p_amount integer)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  got integer;
begin
  if p_result not in ('win', 'escape', 'fool', 'draw') or p_amount not between 0 and 100 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if exists (select 1 from public.glowletter_coin_ledger where user_id = p_user and ref = 'durak:' || p_game || ':' || p_round) then return 0; end if;
  insert into public.glowletter_durak_stats (user_id) values (p_user) on conflict (user_id) do nothing;
  update public.glowletter_durak_stats
     set games = games + 1,
         wins = wins + (p_result = 'win')::integer,
         fools = fools + (p_result = 'fool')::integer,
         draws = draws + (p_result = 'draw')::integer,
         updated_at = now()
   where user_id = p_user;
  if private.glowletter_is_banned(p_user) then return 0; end if;
  got := private.glowletter_coins_add(p_user, p_amount, 'durak', 'durak:' || p_game || ':' || p_round, true);
  if got = 0 then
    insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref)
    values (p_user, 0, (select coins from public.glowletter_wallets where user_id = p_user), 'durak', 'durak:' || p_game || ':' || p_round)
    on conflict do nothing;
  end if;
  return got;
end;
$$;
revoke all on function public.glowletter_durak_award(uuid, integer, uuid, text, integer) from public, anon, authenticated;
grant execute on function public.glowletter_durak_award(uuid, integer, uuid, text, integer) to service_role;

-- Подсказка хода тратит одну подсказку из покупок (вызывает серверная функция durak).
create or replace function public.glowletter_durak_use_hint(p_user uuid)
returns boolean language plpgsql volatile security definer set search_path = ''
as $$
begin
  update public.glowletter_inventory set qty = qty - 1, updated_at = now() where user_id = p_user and item_id = 'hint' and qty > 0;
  return found;
end;
$$;
revoke all on function public.glowletter_durak_use_hint(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_durak_use_hint(uuid) to service_role;

-- Приглашение за стол «Дурака» — обычное сообщение [[durak:…]]; открытки-подарки шлёт только сервер.
create or replace function public.glowletter_messages_send(p_to uuid, p_body text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  body text := pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_body, ''), '[\u0001-\u0009\u000B-\u001F\u007F]', '', 'g'));
  sticker text;
  invite text[];
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_to is null or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if pg_catalog.char_length(body) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if body ~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
     or private.glowletter_notice_message_is_forbidden(body) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  if body ~ '^\[\[(photo|voice|gift):' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  sticker := (pg_catalog.regexp_match(body, '^\[\[sticker:(s[0-9]{2})\]\]'))[1];
  if sticker is not null and not private.glowletter_owns_item(me, 'sticker:' || sticker) then
    raise exception using errcode = '42501', message = 'locked';
  end if;
  invite := pg_catalog.regexp_match(body, '^\[\[(call|play|draw):([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\]$');
  if invite is not null then
    perform private.glowletter_room_admit(me, invite[2]::uuid, invite[1], p_to);
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '24 hours') >= 600 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_messages (sender, recipient, body) values (me, p_to, body) returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return message_id;
end;
$$;
