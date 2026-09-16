-- BLIND WINE — RESET COMPLET DU SCHÉMA APPLICATIF
-- ATTENTION : supprime définitivement toutes les données Blind Wine du schéma public.
-- Parties, joueurs, vins, réponses, profils applicatifs, RPC, policies et triggers applicatifs seront supprimés.
-- Les comptes Supabase Auth (Authentication > Users) sont volontairement conservés.
-- Pour un reset absolument total, supprime aussi les utilisateurs depuis Authentication > Users dans le Dashboard Supabase.

begin;

-- Supprime toutes les tables, vues, fonctions, policies et objets applicatifs.
drop schema if exists public cascade;

-- Recrée le schéma public et les droits standards Supabase.
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

grant all on all tables in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
grant all on all functions in schema public to postgres, service_role;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;

commit;
