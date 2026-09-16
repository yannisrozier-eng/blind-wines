# Blind Wine V4.4.0 — Rapport post-soirée caviste

## Livré
- Consentement commercial participant facultatif et décoché par défaut.
- Rapport détaillé caviste après une partie terminée.
- Analyse groupe : participation, vins préférés, vin clivant, styles/cépages/régions appréciés.
- Opportunités commerciales par vin et par participant.
- Niveau d'affinité explicable : Forte / Bonne / À explorer.
- Emails visibles/exportables uniquement pour les participants consentants.
- Export CSV compatible CRM.
- Envoi automatique d'un rapport au compte email de l'organisateur via Supabase Edge Function + Resend.
- Envoi idempotent par partie + bouton de renvoi manuel.

## Mise à jour d'une base existante
Exécuter `MIGRATION_V4.4.0.sql` dans Supabase SQL Editor.

## Email automatique
Le code de la fonction est dans `supabase/functions/post-event-report/index.ts`.
Créer/déployer la fonction `post-event-report` dans Supabase Dashboard, puis ajouter les secrets :
- RESEND_API_KEY
- REPORT_FROM_EMAIL (domaine vérifié dans Resend)
- REPORT_FROM_NAME (optionnel)
- SITE_URL (optionnel)

Sans cette configuration, tout le dashboard + CSV fonctionne ; seul l'envoi réel du mail reste indisponible.
