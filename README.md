# Blind Wine V4.5.0 — Clean Install

Version propre destinée à une **réinstallation complète** de Blind Wine.

## Ce qui est inclus

- Blind : parcours guidé, arômes détaillés obligatoires, moteur de déduction, comparateur, confiance, reveal, apprentissage, rivalités et événements.
- Discovery : parcours Œil → Nez → Bouche → Comprendre, mini-quiz, comparaison entre vins et dashboard caviste temps réel.
- Challenge : indices et scoring risque/récompense.
- Comptes Supabase Magic Link, historique et progression.
- Rapport caviste post-soirée avec statistiques, affinités commerciales et export CSV.
- Consentement commercial facultatif : l’email d’un participant n’est visible que s’il a accepté.
- **Envoi du résumé par la messagerie du caviste via `mailto:`** : aucun Resend, aucune Edge Function, aucun domaine email à configurer.

## Installation Supabase — nouvelle installation

1. Crée un nouveau projet Supabase.
2. Ouvre **SQL Editor**.
3. Copie/colle puis exécute **uniquement `supabase.sql`** en entier.
4. Dans **Authentication → URL Configuration** :
   - Site URL : l’URL de ton site Vercel.
   - Redirect URL : ajoute ton URL Vercel avec `/**` si nécessaire.
5. Récupère l’URL du projet et la **Publishable Key**.
6. Mets-les dans `config.js`.

Ne mets jamais de `service_role` ou secret dans `config.js`.

## Déploiement Vercel / GitHub

Envoie à la racine du dépôt :

- `index.html`
- `styles.css`
- `config.js`
- `supabase.sql` (peut rester dans le dépôt, il n’est pas exécuté par Vercel)
- `manifest.webmanifest`
- `sw.js`
- les icônes / image OG
- le dossier `js/`

Puis laisse Vercel redéployer. Après la première mise en ligne, ferme/réouvre la PWA ou force l’actualisation.

## Rapport caviste par email — sans service externe

Dans le rapport de fin de partie :

- **📧 Ouvrir dans ma boîte mail** ouvre le client mail du caviste ;
- le destinataire est l’adresse email du compte caviste connecté ;
- l’objet et le résumé de soirée sont déjà remplis ;
- le caviste appuie ensuite lui-même sur **Envoyer** ;
- aucun email n’est envoyé automatiquement par Blind Wine.

Le résumé contient les statistiques et opportunités. Pour un participant sans consentement, il affiche **Email non partagé**.

L’export **CSV CRM** contient uniquement les participants ayant donné leur consentement et disposant d’un email.

## Fichiers volontairement supprimés

Cette archive propre ne contient plus :

- les anciennes migrations de version ;
- les anciens README / audits historiques ;
- la fonction Supabase `post-event-report` ;
- Resend ;
- la table de suivi d’envoi automatique `post_event_reports`.

Pour une nouvelle installation, **`supabase.sql` est la seule source de vérité de la base**.
