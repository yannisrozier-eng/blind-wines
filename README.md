# Blind Wine V4.6.0

Version actuelle centrée sur :
- expérience joueur Blind / Discovery / Challenge,
- rapport caviste post-soirée orienté commercial,
- consentement commercial explicite,
- export CSV CRM,
- email rapide via `mailto:`,
- email design HTML via fichier `.eml`, sans Resend ni domaine.

## Installation neuve
1. Exécuter `supabase.sql` dans Supabase SQL Editor.
2. Renseigner `config.js` avec l'URL Supabase et la publishable key.
3. Déployer les fichiers à la racine sur GitHub/Vercel.
4. Configurer les URLs Magic Link dans Supabase Auth.

## Mise à jour depuis V4.5.0
Si le RPC de consentement V4.5.1 n'a jamais été installé, exécuter `MIGRATION_V4.5.1.sql`.
Aucun SQL supplémentaire n'est requis pour la V4.6.0.

Voir `README_V4.6.0.md` pour le détail du rapport commercial.
