-- Run once, or rerun safely, after supabase-setup.sql.
alter table public.pastel_portfolio_profile
  add column if not exists age text not null default '',
  add column if not exists nationality text not null default '',
  add column if not exists religion text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists facebook text not null default '',
  add column if not exists instagram text not null default '',
  add column if not exists skills text not null default '',
  add column if not exists software text not null default '';
