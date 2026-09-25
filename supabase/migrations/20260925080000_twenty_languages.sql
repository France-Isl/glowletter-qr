-- GlowLetter speaks twenty languages: Russian, English, French, German,
-- Spanish, Italian, Polish, Ukrainian, Portuguese, Dutch, Turkish, Romanian,
-- Czech, Swedish, Greek, Danish, Norwegian, Finnish, Japanese and Korean.
-- Every stored language code is widened together.

alter table public.glowletter_progress
  drop constraint glowletter_progress_language_check,
  add constraint glowletter_progress_language_check
    check (language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko'));

alter table public.glowletter_people
  drop constraint glowletter_people_language_check,
  add constraint glowletter_people_language_check
    check (language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko'));

alter table public.glowletter_letters
  drop constraint glowletter_letters_language_check,
  add constraint glowletter_letters_language_check
    check (language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko'));

alter table private.glowletter_support_tickets
  drop constraint glowletter_support_tickets_language_check,
  add constraint glowletter_support_tickets_language_check
    check (language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko'));

alter table private.glowletter_content_reports
  drop constraint glowletter_content_reports_language_check,
  add constraint glowletter_content_reports_language_check
    check (language in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko'));

-- Identical to the previous definition except for the accepted languages.
create or replace function public.glowletter_create_support_ticket(
  p_user_id uuid,
  p_contact_email text,
  p_category text,
  p_message text,
  p_language text,
  p_platform text,
  p_app_version text
)
returns table(ticket_id uuid, support_id text, created_at timestamp with time zone)
language plpgsql
set search_path to ''
as $function$
declare
  normalized_email text := lower(btrim(coalesce(p_contact_email, '')));
  normalized_category text := lower(btrim(coalesce(p_category, '')));
  normalized_message text := btrim(coalesce(p_message, ''));
  normalized_language text := lower(btrim(coalesce(p_language, '')));
  normalized_platform text := lower(btrim(coalesce(p_platform, '')));
  normalized_app_version text := btrim(coalesce(p_app_version, ''));
  account_support_id text;
  tickets_last_hour integer;
  tickets_last_day integer;
begin
  if p_user_id is null then
    raise exception 'support_user_required' using errcode = '22023';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(normalized_email) not between 3 and 254 then
    raise exception 'support_email_invalid' using errcode = '22023';
  end if;
  if normalized_category not in ('technical', 'account', 'subscription', 'content', 'feedback', 'other') then
    raise exception 'support_category_invalid' using errcode = '22023';
  end if;
  if char_length(normalized_message) not between 20 and 2000 then
    raise exception 'support_message_invalid' using errcode = '22023';
  end if;
  if normalized_language not in ('ru', 'en', 'fr', 'de', 'es', 'it', 'pl', 'uk', 'pt', 'nl', 'tr', 'ro', 'cs', 'sv', 'el', 'da', 'no', 'fi', 'ja', 'ko') then
    raise exception 'support_language_invalid' using errcode = '22023';
  end if;
  if normalized_platform not in ('web', 'android', 'ios') then
    raise exception 'support_platform_invalid' using errcode = '22023';
  end if;
  if char_length(normalized_app_version) not between 1 and 32
     or normalized_app_version !~ '^[A-Za-z0-9][A-Za-z0-9._+ -]{0,31}$' then
    raise exception 'support_app_version_invalid' using errcode = '22023';
  end if;

  select account.support_id
  into account_support_id
  from public.glowletter_accounts as account
  where account.user_id = p_user_id;

  if account_support_id is null then
    raise exception 'support_account_unavailable' using errcode = 'P0002';
  end if;

  -- Serialize submissions for one account so concurrent requests cannot race
  -- past either rolling-window limit.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select count(*) filter (where ticket.created_at > now() - interval '1 hour'),
         count(*)
  into tickets_last_hour, tickets_last_day
  from private.glowletter_support_tickets as ticket
  where ticket.user_id = p_user_id
    and ticket.created_at > now() - interval '1 day';

  if tickets_last_hour >= 3 or tickets_last_day >= 10 then
    raise exception 'support_rate_limited' using errcode = 'P0001';
  end if;

  return query
  insert into private.glowletter_support_tickets as ticket (
    user_id,
    support_id,
    contact_email,
    category,
    message,
    language,
    platform,
    app_version
  ) values (
    p_user_id,
    account_support_id,
    normalized_email,
    normalized_category,
    normalized_message,
    normalized_language,
    normalized_platform,
    normalized_app_version
  )
  returning ticket.id, ticket.support_id, ticket.created_at;
end;
$function$;
