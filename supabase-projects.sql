-- Run supabase-setup.sql first if the portfolio tables do not exist yet.
-- Keeps the existing admin-only write policies and public read policies.
begin;
alter table public.pastel_portfolio_entries
  add column if not exists website_url text not null default '';
alter table public.pastel_portfolio_entries
  drop constraint if exists pastel_portfolio_entries_kind_check;
alter table public.pastel_portfolio_entries
  add constraint pastel_portfolio_entries_kind_check
  check (kind in ('education','competition','activity','certificate','project'));
alter table public.pastel_portfolio_entries
  drop constraint if exists pastel_portfolio_entries_project_url_check;
alter table public.pastel_portfolio_entries
  add constraint pastel_portfolio_entries_project_url_check
  check (kind <> 'project' or website_url ~* '^https?://[^[:space:]]+$');

insert into public.pastel_portfolio_entries
  (id,kind,title,subtitle,description,website_url)
values
  ('5136d8c0-0005-4000-8000-000000000005','project','Willow',
   'ไดอารี่,บันทึกอารมณ์,ความทรงจำ',
   'เว็บไซต์บันทึกไดอารี่และอารมณ์ในแต่ละวัน พร้อมสรุปอารมณ์และคลังความทรงจำ',
   'https://willowlove.kesug.com/')
on conflict (id) do nothing;
commit;
notify pgrst, 'reload schema';
