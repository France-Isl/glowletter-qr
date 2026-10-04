-- Функция ответа получателя зовёт фильтр уведомлений из схемы private, а
-- service_role не имеет на него прав. Поэтому она выполняется от владельца
-- (security definer) при пустом search_path, как и админские функции; вызывать
-- её по-прежнему может только service_role.
alter function public.glowletter_create_letter_reply(uuid, text, text, text, text) security definer;
revoke all on function public.glowletter_create_letter_reply(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.glowletter_create_letter_reply(uuid, text, text, text, text) to service_role;
