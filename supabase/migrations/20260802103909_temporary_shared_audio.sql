-- Temporary private audio attached to a shared GlowLetter link.
-- Raw bearer tokens and original filenames are never stored. Access expires
-- before twelve hours and objects are removed through the Storage API.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table private.glowletter_audio_shares (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  token_hash text not null unique
    check (token_hash ~ '^[0-9a-f]{64}$'),
  object_path text not null unique
    check (object_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp3|m4a|aac|ogg|wav)$'),
  mime_type text not null
    check (mime_type in (
      'audio/mpeg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/aac',
      'audio/ogg',
      'audio/wav',
      'audio/x-wav'
    )),
  size_bytes bigint not null
    check (size_bytes between 1 and 12582912),
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'deleting', 'deleted')),
  upload_deadline timestamptz not null,
  expires_at timestamptz not null,
  ready_at timestamptz,
  cleanup_claimed_at timestamptz,
  cleanup_attempts smallint not null default 0
    check (cleanup_attempts between 0 and 100),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check (upload_deadline > created_at),
  -- Supabase signed upload URLs are valid for two hours. Keep the pending row
  -- and its cleanup tombstone alive beyond that window so a late upload can
  -- never recreate an already-forgotten object.
  check (upload_deadline <= created_at + interval '2 hours 10 minutes'),
  check (expires_at > created_at),
  check (expires_at <= created_at + interval '12 hours'),
  check ((status = 'ready') = (ready_at is not null) or status in ('deleting', 'deleted')),
  check ((status = 'deleted') = (deleted_at is not null))
);

comment on table private.glowletter_audio_shares is
  'Private metadata for user audio shared by an opaque token; access and storage are temporary.';
comment on column private.glowletter_audio_shares.token_hash is
  'SHA-256 of the bearer token. The raw token exists only on sender/recipient devices.';

create index glowletter_audio_shares_owner_active_idx
  on private.glowletter_audio_shares (owner_user_id, expires_at)
  where status in ('pending', 'ready');
create index glowletter_audio_shares_cleanup_idx
  on private.glowletter_audio_shares (status, expires_at, upload_deadline, cleanup_claimed_at);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'glowletter-shared-audio',
  'glowletter-shared-audio',
  false,
  12582912,
  array[
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table private.glowletter_audio_shares enable row level security;
revoke all on table private.glowletter_audio_shares from public, anon, authenticated;
grant select, insert, update, delete on table private.glowletter_audio_shares to service_role;

create policy "Temporary audio is never available to app clients"
  on private.glowletter_audio_shares
  for all
  to authenticated
  using (false)
  with check (false);

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
  if p_user_id is null
     or not exists (select 1 from auth.users where id = p_user_id) then
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

  select count(*) filter (where created_at > now() - interval '1 hour'),
         count(*)
  into uploads_last_hour, uploads_last_day
  from private.glowletter_audio_shares
  where owner_user_id = p_user_id
    and created_at > now() - interval '1 day';

  select count(*)
  into active_uploads
  from private.glowletter_audio_shares
  where owner_user_id = p_user_id
    and status in ('pending', 'ready')
    and expires_at > now();

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
    -- The cleanup job runs every five minutes. Expiring ten minutes early
    -- keeps the physical object within the promised twelve-hour ceiling.
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

create or replace function public.glowletter_audio_share_for_finalize(
  p_user_id uuid,
  p_token_hash text
)
returns table (
  share_id uuid,
  object_path text,
  mime_type text,
  size_bytes bigint,
  upload_deadline timestamptz,
  expires_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select audio_share.id,
         audio_share.object_path,
         audio_share.mime_type,
         audio_share.size_bytes,
         audio_share.upload_deadline,
         audio_share.expires_at
  from private.glowletter_audio_shares as audio_share
  where audio_share.owner_user_id = p_user_id
    and audio_share.token_hash = lower(btrim(coalesce(p_token_hash, '')))
    and audio_share.status = 'pending'
    and audio_share.upload_deadline > now()
    and audio_share.expires_at > now();
$$;

create or replace function public.glowletter_mark_audio_share_ready(
  p_user_id uuid,
  p_share_id uuid
)
returns table (expires_at timestamptz)
language sql
volatile
security invoker
set search_path = ''
as $$
  update private.glowletter_audio_shares as audio_share
  set status = 'ready',
      ready_at = now()
  where audio_share.id = p_share_id
    and audio_share.owner_user_id = p_user_id
    and audio_share.status = 'pending'
    and audio_share.upload_deadline > now()
    and audio_share.expires_at > now()
  returning audio_share.expires_at;
$$;

create or replace function public.glowletter_abort_audio_share(
  p_user_id uuid,
  p_share_id uuid
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
    and audio_share.owner_user_id = p_user_id
    and audio_share.status in ('pending', 'ready');
$$;

create or replace function public.glowletter_resolve_audio_share(p_token_hash text)
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
         audio_share.expires_at
  from private.glowletter_audio_shares as audio_share
  where audio_share.token_hash = lower(btrim(coalesce(p_token_hash, '')))
    and audio_share.status = 'ready'
    and audio_share.expires_at > now();
$$;

create or replace function public.glowletter_claim_audio_cleanup(p_limit integer default 40)
returns table (
  share_id uuid,
  object_path text
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  delete from private.glowletter_audio_shares
  where status = 'deleted'
    and deleted_at < now() - interval '1 day';

  return query
  with candidates as (
    select audio_share.id
    from private.glowletter_audio_shares as audio_share
    where (
      (audio_share.status = 'pending' and audio_share.upload_deadline <= now())
      or (audio_share.status = 'ready' and audio_share.expires_at <= now())
      or (
        audio_share.status = 'deleting'
        and (
          audio_share.cleanup_claimed_at is null
          or audio_share.cleanup_claimed_at <= now() - interval '5 minutes'
        )
      )
    )
    order by least(audio_share.expires_at, audio_share.upload_deadline)
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 40), 100))
  )
  update private.glowletter_audio_shares as audio_share
  set status = 'deleting',
      cleanup_claimed_at = now(),
      cleanup_attempts = least(audio_share.cleanup_attempts + 1, 100)
  from candidates
  where audio_share.id = candidates.id
  returning audio_share.id, audio_share.object_path;
end;
$$;

create or replace function public.glowletter_finish_audio_cleanup(
  p_share_id uuid,
  p_deleted boolean
)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  if p_share_id is null or p_deleted is null then
    raise exception 'audio_cleanup_invalid' using errcode = '22023';
  end if;

  update private.glowletter_audio_shares
  set status = case when p_deleted then 'deleted' else 'deleting' end,
      deleted_at = case when p_deleted then now() else null end,
      cleanup_claimed_at = now()
  where id = p_share_id
    and status = 'deleting';
end;
$$;

revoke all on function public.glowletter_reserve_audio_share(uuid, text, text, text, bigint)
  from public, anon, authenticated;
revoke all on function public.glowletter_audio_share_for_finalize(uuid, text)
  from public, anon, authenticated;
revoke all on function public.glowletter_mark_audio_share_ready(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.glowletter_abort_audio_share(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.glowletter_resolve_audio_share(text)
  from public, anon, authenticated;
revoke all on function public.glowletter_claim_audio_cleanup(integer)
  from public, anon, authenticated;
revoke all on function public.glowletter_finish_audio_cleanup(uuid, boolean)
  from public, anon, authenticated;

grant execute on function public.glowletter_reserve_audio_share(uuid, text, text, text, bigint)
  to service_role;
grant execute on function public.glowletter_audio_share_for_finalize(uuid, text)
  to service_role;
grant execute on function public.glowletter_mark_audio_share_ready(uuid, uuid)
  to service_role;
grant execute on function public.glowletter_abort_audio_share(uuid, uuid)
  to service_role;
grant execute on function public.glowletter_resolve_audio_share(text)
  to service_role;
grant execute on function public.glowletter_claim_audio_cleanup(integer)
  to service_role;
grant execute on function public.glowletter_finish_audio_cleanup(uuid, boolean)
  to service_role;

create extension if not exists pg_net with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.glowletter_validate_cleanup_secret(p_secret_hash text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'glowletter_cleanup_secret'
      and pg_catalog.encode(
        extensions.digest(decrypted_secret, 'sha256'),
        'hex'
      ) = lower(btrim(coalesce(p_secret_hash, '')))
  );
$$;

revoke all on function public.glowletter_validate_cleanup_secret(text)
  from public, anon, authenticated;
grant execute on function public.glowletter_validate_cleanup_secret(text)
  to service_role;

do $vault$
declare
  project_url_secret_id uuid;
  cleanup_secret_id uuid;
begin
  select id into project_url_secret_id
  from vault.secrets
  where name = 'glowletter_project_url';

  if project_url_secret_id is null then
    perform vault.create_secret(
      'https://xzzngrquomyiglktroqi.supabase.co',
      'glowletter_project_url',
      'GlowLetter scheduled Edge Function base URL'
    );
  else
    perform vault.update_secret(
      project_url_secret_id,
      'https://xzzngrquomyiglktroqi.supabase.co',
      'glowletter_project_url',
      'GlowLetter scheduled Edge Function base URL'
    );
  end if;

  select id into cleanup_secret_id
  from vault.secrets
  where name = 'glowletter_cleanup_secret';

  if cleanup_secret_id is null then
    perform vault.create_secret(
      pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'),
      'glowletter_cleanup_secret',
      'Private random secret used only by the temporary-audio cleanup schedule'
    );
  end if;
end
$vault$;

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-temporary-audio'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'glowletter-purge-temporary-audio',
    '*/5 * * * *',
    $command$
      select net.http_post(
        url := (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'glowletter_project_url'
        ) || '/functions/v1/cleanup-shared-audio',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-GlowLetter-Cleanup', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'glowletter_cleanup_secret'
          )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 10000
      );
    $command$
  );
end
$migration$;

notify pgrst, 'reload schema';
