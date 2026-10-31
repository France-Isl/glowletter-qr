-- Владелец 01.11: «по умолчанию у всех поставь, как у меня, фон» — «Домик у костра» и гранатовая тема.
update public.glowletter_user_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object('scene', 'cabin', 'scene2', 'cabin', 'theme', 'garnet');
