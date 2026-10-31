-- Звонок, когда приложение закрыто (владелец 01.11: «чтобы у него был звонок, как в WhatsApp»).
-- Android-приложение (2.4.29+) получает адрес Firebase Cloud Messaging и записывает его сюда
-- для вошедшего пользователя. Функция call-push будит телефоны друга, которому только что
-- отправлено приглашение [[call:комната]]; адреса читает только сервер (service_role).

create table public.glowletter_call_devices (
  token text primary key check (pg_catalog.char_length(token) between 20 and 4096 and token ~ '^[A-Za-z0-9_:.-]+$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);
create index glowletter_call_devices_user_idx on public.glowletter_call_devices (user_id, updated_at desc);
comment on table public.glowletter_call_devices is 'Firebase Cloud Messaging addresses of Android phones, used only to ring for incoming calls.';

alter table public.glowletter_call_devices enable row level security;
revoke all on table public.glowletter_call_devices from public, anon, authenticated;
grant all on table public.glowletter_call_devices to service_role;

-- Адрес переходит к тому, кто сейчас вошёл на этом телефоне. У человека не больше пяти телефонов.
create or replace function public.glowletter_call_device_set(p_token text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  value text := pg_catalog.btrim(coalesce(p_token, ''));
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if pg_catalog.char_length(value) not between 20 and 4096 or value !~ '^[A-Za-z0-9_:.-]+$' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  insert into public.glowletter_call_devices (token, user_id, updated_at) values (value, me, now())
  on conflict (token) do update set user_id = excluded.user_id, updated_at = now();
  delete from public.glowletter_call_devices
  where user_id = me and token in (
    select d.token from public.glowletter_call_devices as d where d.user_id = me order by d.updated_at desc offset 5
  );
  delete from public.glowletter_call_devices where updated_at < now() - interval '90 days';
  return true;
end;
$$;

create or replace function public.glowletter_call_device_remove(p_token text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  delete from public.glowletter_call_devices where token = coalesce(p_token, '') and user_id = me;
  return found;
end;
$$;

revoke all on function public.glowletter_call_device_set(text) from public, anon;
revoke all on function public.glowletter_call_device_remove(text) from public, anon;
grant execute on function public.glowletter_call_device_set(text) to authenticated;
grant execute on function public.glowletter_call_device_remove(text) to authenticated;
