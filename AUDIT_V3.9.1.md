# Blind Wine V3.9.1 — Revue complète de code et cohérence

## Périmètre
Revue du build V3.9.0 centré sur l'expérience joueur du mode Découverte. Les correctifs V3.9.1 restent limités au parcours joueur Découverte, à la robustesse de ses chargements et au cache PWA.

## Correctifs apportés
- Les étapes sensorielles ne peuvent plus être sautées depuis l'interface Découverte :
  - Œil : intensité visuelle requise.
  - Nez : intensité aromatique + au moins une famille d'arômes requises.
  - Bouche : acidité, douceur, corps, persistance + note plaisir requises.
- `submitAnswer()` revérifie l'intégralité des repères sensoriels avant de verrouiller un verre Découverte, utile notamment après restauration d'une ancienne session.
- La barre `Ton parcours` reflète maintenant réellement la position du joueur : vin 1/N > 0 % et dernier vin = 100 %.
- Les erreurs Supabase lors du chargement de la progression et de la distribution collective sont désormais remontées au lieu d'être silencieusement interprétées comme des données vides.
- Suppression du double attribut `disabled` sur le CTA final Découverte.
- Cache Service Worker : `blind-wine-v391-code-review`.

## Contrôles structurels
- Syntaxe individuelle de tous les fichiers JS : OK.
- Syntaxe du bundle complet dans l'ordre réel de chargement : OK.
- 157 fonctions détectées, 0 doublon.
- 43 handlers inline détectés, 0 handler manquant.
- 10 RPC frontend détectés, 0 RPC absent de `supabase.sql`.
- Tous les assets locaux référencés par `index.html` sont présents.

## Non-régression
Comparaison byte-à-byte avec la V3.9.0 : seuls les fichiers suivants changent fonctionnellement :
- `js/discovery.js`
- `js/player.js`
- `sw.js`

`supabase.sql` est strictement identique à la V3.9.0 / V3.8.1 Fresh Install.
Aucun changement du scoring Blind, du Challenge, de l'authentification, de l'historique, des écrans hôte ou des RPC serveur.

## Limite
Audit statique, syntaxique et logique ciblé. Aucun test E2E multi-appareil réel n'a été exécuté contre le Supabase/Vercel de production.
