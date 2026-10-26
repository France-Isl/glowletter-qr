-- Последняя версия, которая уже доступна в Google Play (2.4.19). Приложение
-- сверяет с ней свою версию и предлагает обновиться, даже когда Play ещё не
-- сообщил о новой сборке через встроенный механизм обновлений. Запись меняется
-- только сервисной ролью — после того как Google одобрил выпуск.
create table public.glowletter_app_release (
  platform text primary key check (platform in ('android', 'ios')),
  version_name text not null check (version_name ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  version_code integer not null check (version_code > 0),
  updated_at timestamptz not null default now()
);

alter table public.glowletter_app_release enable row level security;
revoke all on table public.glowletter_app_release from public, anon, authenticated;
grant select on table public.glowletter_app_release to anon, authenticated;

create policy "Anyone reads the published app version"
  on public.glowletter_app_release
  for select to anon, authenticated
  using (true);

insert into public.glowletter_app_release (platform, version_name, version_code)
values ('android', '2.4.17', 32);

comment on table public.glowletter_app_release is
  'Latest store version per platform; update after the store approves a release.';
