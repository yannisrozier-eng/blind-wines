-- À exécuter uniquement si MIGRATION_V4.4.0.sql a déjà été appliquée.
-- V4.4.1 — durcissement RLS du suivi de rapport post-soirée.

drop policy if exists post_event_reports_host_update on public.post_event_reports;
create policy post_event_reports_host_update
on public.post_event_reports
for update to authenticated
using(host_id=auth.uid() and public.is_game_host(game_id))
with check(host_id=auth.uid() and public.is_game_host(game_id));
