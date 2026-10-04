-- Своё аудио в QR-письме (2.4.17). Файл отправителя привязывается к QR-ссылке
-- и остаётся доступным, пока ссылка активна, но не дольше 30 дней; обычная
-- персональная ссылка по-прежнему живёт 12 часов. Привязку меняет только
-- service_role через функцию shared-audio: клиент не может подставить чужой файл.

alter table private.glowletter_audio_shares
  drop constraint glowletter_audio_shares_check3;
alter table private.glowletter_audio_shares
  add constraint glowletter_audio_shares_expiry_ceiling
  check (expires_at <= created_at + interval '31 days');

alter table public.glowletter_qr_links
  add column audio_share_id uuid
    references private.glowletter_audio_shares(id) on delete set null;

create index glowletter_qr_links_audio_share_idx
  on public.glowletter_qr_links (audio_share_id)
  where audio_share_id is not null;

comment on column public.glowletter_qr_links.audio_share_id is
  'Audio attached to the QR letter; set only by service_role, cleared when the share is purged.';

-- Приложение читает ссылку целиком, но менять привязку аудио прямым запросом не может.
create or replace function public.glowletter_guard_qr_audio_share()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and (
    (tg_op = 'INSERT' and new.audio_share_id is not null)
    or (tg_op = 'UPDATE' and new.audio_share_id is distinct from old.audio_share_id)
  ) then
    raise exception 'audio_share_readonly' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.glowletter_guard_qr_audio_share()
  from public, anon, authenticated, service_role;

create trigger glowletter_qr_links_audio_guard
  before insert or update on public.glowletter_qr_links
  for each row execute function public.glowletter_guard_qr_audio_share();

-- Лимиты резервирования: порог «3 активных файла» заблокировал бы отправителя
-- на месяц, когда аудио живёт 30 дней. Теперь считаются незавершённые загрузки
-- (не больше 3) и готовые файлы (не больше 30); часовой и суточный лимиты прежние.
create or replace function public.glowletter_reserve_audio_share(
  p_user_id uuid,
  p_token_hash text,
  p_object_path text,
  p_mime_type text,
  p_size_bytes bigint
)
returns table (
  share_id uuid,
  upload_deadline timestamptz,
  expires_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  normalized_hash text := lower(btrim(coalesce(p_token_hash, '')));
  normalized_path text := lower(btrim(coalesce(p_object_path, '')));
  normalized_mime text := lower(btrim(coalesce(p_mime_type, '')));
  uploads_last_hour integer;
  uploads_last_day integer;
  pending_uploads integer;
  ready_shares integer;
begin
  if p_user_id is null then
    raise exception 'audio_account_required' using errcode = '22023';
  end if;
  if normalized_hash !~ '^[0-9a-f]{64}$'
     or normalized_path !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp3|m4a|aac|ogg|wav)$'
     or normalized_mime not in (
       'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac',
       'audio/ogg', 'audio/wav', 'audio/x-wav'
     )
     or p_size_bytes is null
     or p_size_bytes not between 1 and 12582912 then
    raise exception 'audio_metadata_invalid' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('glowletter-audio:' || p_user_id::text, 0)
  );

  select count(*) filter (
           where audio_share.created_at > now() - interval '1 hour'
         ),
         count(*)
  into uploads_last_hour, uploads_last_day
  from private.glowletter_audio_shares as audio_share
  where audio_share.owner_user_id = p_user_id
    and audio_share.created_at > now() - interval '1 day';

  select count(*) filter (
           where audio_share.status = 'pending'
             and audio_share.upload_deadline > now()
         ),
         count(*) filter (
           where audio_share.status = 'ready'
             and audio_share.expires_at > now()
         )
  into pending_uploads, ready_shares
  from private.glowletter_audio_shares as audio_share
  where audio_share.owner_user_id = p_user_id
    and audio_share.status in ('pending', 'ready');

  if uploads_last_hour >= 3 or uploads_last_day >= 10
     or pending_uploads >= 3 or ready_shares >= 30 then
    raise exception 'audio_rate_limited' using errcode = 'P0001';
  end if;

  return query
  insert into private.glowletter_audio_shares as audio_share (
    owner_user_id,
    token_hash,
    object_path,
    mime_type,
    size_bytes,
    upload_deadline,
    expires_at
  ) values (
    p_user_id,
    normalized_hash,
    normalized_path,
    normalized_mime,
    p_size_bytes,
    now() + interval '2 hours 5 minutes',
    now() + interval '11 hours 50 minutes'
  )
  returning audio_share.id, audio_share.upload_deadline, audio_share.expires_at;
end;
$$;

-- Файл, который больше не нужен ни одной QR-ссылке, уходит в очередь очистки.
create or replace function public.glowletter_release_qr_audio_share(
  p_share_id uuid,
  p_except_link_id uuid
)
returns void
language sql
volatile
security invoker
set search_path = ''
as $$
  update private.glowletter_audio_shares as audio_share
  set status = 'deleting',
      cleanup_claimed_at = null
  where audio_share.id = p_share_id
    and audio_share.status in ('pending', 'ready')
    and not exists (
      select 1
      from public.glowletter_qr_links as link
      where link.audio_share_id = p_share_id
        and link.id is distinct from p_except_link_id
    );
$$;

-- Привязка готового файла отправителя к его активной QR-ссылке. Срок файла
-- продлевается до 30 дней, но не дальше срока самой ссылки.
create or replace function public.glowletter_attach_qr_audio(
  p_user_id uuid,
  p_public_id uuid,
  p_token_hash text
)
returns table (expires_at timestamptz)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  share_row private.glowletter_audio_shares%rowtype;
  link_row public.glowletter_qr_links%rowtype;
  new_expiry timestamptz;
begin
  if p_user_id is null or p_public_id is null then
    raise exception 'invalid' using errcode = '22023';
  end if;

  select * into share_row
  from private.glowletter_audio_shares as audio_share
  where audio_share.token_hash = lower(btrim(coalesce(p_token_hash, '')))
    and audio_share.owner_user_id = p_user_id
    and audio_share.status = 'ready'
    and audio_share.expires_at > now()
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  select * into link_row
  from public.glowletter_qr_links as link
  where link.public_id = p_public_id
    and link.user_id = p_user_id
    and link.kind = 'letter'
    and link.status = 'active'
    and (link.expires_at is null or link.expires_at > now())
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  new_expiry := least(
    now() + interval '30 days',
    coalesce(link_row.expires_at, now() + interval '30 days'),
    share_row.created_at + interval '31 days'
  );
  if new_expiry > share_row.expires_at then
    update private.glowletter_audio_shares as audio_share
    set expires_at = new_expiry
    where audio_share.id = share_row.id;
  else
    new_expiry := share_row.expires_at;
  end if;

  if link_row.audio_share_id is distinct from share_row.id then
    update public.glowletter_qr_links as link
    set audio_share_id = share_row.id
    where link.id = link_row.id;
    if link_row.audio_share_id is not null then
      perform public.glowletter_release_qr_audio_share(link_row.audio_share_id, link_row.id);
    end if;
  end if;

  return query select new_expiry;
end;
$$;

create or replace function public.glowletter_detach_qr_audio(
  p_user_id uuid,
  p_public_id uuid
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  link_row public.glowletter_qr_links%rowtype;
begin
  if p_user_id is null or p_public_id is null then
    return false;
  end if;
  select * into link_row
  from public.glowletter_qr_links as link
  where link.public_id = p_public_id
    and link.user_id = p_user_id
  for update;
  if not found or link_row.audio_share_id is null then
    return false;
  end if;
  update public.glowletter_qr_links as link
  set audio_share_id = null
  where link.id = link_row.id;
  perform public.glowletter_release_qr_audio_share(link_row.audio_share_id, link_row.id);
  return true;
end;
$$;

-- Для resolve-letter: файл отдаётся только у живой, открытой ссылки.
create or replace function public.glowletter_qr_link_audio(p_public_id uuid)
returns table (
  object_path text,
  mime_type text,
  expires_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select audio_share.object_path,
         audio_share.mime_type,
         least(audio_share.expires_at, coalesce(link.expires_at, audio_share.expires_at))
  from public.glowletter_qr_links as link
  join private.glowletter_audio_shares as audio_share
    on audio_share.id = link.audio_share_id
  where link.public_id = p_public_id
    and link.kind = 'letter'
    and link.status = 'active'
    and (link.expires_at is null or link.expires_at > now())
    and (link.unlock_at is null or link.unlock_at <= now())
    and audio_share.status = 'ready'
    and audio_share.expires_at > now()
  limit 1;
$$;

revoke all on function public.glowletter_release_qr_audio_share(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.glowletter_attach_qr_audio(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.glowletter_detach_qr_audio(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.glowletter_qr_link_audio(uuid)
  from public, anon, authenticated;

grant execute on function public.glowletter_release_qr_audio_share(uuid, uuid)
  to service_role;
grant execute on function public.glowletter_attach_qr_audio(uuid, uuid, text)
  to service_role;
grant execute on function public.glowletter_detach_qr_audio(uuid, uuid)
  to service_role;
grant execute on function public.glowletter_qr_link_audio(uuid)
  to service_role;

notify pgrst, 'reload schema';
