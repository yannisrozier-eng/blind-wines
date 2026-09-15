# Audit V4.1.8 — Régions uniquement

## Vérifications
- Syntaxe de tous les fichiers JS : OK.
- Sélecteur origine : uniquement `region` et `subregion` ; `appellation`, `macro` et `country` ne sont jamais proposés comme choix.
- Hôte : libellé « Région » uniquement.
- Joueur : même sélecteur régional, aucun choix d’appellation.
- Compatibilité historique : une ancienne appellation est canonicalisée vers sa région/sous-région pour le scoring.
- Scoring région : exact 3 pts ; relation région/sous-région 2 pts ; même macro-région 1 pt ; simple même pays 0 pt.
- Atlas Blind : le bloc « appellations » a été retiré des fiches région pour ne pas brouiller le jeu.
- SQL inchangé.
- Discovery / Challenge : logique métier inchangée ; seule la sélection d’origine est désormais régionale.
