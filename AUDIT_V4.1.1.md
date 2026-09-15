# Blind Wine V4.1.1 — Revue complète Atlas du Blind

## Périmètre
Revue complète de la V4.1.0, avec contrôle de syntaxe, dépendances, intégrité PWA, isolation du mode Blind, données statiques de l'Atlas, sécurité vis-à-vis des secrets de bouteille et non-régression des autres modes.

## Correctif trouvé pendant la revue
L'Atlas était rendu dans un overlay attaché à `document.body`. S'il restait ouvert au moment où l'hôte lançait la révélation, il pouvait masquer le compte à rebours et le reveal joueur.

Correction V4.1.1 :
- fermeture automatique de l'Atlas avant `renderPlayerReveal()` ;
- fermeture automatique avant l'écran final et le lobby ;
- touche `Échap` pour fermer sur desktop ;
- focus clavier placé sur le bouton Fermer à l'ouverture ;
- restitution du focus au bouton d'origine à la fermeture lorsque celui-ci existe encore.

## Contrôles structurels
- 182 fonctions JavaScript uniques ; 0 doublon.
- 53 handlers inline uniques ; 0 handler sans fonction.
- Syntaxe individuelle de tous les fichiers JS : OK.
- Syntaxe du bundle concaténé dans l'ordre réel de chargement : OK.
- 10 RPC frontend détectés ; 0 RPC absent de `supabase.sql`.
- 0 asset local référencé mais absent.
- 21 entrées du shell Service Worker ; 0 fichier absent.

## Atlas
- 14 grands bassins viticoles ; 14 identifiants uniques.
- 20 fiches cépages ; 20 noms uniques.
- Coordonnées de carte dans le viewBox attendu : OK.
- Aucun accès depuis `blind-guide.js` à `wine_secrets`, `wine_reveals`, aux RPC de révélation ou aux getters Discovery/Challenge.
- L'Atlas reste une référence statique identique quelle que soit la bouteille en cours.

## Non-régression par rapport à V4.0.0
Strictement inchangés :
- `supabase.sql`
- `config.js`
- `manifest.webmanifest`
- `js/auth.js`
- `js/challenge.js`
- `js/core.js`
- `js/discovery.js`
- `js/game.js`
- `js/history.js`
- `js/host.js`
- `js/main.js`
- `js/reveal.js`

Le scoring Blind, les transitions serveur, Discovery et Challenge ne sont pas modifiés.

## Limites
- Audit statique/syntaxique et tests ciblés de cohérence.
- Aucun E2E multi-appareil réel contre le Supabase/Vercel de production n'a été exécuté depuis cet environnement.
- La carte est une carte pédagogique simplifiée des grands bassins, pas un tracé cadastral ou réglementaire des limites AOC.
