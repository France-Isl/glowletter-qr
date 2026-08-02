-- Qualify table columns that share names with the function's output columns.
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
  active_uploads integer;
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

  select count(*)
  into active_uploads
  from private.glowletter_audio_shares as audio_share
  where audio_share.owner_user_id = p_user_id
    and audio_share.status in ('pending', 'ready')
    and audio_share.expires_at > now();

  if uploads_last_hour >= 3 or uploads_last_day >= 10 or active_uploads >= 3 then
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
