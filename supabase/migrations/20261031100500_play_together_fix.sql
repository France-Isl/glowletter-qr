-- Правки после проверки play_together:
-- 1) огонёк: если оба друга впервые за день отметились одновременно, второй
--    вставлял строку через on conflict и очки за день не начислялись — теперь
--    отметки пары за день идут по очереди (advisory lock);
-- 2) фото меньше 500 байт — ошибка «invalid», а не «too_large»;
-- 3) push_poll: фото только от друзей и не от заблокированных (как сообщения и виджет);
-- 4) сундук: два одновременных открытия больше не падают на первичном ключе.

create or replace function private.glowletter_touch_day(p_me uuid, p_friend uuid)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare
  pa uuid := least(p_me, p_friend);
  pb uuid := greatest(p_me, p_friend);
  d date := private.glowletter_today();
  row_before public.glowletter_pair_days;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(pa::text || pb::text || ':day', 0));
  select * into row_before from public.glowletter_pair_days where a = pa and b = pb and day = d for update;
  if not found then
    insert into public.glowletter_pair_days (a, b, day, a_seen, b_seen) values (pa, pb, d, p_me = pa, p_me = pb);
    return;
  end if;
  if (p_me = pa and row_before.a_seen) or (p_me = pb and row_before.b_seen) then return; end if;
  update public.glowletter_pair_days set a_seen = a_seen or p_me = pa, b_seen = b_seen or p_me = pb
  where a = pa and b = pb and day = d;
  -- Второй из пары отметился сегодня — день засчитан.
  if (p_me = pa and row_before.b_seen) or (p_me = pb and row_before.a_seen) then
    perform private.glowletter_award(p_me, p_friend, 'streak', 10);
  end if;
end;
$$;

create or replace function public.glowletter_photo_send(p_to uuid, p_mime text, p_image text, p_frame text)
returns uuid language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  data bytea;
  photo_id uuid;
  message_id uuid;
begin
  perform private.glowletter_require_friend(me, p_to);
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  if coalesce(p_mime, '') not in ('image/jpeg', 'image/webp', 'image/png') or (p_frame is not null and p_frame !~ '^f0[1-8]$') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  begin
    data := pg_catalog.decode(coalesce(p_image, ''), 'base64');
  exception when others then
    raise exception using errcode = '22023', message = 'invalid';
  end;
  if pg_catalog.octet_length(data) < 500 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if pg_catalog.octet_length(data) > 450000 then
    raise exception using errcode = '22023', message = 'too_large';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_photos where sender = me and created_at >= now() - interval '24 hours') >= 40
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  delete from public.glowletter_photos where created_at < now() - interval '30 days';
  insert into public.glowletter_photos (sender, recipient, mime_type, frame, image)
  values (me, p_to, p_mime, p_frame, data) returning id into photo_id;
  insert into public.glowletter_messages (sender, recipient, body)
  values (me, p_to, '[[photo:' || photo_id::text || ']]') returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  perform private.glowletter_touch_day(me, p_to);
  return message_id;
end;
$$;

create or replace function public.glowletter_chest_open()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  d date := private.glowletter_today();
  pick text;
  existing text;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if not private.glowletter_has_paid_access(me) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  select reward into existing from public.glowletter_chests where user_id = me and day = d;
  if found then
    return pg_catalog.jsonb_build_object('reward', existing, 'opened', true);
  end if;
  -- Сначала то, чего ещё нет в коллекции; когда собрано всё — что угодно.
  select r into pick from (
    select 'sticker:s' || pg_catalog.lpad(n::text, 2, '0') as r from pg_catalog.generate_series(1, 20) as n
    union all
    select 'frame:f0' || n::text from pg_catalog.generate_series(1, 8) as n
  ) as all_rewards
  where r not in (select reward from public.glowletter_chests where user_id = me)
  order by pg_catalog.random() limit 1;
  if pick is null then
    pick := case when pg_catalog.random() < 0.7 then 'sticker:s' || pg_catalog.lpad((1 + pg_catalog.floor(pg_catalog.random() * 20))::int::text, 2, '0')
                 else 'frame:f0' || (1 + pg_catalog.floor(pg_catalog.random() * 8))::int::text end;
  end if;
  insert into public.glowletter_chests (user_id, day, reward) values (me, d, pick) on conflict (user_id, day) do nothing;
  if not found then
    -- Сундук уже открыли в соседнем запросе — отдаём то, что выпало там.
    select reward into existing from public.glowletter_chests where user_id = me and day = d;
    return pg_catalog.jsonb_build_object('reward', existing, 'opened', true);
  end if;
  return pg_catalog.jsonb_build_object('reward', pick, 'opened', false);
end;
$$;

create or replace function public.glowletter_push_poll(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
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
               case when m.body like '[[%' then '' else pg_catalog.left(m.body, 100) end as text
        from public.glowletter_messages as m
        left join public.glowletter_profiles as p on p.user_id = m.sender
        where m.recipient = device.user_id and m.created_at > since and m.read_at is null
          and m.body not like '[[react:%'
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
