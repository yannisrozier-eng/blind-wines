# Blind Wine V4.0.0 — Audit Blind gameplay

## Périmètre
Évolution volontairement limitée au parcours joueur du mode **Blind / À l’aveugle**.

## Changements fonctionnels
- Intro de manche plein écran avant chaque vin.
- Sensations reléguées au rôle d’aide à la décision, plus compactes et non obligatoires.
- Zone "Tes paris" dédiée : prix, région, cépages et rappel des 11 points.
- Confirmation de verrouillage avec récapitulatif des 3 paris.
- Écran d’attente Blind plus ludique après verrouillage.
- Reveal 3–2–1 conservé puis score joueur restructuré.
- Animation des points Prix → Région → Cépages.
- Feedback de performance : Parfait / Presque parfait / Bien vu / Tu chauffes / Piège du verre.
- Streaks cumulés sur prix précis, régions exactes et cépages parfaits.
- "Style du soir" dynamique selon la meilleure catégorie cumulée du joueur.
- Classement intermédiaire conservé.

## Contrôles techniques
- 167 fonctions JavaScript détectées.
- 0 fonction dupliquée.
- 93 handlers inline détectés.
- 0 handler sans fonction correspondante.
- 10 RPC frontend détectés.
- 0 RPC absent de `supabase.sql`.
- Syntaxe de chaque fichier JS : OK.
- Syntaxe du bundle concaténé dans l’ordre réel de chargement : OK.
- Assets HTML / Service Worker : aucun manquant.

## Non-régression
Strictement inchangés par rapport à V3.9.1 :
- `config.js`
- `index.html`
- `manifest.webmanifest`
- `supabase.sql`
- `js/auth.js`
- `js/challenge.js`
- `js/core.js`
- `js/discovery.js`
- `js/game.js`
- `js/history.js`
- `js/host.js`
- `js/main.js`
- `js/reveal.js`

Fichiers fonctionnels modifiés :
- `js/player.js`
- `styles.css`
- `sw.js` (cache PWA uniquement)

## Base de données
Aucune migration SQL nécessaire. Le scoring Blind, les règles RLS et les RPC restent inchangés.

## Limite
Audit statique, syntaxique et de cohérence. Aucun test E2E multi-appareils réel contre le Supabase/Vercel de production n'a été exécuté depuis cet environnement.
