# Audit V4.4.0

- Nouveau module `js/post-event.js` isolé du gameplay.
- Scoring Blind / Challenge inchangé.
- Discovery inchangé hors exploitation post-soirée des notes déjà enregistrées.
- Emails participants non ajoutés à `profiles` et non exposés par RLS.
- RPC `get_post_event_contacts` : host-only, partie terminée, email retourné uniquement si consentement commercial.
- Consentement décoché par défaut et non nécessaire pour rejoindre.
- CSV : uniquement contacts consentants.
- Edge Function : vérifie JWT, host_id et status=finished.
- Envoi idempotent par game_id.
- Clé Resend conservée côté serveur.
- Tests statiques JS et bundle effectués ; pas de test E2E réel Supabase/Resend.
