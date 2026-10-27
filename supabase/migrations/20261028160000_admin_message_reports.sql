-- Админ-панель, вкладка «Жалобы»: жалобы на личные сообщения. Только админ.

create or replace function public.glowletter_admin_message_reports()
returns table (
  id uuid,
  created_at timestamptz,
  reason text,
  body text,
  message_at timestamptz,
  sender_email text,
  sender_name text,
  reporter_email text,
  reports bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.glowletter_is_admin() then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  return query
  select r.id, r.created_at, r.reason, m.body, m.created_at,
         su.email::text, p.display_name, ru.email::text,
         (select count(*) from public.glowletter_message_reports as other where other.message_id = r.message_id)
  from public.glowletter_message_reports as r
  join public.glowletter_messages as m on m.id = r.message_id
  left join auth.users as su on su.id = m.sender
  left join public.glowletter_profiles as p on p.user_id = m.sender
  left join auth.users as ru on ru.id = r.reporter
  order by r.created_at desc
  limit 200;
end;
$$;
revoke all on function public.glowletter_admin_message_reports() from public, anon;
grant execute on function public.glowletter_admin_message_reports() to authenticated;

-- Решение по жалобе: удалить само сообщение (вместе со всеми жалобами на него)
-- или просто закрыть жалобу.
create or replace function public.glowletter_admin_resolve_report(p_report uuid, p_delete_message boolean)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  if not private.glowletter_is_admin() then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  select r.message_id into target from public.glowletter_message_reports as r where r.id = p_report;
  if target is null then return; end if;
  if coalesce(p_delete_message, false) then
    delete from public.glowletter_messages as m where m.id = target;
  else
    delete from public.glowletter_message_reports as r where r.id = p_report;
  end if;
end;
$$;
revoke all on function public.glowletter_admin_resolve_report(uuid, boolean) from public, anon;
grant execute on function public.glowletter_admin_resolve_report(uuid, boolean) to authenticated;
