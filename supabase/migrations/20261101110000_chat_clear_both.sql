-- «Очистить у обоих» (владелец 01.11: «человек может очистить чат только у себя и у всех тоже…
-- так будет лучше, и память на сервере меньше будет храниться»). Переписка двоих, их фото и
-- голосовые удаляются с сервера совсем. Остаются только сообщения, на которые пожаловались
-- (их смотрит администратор), но и они скрываются у обоих через glowletter_chat_clears.
-- Второй человек узнаёт об очистке сразу: сигнал chat-cleared в канал glowletter-chat:<его id>.

create or replace function public.glowletter_chat_clear_both(p_friend uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  removed integer := 0;
begin
  if me is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_friend is null or p_friend = me then raise exception using errcode = '22023', message = 'invalid'; end if;

  delete from public.glowletter_photos as p
  where ((p.sender = me and p.recipient = p_friend) or (p.sender = p_friend and p.recipient = me))
    and not exists (
      select 1 from public.glowletter_messages as m join public.glowletter_message_reports as r on r.message_id = m.id
      where pg_catalog.strpos(m.body, p.id::text) > 0);

  delete from public.glowletter_voice_notes as v
  where ((v.sender = me and v.recipient = p_friend) or (v.sender = p_friend and v.recipient = me))
    and not exists (
      select 1 from public.glowletter_messages as m join public.glowletter_message_reports as r on r.message_id = m.id
      where pg_catalog.strpos(m.body, v.id::text) > 0);

  delete from public.glowletter_messages as m
  where ((m.sender = me and m.recipient = p_friend) or (m.sender = p_friend and m.recipient = me))
    and not exists (select 1 from public.glowletter_message_reports as r where r.message_id = m.id);
  get diagnostics removed = row_count;

  insert into public.glowletter_chat_clears (user_id, friend_id, cleared_at)
  values (me, p_friend, now()), (p_friend, me, now())
  on conflict (user_id, friend_id) do update set cleared_at = excluded.cleared_at;

  perform realtime.send(pg_catalog.jsonb_build_object('from', me), 'chat-cleared', 'glowletter-chat:' || p_friend::text, false);
  return removed;
end;
$$;

revoke all on function public.glowletter_chat_clear_both(uuid) from public, anon;
grant execute on function public.glowletter_chat_clear_both(uuid) to authenticated;
