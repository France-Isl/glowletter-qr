-- Владелец 31.10: «фотки должны храниться максимум 6 часов».
-- Фото на экран друга живут не больше 6 часов: их не отдают позже, а планировщик
-- каждые 15 минут удаляет просроченные. Виджет на телефоне сам очищается, когда
-- сервер перестаёт отдавать фото.

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

create or replace function public.glowletter_photo_get(p_id uuid)
returns table (mime_type text, frame text, image text)
language plpgsql stable security definer set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  return query
  select ph.mime_type, ph.frame, pg_catalog.translate(pg_catalog.encode(ph.image, 'base64'), E'\n', '')
  from public.glowletter_photos as ph
  where ph.id = p_id and me in (ph.sender, ph.recipient) and ph.created_at >= now() - interval '6 hours'
    and not private.glowletter_is_blocked(ph.sender, ph.recipient);
end;
$$;

create or replace function public.glowletter_widget_photo(p_token text, p_since uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  device public.glowletter_push_devices;
  ph record;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then raise exception using errcode = '22023', message = 'invalid'; end if;
  select * into device from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex');
  if not found then raise exception using errcode = 'P0002', message = 'not_found'; end if;
  select x.id, x.mime_type, x.frame, x.image, x.created_at, coalesce(p.display_name, '') as name into ph
  from public.glowletter_photos as x
  left join public.glowletter_profiles as p on p.user_id = x.sender
  where x.recipient = device.user_id and x.created_at >= now() - interval '6 hours'
    and private.glowletter_are_friends(x.sender, x.recipient) and not private.glowletter_is_blocked(x.sender, x.recipient)
  order by x.created_at desc limit 1;
  if not found then return '{}'::jsonb; end if;
  if ph.id = p_since then return pg_catalog.jsonb_build_object('id', ph.id, 'same', true); end if;
  return pg_catalog.jsonb_build_object('id', ph.id, 'name', ph.name, 'mime', ph.mime_type, 'frame', ph.frame,
    'image', pg_catalog.translate(pg_catalog.encode(ph.image, 'base64'), E'\n', ''));
end;
$$;

comment on table public.glowletter_photos is 'Photos for the friend''s chat and home-screen widget, kept at most 6 hours (purged every 15 minutes). Read only by sender, recipient or the recipient''s device key.';

delete from public.glowletter_photos where created_at < now() - interval '6 hours';

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-photos'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
  perform cron.schedule(
    'glowletter-purge-photos',
    '*/15 * * * *',
    $command$delete from public.glowletter_photos where created_at < now() - interval '6 hours'$command$
  );
end
$migration$;

notify pgrst, 'reload schema';
