# Blind Wine V4.3.1 — Revue complète

Base auditée : V4.2.0 Player Experience, avec intégration effective des briques V4.3 annoncées.

## Corrections / ajouts effectifs
- `Apprends de ton erreur` après reveal : analyse les arômes, acidité, corps, cépage/région joués et la vérité révélée.
- Rivalité : joueur actif au score le plus proche, détection de dépassement en retirant le score de la manche courante.
- Événements prioritaires : Perfect Wine, Zero Absolu, Prix Parfait, Sniper, Loup Solitaire, Nez Absolu, Cartographe, Sang-froid, Coup de bluff.
- Les rivalités excluent les joueurs sans score/participation active.
- Cache PWA bumpé vers `blind-wine-v431-full-code-review`.

## Vérifications statiques
- Tous les fichiers JS passent `node --check`.
- Bundle concaténé selon l'ordre réel de `index.html` : OK.
- 141 fonctions globales, aucun doublon de fonction détecté.
- Aucun doublon de `const` global détecté entre scripts classiques.
- 10 RPC utilisées côté JS, toutes présentes dans `supabase.sql`.
- 21 assets du Service Worker, aucun asset manquant.
- `wine_secrets` reste host-only via RLS.
- Le joueur n'accède aux vérités qu'après leur copie dans `wine_reveals` lors du reveal.
- Aucun changement SQL requis.

## Périmètre non modifié
- Discovery
- Challenge
- Auth
- création/join de partie
- scoring Blind 5 + 3 + 3 = 11 points
- schéma SQL et RLS

## Limite de la revue
Revue statique et de cohérence effectuée localement. Aucun test E2E réel multi-appareils contre le Supabase/Vercel de production n'a été exécuté.
