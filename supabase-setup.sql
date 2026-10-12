-- Run once in your Supabase project's SQL Editor.
begin;
create table if not exists public.pastel_portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.pastel_portfolio_admins enable row level security;
revoke all on public.pastel_portfolio_admins from anon, authenticated;
grant select on public.pastel_portfolio_admins to authenticated;
drop policy if exists "Admins can read own membership" on public.pastel_portfolio_admins;
create policy "Admins can read own membership" on public.pastel_portfolio_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.pastel_portfolio_profile (
  id integer primary key default 1 check (id = 1),
  name text not null default '', nickname text not null default '',
  role text not null default '', about text not null default '',
  birth text not null default '', location text not null default '',
  email text not null default '', hobbies text not null default '',
  media_path text, media_type text,
  age text not null default '', nationality text not null default '',
  religion text not null default '', phone text not null default '',
  facebook text not null default '', instagram text not null default '',
  skills text not null default '', software text not null default ''
);
alter table public.pastel_portfolio_profile
  add column if not exists age text not null default '',
  add column if not exists nationality text not null default '',
  add column if not exists religion text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists facebook text not null default '',
  add column if not exists instagram text not null default '',
  add column if not exists skills text not null default '',
  add column if not exists software text not null default '';
insert into public.pastel_portfolio_profile (id) values (1) on conflict do nothing;

create table if not exists public.pastel_portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('education','competition','activity','certificate','project')),
  title text not null check (length(trim(title)) > 0),
  subtitle text not null default '', period text not null default '',
  description text not null default '', media_path text, media_type text,
  website_url text not null default '',
  video_url text not null default '',
  competition_level text not null default '',
  created_at timestamptz not null default now()
);
alter table public.pastel_portfolio_profile enable row level security;
alter table public.pastel_portfolio_entries enable row level security;
revoke all on public.pastel_portfolio_profile, public.pastel_portfolio_entries from anon, authenticated;
grant select on public.pastel_portfolio_profile, public.pastel_portfolio_entries to anon, authenticated;
grant insert, update, delete on public.pastel_portfolio_profile, public.pastel_portfolio_entries to authenticated;
drop policy if exists "Public portfolio profile" on public.pastel_portfolio_profile;
drop policy if exists "Public portfolio entries" on public.pastel_portfolio_entries;
drop policy if exists "Admin manages profile" on public.pastel_portfolio_profile;
drop policy if exists "Admin manages entries" on public.pastel_portfolio_entries;
create policy "Public portfolio profile" on public.pastel_portfolio_profile for select to anon, authenticated using (true);
create policy "Public portfolio entries" on public.pastel_portfolio_entries for select to anon, authenticated using (true);
create policy "Admin manages profile" on public.pastel_portfolio_profile for all to authenticated
  using (exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())));
create policy "Admin manages entries" on public.pastel_portfolio_entries for all to authenticated
  using (exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('pastel-portfolio-media','pastel-portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Pastel admin uploads files" on storage.objects;
drop policy if exists "Pastel admin reads files" on storage.objects;
drop policy if exists "Pastel admin deletes files" on storage.objects;
create policy "Pastel admin uploads files" on storage.objects for insert to authenticated
  with check (bucket_id = 'pastel-portfolio-media' and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())));
create policy "Pastel admin reads files" on storage.objects for select to authenticated
  using (bucket_id = 'pastel-portfolio-media' and exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())));
create policy "Pastel admin deletes files" on storage.objects for delete to authenticated
  using (bucket_id = 'pastel-portfolio-media' and exists(select 1 from public.pastel_portfolio_admins where user_id = (select auth.uid())));
commit;

-- Create your account in Authentication > Users > Add user first.
-- Then replace YOUR_ADMIN_USER_UUID with that user's UUID and run:
-- insert into public.pastel_portfolio_admins (user_id) values ('YOUR_ADMIN_USER_UUID');
