# Blind Wine V3.7.1 — Revue complète de cohérence

## Correctif trouvé pendant l'audit
`getHostWines()` ne rechargeait pas `host_note`. La note privée était bien enregistrée dans Supabase et visible pendant la dégustation, mais pouvait sembler vide après un rerender de l'écran de configuration. V3.7.1 ajoute `host_note` à la projection hôte.

## Contrôles
- Syntaxe de chaque fichier JS + Service Worker : OK.
- Bundle concaténé dans l'ordre de chargement : OK.
- Handlers HTML inline : aucune cible manquante.
- RPC frontend : toutes les fonctions appelées existent dans `supabase.sql`.
- RLS `wine_secrets` : SELECT host-only, UPDATE host-only en lobby.
- `host_note` reste dans `wine_secrets` et n'est pas copié dans `wine_reveals`.
- Migration V3.7.0 idempotente : `add column if not exists host_note`.
- Blind : modules/scoring non modifiés par les fonctionnalités Découverte.
- Challenge : `challenge.js` inchangé par rapport à V3.6.5.
- Auth, historique, bootstrap et reveal Blind : inchangés par rapport à V3.6.5.
- `player.js` : modification limitée à la branche Découverte pour charger la réponse du vin précédent.
- Realtime answers présent : le tableau collectif hôte peut se rafraîchir avec les réponses.
- Cache Service Worker bumpé en V3.7.1.

## Limite
Audit statique, syntaxique et de cohérence. Pas de test E2E multi-appareils réel contre le Supabase/Vercel de production depuis cet environnement.
