-- Run in Supabase SQL Editor after supabase-setup.sql.
begin;
alter table public.pastel_portfolio_entries
  add column if not exists video_url text not null default '';
alter table public.pastel_portfolio_entries
  drop constraint if exists pastel_portfolio_entries_video_url_check;
alter table public.pastel_portfolio_entries
  add constraint pastel_portfolio_entries_video_url_check
  check (video_url = '' or video_url ~* '^https?://[^[:space:]]+$');
commit;
notify pgrst, 'reload schema';
