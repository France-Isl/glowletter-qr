-- Уведомления на телефон (2.4.25) без Firebase и без секретов на сервере.
-- Приложение Android при включении получает случайный ключ устройства
-- (на сервере хранится только его SHA-256) и примерно раз в 15 минут
-- спрашивает glowletter_push_poll: что нового с прошлого раза — сообщения
-- друзей, открытые письма, ответы на письма. Сердечки не уведомляют.
-- Ключ работает без входа, поэтому функция отдаёт только короткую сводку
-- для своего владельца и не чаще раза в три минуты.

create table public.glowletter_push_devices (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  cursor_at timestamptz not null default now(),
  last_poll timestamptz,
  created_at timestamptz not null default now()
);
create index glowletter_push_devices_user_idx on public.glowletter_push_devices (user_id, created_at desc);
comment on table public.glowletter_push_devices is 'Android devices that poll for phone notifications. Only the SHA-256 of the device key is stored.';

alter table public.glowletter_push_devices enable row level security;
revoke all on table public.glowletter_push_devices from public, anon, authenticated;
grant all on table public.glowletter_push_devices to service_role;

create or replace function public.glowletter_push_register()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  token text := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  delete from public.glowletter_push_devices where coalesce(last_poll, created_at) < now() - interval '60 days';
  delete from public.glowletter_push_devices
  where user_id = me and token_hash in (
    select d.token_hash from public.glowletter_push_devices as d where d.user_id = me order by d.created_at desc offset 9
  );
  insert into public.glowletter_push_devices (token_hash, user_id)
  values (pg_catalog.encode(extensions.digest(token, 'sha256'), 'hex'), me);
  return token;
end;
$$;

create or replace function public.glowletter_push_unregister(p_token text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  delete from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
  return found;
end;
$$;

-- Сводка нового с прошлого опроса. kind сообщения: text, voice, bear, draw, game.
create or replace function public.glowletter_push_poll(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  device public.glowletter_push_devices;
  since timestamptz;
  result jsonb;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid';
  end if;
  select * into device from public.glowletter_push_devices
  where token_hash = pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'not_found';
  end if;
  if device.last_poll is not null and device.last_poll > now() - interval '3 minutes' then
    return '{}'::jsonb;
  end if;
  since := device.cursor_at;
  select pg_catalog.jsonb_build_object(
    'messages', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('name', x.name, 'kind', x.kind, 'text', x.text) order by x.created_at)
      from (
        select m.created_at,
               coalesce(p.display_name, '') as name,
               case
                 when m.body like '[[voice:%' then 'voice'
                 when m.body like '[[bear:%' then 'bear'
                 when m.body like '[[draw:%' then 'draw'
                 when m.body like '[[game:%' then 'game'
                 else 'text'
               end as kind,
               case when m.body like '[[%' then '' else pg_catalog.left(m.body, 100) end as text
        from public.glowletter_messages as m
        left join public.glowletter_profiles as p on p.user_id = m.sender
        where m.recipient = device.user_id and m.created_at > since and m.read_at is null
          and m.body not like '[[react:%'
          and private.glowletter_are_friends(m.sender, device.user_id)
          and not private.glowletter_is_blocked(m.sender, device.user_id)
        order by m.created_at desc
        limit 10
      ) as x
    ), '[]'::jsonb),
    'opened', (
      select count(*)::int from public.glowletter_qr_links as l
      where l.user_id = device.user_id and l.opened_at > since
    ),
    'replies', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('reaction', r.reaction, 'message', coalesce(r.message, '')) order by r.created_at)
      from (
        select * from public.glowletter_letter_replies as lr
        where lr.user_id = device.user_id and lr.created_at > since
        order by lr.created_at desc
        limit 5
      ) as r
    ), '[]'::jsonb)
  ) into result;
  update public.glowletter_push_devices set cursor_at = now(), last_poll = now() where token_hash = device.token_hash;
  return result;
end;
$$;

revoke all on function public.glowletter_push_register() from public, anon;
grant execute on function public.glowletter_push_register() to authenticated;
revoke all on function public.glowletter_push_unregister(text) from public;
grant execute on function public.glowletter_push_unregister(text) to anon, authenticated;
revoke all on function public.glowletter_push_poll(text) from public;
grant execute on function public.glowletter_push_poll(text) to anon, authenticated;

notify pgrst, 'reload schema';
