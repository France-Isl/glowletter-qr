-- Recipient safety reports are deliberately kept outside the Data API schemas.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to service_role;
grant usage on schema private to authenticated;

create table if not exists private.glowletter_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  content_kind text not null check (content_kind in ('direct_letter', 'moment_letter', 'shared_audio')),
  category text not null check (category in ('adult', 'harassment', 'hate', 'threat', 'fraud', 'privacy', 'spam', 'other')),
  language text not null check (language in ('ru', 'en', 'fr')),
  platform text not null check (platform in ('web', 'android_play', 'ios')),
  app_version text not null check (char_length(app_version) between 1 and 32),
  content_ref text not null check (content_ref ~ '^[A-Za-z0-9_-]{16,80}$'),
  moment_public_id uuid,
  audio_attached boolean not null default false,
  sender_snapshot text not null default '' check (char_length(sender_snapshot) <= 36),
  recipient_snapshot text not null default '' check (char_length(recipient_snapshot) <= 36),
  text_snapshot text not null default '' check (char_length(text_snapshot) <= 1800),
  details text not null default '' check (char_length(details) <= 500),
  source_hash text not null check (source_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  owner_note text not null default '' check (char_length(owner_note) <= 2000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table private.glowletter_content_reports enable row level security;
revoke all on private.glowletter_content_reports from public, anon, authenticated;
grant select, insert, update, delete on private.glowletter_content_reports to service_role;

create policy glowletter_content_reports_no_browser_access
  on private.glowletter_content_reports
  for all to anon, authenticated
  using (false)
  with check (false);

create index if not exists glowletter_content_reports_pending_idx
  on private.glowletter_content_reports (created_at desc) where status = 'pending';
create index if not exists glowletter_content_reports_source_idx
  on private.glowletter_content_reports (source_hash, created_at desc);

create or replace function public.glowletter_create_content_report(
  p_reporter_user_id uuid,
  p_content_kind text,
  p_category text,
  p_language text,
  p_platform text,
  p_app_version text,
  p_content_ref text,
  p_moment_public_id uuid,
  p_audio_attached boolean,
  p_sender_snapshot text,
  p_recipient_snapshot text,
  p_text_snapshot text,
  p_details text,
  p_source_hash text
) returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  existing_id uuid;
  report_id uuid;
begin
  -- Opportunistic retention: reports are removed no later than the next report
  -- submitted after they become six months old.
  delete from private.glowletter_content_reports
    where created_at < now() - interval '6 months';

  perform pg_advisory_xact_lock(hashtextextended(p_source_hash, 0));

  select id into existing_id
    from private.glowletter_content_reports
    where source_hash = p_source_hash
      and content_ref = p_content_ref
      and category = p_category
      and created_at >= now() - interval '24 hours'
    order by created_at desc limit 1;
  if existing_id is not null then return existing_id; end if;

  if (select count(*) from private.glowletter_content_reports where source_hash = p_source_hash and created_at >= now() - interval '1 hour') >= 5
     or (select count(*) from private.glowletter_content_reports where source_hash = p_source_hash and created_at >= date_trunc('day', now())) >= 20 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into private.glowletter_content_reports (
    reporter_user_id, content_kind, category, language, platform, app_version,
    content_ref, moment_public_id, audio_attached, sender_snapshot,
    recipient_snapshot, text_snapshot, details, source_hash
  ) values (
    p_reporter_user_id, p_content_kind, p_category, p_language, p_platform,
    p_app_version, p_content_ref, p_moment_public_id, p_audio_attached,
    p_sender_snapshot, p_recipient_snapshot, p_text_snapshot, p_details,
    p_source_hash
  ) returning id into report_id;
  return report_id;
end;
$$;

revoke all on function public.glowletter_create_content_report(uuid, text, text, text, text, text, text, uuid, boolean, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.glowletter_create_content_report(uuid, text, text, text, text, text, text, uuid, boolean, text, text, text, text, text) to service_role;

comment on table private.glowletter_content_reports is
  'Private recipient reports. Review in Supabase SQL/Studio; never expose through anon/authenticated roles.';

do $migration$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'glowletter-purge-content-reports'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
  perform cron.schedule(
    'glowletter-purge-content-reports',
    '41 3 * * *',
    $command$delete from private.glowletter_content_reports where created_at < now() - interval '6 months'$command$
  );
end
$migration$;

notify pgrst, 'reload schema';
