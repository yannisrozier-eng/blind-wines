# Blind Wine V3.9.0 — Audit expérience joueur Découverte

## Périmètre
Évolution limitée à l'expérience joueur du mode Découverte : mission avant chaque verre, interactions sensorielles visuelles, micro-révélations et progression visible pendant la soirée.

## Changements fonctionnels
- Écran « Mission du verre » avant chaque bouteille.
- Consigne pédagogique concrète adaptée à l'objectif du vin.
- Échelles sensorielles enrichies avec ancres verbales et libellés pour chaque niveau.
- Micro-révélation après chaque choix sensoriel, sans transformer la perception en bonne/mauvaise réponse.
- Progression de soirée visible : verre courant, notions déjà explorées, réussite aux mini-quiz déjà terminés.
- Conseils affichés avant la réponse puis remplacés par le repère après la réponse pour éviter les répétitions.

## Contrôles
- Syntaxe de chaque JS modifié : OK.
- Syntaxe du bundle complet dans l'ordre de chargement : OK.
- 157 fonctions détectées, 0 doublon.
- 43 handlers UI détectés, 0 handler manquant.
- 10 RPC frontend, 0 RPC absent de `supabase.sql`.
- Tests ciblés des échelles, mission, micro-révélation et progression : OK.
- Assets HTML : OK.
- Assets du Service Worker : OK.
- `supabase.sql` strictement identique à la V3.8.1 Fresh Install : aucune migration.
- Modules Blind/Challenge/Auth/Game/History/Reveal/Host/Core/Main inchangés.

## Fichiers modifiés
- `js/discovery.js`
- `js/player.js` — uniquement la branche `experience_mode === "discovery"`
- `styles.css`
- `sw.js` — cache V3.9.0

## Limite
Audit statique, syntaxique et tests ciblés. Aucun test E2E multi-appareil réel contre le Supabase/Vercel de production n'a été exécuté depuis cet environnement.
