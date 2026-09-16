# Blind Wine V4.6.0 — Rapport commercial caviste

## Nouveautés
- Rapport caviste entièrement repensé en dashboard commercial.
- Résumé exécutif en 30 secondes.
- Podium des vins à potentiel.
- Lecture audience : styles, cépages et régions les mieux notés.
- Opportunités regroupées : chaudes / bonnes / à explorer.
- Plan d'action commercial automatique.
- Email design `.eml` avec HTML inline et destinataire = email du compte caviste.
- Email rapide `mailto:` conservé comme fallback universel.
- Règle de consentement inchangée : email visible uniquement si consentement explicite.
- CSV CRM limité aux contacts consentants.

## Limite importante
Un lien `mailto:` standard ne peut pas imposer un rendu HTML riche de manière fiable. Le bouton **Créer l'email design** génère donc un fichier `.eml` contenant le rapport HTML. Il peut être ouvert dans un client compatible (Outlook, Apple Mail, Thunderbird selon l'environnement) puis envoyé. Le bouton **Email rapide** fonctionne partout mais reste en texte structuré.
