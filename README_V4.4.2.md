# Blind Wine V4.4.2 — Discovery player fixes

Correctifs ciblés côté joueur en mode Discovery.

## 1. Navigation Œil → Nez → Bouche → Comprendre
À chaque changement d'étape via `setDiscoveryStep`, la nouvelle vue est rendue puis la page remonte automatiquement en haut.

## 2. Vin 2+ : bouton « Terminer ce verre »
Correction de `setDiscoveryComparison` : le rendu était déclenché sur échec (`if(!saved)`) au lieu de succès. La comparaison était donc enregistrée mais le bouton restait visuellement désactivé jusqu'à un autre rerender.

Désormais, après sélection de `Vin précédent`, `Très proches` ou `Ce vin`, la réponse est enregistrée puis la vue est immédiatement rerendue. Le bouton de fin reflète donc correctement l'état quiz + comparaison.

## Base de données
Aucune migration SQL nécessaire.

## Cache PWA
`blind-wine-v442-discovery-player-fixes`
