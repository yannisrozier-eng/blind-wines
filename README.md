# Blind Wine V4.6.3 — Full Reinstall

Pack propre pour repartir de zéro sur le même projet Supabase et redéployer l'application.

## 1 — Nettoyer Supabase
Dans **Supabase → SQL Editor → New query** :
1. Ouvre `RESET_SUPABASE.sql`
2. Copie tout
3. Clique **Run**

Ce reset supprime toutes les données et objets **Blind Wine** du schéma `public`.
Il conserve volontairement **Authentication > Users** afin de ne pas casser la configuration Auth du projet.

### Si tu veux aussi supprimer tous les comptes de test
Dans **Supabase → Authentication → Users**, supprime les utilisateurs de test avant l'étape 2.
Ne supprime pas le projet Supabase lui-même.

## 2 — Réinstaller le schéma complet
Toujours dans **SQL Editor → New query** :
1. Ouvre `supabase.sql`
2. Copie tout
3. Clique **Run**

`supabase.sql` est la seule source de vérité. Aucune ancienne migration n'est nécessaire.
Il recrée notamment : tables, contraintes, RLS, RPC, profils, consentement commercial et récupération sécurisée des emails consentis.

## 3 — Vérifier Auth
Dans **Authentication → URL Configuration** :
- Site URL : `https://blind-wines.vercel.app`
- Redirect URLs : ajoute `https://blind-wines.vercel.app/**`

## 4 — Configurer l'application
Dans `config.js`, renseigne uniquement :
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Ne mets jamais de `service_role` dans le frontend.

## 5 — GitHub / Vercel
Le ZIP est directement déployable. Upload son contenu à la racine du repo GitHub, puis laisse Vercel redéployer.

## Ordre exact
`RESET_SUPABASE.sql` → éventuellement supprimer les comptes Auth de test → `supabase.sql` → config.js → GitHub/Vercel → hard refresh/PWA relaunch.


## V4.6.3
En mode Découverte, les notes sensorielles 1–5 sont mises à jour localement sans rerender complet de la page, supprimant le saut/vibration écran à chaque sélection. Aucun changement SQL.
