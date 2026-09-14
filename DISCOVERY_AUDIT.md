# Blind Wine V3.6.4 — Revue de code après évolution Découverte

## Périmètre
Évolution volontairement limitée au mode Découverte. Aucun changement SQL. Les modules Auth, Challenge, Core, Game, History, Main, Player et Reveal restent byte-à-byte identiques à la V3.6.3.

## Contrôles effectués
- ✅ Syntaxe js/core.js
- ✅ Syntaxe js/auth.js
- ✅ Syntaxe js/game.js
- ✅ Syntaxe js/discovery.js
- ✅ Syntaxe js/challenge.js
- ✅ Syntaxe js/player.js
- ✅ Syntaxe js/reveal.js
- ✅ Syntaxe js/host.js
- ✅ Syntaxe js/history.js
- ✅ Syntaxe js/main.js
- ✅ Syntaxe concaténée dans ordre de chargement
- ✅ Aucune fonction dupliquée — []
- ✅ Tous les handlers existent — []
- ✅ Tous les RPC existent — []
- ✅ SQL strictement inchangé
- ✅ Fichiers hors Découverte inchangés — []
- ✅ Assets PWA présents — []
- ✅ Cache V3.6.4 versionné
- ✅ 12 objectifs pédagogiques complets
- ✅ Rendu/fallback/focus Découverte valides — OK
- ✅ Fonction conservée renderPlayerBlindTasting
- ✅ Fonction conservée renderPlayerChallengeTasting
- ✅ Fonction conservée renderHostChallengeReveal
- ✅ Fonction conservée renderPlayerReveal
- ✅ Fonction conservée scoreParts
- ✅ Fonction conservée challengeFactor
- ✅ Challenge.js byte-à-byte identique
- ✅ Player.js byte-à-byte identique

## Fonctionnalités Découverte ajoutées
- 12 objectifs pédagogiques prédéfinis.
- Préremplissage automatique du message à retenir, des repères Œil/Nez/Bouche et du mini-quiz.
- Confirmation avant remplacement d’un contenu pédagogique existant.
- Tous les champs proposés restent modifiables par le caviste.
- Le joueur voit un focus pédagogique contextualisé au bon moment du parcours.
- L’objectif pédagogique est obligatoire avant le lancement d’une soirée Découverte.

## Non-régression
- Aucun changement du scoring Blind.
- Aucun changement du système de risque/indices Challenge.
- Aucun changement SQL/RLS/RPC.
- Aucun changement du profil/historique.

## Limite
Audit statique + tests ciblés de fonctions et rendu HTML généré. Pas de test E2E multi-appareils contre le Supabase de production.