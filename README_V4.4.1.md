# Blind Wine V4.4.1 — Post-event code review

Cette version corrige et audite le module caviste post-soirée de V4.4.0.

## Principales corrections
- même score d'affinité dans le dashboard et dans le mail ;
- aucune opportunité nominative affichée pour un participant sans consentement ;
- renvoi manuel d'email réellement distinct grâce à une nouvelle clé d'idempotence ;
- détection d'erreur lors de l'enregistrement du statut d'envoi ;
- comptage par `wine_id` pour éviter les collisions de noms ;
- régions lisibles dans l'email ;
- RLS UPDATE de `post_event_reports` durcie ;
- cache PWA V4.4.1.

Voir `AUDIT_V4.4.1.md` pour le détail.
