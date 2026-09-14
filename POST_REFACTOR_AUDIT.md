# Blind Wine V3.6.2 — Audit complet post-refactor

## Résumé
Audit réalisé après le découpage du monolithe `index.html` en HTML/CSS/10 scripts JS.

### Régression critique corrigée
`js/main.js` contenait deux fois le bloc d'initialisation. Cela provoquait deux appels à `boot()`, deux registrations du Service Worker et deux jeux de listeners réseau. Corrigé : chaque initialisation n'existe plus qu'une seule fois.

## Contrôles techniques
- Syntaxe de chaque fichier JS : OK (`node --check`).
- Syntaxe du bundle concaténé dans l'ordre réel de chargement : OK.
- 120 fonctions JS, aucune duplication.
- Aucun handler `onclick` / `onchange` / `oninput` ne pointe vers une fonction manquante.
- Tous les RPC appelés par le frontend existent dans `supabase.sql`.
- Toutes les cibles `GRANT/REVOKE` existent après leur `CREATE FUNCTION`.
- Toutes les tables applicatives ont RLS activé.
- `supabase.sql` est strictement identique au build V3.6.0 : aucune migration nécessaire.
- 17 assets référencés par HTML/manifest : tous présents.
- 20 entrées du shell PWA : toutes présentes.
- Tous les fichiers runtime servis localement répondent HTTP 200 avec le bon type MIME.
- `main.js` : 1 seul `boot()`, 1 listener online, 1 registration Service Worker.

## Tests métier ciblés
- `Rhône` = `RHONE` : OK.
- `Côtes-du-Rhône` = `cotes du rhone` : OK.
- Prix exact = 5 points : OK.
- Prix à +20 % = 4 points : OK.
- Margaux/Margaux = 3 points : OK.
- Bordeaux/Margaux = 2 points : OK.
- Pauillac/Margaux = 1 point : OK.
- Shiraz = Syrah : OK.
- Rolle = Vermentino : OK.
- Challenge 1 indice = ×0,75 : OK.
- Challenge 2 indices = ×0,50 : OK.

## UX vérifiée / corrigée
- Fiche joueur mobile-first conservée après refactor.
- Bouton Accueil et CTA sticky conservent leur hiérarchie de z-index.
- Sélecteurs région/cépages, recherche dynamique et mémo régions/cépages présents.
- Breakpoints spécifiques 700 / 560 / 430 / 360 px conservés.
- Tableaux de résultats : ajout d'un scroll horizontal sur mobile pour éviter l'écrasement des colonnes.
- Header petit écran : ellipsis et largeur limitée déjà présents.
- Focus clavier visible conservé.
- Barre réseau : ajout `role=status` + `aria-live=polite`.
- Open Graph : image et URL passées en URL absolue pour une miniature plus fiable sur les plateformes de partage.

## Architecture après refactor
- `core.js` : état partagé, catalogues, scoring, primitives UI.
- `auth.js` : auth et profil.
- `game.js` : session, navigation, Realtime et cycle de jeu.
- `discovery.js` : mode Découverte.
- `challenge.js` : mode Challenge.
- `player.js` : écrans joueur / fiche de dégustation.
- `reveal.js` : révélations et classement intermédiaire Blind.
- `host.js` : création/configuration/lobby/hôte/final.
- `history.js` : profil, statistiques et progression.
- `main.js` : bootstrap, réseau, PWA, MutationObserver.

## Points non bloquants à traiter ensuite
1. Configuration hôte Découverte toujours longue : idéalement accordéon par bouteille.
2. `alert()` est encore utilisé comme système de toast : fonctionnel mais peu élégant sur mobile.
3. Les CDN Supabase/QRCode restent externes et ne sont pas contrôlés par le Service Worker.
4. Les réponses révélées restent lisibles par les membres selon la RLS actuelle ; un futur RPC d'agrégation renforcerait la confidentialité.
5. Il manque toujours un E2E réel multi-appareils connecté à la production pour valider réseau/Reatime/Magic Link dans les conditions réelles.

## Conclusion
Le refactor est cohérent après correction du double bootstrap. Aucun changement SQL n'est nécessaire. Le build V3.6.2 est prêt pour déploiement et test multi-appareils.
