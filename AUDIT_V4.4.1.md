# Blind Wine V4.4.1 — Revue complète de code

## Portée
Audit complet de la V4.4.0 : frontend, logique post-soirée, calcul d'affinité, consentement, export CSV, SQL/RLS/RPC, Edge Function d'email, PWA/cache et non-régression des modes Blind / Discovery / Challenge.

## Corrections appliquées
1. **Parité dashboard / email** : l'Edge Function applique maintenant exactement le même moteur d'affinité que `js/post-event.js` (seuil note >= 6, top personnel, affinité cépage, affinité région, perception prix, seuils 58/68/80).
2. **Confidentialité des non-consentants** : la table nominative du rapport n'affiche plus les participants n'ayant pas donné leur consentement commercial. Leurs réponses continuent seulement d'alimenter les statistiques agrégées.
3. **Renvoyer réellement un email** : l'envoi automatique conserve une clé d'idempotence stable, tandis qu'un renvoi manuel utilise une nouvelle clé unique afin que Resend ne déduplique pas volontairement la demande.
4. **Traçabilité de l'envoi** : l'erreur d'upsert dans `post_event_reports` est maintenant vérifiée. Un email envoyé mais non enregistré n'est plus silencieusement considéré comme correctement persisté.
5. **Vins homonymes** : le calcul des opportunités par vin côté email utilise désormais `wine_id` et non le nom du vin, évitant de fusionner deux bouteilles portant le même nom.
6. **Libellés de région dans l'email** : les IDs internes (`rhone_nord`, `loire_touraine`, etc.) sont convertis en libellés lisibles.
7. **Durcissement RLS** : la policy UPDATE de `post_event_reports` revalide maintenant que le nouveau `game_id` appartient également à l'hôte dans le `WITH CHECK`.
8. **Versioning** : cache PWA porté à `blind-wine-v441-post-event-review` et en-tête du schéma fresh install mis à jour.

## Contrôles automatiques
- 12 fichiers JavaScript vérifiés individuellement avec `node --check` : OK.
- Bundle concaténé dans l'ordre réel de `index.html` : OK.
- 45 handlers `onclick` détectés : 0 handler manquant.
- 0 fonction JavaScript globale dupliquée détectée.
- 11 RPC utilisées par le frontend : toutes présentes dans `supabase.sql`.
- 22 assets Service Worker : 0 asset manquant.
- Edge Function : authentification utilisateur, contrôle host, contrôle partie terminée, filtrage consentement, idempotence et contrôle de persistance présents.
- TypeScript : analyse statique sans erreur de syntaxe ; les seuls diagnostics locaux proviennent de l'absence de l'environnement Deno / résolution `npm:` dans `tsc` Node, ce qui est attendu hors runtime Supabase Edge Functions.

## SQL / migrations
- Fresh install : utiliser `supabase.sql` de cette V4.4.1.
- Si V4.4.0 n'a jamais été appliquée sur une base V4.3.1 : appliquer `MIGRATION_V4.4.0.sql` de cette archive (déjà corrigée).
- Si V4.4.0 a déjà été appliquée : appliquer uniquement `MIGRATION_V4.4.1.sql` pour durcir la policy UPDATE.

## Limites de la revue
Pas de test E2E réel contre le projet Supabase de production, pas d'appel réel à Resend, et pas de test multi-appareils. La revue couvre la syntaxe, les dépendances internes, la logique, les permissions déclaratives et la cohérence des flux.
