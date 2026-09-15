# Blind Wine V3.8.1 — Audit Fresh Install

## Objectif
Construire un package autonome pour un projet Supabase neuf, sans dépendre des migrations V3.7.0, V3.8.0 ou V3.8.1.

## SQL
- `supabase.sql` est le seul fichier SQL du package.
- Tables principales présentes : games, players, wines, wine_secrets, wine_reveals, answers, profiles.
- Champs V3.8.1 intégrés : discovery_theme, discovery_theme_goal, discovery_compare, host_note.
- RPC Découverte intégré : set_discovery_setup.
- Contrôles start_game V3.8.1 intégrés.
- Contrôles guard_answer_write V3.8.1 intégrés.
- RLS + policies + grants présents.
- Trigger profil auth.users -> profiles présent.
- Publication Realtime idempotente présente.
- Aucune migration intermédiaire requise.

## Frontend
- Syntaxe de tous les JS contrôlée avec Node.
- Scripts classiques conservés dans le même ordre de chargement.
- Service Worker V3.8.1 conservé.
- Blind/Challenge restent ceux du build V3.8.1 audité.

## Limite
Pas de test E2E réel multi-appareils contre le projet Supabase/Vercel de production depuis cet environnement.
