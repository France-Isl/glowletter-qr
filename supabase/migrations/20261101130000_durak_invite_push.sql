-- Приглашение в «Дурака» и «Шашки» ([[durak:…]]) в уведомлении телефона — «Имя зовёт вас играть»,
-- а не пустая строка (владелец 31.10: «друг не получает уведомление, когда я его приглашаю»).
-- Подсказки были только для игр с ботами — ботов больше нет, товар скрыт из магазина.

create or replace function public.glowletter_push_poll(p_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  device public.glowletter_push_devices;
  since timestamptz;
  result jsonb;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  select * into device from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if device.last_poll is not null and device.last_poll > now() - interval '3 minutes' then
    return '{}'::jsonb;
  end if;
  since := device.cursor_at;
  select pg_catalog.jsonb_build_object(
    'messages', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('name', x.name, 'kind', x.kind, 'text', x.text) order by x.created_at)
      from (
        select m.created_at,
               coalesce(p.display_name, '') as name,
               case
                 when m.body like '[[voice:%' then 'voice'
                 when m.body like '[[bear:%' then 'bear'
                 when m.body like '[[draw:%' then 'draw'
                 when m.body like '[[game:%' then 'game'
                 when m.body like '[[play:%' then 'game'
                 when m.body like '[[durak:%' then 'game'
                 when m.body like '[[call:%' then 'call'
                 when m.body like '[[photo:%' then 'photo'
                 when m.body like '[[sticker:%' then 'sticker'
                 else 'text'
               end as kind,
               case
                 when m.body like '[[fx:%' then pg_catalog.left(pg_catalog.regexp_replace(m.body, '^\[\[fx:[a-z]+\]\]', ''), 100)
                 when m.body like '[[rain:%' then
                   case pg_catalog.substring(m.body, '^\[\[rain:([a-z]+)\]\]$')
                     when 'hearts' then '💕 💕 💕'
                     when 'petals' then '🌸 🌸 🌸'
                     when 'bouquets' then '💐 💐 💐'
                     when 'stars' then '✨ ✨ ✨'
                     when 'confetti' then '🎉 🎉 🎉'
                     when 'butterflies' then '🦋 🦋 🦋'
                     else ''
                   end
                 when m.body like '[[%' then ''
                 else pg_catalog.left(m.body, 100)
               end as text
        from public.glowletter_messages as m
        left join public.glowletter_profiles as p on p.user_id = m.sender
        where m.recipient = device.user_id and m.created_at > since and m.read_at is null
          and m.body not like '[[react:%' and m.body not like '[[like:%' and m.body not like '[[unlike:%'
          and private.glowletter_are_friends(m.sender, device.user_id)
          and not private.glowletter_is_blocked(m.sender, device.user_id)
        order by m.created_at desc
        limit 10
      ) as x
    ), '[]'::jsonb),
    'opened', (
      select count(*)::int from public.glowletter_qr_links as l
      where l.user_id = device.user_id and l.opened_at > since
    ),
    'replies', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('reaction', r.reaction, 'message', coalesce(r.message, '')) order by r.created_at)
      from (
        select * from public.glowletter_letter_replies as lr
        where lr.user_id = device.user_id and lr.created_at > since
        order by lr.created_at desc
        limit 5
      ) as r
    ), '[]'::jsonb),
    'photo', (
      select x.id from public.glowletter_photos as x
      where x.recipient = device.user_id and x.created_at > since
        and private.glowletter_are_friends(x.sender, device.user_id)
        and not private.glowletter_is_blocked(x.sender, device.user_id)
      order by x.created_at desc limit 1
    )
  ) into result;
  update public.glowletter_push_devices set cursor_at = now(), last_poll = now() where token_hash = device.token_hash;
  return result;
end;
$$;

update public.glowletter_shop_items set active = false where id = 'hint';
