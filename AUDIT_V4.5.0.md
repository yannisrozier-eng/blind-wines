# Audit V4.5.0 — Clean Install / Mail local

## Changements

- Suppression de Resend et de l’Edge Function d’envoi de rapport.
- Suppression du suivi serveur `post_event_reports` du schéma fresh-install.
- Suppression des déclenchements automatiques d’email dans les écrans finaux caviste.
- Ajout de `openPostEventMail()` : ouvre la messagerie locale via `mailto:` avec l’adresse du caviste, l’objet et un résumé prérempli.
- Ajout de `copyPostEventSummary()`.
- Conservation de `get_post_event_contacts()` afin de révéler au caviste l’email uniquement après consentement explicite et seulement après une partie terminée.
- Export CSV CRM toujours limité aux contacts consentants.
- Nettoyage du ZIP : un seul README, un seul audit, aucune migration historique.

## Contrôles

- Syntaxe individuelle de tous les fichiers JS : OK.
- Bundle concaténé dans l’ordre de `index.html` : OK.
- Aucun appel restant à `post-event-report`, Resend ou `post_event_reports` : OK.
- Assets Service Worker présents : OK.
- `supabase.sql` contient le consentement commercial + RPC sécurisé `get_post_event_contacts` : OK.

## Limite

Un lien `mailto:` ne peut pas joindre automatiquement le CSV de façon portable. Le résumé est prérempli dans le mail ; le CSV complet reste téléchargeable séparément depuis le rapport.
