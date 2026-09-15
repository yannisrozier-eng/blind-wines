# Blind Wine V4.1.0 — Audit Atlas du Blind

## Périmètre
Évolution strictement limitée à l'aide générale du mode Blind.

## Fonctionnalités
- Carte pédagogique de France avec 14 grands bassins viticoles cliquables.
- 14 fiches régions : climat, style, rouges, blancs, repères fréquents, appellations.
- 20 fiches cépages : couleur, régions, corps, acidité, marqueurs classiques.
- Recherche textuelle dans régions et cépages.
- Comparaison de deux hypothèses régionales.
- L'ancien mémo reste disponible dans Challenge, inchangé.

## Sécurité du jeu
- `js/blind-guide.js` ne référence ni `wine_secrets`, ni `wine_reveals`, ni `getCurrentReveal`, ni les RPC Discovery/Challenge.
- L'Atlas ne reçoit aucun identifiant de vin et ne lit aucune donnée de la bouteille courante.
- Toutes les données de l'Atlas sont statiques et identiques pour chaque manche et chaque joueur.
- Aucun SQL/RLS/RPC modifié.

## Contrôles techniques
- Syntaxe individuelle de tous les JS : OK.
- Syntaxe bundle complet dans l'ordre réel de chargement : OK.
- 182 fonctions JavaScript, 0 doublon.
- 53 handlers UI détectés, 0 manquant.
- 10 RPC frontend détectés, 0 RPC absent du SQL.
- 21 assets Service Worker, 0 manquant.
- 14 régions, 0 identifiant dupliqué, 0 coordonnée hors carte.
- 20 cépages, 0 nom dupliqué, 0 fiche incomplète.

## Non-régression V4.0.0
Strictement inchangés :
- `js/auth.js`
- `js/challenge.js`
- `js/core.js`
- `js/discovery.js`
- `js/game.js`
- `js/history.js`
- `js/host.js`
- `js/main.js`
- `js/reveal.js`
- `supabase.sql`
- `manifest.webmanifest`
- `config.js`

`js/player.js` : une seule modification fonctionnelle : remplacement du mémo général par le bouton `Atlas du blind` dans `renderPlayerBlindTasting()`.

## Fichiers ajoutés/modifiés
- `js/blind-guide.js` — nouveau module statique Atlas.
- `js/player.js` — intégration Blind uniquement.
- `styles.css` — styles préfixés `.blind-atlas-*`.
- `index.html` — chargement du module Atlas.
- `sw.js` — cache V4.1.0 et ajout du module au shell PWA.

## Limite
La carte est volontairement pédagogique et simplifiée. Les points indiquent les grands bassins viticoles et ne représentent pas les limites exactes des AOC/AOP.
