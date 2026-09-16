# Audit V4.5.1 — Consentement commercial

## Bug corrigé
Le rapport post-soirée utilisait le résultat du RPC `get_post_event_contacts` comme source de vérité du consentement. Si ce RPC ne renvoyait pas correctement la ligne ou l'email, un consentement pourtant enregistré dans `players.commercial_consent` pouvait être interprété comme absent.

## Correctifs
- `players.commercial_consent` devient la source de vérité pour le rapport.
- `get_post_event_contacts` ne sert plus qu'à exposer l'email quand le consentement est vrai.
- Après `join_game`, le frontend vérifie que la valeur enregistrée correspond à la case cochée.
- En cas d'écart, le RPC sécurisé `set_commercial_consent` resynchronise la ligne du participant.
- Le RPC ne permet de modifier que sa propre participation et uniquement avant la fin de partie.

## Installation
- Nouvelle installation : exécuter `supabase.sql`.
- Base V4.5.0 existante : exécuter `MIGRATION_V4.5.1.sql` une seule fois.
