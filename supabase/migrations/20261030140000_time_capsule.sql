-- «Капсула времени» (2.4.24): письмо по ссылке/QR может ждать дольше года —
-- до 25 лет (например, до 18-летия ребёнка). До года — как раньше, для всех;
-- дольше года — с полным доступом (проверяет триггер, функция остаётся invoker).

alter table public.glowletter_qr_links drop constraint if exists glowletter_qr_links_check2;
alter table public.glowletter_qr_links add constraint glowletter_qr_links_unlock_window
  check (unlock_at is null or unlock_at <= created_at + interval '25 years 1 day');

create or replace function public.glowletter_create_qr_link(
  p_kind text default 'letter',
  p_letter_id uuid default null,
  p_person_id uuid default null,
  p_unlock_at timestamptz default null,
  p_expires_at timestamptz default null
)
returns table (id uuid, public_id uuid, unlock_at timestamptz, expires_at timestamptz)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  if p_unlock_at is not null and (p_unlock_at < now() - interval '5 minutes' or p_unlock_at > now() + interval '25 years') then
    raise exception 'invalid_unlock_time' using errcode = '22023';
  end if;
  if p_expires_at is not null and (p_expires_at <= now() or p_expires_at > now() + interval '366 days') then
    raise exception 'invalid_expiry_time' using errcode = '22023';
  end if;
  if p_kind = 'letter' then
    if p_letter_id is null or p_person_id is not null or not exists (
      select 1 from public.glowletter_letters where glowletter_letters.id = p_letter_id and user_id = owner_id
    ) then raise exception 'letter_not_found' using errcode = '22023'; end if;
  elsif p_kind = 'person_permanent' then
    if p_person_id is null or p_letter_id is not null or not exists (
      select 1 from public.glowletter_people where glowletter_people.id = p_person_id and user_id = owner_id
    ) then raise exception 'person_not_found' using errcode = '22023'; end if;
  else
    raise exception 'invalid_qr_kind' using errcode = '22023';
  end if;

  return query
  insert into public.glowletter_qr_links (user_id, kind, letter_id, person_id, unlock_at, expires_at)
  values (owner_id, p_kind, p_letter_id, p_person_id, p_unlock_at, p_expires_at)
  returning glowletter_qr_links.id, glowletter_qr_links.public_id,
            glowletter_qr_links.unlock_at, glowletter_qr_links.expires_at;
end;
$$;

create or replace function private.glowletter_qr_capsule_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.unlock_at is not null and new.unlock_at > now() + interval '366 days'
     and not private.glowletter_has_paid_access(new.user_id) then
    raise exception 'premium_required' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.glowletter_qr_capsule_guard() from public, anon, authenticated;

drop trigger if exists glowletter_qr_links_capsule_guard on public.glowletter_qr_links;
create trigger glowletter_qr_links_capsule_guard
  before insert or update of unlock_at on public.glowletter_qr_links
  for each row execute function private.glowletter_qr_capsule_guard();
