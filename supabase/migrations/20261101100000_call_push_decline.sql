-- «Отклонить» в уведомлении о звонке (владелец 01.11: «если я отклонил, значит у него тоже вызов
-- должен прерваться, как в WhatsApp»). Телефон с закрытым приложением зовёт функцию call-push с
-- подписью звонка, функция проверяет подпись и вызывает это: звонящему в комнату звонка уходит
-- тот же сигнал decline, что и со страницы. Отправляем в закрытый и открытый канал — какой из них
-- сейчас у комнаты, зависит от private_rooms. Вызывает только сервер (service_role).

create or replace function public.glowletter_call_declined(p_room uuid, p_caller uuid, p_callee uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  topic text := 'glowletter-call:' || p_room::text;
  payload jsonb := pg_catalog.jsonb_build_object('from', p_callee, 'to', p_caller);
begin
  if p_room is null or p_caller is null or p_callee is null or p_caller = p_callee then return false; end if;
  -- Только настоящий звонок: приглашение от звонящего этому человеку не старше двух минут.
  if not exists (
    select 1 from public.glowletter_messages as m
    where m.sender = p_caller and m.recipient = p_callee
      and m.body = '[[call:' || p_room::text || ']]'
      and m.created_at > now() - interval '2 minutes'
  ) then
    return false;
  end if;
  perform realtime.send(payload, 'decline', topic, true);
  perform realtime.send(payload, 'decline', topic, false);
  return true;
end;
$$;

revoke all on function public.glowletter_call_declined(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.glowletter_call_declined(uuid, uuid, uuid) to service_role;
