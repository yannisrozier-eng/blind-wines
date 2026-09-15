# Blind Wine V3.8.1 — Fresh install

Ce ZIP est le build complet à utiliser si la V3.8.0 n'a jamais été installée.

## 1. Supabase
Dans le nouveau projet Supabase :
1. Ouvre **SQL Editor**.
2. Copie **tout** le contenu de `supabase.sql`.
3. Exécute-le en une seule fois.
4. Il n'y a **aucune migration V3.7 / V3.8 / V3.8.1 à exécuter séparément**.

Le script crée/alimente directement : tables, colonnes, contraintes, triggers, RLS, policies, RPC, grants, profils et Realtime.

## 2. Configuration frontend
Conserve/renseigne dans `config.js` uniquement :
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

N'utilise jamais une service-role key dans le navigateur.

## 3. GitHub / Vercel
Décompresse le ZIP puis envoie **les fichiers extraits et le dossier `js/`**, pas le ZIP lui-même.

Si ton dépôt contient déjà Blind Wine, remplace le contenu par ce build mais garde ton `config.js` de production si ses valeurs sont déjà correctes.

Vercel redéploiera automatiquement depuis GitHub.

Après le déploiement, fais une actualisation forcée (`Ctrl+F5`) ou ferme/réouvre la PWA sur iPhone.

## Version
Frontend + SQL : **V3.8.1 Fresh Install**.
