-- Коллекция больше не заканчивается на 50: тексты из админ-панели получают
-- номера 51, 52, … (public.glowletter_catalog_letters). Прогресс чтения и
-- избранное должны принимать такие номера, иначе синхронизация падала бы на
-- проверке «between 1 and 50». Верхняя граница — предел smallint.

alter table public.glowletter_progress
  drop constraint if exists glowletter_progress_current_letter_id_check,
  add constraint glowletter_progress_current_letter_id_check
    check (current_letter_id between 1 and 32767);
