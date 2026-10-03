alter table public.callback_requests
  add column if not exists email text;

create table if not exists public.marketing_settings (
  id boolean primary key default true check (id),
  lead_notification_email text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.marketing_settings enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'marketing_settings' and policyname = 'marketing_settings: admins manage') then
    create policy "marketing_settings: admins manage" on public.marketing_settings
      for all to authenticated using (is_admin()) with check (is_admin());
  end if;
end $$;

insert into public.marketing_settings (id) values (true)
on conflict (id) do nothing;
