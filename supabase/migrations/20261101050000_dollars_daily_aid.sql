-- Помощь дня (владелец 01.11): раз в сутки игра даёт 2 000 $ бесплатно, если на счёте меньше 2 000 $.
-- Сутки — по UTC, как у награды дня. Повтор в тот же день не проходит: ref «aid$:<дата>» в журнале уникален.

alter table public.glowletter_coin_ledger drop constraint if exists glowletter_coin_ledger_reason_check;
alter table public.glowletter_coin_ledger add constraint glowletter_coin_ledger_reason_check
  check (reason in ('welcome', 'daily', 'aid', 'promo', 'shop', 'durak', 'admin', 'refund', 'purchase', 'exchange', 'transfer', 'bet', 'payout', 'quest', 'invite', 'insurance'));

create or replace function public.glowletter_dollars_aid()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  aid_ref text := 'aid$:' || today::text;
  have bigint;
  added integer := 0;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  perform private.glowletter_wallet_open(me);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':aid', 0));
  select dollars into have from public.glowletter_wallets where user_id = me for update;
  if have < 2000 and not exists (select 1 from public.glowletter_coin_ledger where user_id = me and ref = aid_ref) then
    perform private.glowletter_money_add(me, 'dollars', 2000, 'aid', aid_ref);
    added := 2000;
  end if;
  return pg_catalog.jsonb_build_object('dollars_added', added,
    'taken_today', exists (select 1 from public.glowletter_coin_ledger where user_id = me and glowletter_coin_ledger.ref = aid_ref),
    'dollars', (select dollars from public.glowletter_wallets where user_id = me));
end;
$$;

revoke all on function public.glowletter_dollars_aid() from public, anon;
grant execute on function public.glowletter_dollars_aid() to authenticated;
