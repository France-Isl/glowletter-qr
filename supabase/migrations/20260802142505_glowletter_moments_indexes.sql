-- Cover same-owner foreign keys used by cascades and history joins.
create index glowletter_moments_person_owner_idx
  on public.glowletter_moments (person_id, user_id);
create index glowletter_letters_person_owner_idx
  on public.glowletter_letters (person_id, user_id)
  where person_id is not null;
create index glowletter_letters_moment_owner_idx
  on public.glowletter_letters (moment_id, user_id)
  where moment_id is not null;
create index glowletter_qr_links_letter_owner_idx
  on public.glowletter_qr_links (letter_id, user_id)
  where letter_id is not null;
create index glowletter_qr_links_person_owner_idx
  on public.glowletter_qr_links (person_id, user_id)
  where person_id is not null;
