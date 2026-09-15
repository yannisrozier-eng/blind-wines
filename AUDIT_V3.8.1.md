# Blind Wine V3.8.1 — Revue complète de code et cohérence

## Résumé
Revue effectuée à partir du build V3.8.0. Deux incohérences fonctionnelles réelles ont été identifiées et corrigées.

### Correctif 1 — progression personnelle déterministe
La comparaison « début / fin » utilisait l’ordre brut renvoyé par Supabase pour les réponses. Cet ordre n’est pas garanti. La progression peut donc être calculée avec des vins dans le mauvais ordre.

Correction : les réponses Découverte sont maintenant triées explicitement selon la position des vins avant le calcul. Le wording a aussi été rendu plus exact : « Première moitié / Deuxième moitié » et « réussite aux mini-quiz », afin de ne pas présenter deux notions différentes comme un test pré/post strict.

### Correctif 2 — comparaison réellement obligatoire côté serveur
Le frontend exigeait une comparaison à partir du deuxième vin, mais le trigger SQL ne l’imposait pas au moment de `done=true`. Un client contournant l’UI pouvait verrouiller le verre sans comparaison.

Correction : pour Découverte, à partir du deuxième vin, le serveur exige maintenant `choice` + `metric`. Le premier vin refuse toute comparaison. Les clés JSON supplémentaires sont rejetées.

### Correctif 3 — objectif global de soirée cohérent
Le thème global était obligatoire mais le texte « ce que les participants doivent retenir » ne l’était pas. Il est désormais vérifié côté frontend et dans `start_game()`.

### Correctif 4 — CTA joueur
Le bouton « Terminer ce verre » reste désactivé tant que la comparaison requise n’a pas été effectuée.

## Contrôles automatisés
- Syntaxe de chaque JS : OK
- Syntaxe du bundle concaténé dans l’ordre réel de chargement : OK
- 151 fonctions JS : 0 doublon
- 42 handlers inline : 0 handler manquant
- 10 RPC frontend : 0 RPC absent du SQL
- 15 références locales HTML : 0 fichier manquant
- 18 assets Service Worker : 0 fichier manquant
- Cache Service Worker : `blind-wine-v381-coherence-review`

## Non-régression
Strictement inchangés par rapport à V3.7.1 :
- `js/auth.js`
- `js/challenge.js`
- `js/core.js`
- `js/history.js`
- `js/main.js`
- `js/reveal.js`
- `config.js`
- `manifest.webmanifest`

Le scoring Blind, les multiplicateurs Challenge, l’authentification et l’historique ne sont pas modifiés.

## Sécurité / cohérence SQL
- `host_note` reste dans `wine_secrets` et n’est pas copié dans `wine_reveals`.
- `discovery_compare` est refusé dans Blind et Challenge.
- En Découverte, la comparaison n’accepte que les choix `previous/current/similar` et les métriques autorisées.
- Les objets de comparaison incomplets ou contenant des clés supplémentaires sont rejetés.
- Le vin 1 ne peut pas avoir de comparaison.
- À partir du vin 2, une comparaison complète est requise avant `done=true`.
- Le thème et l’objectif global sont requis avant le démarrage d’une partie Découverte.

## Limite de validation
Revue statique, tests de cohérence et contrôles de dépendances effectués localement. Aucun test E2E multi-appareils réel contre le Supabase/Vercel de production n’a été exécuté dans cet environnement.
