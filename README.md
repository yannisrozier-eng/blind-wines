# Blind Wine V3.5.1 — Revue complète de cohérence

Cette version succède à la V3.5.0 et peut être utilisée sur une installation neuve ou une base déjà existante.

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


## Mise à jour depuis V3.5.0
1. Sauvegarder par précaution les données importantes.
2. Exécuter le `supabase.sql` V3.5.1 en entier dans Supabase SQL Editor. Le bloc de migration legacy a été rendu idempotent et ne réécrase plus `wine_secrets`.
3. Remplacer `index.html`, `sw.js`, `manifest.webmanifest` et `README.md` sur GitHub.
4. Conserver le `config.js` déjà configuré avec ton URL et ta Publishable Key Supabase.
5. Laisser Vercel redéployer puis faire un rechargement forcé du navigateur.

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

## V3.5.0 — Suppression d'une partie
- L'organisateur peut supprimer une partie depuis la carte "Partie en cours" sur l'accueil.
- Confirmation obligatoire avant suppression.
- Suppression sécurisée via RPC Supabase `delete_game(uuid)`.
- Seul le host authentifié peut supprimer la partie.
- La session locale est nettoyée après suppression.


## V3.5.1 — Revue complète de cohérence
- Migration SQL rendue réellement réexécutable : les anciennes colonnes vides de `wines` ne peuvent plus écraser `wine_secrets`.
- Séparation serveur des champs Blind / Discovery / Challenge dans `guard_answer_write()`.
- Challenge : 2 indices obligatoires par bouteille côté client et côté SQL.
- Challenge : correction du score brut (il n'est plus déjà pénalisé).
- Challenge : explication pédagogique affichée après révélation.
- Blind et Challenge : suppression de l'aide gratuite régions/cépages ; le Blind redevient zéro indice et le Challenge réserve l'aide aux indices pénalisants.
- Découverte : correction de l'option de quiz affichée à tort comme sélectionnée lorsque `quiz_correct` vaut NULL.
- Realtime : les validations joueurs rafraîchissent à nouveau correctement l'écran hôte spécifique au mode.
- Navigation : les événements Realtime ne forcent plus le retour dans la partie quand l'utilisateur est sur Accueil / Profil / Création.
- Suppression distante d'une partie : nettoyage propre de la session si la partie disparaît.
- `config.js` manquant ne provoque plus un écran blanc ; message de configuration à la place.
- Nettoyage de la référence résiduelle `supabase` après renommage en `supabaseClient`.
- Statistiques Challenge et Découverte rendues plus spécifiques au mode.
- PWA : `config.js` ajouté au shell de cache, cache versionné V3.5.1.

- `create_game` exige désormais explicitement `experience_mode` côté serveur : plus aucun mode Blind implicite.
- Mini-quiz Découverte normalisé : un quiz personnalisé est utilisé uniquement s'il est complet ; sinon question/options/correction/explication de fallback restent cohérentes ensemble.

- Cycle de vie de session clarifié : une partie terminée n'est plus libellée « en cours ».
- Nouveau bouton « Fermer/Quitter cette session » : retire seulement le raccourci local et conserve toutes les données/historique.
- La suppression serveur reste réservée à l'organisateur et aux parties non terminées depuis la carte d'accueil.

- Scoring région réaligné sur la règle produit : exact = 3, vraie relation parent/enfant = 2, proximité géographique non exacte = 1. Les appellations sœurs ne reçoivent plus 2 points.
- Alias cépages complétés : Shiraz↔Syrah, Monastrell↔Mourvèdre, Rolle↔Vermentino, y compris lorsqu'un ancien enregistrement contient seulement l'un des alias.

- Nettoyage de deux helpers frontend devenus inutilisés (`makeCode`, `selectedValues`).

## V3.5.2 — Recherche dans les sélecteurs
- Recherche instantanée, insensible aux accents et à la casse.
- Cépages : recherche disponible pour l'organisateur et les joueurs, tout en conservant le multi-sélection.
- Région / appellation : remplacement du long select natif par un picker recherchable.
- Les chemins de régions sont visibles (ex. appellation · région · pays) pour éviter les ambiguïtés.
- Optimisé mobile : liste scrollable, champ de recherche sticky, bouton d'effacement.
- Les arômes restent volontairement sous forme de chips visuelles pour préserver l'expérience sensorielle.

## V3.5.3 — Correctif recherche
- Corrige le contraste des sélecteurs recherchables : fond blanc, texte lisible et cohérent avec le thème de l'app.
- Corrige le filtrage dynamique : les résultats masqués le sont réellement même avec les styles flex/grid.
- Recherche déclenchée à chaque frappe via `input`, avec fallback `addEventListener`.
- Recherche insensible à la casse et aux accents : `rhone`, `Rhône` et `RHÔNE` correspondent.
- Normalisation supplémentaire des apostrophes, tirets et ponctuation pour améliorer les recherches.

## V3.5.4 — Correctif `join_game`
- Corrige l'erreur PostgreSQL `column reference "game_id" is ambiguous` lors de l'arrivée d'un joueur.
- Cause : `game_id` est à la fois une colonne de sortie de `RETURNS TABLE` et une colonne de `players`.
- `ON CONFLICT (game_id,user_id)` est remplacé par `ON CONFLICT ON CONSTRAINT players_game_id_user_id_key`.
- Aucun changement d'API frontend.
