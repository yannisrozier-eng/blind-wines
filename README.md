# Blind Wine V3.4.5 — Full Audit / Fresh Install

Cette version remplace V3.4.4 pour une installation Supabase neuve.

## Corrections importantes
- `profiles` existe désormais avant la compilation de `create_game()` / `join_game()`.
- `config.js` ne contient plus l'URL d'un ancien projet Supabase supprimé.
- Le code `?game=ABCDE` est conservé à travers le Magic Link.
- Score Challenge cohérent sur l'écran de révélation joueur (100 % / 75 % / 50 %).
- Classement final avec égalités en classement de compétition.
- Badges finaux compatibles avec les ex æquo.
- Mini-quiz Découverte générique cohérent jusque dans les écrans de révélation.
- Un joueur n'ayant pas validé son quiz n'est plus considéré comme ayant répondu correctement par conversion `null -> 0`.
- Validation serveur et frontend des quiz personnalisés (2 à 4 choix + réponse valide).
- Contraintes d'intégrité sur `quiz_options`.
- Un vin / secret ne peut plus être déplacé accidentellement vers une autre partie ou position.
- Correction du HTML des boutons d'arômes : les chaînes JSON n'endommagent plus les attributs `onclick`.
- Cache PWA incrémenté.

## Installation neuve
1. Créer un nouveau projet Supabase.
2. Exécuter `supabase.sql` en entier.
3. Renseigner `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` dans `config.js`.
4. Déployer tous les fichiers sur Vercel.
5. Ajouter l'URL Vercel dans Supabase Authentication > URL Configuration.
6. Tester les trois modes avec plusieurs comptes.

## Limite
Validation statique approfondie effectuée. Pas de vrai test E2E contre ton projet Supabase réel.

## V3.4.6 — Correctif page blanche
- Corrige `Identifier 'supabase' has already been declared`.
- Le SDK CDN possède déjà le global `window.supabase`.
- L'état applicatif utilise désormais `supabaseClient`, sans collision de nom.

## V3.4.7 — Sélection obligatoire du mode
- Nouveau parcours organisateur en 2 étapes.
- Étape 1 : choix explicite entre À l'aveugle / Découverte / Challenge.
- Aucun mode par défaut silencieux : impossible de créer une partie sans sélection.
- Étape 2 : configuration des bouteilles.
- Le mode choisi est rappelé clairement dans le lobby organisateur.

## V3.4.8 — Trois modes réellement distincts

### 🎯 À l'aveugle
- Aucun indice.
- Fiche de dégustation + prix/région/cépages.
- Révélation classique.
- Classement sommelier et badges de précision.

### 🎓 Découverte
- Vin connu dès le départ.
- Parcours Œil → Nez → Bouche → Comprendre.
- Mini-quiz et explications pédagogiques.
- Aucun podium de connaissance ; bilan collectif et apprentissage.

### 🥂 Challenge
- Expérience séparée de Blind.
- Indices progressifs et score potentiel visible.
- 0 indice = x1 ; 1 indice = x0,75 ; 2 indices = x0,50.
- Révélation dédiée Brut → Indices → Multiplicateur → Final.
- Classement final dédié à la prise de risque, avec badges Champion du risque / Sans filet / Stratège.

## V3.4.9 — Navigation Accueil / reprise de partie
- Ajoute un bouton Accueil flottant pendant une partie.
- Revenir à l'accueil ne supprime ni la session ni la partie.
- L'accueil affiche une carte "Partie en cours" avec bouton de reprise.
- Fonctionne pour organisateur et joueur, dans les 3 modes.
- La restauration automatique de session reste active après rechargement du navigateur.
