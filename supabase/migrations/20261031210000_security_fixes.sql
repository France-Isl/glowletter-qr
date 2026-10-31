-- Исправления после проверки безопасности (31.10).
-- 1) Опыт: только с другом старше суток, не со свежим аккаунтом (< 3 дней),
--    не больше 5 разных напарников в день; партия засчитывается, когда итог
--    подтвердили оба игрока.
-- 2) Платные стихи из коллекции отдаются только тем, у кого есть доступ.
-- 3) QR-ссылки меняются только через функции (возврат денег нельзя обойти).
-- 4) Наклейки и рамки — только из своей коллекции; заблокированный не пишет.

create or replace function private.glowletter_award(p_me uuid, p_friend uuid, p_source text, p_points integer)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare
  pa uuid := least(p_me, p_friend);
  pb uuid := greatest(p_me, p_friend);
  cap integer := case p_source when 'game' then 120 when 'streak' then 10 when 'pet' then 30 when 'word' then 12 else 0 end;
  day_start timestamptz := private.glowletter_today()::timestamp at time zone 'UTC';
  used integer;
  mine integer;
  partners integer;
  give integer;
begin
  if p_me is null or p_friend is null or coalesce(p_points, 0) <= 0 or private.glowletter_is_banned(p_me) then return 0; end if;
  -- Дружба младше суток и аккаунт друга младше 3 дней опыта не дают.
  if coalesce((select coalesce(f.responded_at, f.created_at) from public.glowletter_friendships as f
               where f.status = 'accepted' and least(f.requester, f.addressee) = pa and greatest(f.requester, f.addressee) = pb
               order by f.created_at limit 1), now()) > now() - interval '24 hours' then return 0; end if;
  if coalesce((select u.created_at from auth.users as u where u.id = p_friend), now()) > now() - interval '3 days' then return 0; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(pa::text || pb::text || ':points', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_me::text || ':points-day', 0));
  select count(distinct case when user_id = a then b else a end) into partners from public.glowletter_points
  where user_id = p_me and created_at >= day_start and not (a = pa and b = pb);
  if partners >= 5 then return 0; end if;
  select coalesce(sum(points), 0) into used from public.glowletter_points
  where a = pa and b = pb and source = p_source and created_at >= day_start;
  select coalesce(sum(points), 0) into mine from public.glowletter_points
  where user_id = p_me and created_at >= day_start;
  give := least(p_points, cap - used, 300 - mine);
  if give <= 0 then return 0; end if;
  insert into public.glowletter_points (a, b, user_id, source, points) values (pa, pb, p_me, p_source, give);
  return give;
end;
$$;

-- Партия засчитывается, когда второй игрок прислал совпадающий итог той же комнаты.
create or replace function public.glowletter_play_record(p_friend uuid, p_game text, p_room uuid, p_result text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  gained integer := 0;
  other_result text;
  matches boolean;
  points_for constant jsonb := '{"win": 10, "draw": 6, "done": 6, "loss": 4}';
begin
  perform private.glowletter_require_friend(me, p_friend);
  if p_room is null or p_game not in ('lost', 'explain', 'sketch', 'sea', 'four', 'checkers', 'talk')
     or p_result not in ('win', 'loss', 'draw', 'done') then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if not private.glowletter_pair_paid(me, p_friend) then
    raise exception using errcode = '42501', message = 'premium_required';
  end if;
  if (select count(*) from public.glowletter_play_results where user_id = me and created_at >= now() - interval '1 hour') >= 40 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room::text || ':play', 0));
  insert into public.glowletter_play_results (room, user_id, friend_id, game, result)
  values (p_room, me, p_friend, p_game, p_result) on conflict do nothing;
  if found then
    select r.result into other_result from public.glowletter_play_results as r
    where r.room = p_room and r.user_id = p_friend and r.friend_id = me and r.game = p_game
      and r.created_at > now() - interval '3 hours';
    if other_result is not null then
      matches := (p_result, other_result) in (('win', 'loss'), ('loss', 'win'), ('draw', 'draw'), ('done', 'done'));
      if matches then
        gained := private.glowletter_award(me, p_friend, 'game', (points_for ->> p_result)::integer);
        perform private.glowletter_award(p_friend, me, 'game', (points_for ->> other_result)::integer);
      end if;
    end if;
  end if;
  perform private.glowletter_touch_day(me, p_friend);
  return pg_catalog.jsonb_build_object('points', gained, 'waiting', other_result is null);
end;
$$;

-- Платные стихи: без доступа приходит только начало (48 знаков) для витрины.
create or replace function public.glowletter_catalog_letters()
returns table(id bigint, category text, texts jsonb, author text, is_free boolean, published_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select l.id, l.category,
         case when l.is_free or private.glowletter_has_paid_access((select auth.uid())) then l.texts
              else coalesce((select pg_catalog.jsonb_object_agg(t.key, pg_catalog.left(t.value, 48) || '…')
                             from pg_catalog.jsonb_each_text(l.texts) as t), '{}'::jsonb) end,
         l.author, l.is_free, l.published_at, l.updated_at
  from public.glowletter_catalog_letters as l
  where l.status = 'published'
  order by l.id
  limit 500;
$$;

-- QR-ссылки: только через glowletter_create_qr_link / glowletter_revoke_qr_link.
revoke insert, update on public.glowletter_qr_links from authenticated, anon;

create or replace function private.glowletter_guard_qr_revival()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if old.status = 'revoked' and new.status is distinct from 'revoked' and current_user in ('anon', 'authenticated') then
    raise exception using errcode = '42501', message = 'revoked';
  end if;
  return new;
end;
$$;
drop trigger if exists glowletter_qr_links_no_revival on public.glowletter_qr_links;
create trigger glowletter_qr_links_no_revival before update on public.glowletter_qr_links
for each row execute function private.glowletter_guard_qr_revival();

-- Наклейки и рамки: только открытые в сундуке или выданные админом.
create or replace function private.glowletter_owns_item(p_user uuid, p_item text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.glowletter_chests where user_id = p_user and reward = p_item)
      or exists (select 1 from public.glowletter_unlocks where user_id = p_user and item = p_item)
$$;
revoke all on function private.glowletter_owns_item(uuid, text) from public, anon, authenticated;

create or replace function public.glowletter_messages_send(p_to uuid, p_body text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  body text := pg_catalog.btrim(pg_catalog.regexp_replace(coalesce(p_body, ''), '[\u0001-\u0009\u000B-\u001F\u007F]', '', 'g'));
  sticker text;
  message_id uuid;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if private.glowletter_is_banned(me) then raise exception using errcode = '42501', message = 'account_blocked'; end if;
  if p_to is null or not private.glowletter_are_friends(me, p_to) or private.glowletter_is_blocked(me, p_to) then
    raise exception using errcode = '42501', message = 'not_friends';
  end if;
  if pg_catalog.char_length(body) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  if body ~* '(https?://|www\.|[a-z0-9-]+\.(com|ru|net|org|io|me|ly|xyz|link|click)(/|\s|$))'
     or private.glowletter_notice_message_is_forbidden(body) then
    raise exception using errcode = '22023', message = 'forbidden';
  end if;
  if body ~ '^\[\[(photo|voice):' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  sticker := (pg_catalog.regexp_match(body, '^\[\[sticker:(s[0-9]{2})\]\]'))[1];
  if sticker is not null and not private.glowletter_owns_item(me, 'sticker:' || sticker) then
    raise exception using errcode = '42501', message = 'locked';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(me::text || ':dm', 0));
  if (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '1 minute') >= 20
     or (select count(*) from public.glowletter_messages as m where m.sender = me and m.created_at >= now() - interval '24 hours') >= 600 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;
  insert into public.glowletter_messages (sender, recipient, body) values (me, p_to, body) returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  return message_id;
end;
$$;

create or replace function public.glowletter_photo_send(p_to uuid, p_mime text, p_image text, p_frame text)
returns uuid language plpgsql security definer set search_path = ''
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
  if p_frame is not null and not private.glowletter_owns_item(me, 'frame:' || p_frame) then
    raise exception using errcode = '42501', message = 'locked';
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
  delete from public.glowletter_photos where created_at < now() - interval '6 hours';
  insert into public.glowletter_photos (sender, recipient, mime_type, frame, image)
  values (me, p_to, p_mime, p_frame, data) returning id into photo_id;
  insert into public.glowletter_messages (sender, recipient, body)
  values (me, p_to, '[[photo:' || photo_id::text || ']]') returning id into message_id;
  update public.glowletter_profiles set last_seen = now() where user_id = me;
  perform private.glowletter_touch_day(me, p_to);
  return message_id;
end;
$$;
