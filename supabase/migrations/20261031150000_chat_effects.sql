-- Владелец 31.10: «больше таких разных идей в самом чате» — дождь по экрану, сообщение с эффектом,
-- сердечко двойным касанием. Новые служебные сообщения:
--   [[rain:<вид>]]          — дождь по экрану у друга (сердечки, лепестки, букеты, звёзды, конфетти, бабочки);
--   [[fx:<эффект>]]текст    — обычное сообщение с эффектом (hearts, glow, big);
--   [[like:<id>]] / [[unlike:<id>]] — сердечко на сообщении; как и реакции, не считаются непрочитанными.
-- Уведомления на телефоне показывают текст сообщения с эффектом и смайлики дождя, а сердечки пропускают.

create or replace function public.glowletter_friends_list()
returns table (user_id uuid, display_name text, status text, last_seen timestamptz, unread integer, last_message_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  perform private.glowletter_ensure_profile(me);
  update public.glowletter_profiles set last_seen = now() where glowletter_profiles.user_id = me;
  return query
  select other.id,
         p.display_name,
         case when f.status = 'accepted' then 'friend' when f.addressee = me then 'incoming' else 'outgoing' end,
         case when f.status = 'accepted' then p.last_seen end,
         (select count(*)::int from public.glowletter_messages as m where m.sender = other.id and m.recipient = me and m.read_at is null
            and m.body not like '[[react:%' and m.body not like '[[like:%' and m.body not like '[[unlike:%'),
         (select max(m.created_at) from public.glowletter_messages as m where (m.sender = other.id and m.recipient = me) or (m.sender = me and m.recipient = other.id))
  from public.glowletter_friendships as f
  cross join lateral (select case when f.requester = me then f.addressee else f.requester end as id) as other
  left join public.glowletter_profiles as p on p.user_id = other.id
  where me in (f.requester, f.addressee);
end;
$$;

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

notify pgrst, 'reload schema';
