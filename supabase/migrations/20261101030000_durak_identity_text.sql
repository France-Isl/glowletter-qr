-- «Дурак»: сервер видит доллары игрока (проверка ставки при входе) и проверяет текст чата за столом.
create or replace function public.glowletter_durak_identity(p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform private.glowletter_wallet_open(p_user);
  return (select pg_catalog.jsonb_build_object(
    'name', coalesce((select display_name from public.glowletter_profiles where user_id = p_user), ''),
    'banned', private.glowletter_is_banned(p_user),
    'dollars', w.dollars, 'back', w.card_back, 'cloth', w.cloth)
    from public.glowletter_wallets as w where w.user_id = p_user);
end;
$$;
revoke all on function public.glowletter_durak_identity(uuid) from public, anon, authenticated;
grant execute on function public.glowletter_durak_identity(uuid) to service_role;

create or replace function public.glowletter_durak_text_ok(p_text text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select pg_catalog.char_length(coalesce(p_text, '')) between 1 and 120
     and p_text !~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
     and not private.glowletter_notice_message_is_forbidden(p_text)
$$;
revoke all on function public.glowletter_durak_text_ok(text) from public, anon, authenticated;
grant execute on function public.glowletter_durak_text_ok(text) to service_role;
