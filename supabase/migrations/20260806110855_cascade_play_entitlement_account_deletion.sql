alter table private.glowletter_play_entitlements
  drop constraint if exists glowletter_play_entitlements_user_id_fkey;

alter table private.glowletter_play_entitlements
  add constraint glowletter_play_entitlements_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
