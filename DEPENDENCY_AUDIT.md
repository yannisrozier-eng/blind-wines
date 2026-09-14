# Blind Wine V3.6.1 — Dependency Audit

## Résumé
- Fonctions JavaScript: **119**
- Fonctions dupliquées: **0**
- Handlers HTML manquants: **0**
- RPC frontend manquants côté SQL: **0**
- GRANT/REVOKE vers fonctions absentes: **0**
- Ambiguïtés RETURNS TABLE / ON CONFLICT détectées: **0**
- Assets HTML manquants: **0**
- Assets Service Worker manquants: **0**
- Assets runtime non cachés: **0**
- SQL inchangé vs V3.6.0: **oui**

## Syntaxe par fichier
- `config.js`: OK
- `js/auth.js`: OK
- `js/challenge.js`: OK
- `js/core.js`: OK
- `js/discovery.js`: OK
- `js/game.js`: OK
- `js/history.js`: OK
- `js/host.js`: OK
- `js/main.js`: OK
- `js/player.js`: OK
- `js/reveal.js`: OK
- `sw.js`: OK

## Dépendances inter-fichiers
- `auth.js` → `core.js` (3 référence(s))
- `auth.js` → `game.js` (3 référence(s))
- `auth.js` → `history.js` (1 référence(s))
- `challenge.js` → `core.js` (4 référence(s))
- `challenge.js` → `game.js` (1 référence(s))
- `challenge.js` → `host.js` (2 référence(s))
- `challenge.js` → `player.js` (6 référence(s))
- `challenge.js` → `reveal.js` (4 référence(s))
- `core.js` → `challenge.js` (1 référence(s))
- `core.js` → `host.js` (2 référence(s))
- `core.js` → `player.js` (2 référence(s))
- `discovery.js` → `core.js` (4 référence(s))
- `discovery.js` → `game.js` (2 référence(s))
- `discovery.js` → `host.js` (1 référence(s))
- `discovery.js` → `player.js` (7 référence(s))
- `game.js` → `auth.js` (1 référence(s))
- `game.js` → `challenge.js` (2 référence(s))
- `game.js` → `core.js` (4 référence(s))
- `game.js` → `discovery.js` (2 référence(s))
- `game.js` → `history.js` (1 référence(s))
- `game.js` → `host.js` (3 référence(s))
- `game.js` → `player.js` (4 référence(s))
- `game.js` → `reveal.js` (1 référence(s))
- `history.js` → `auth.js` (1 référence(s))
- `history.js` → `core.js` (4 référence(s))
- `history.js` → `game.js` (2 référence(s))
- `host.js` → `core.js` (8 référence(s))
- `host.js` → `discovery.js` (2 référence(s))
- `host.js` → `game.js` (5 référence(s))
- `host.js` → `history.js` (1 référence(s))
- `main.js` → `auth.js` (1 référence(s))
- `main.js` → `core.js` (1 référence(s))
- `player.js` → `challenge.js` (1 référence(s))
- `player.js` → `core.js` (9 référence(s))
- `player.js` → `discovery.js` (4 référence(s))
- `player.js` → `game.js` (6 référence(s))
- `player.js` → `history.js` (1 référence(s))
- `player.js` → `reveal.js` (5 référence(s))
- `reveal.js` → `core.js` (8 référence(s))
- `reveal.js` → `game.js` (2 référence(s))
- `reveal.js` → `host.js` (2 référence(s))

## Ordre de chargement
- `./js/core.js`
- `./js/auth.js`
- `./js/game.js`
- `./js/discovery.js`
- `./js/challenge.js`
- `./js/player.js`
- `./js/reveal.js`
- `./js/host.js`
- `./js/history.js`
- `./js/main.js`

## Notes
- Les scripts restent classiques afin que les handlers HTML générés restent accessibles globalement.
- `main.js` est chargé en dernier et appelle `boot()` uniquement après définition de toutes les fonctions.
- `config.js` est traité en network-first par le Service Worker afin d’éviter une ancienne configuration Supabase figée en cache.
- Le refactor ne modifie pas `supabase.sql`.
