-- Run in Supabase SQL Editor after the base portfolio setup.
-- Older records remain unclassified until an admin selects their level.
begin;
alter table public.pastel_portfolio_entries
  add column if not exists competition_level text not null default '';
alter table public.pastel_portfolio_entries
  drop constraint if exists pastel_portfolio_entries_competition_level_check;
alter table public.pastel_portfolio_entries
  add constraint pastel_portfolio_entries_competition_level_check
  check (competition_level in ('','school','province','region','national'));
commit;
notify pgrst, 'reload schema';
