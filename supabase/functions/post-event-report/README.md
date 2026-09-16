# Edge Function `post-event-report`

Envoie le rapport post-soirée au compte email de l'organisateur via Resend.

Secrets à configurer dans Supabase > Edge Functions > Secrets :
- `RESEND_API_KEY` : clé Resend.
- `REPORT_FROM_EMAIL` : expéditeur vérifié, ex. `rapports@tondomaine.fr`.
- `REPORT_FROM_NAME` : facultatif, ex. `Blind Wine`.
- `SITE_URL` : facultatif, défaut `https://blind-wines.vercel.app/`.

`SUPABASE_URL` et `SUPABASE_ANON_KEY` sont fournis par l'environnement Supabase.

La fonction vérifie le JWT, que l'utilisateur est bien l'hôte, que la partie est terminée, et utilise une clé d'idempotence par partie.
