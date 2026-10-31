-- Игры с ботами ничего не дают (владелец 31.10: «с ботами вообще ничего не должно засчитываться,
-- рейтинг; с ботами нельзя делать ставку и зарабатывать на ботах»). Сервер игры ставит ставку 0,
-- если за столом есть бот, а выплата за такую партию только возвращает уже снятую ставку и не
-- трогает статистику (рейтинг, серии, «был дураком»).

create or replace function public.glowletter_durak_settle(p_game uuid, p_round integer, p_user uuid, p_result text, p_stake bigint, p_payout bigint, p_with_bots boolean)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  pay_ref text := 'payout:' || p_game || ':' || p_round;
  net bigint := p_payout - p_stake;
  paid bigint := p_payout;
  insured boolean := false;
  boosted boolean;
  week date := date_trunc('week', now())::date;
begin
  if p_result not in ('win', 'escape', 'fool', 'loss', 'draw') or p_payout < 0 then raise exception using errcode = '22023', message = 'invalid'; end if;
  perform private.glowletter_wallet_open(p_user);
  if exists (select 1 from public.glowletter_coin_ledger where user_id = p_user and ref = pay_ref) then return pg_catalog.jsonb_build_object('paid', 0, 'repeat', true); end if;
  -- С ботами ничего не засчитывается (владелец 31.10): ни выигрыш, ни рейтинг, ни серия.
  -- Ставка, снятая в партии, начатой до этого правила, просто возвращается.
  if p_with_bots then
    if p_stake > 0 then perform private.glowletter_money_add(p_user, 'dollars', p_stake, 'payout', pay_ref);
    else insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency)
         values (p_user, 0, (select dollars from public.glowletter_wallets where user_id = p_user), 'payout', pay_ref, 'dollars') on conflict do nothing; end if;
    return pg_catalog.jsonb_build_object('paid', greatest(p_stake, 0), 'net', 0, 'insured', false, 'boosted', false, 'bots', true);
  end if;
  boosted := coalesce((select boost_until > now() from public.glowletter_wallets where user_id = p_user), false);
  if boosted and net > 0 then paid := paid + net; net := net * 2; end if;
  if p_result in ('fool', 'loss') and p_stake > 0 and (select insurance from public.glowletter_wallets where user_id = p_user) > 0 then
    update public.glowletter_wallets set insurance = insurance - 1 where user_id = p_user;
    paid := paid + p_stake / 2;
    net := net + p_stake / 2;
    insured := true;
  end if;
  if paid > 0 then perform private.glowletter_money_add(p_user, 'dollars', paid, 'payout', pay_ref);
  else insert into public.glowletter_coin_ledger (user_id, delta, balance, reason, ref, currency)
       values (p_user, 0, (select dollars from public.glowletter_wallets where user_id = p_user), 'payout', pay_ref, 'dollars') on conflict do nothing; end if;
  insert into public.glowletter_durak_stats (user_id) values (p_user) on conflict (user_id) do nothing;
  update public.glowletter_durak_stats as s set
    games = s.games + 1,
    wins = s.wins + (p_result = 'win')::integer,
    fools = s.fools + (p_result = 'fool')::integer,
    draws = s.draws + (p_result = 'draw')::integer,
    streak = case when p_result = 'win' then s.streak + 1 when p_result in ('fool', 'loss') then 0 else s.streak end,
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
