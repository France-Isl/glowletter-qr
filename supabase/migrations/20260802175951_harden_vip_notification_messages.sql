-- Harden administrator-authored VIP notices against common Unicode bypasses.
-- This follows the initial notification migration without changing its API.

create or replace function private.glowletter_normalize_notice_message(p_message text)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  normalized text := coalesce(p_message, '');
begin
  normalized := pg_catalog.regexp_replace(normalized, '[[:cntrl:]]+', ' ', 'g');
  normalized := pg_catalog.replace(normalized, pg_catalog.chr(8203), '');
  normalized := pg_catalog.replace(normalized, pg_catalog.chr(8204), '');
  normalized := pg_catalog.replace(normalized, pg_catalog.chr(8205), '');
  normalized := pg_catalog.replace(normalized, pg_catalog.chr(8288), '');
  normalized := pg_catalog.replace(normalized, pg_catalog.chr(65279), '');
  normalized := pg_catalog.translate(
    normalized,
    '０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ＋',
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+'
  );
  normalized := pg_catalog.regexp_replace(normalized, '[[:space:]]+', ' ', 'g');
  return nullif(pg_catalog.btrim(normalized), '');
end;
$$;

create or replace function private.glowletter_notice_message_is_forbidden(p_message text)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  normalized text := pg_catalog.lower(
    coalesce(private.glowletter_normalize_notice_message(p_message), '')
  );
begin
  normalized := pg_catalog.replace(normalized, 'ё', 'е');
  normalized := pg_catalog.replace(normalized, 'œ', 'oe');
  normalized := pg_catalog.replace(normalized, 'é', 'e');
  normalized := pg_catalog.replace(normalized, 'è', 'e');
  normalized := pg_catalog.replace(normalized, 'ê', 'e');
  normalized := pg_catalog.replace(normalized, 'ë', 'e');
  normalized := pg_catalog.replace(normalized, 'à', 'a');
  normalized := pg_catalog.replace(normalized, 'â', 'a');
  normalized := pg_catalog.replace(normalized, 'ä', 'a');
  normalized := pg_catalog.replace(normalized, 'î', 'i');
  normalized := pg_catalog.replace(normalized, 'ï', 'i');
  normalized := pg_catalog.replace(normalized, 'ô', 'o');
  normalized := pg_catalog.replace(normalized, 'ö', 'o');
  normalized := pg_catalog.replace(normalized, 'ù', 'u');
  normalized := pg_catalog.replace(normalized, 'û', 'u');
  normalized := pg_catalog.replace(normalized, 'ü', 'u');
  normalized := pg_catalog.replace(normalized, 'ç', 'c');

  if normalized ~ '(^|[^0-9])18[[:space:]]*\+($|[^0-9])' then
    return true;
  end if;

  return normalized ~ (
    '(^|[^[:alnum:]_])('
    || 'секс[[:alnum:]_]*|эрот[[:alnum:]_]*|порн[[:alnum:]_]*|поцелу[[:alnum:]_]*|'
    || 'интим[[:alnum:]_]*|обнаж[[:alnum:]_]*|генитал[[:alnum:]_]*|оргазм[[:alnum:]_]*|'
    || 'возбужд[[:alnum:]_]*|мастурб[[:alnum:]_]*|проститу[[:alnum:]_]*|'
    || 'sex[[:alnum:]_]*|erotic[[:alnum:]_]*|porn[[:alnum:]_]*|kiss[[:alnum:]_]*|'
    || 'intimacy|nude|naked|genital[[:alnum:]_]*|orgasm[[:alnum:]_]*|arous[[:alnum:]_]*|'
    || 'masturb[[:alnum:]_]*|prostitut[[:alnum:]_]*|'
    || 'eroti[[:alnum:]_]*|bais(er|e|es|ons|ez|ent|ait|aient)|'
    || 'embrass(er|e|es|ons|ez|ent|ait|aient|ee|ees)|intimite|nudite|'
    || 'orgasme[[:alnum:]_]*|excite[[:alnum:]_]*|prostitu[[:alnum:]_]*'
    || ')($|[^[:alnum:]_])'
  );
end;
$$;

revoke all on function private.glowletter_normalize_notice_message(text)
  from public, anon, authenticated;
revoke all on function private.glowletter_notice_message_is_forbidden(text)
  from public, anon, authenticated;
