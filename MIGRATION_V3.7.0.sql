-- Blind Wine V3.7.0 — Découverte / copilote caviste
-- À exécuter une fois dans Supabase > SQL Editor avant de déployer le frontend V3.7.0.
-- Ce champ reste dans wine_secrets : les politiques RLS existantes le rendent visible uniquement par l'hôte.
alter table public.wine_secrets
  add column if not exists host_note text not null default '';
