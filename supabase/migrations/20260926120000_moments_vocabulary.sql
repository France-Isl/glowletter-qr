-- Moments vocabulary (2.4.15). The app has always sent recurrence
-- 'annual'/'once', the kinds 'meeting'/'other', the relationship 'auto',
-- titles up to 100 characters and dates without a person, while the tables
-- created in August accepted only their own vocabulary — so no date and no
-- "auto" person ever reached the cloud, and every save fell back to the
-- device. The tables now accept both vocabularies; nothing is removed.
-- Applied on 2026-09-26 at the owner's explicit request («делай все» in
-- answer to the question whether to apply it).

alter table public.glowletter_people
  drop constraint glowletter_people_relationship_check,
  add constraint glowletter_people_relationship_check
    check (relationship in ('auto', 'mother', 'father', 'spouse', 'child', 'sibling', 'grandparent', 'teacher', 'friend', 'universal'));

alter table public.glowletter_moments
  alter column person_id drop not null,
  alter column title type varchar(100),
  alter column time_zone type varchar(80),
  drop constraint glowletter_moments_kind_check,
  add constraint glowletter_moments_kind_check
    check (kind in ('birthday', 'anniversary', 'holiday', 'gratitude', 'custom', 'meeting', 'other')),
  drop constraint glowletter_moments_recurrence_check,
  add constraint glowletter_moments_recurrence_check
    check (recurrence in ('none', 'yearly', 'once', 'annual')),
  drop constraint glowletter_moments_title_check,
  add constraint glowletter_moments_title_check
    check (char_length(btrim(title)) between 1 and 100),
  drop constraint glowletter_moments_time_zone_check,
  add constraint glowletter_moments_time_zone_check
    check (char_length(time_zone) between 1 and 80 and time_zone ~ '^[A-Za-z_+-]+(?:/[A-Za-z0-9_+-]+){0,3}$');
