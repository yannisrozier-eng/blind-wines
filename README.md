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
