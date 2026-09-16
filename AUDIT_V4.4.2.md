# Audit V4.4.2

## Problèmes reproduits par lecture du flux

### Navigation Discovery
`setDiscoveryStep()` rerendait la nouvelle étape sans modifier la position de défilement. Sur mobile, le joueur pouvait donc arriver au milieu de la nouvelle étape.

Correction : helper `scrollDiscoveryStageTop()` exécuté après le rendu réussi de chaque changement d'étape.

### Comparaison vin 2+
Dans V4.4.1 :

```js
const saved=await upsertAnswer(...);
if(!saved)renderPlayerTasting();
```

La condition était inversée. En cas de sauvegarde réussie, le cache et la base recevaient bien `discovery_compare`, mais le DOM conservait l'ancien bouton `disabled`.

Correction :

```js
if(saved) await renderPlayerTasting();
```

## Validation
- Tous les fichiers `js/*.js` passent `node --check`.
- Le bundle concaténé dans l'ordre de `index.html` passe `node --check`.
- Le garde-fou SQL Discovery exige toujours le mini-quiz et, à partir du vin 2, un objet `discovery_compare` avec `choice` + `metric` valides.
- `submitAnswer()` attend les écritures en attente puis recharge la réponse avec `force=true` avant validation.
- Aucun changement de scoring, RLS, RPC, Discovery host, Blind, Challenge ou rapport caviste.
- Aucune migration SQL.

## Limite
Pas de test E2E réel multi-appareils sur l'instance Supabase/Vercel de production.
