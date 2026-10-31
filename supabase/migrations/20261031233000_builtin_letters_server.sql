-- Тексты платных встроенных писем 11–50 (31.10): только на сервере, приложение получает их при полном доступе.
-- Сами тексты в репозиторий не кладём (он открыт): таблица заполнена прямо в базе.
create table if not exists public.glowletter_builtin_letters (
  id integer primary key,
  category text not null,
  texts jsonb not null
);
alter table public.glowletter_builtin_letters enable row level security;
revoke all on public.glowletter_builtin_letters from anon, authenticated;

create or replace function public.glowletter_builtin_letters()
returns table(id integer, category text, texts jsonb)
language sql stable security definer set search_path = ''
as $$
  select l.id, l.category, l.texts
  from public.glowletter_builtin_letters as l
  where private.glowletter_has_paid_access((select auth.uid()))
  order by l.id
$$;
revoke all on function public.glowletter_builtin_letters() from public, anon;
grant execute on function public.glowletter_builtin_letters() to authenticated;
