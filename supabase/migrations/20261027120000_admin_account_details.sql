-- Карточка аккаунта в админ-панели (2.4.20): всё об одном аккаунте одним
-- вызовом — доступ (VIP, без срока, подписка Google Play и до какого числа),
-- e-mail, даты создания и входа, язык, сколько писем, QR-ссылок и ответов,
-- последние действия с VIP. Только для админа; токены покупок не отдаются.
create or replace function private.glowletter_admin_account_details(p_support_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  account public.glowletter_accounts%rowtype;
  result jsonb;
begin
  if (select auth.uid()) is null or not private.glowletter_is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select * into account
  from public.glowletter_accounts as candidate
  where candidate.support_id = pg_catalog.upper(pg_catalog.btrim(coalesce(p_support_id, '')));
  if not found then
    return null;
  end if;

  select pg_catalog.jsonb_build_object(
    'support_id', account.support_id,
    'is_admin', account.is_admin,
    'premium_forever', account.premium_forever,
    'vip_until', account.vip_until,
    'premium_active', account.premium_forever or coalesce(account.vip_until > now(), false),
    'created_at', account.created_at,
    'email', users.email,
    'provider', users.raw_app_meta_data ->> 'provider',
    'last_sign_in_at', users.last_sign_in_at,
    'language', progress.language,
    'sender_name', progress.sender_name,
    'recipient_name', progress.recipient_name,
    'current_letter_id', progress.current_letter_id,
    'progress_updated_at', progress.updated_at,
    'letters', (select pg_catalog.count(*) from public.glowletter_letters as letter where letter.user_id = account.user_id),
    'qr_links', (select pg_catalog.count(*) from public.glowletter_qr_links as link where link.user_id = account.user_id and link.status = 'active'),
    'replies', (select pg_catalog.count(*) from public.glowletter_letter_replies as reply where reply.user_id = account.user_id),
    'play', (
      select pg_catalog.jsonb_build_object(
        'product_id', entitlement.product_id,
        'base_plan_id', entitlement.base_plan_id,
        'state', entitlement.state,
        'subscription_state', entitlement.subscription_state,
        'expiry_time', entitlement.expiry_time,
        'auto_renew', entitlement.auto_renew_enabled,
        'test', entitlement.is_test_purchase,
        'purchase_time', entitlement.purchase_time
      )
      from private.glowletter_play_entitlements as entitlement
      where entitlement.user_id = account.user_id
      order by entitlement.expiry_time desc nulls last, entitlement.updated_at desc
      limit 1
    ),
    'audit', coalesce((
      select pg_catalog.jsonb_agg(item order by item.created_at desc)
      from (
        select audit.action, audit.granted_days, audit.new_vip_until, audit.created_at
        from private.glowletter_vip_audit as audit
        where audit.target_user_id = account.user_id
        order by audit.created_at desc
        limit 5
      ) as item
    ), '[]'::jsonb)
  )
  into result
  from auth.users as users
  left join public.glowletter_progress as progress on progress.user_id = users.id
  where users.id = account.user_id;

  return result;
end;
$$;

revoke all on function private.glowletter_admin_account_details(text) from public, anon, authenticated;
grant execute on function private.glowletter_admin_account_details(text) to authenticated;

create or replace function public.glowletter_admin_account_details(p_support_id text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select private.glowletter_admin_account_details(p_support_id);
$$;

revoke all on function public.glowletter_admin_account_details(text) from public, anon;
grant execute on function public.glowletter_admin_account_details(text) to authenticated;

notify pgrst, 'reload schema';
