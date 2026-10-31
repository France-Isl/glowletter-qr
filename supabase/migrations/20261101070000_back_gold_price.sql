-- Владелец 01.11: золотая рубашка карт стоит 1000 Светлячков вместо 300.
update public.glowletter_shop_items set price = 1000 where id = 'back_gold';
