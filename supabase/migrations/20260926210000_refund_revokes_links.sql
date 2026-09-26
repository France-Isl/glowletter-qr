-- Refunds switch the shared letters off. When Google reports a refund or a
-- voided purchase, the RTDN handler sets the entitlement state to 'revoked'
-- (normal expiry is 'expired' and keeps everything). From then on every QR
-- link the account created stops resolving: the recipient sees «письмо
-- недоступно», the sender sees the link as switched off in History. Applied
-- on 2026-09-26 at the owner's request («сделай всё что нужно», refund policy).

create or replace function private.glowletter_revoke_links_after_refund()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.state = 'revoked' and old.state is distinct from 'revoked' then
    update public.glowletter_qr_links
      set status = 'revoked', revoked_at = now()
      where user_id = new.user_id
        and status = 'active';
  end if;
  return new;
end;
$$;

revoke all on function private.glowletter_revoke_links_after_refund()
  from public, anon, authenticated;

drop trigger if exists glowletter_revoke_links_after_refund
  on private.glowletter_play_entitlements;
create trigger glowletter_revoke_links_after_refund
  after update of state on private.glowletter_play_entitlements
  for each row
  execute function private.glowletter_revoke_links_after_refund();
