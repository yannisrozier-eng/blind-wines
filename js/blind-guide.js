/* Blind Wine — Static Blind-mode wine atlas. General reference only; never reads current wine secrets. */
'use strict';

const BLIND_WINE_REGIONS=[
 {id:'champagne',name:'Champagne',icon:'🥂',x:326,y:104,climate:'Septentrional, frais',reds:['Pinot noir','Meunier'],whites:['Chardonnay'],markers:['agrumes','pomme','brioche','craie','acidité élevée'],appellations:['Champagne','Coteaux Champenois','Rosé des Riceys'],style:'Effervescents tendus ; finesse, fraîcheur et notes briochées avec l’élevage.'},
 {id:'lorraine',name:'Lorraine',icon:'🌿',x:388,y:142,climate:'Continental, frais',reds:['Pinot noir','Gamay'],whites:['Auxerrois','Pinot gris'],markers:['fruits rouges','agrumes','fleurs','fraîcheur'],appellations:['Côtes de Toul','Moselle'],style:'Petit vignoble septentrional, vins frais et souvent délicats.'},
 {id:'alsace',name:'Alsace',icon:'🌼',x:431,y:176,climate:'Continental, sec',reds:['Pinot noir'],whites:['Riesling','Gewurztraminer','Pinot gris','Pinot blanc','Auxerrois'],markers:['fleurs','agrumes','fruits exotiques','épices','expression aromatique'],appellations:['Alsace','Alsace Grand Cru','Crémant d’Alsace'],style:'Blancs très aromatiques, du sec au moelleux, souvent mono-cépage.'},
 {id:'bourgogne',name:'Bourgogne',icon:'🍇',x:342,y:218,climate:'Continental, frais à modéré',reds:['Pinot noir'],whites:['Chardonnay','Aligoté'],markers:['cerise','framboise','sous-bois','beurre','agrumes','minéralité'],appellations:['Chablis','Côte de Nuits','Côte de Beaune','Côte Chalonnaise','Mâconnais'],style:'Rouges fins et blancs très variés, avec forte lecture du terroir.'},
 {id:'jura',name:'Jura',icon:'⛰️',x:391,y:252,climate:'Continental, frais',reds:['Poulsard','Trousseau','Pinot noir'],whites:['Savagnin','Chardonnay'],markers:['noix','pomme','épices','minéralité','acidité'],appellations:['Arbois','Côtes du Jura','Château-Chalon','L’Étoile'],style:'Vins ouillés ou sous voile, profils singuliers et forte fraîcheur.'},
 {id:'savoie',name:'Savoie',icon:'🏔️',x:416,y:305,climate:'Alpin, frais',reds:['Mondeuse','Gamay','Pinot noir'],whites:['Jacquère','Altesse','Chasselas','Roussanne'],markers:['agrumes','fleurs blanches','herbes','fraîcheur','corps léger'],appellations:['Apremont','Chignin','Roussette de Savoie','Seyssel'],style:'Vins frais et digestes, souvent marqués par les cépages alpins.'},
 {id:'bugey',name:'Bugey',icon:'🗻',x:383,y:290,climate:'Frais, influences continentales et alpines',reds:['Gamay','Pinot noir','Mondeuse'],whites:['Altesse','Chardonnay'],markers:['fruits rouges','fleurs','agrumes','fraîcheur'],appellations:['Bugey','Cerdon','Montagnieu','Roussette du Bugey'],style:'Vignoble morcelé de l’Ain, tranquilles et effervescents, souvent très frais.'},
 {id:'beaujolais',name:'Beaujolais',icon:'🍒',x:326,y:272,climate:'Semi-continental',reds:['Gamay'],whites:['Chardonnay'],markers:['cerise','framboise','violette','poivre','corps léger à moyen'],appellations:['Morgon','Fleurie','Moulin-à-Vent','Brouilly','Juliénas'],style:'Gamay fruité et digeste, plus structuré dans certains crus.'},
 {id:'lyonnais-forez',name:'Lyonnais · Forez · Roannaise',icon:'🌋',x:298,y:300,climate:'Semi-continental, reliefs du Massif central',reds:['Gamay'],whites:['Chardonnay'],markers:['fruits rouges','poivre','violette','fraîcheur'],appellations:['Coteaux du Lyonnais','Côtes du Forez','Côte Roannaise'],style:'Gamay frais et épicé sur des terroirs granitiques ou volcaniques.'},
 {id:'auvergne',name:'Auvergne',icon:'🌋',x:263,y:332,climate:'Continental, altitude et effet de foehn',reds:['Gamay','Pinot noir'],whites:['Chardonnay','Tressallier'],markers:['cerise','poivre','violette','minéralité','fraîcheur'],appellations:['Côtes d’Auvergne','Saint-Pourçain','IGP Puy-de-Dôme'],style:'Vins frais et nerveux, souvent sur sols volcaniques autour de Clermont-Ferrand.'},
 {id:'loire-centre',name:'Centre-Loire',icon:'🌱',x:291,y:190,climate:'Semi-continental',reds:['Pinot noir'],whites:['Sauvignon blanc','Chasselas'],markers:['agrumes','buis','pierre à fusil','fruits rouges','acidité'],appellations:['Sancerre','Pouilly-Fumé','Menetou-Salon','Quincy','Reuilly'],style:'Sauvignon tendu et précis ; Pinot noir léger à moyen.'},
 {id:'loire-touraine',name:'Loire · Touraine',icon:'🏰',x:232,y:207,climate:'Océanique dégradé',reds:['Cabernet Franc','Gamay','Côt'],whites:['Chenin blanc','Sauvignon blanc'],markers:['framboise','violette','agrumes','coing','herbes'],appellations:['Chinon','Bourgueil','Vouvray','Montlouis-sur-Loire','Touraine'],style:'Grande diversité : Cabernet Franc, Chenin et Sauvignon dominent.'},
 {id:'loire-anjou',name:'Loire · Anjou-Saumur',icon:'🌿',x:171,y:214,climate:'Océanique tempéré',reds:['Cabernet Franc','Cabernet Sauvignon','Grolleau'],whites:['Chenin blanc'],markers:['fruits rouges','violette','coing','miel','acidité'],appellations:['Saumur-Champigny','Savennières','Coteaux du Layon','Anjou'],style:'Chenin sec ou liquoreux et Cabernet Franc souvent souple et parfumé.'},
 {id:'loire-nantes',name:'Loire · Nantais',icon:'🌊',x:110,y:221,climate:'Océanique',reds:['Pinot noir','Gamay'],whites:['Melon de Bourgogne','Folle blanche'],markers:['citron','pomme verte','iode','salinité','levure'],appellations:['Muscadet Sèvre-et-Maine','Muscadet Côtes de Grandlieu','Gros Plant'],style:'Blancs légers, salins et très frais, souvent sur lies.'},
 {id:'charentes',name:'Charentes',icon:'⚓',x:137,y:285,climate:'Océanique',reds:['Merlot','Cabernet Franc','Cabernet Sauvignon'],whites:['Ugni blanc','Colombard','Sauvignon blanc'],markers:['agrumes','fleurs','fruits frais','fraîcheur'],appellations:['IGP Charentais','Pineau des Charentes'],style:'Région surtout célèbre pour Cognac, mais aussi vins tranquilles frais et simples.'},
 {id:'bordeaux',name:'Bordeaux',icon:'🍷',x:145,y:337,climate:'Océanique, tempéré',reds:['Merlot','Cabernet Sauvignon','Cabernet Franc','Petit Verdot'],whites:['Sauvignon blanc','Sémillon'],markers:['cassis','prune','cèdre','tabac','tanins structurés'],appellations:['Médoc','Saint-Émilion','Pomerol','Graves','Sauternes'],style:'Rouges souvent assemblés et structurés ; blancs secs ou liquoreux.'},
 {id:'sud-ouest',name:'Sud-Ouest',icon:'🧭',x:178,y:395,climate:'Océanique à continental',reds:['Malbec','Tannat','Négrette','Fer Servadou','Duras'],whites:['Gros Manseng','Petit Manseng','Colombard','Mauzac'],markers:['fruits noirs','violette','épices','tanins','fruits exotiques'],appellations:['Cahors','Madiran','Jurançon','Fronton','Gaillac','Marcillac'],style:'Mosaïque de terroirs et nombreux cépages locaux à forte identité.'},
 {id:'rhone-nord',name:'Rhône Nord',icon:'🌄',x:336,y:326,climate:'Continental à méditerranéen',reds:['Syrah'],whites:['Viognier','Marsanne','Roussanne'],markers:['mûre','violette','poivre noir','olive','fumé'],appellations:['Côte-Rôtie','Hermitage','Crozes-Hermitage','Saint-Joseph','Condrieu'],style:'Syrah tendue et épicée ; blancs structurés et expressifs.'},
 {id:'rhone-sud',name:'Rhône Sud',icon:'☀️',x:338,y:382,climate:'Méditerranéen, chaud',reds:['Grenache','Syrah','Mourvèdre','Cinsault'],whites:['Grenache blanc','Roussanne','Marsanne','Clairette'],markers:['fruits mûrs','garrigue','épices','chaleur','corps généreux'],appellations:['Châteauneuf-du-Pape','Gigondas','Vacqueyras','Tavel'],style:'Assemblages solaires, généreux et épicés.'},
 {id:'languedoc',name:'Languedoc',icon:'🌞',x:287,y:426,climate:'Méditerranéen, chaud et sec',reds:['Syrah','Grenache','Mourvèdre','Carignan','Cinsault'],whites:['Picpoul','Grenache blanc','Roussanne','Vermentino'],markers:['fruits mûrs','épices','garrigue','réglisse','chaleur'],appellations:['Pic Saint-Loup','Corbières','Minervois','Faugères','Picpoul de Pinet'],style:'Très large palette méditerranéenne, des vins frais aux rouges puissants.'},
 {id:'roussillon',name:'Roussillon',icon:'⛰️',x:244,y:466,climate:'Méditerranéen, très ensoleillé',reds:['Grenache','Carignan','Syrah','Mourvèdre'],whites:['Grenache blanc','Grenache gris','Macabeu'],markers:['fruits noirs','figue','épices','garrigue','rancio selon style'],appellations:['Collioure','Côtes du Roussillon','Maury','Banyuls'],style:'Vins secs méditerranéens et grande tradition de vins doux naturels.'},
 {id:'provence',name:'Provence',icon:'🌸',x:390,y:438,climate:'Méditerranéen, chaud et sec',reds:['Grenache','Cinsault','Syrah','Mourvèdre','Tibouren'],whites:['Rolle / Vermentino','Clairette'],markers:['fruits rouges','agrumes','herbes','garrigue','fraîcheur saline'],appellations:['Côtes de Provence','Bandol','Cassis','Palette'],style:'Rosés majeurs, mais aussi rouges méditerranéens et blancs salins.'},
 {id:'corse',name:'Corse',icon:'🏝️',x:453,y:470,climate:'Méditerranéen insulaire',reds:['Niellucciu','Sciaccarellu','Grenache'],whites:['Rolle / Vermentino'],markers:['maquis','herbes','fruits rouges','agrumes','salinité'],appellations:['Patrimonio','Ajaccio','Figari','Corse Calvi'],style:'Vins méditerranéens avec fraîcheur maritime et cépages insulaires.'}
];

const BLIND_GRAPE_PROFILES=[
 {name:'Cabernet Sauvignon',color:'Rouge',regions:['Bordeaux','Sud-Ouest'],markers:['cassis','cèdre','poivron mûr','tanins fermes'],body:'Moyen à puissant',acid:'Moyenne à élevée'},
 {name:'Merlot',color:'Rouge',regions:['Bordeaux','Charentes','Sud-Ouest'],markers:['prune','cerise noire','chocolat','texture ronde'],body:'Moyen à puissant',acid:'Moyenne'},
 {name:'Cabernet Franc',color:'Rouge',regions:['Loire · Touraine','Loire · Anjou-Saumur','Bordeaux'],markers:['framboise','violette','poivron','graphite'],body:'Léger à moyen',acid:'Moyenne à élevée'},
 {name:'Pinot noir',color:'Rouge',regions:['Bourgogne','Champagne','Alsace','Jura','Centre-Loire','Lorraine'],markers:['cerise','framboise','sous-bois','épices fines'],body:'Léger à moyen',acid:'Élevée'},
 {name:'Gamay',color:'Rouge',regions:['Beaujolais','Lyonnais · Forez · Roannaise','Auvergne','Loire','Bugey'],markers:['cerise','fraise','violette','poivre'],body:'Léger à moyen',acid:'Moyenne à élevée'},
 {name:'Syrah',color:'Rouge',regions:['Rhône Nord','Rhône Sud','Languedoc'],markers:['mûre','poivre noir','violette','olive'],body:'Moyen à puissant',acid:'Moyenne à élevée'},
 {name:'Grenache',color:'Rouge',regions:['Rhône Sud','Provence','Languedoc','Roussillon'],markers:['fraise mûre','cerise','garrigue','épices'],body:'Moyen à puissant',acid:'Plutôt basse'},
 {name:'Mourvèdre',color:'Rouge',regions:['Provence','Rhône Sud','Languedoc','Roussillon'],markers:['mûre','viande','herbes','tanins élevés'],body:'Puissant',acid:'Moyenne'},
 {name:'Carignan',color:'Rouge',regions:['Languedoc','Roussillon'],markers:['fruits noirs','épices','garrigue','acidité'],body:'Moyen à puissant',acid:'Moyenne à élevée'},
 {name:'Cinsault',color:'Rouge',regions:['Provence','Languedoc','Rhône Sud'],markers:['fraise','framboise','fleurs','souplesse'],body:'Léger à moyen',acid:'Moyenne'},
 {name:'Tannat',color:'Rouge',regions:['Sud-Ouest'],markers:['mûre','prune','épices','tanins très fermes'],body:'Puissant',acid:'Moyenne à élevée'},
 {name:'Malbec',color:'Rouge',regions:['Sud-Ouest'],markers:['prune','mûre','violette','réglisse'],body:'Moyen à puissant',acid:'Moyenne'},
 {name:'Mondeuse',color:'Rouge',regions:['Savoie','Bugey'],markers:['violette','poivre','fruits noirs','fraîcheur'],body:'Moyen',acid:'Élevée'},
 {name:'Poulsard',color:'Rouge',regions:['Jura'],markers:['fraise','groseille','épices','couleur pâle'],body:'Léger',acid:'Élevée'},
 {name:'Trousseau',color:'Rouge',regions:['Jura'],markers:['cerise noire','poivre','épices','structure'],body:'Moyen',acid:'Moyenne à élevée'},
 {name:'Chardonnay',color:'Blanc',regions:['Bourgogne','Champagne','Jura','Beaujolais','Auvergne'],markers:['citron','pomme','beurre','noisette selon élevage'],body:'Léger à puissant',acid:'Moyenne à élevée'},
 {name:'Sauvignon blanc',color:'Blanc',regions:['Centre-Loire','Loire · Touraine','Bordeaux','Charentes'],markers:['agrumes','buis','herbe','fruit de la passion'],body:'Léger à moyen',acid:'Élevée'},
 {name:'Chenin blanc',color:'Blanc',regions:['Loire · Touraine','Loire · Anjou-Saumur'],markers:['pomme','coing','miel','fleurs'],body:'Léger à moyen',acid:'Très élevée'},
 {name:'Riesling',color:'Blanc',regions:['Alsace'],markers:['citron','pomme','fleurs','pétrole avec l’âge'],body:'Léger à moyen',acid:'Très élevée'},
 {name:'Gewurztraminer',color:'Blanc',regions:['Alsace'],markers:['litchi','rose','épices','fruits exotiques'],body:'Moyen à ample',acid:'Plutôt basse'},
 {name:'Viognier',color:'Blanc',regions:['Rhône Nord'],markers:['abricot','pêche','violette','texture ample'],body:'Moyen à ample',acid:'Plutôt basse'},
 {name:'Sémillon',color:'Blanc',regions:['Bordeaux'],markers:['citron','cire','miel','fruits secs avec l’âge'],body:'Moyen à ample',acid:'Moyenne'},
 {name:'Melon de Bourgogne',color:'Blanc',regions:['Loire · Nantais'],markers:['citron','pomme verte','iode','levure'],body:'Léger',acid:'Élevée'},
 {name:'Savagnin',color:'Blanc',regions:['Jura'],markers:['pomme','noix','épices','curry sous voile'],body:'Moyen',acid:'Élevée'},
 {name:'Jacquère',color:'Blanc',regions:['Savoie'],markers:['citron','fleurs blanches','herbes','pierre'],body:'Léger',acid:'Élevée'},
 {name:'Altesse',color:'Blanc',regions:['Savoie','Bugey'],markers:['poire','fleurs','miel léger','amande'],body:'Moyen',acid:'Moyenne à élevée'},
 {name:'Tressallier',color:'Blanc',regions:['Auvergne · Saint-Pourçain'],markers:['agrumes','poire','fleurs','fraîcheur'],body:'Léger à moyen',acid:'Élevée'},
 {name:'Picpoul',color:'Blanc',regions:['Languedoc'],markers:['citron','fleurs','iode','acidité'],body:'Léger',acid:'Élevée'},
 {name:'Grenache blanc',color:'Blanc',regions:['Rhône Sud','Languedoc','Roussillon'],markers:['poire','fenouil','fleurs','texture'],body:'Moyen à ample',acid:'Plutôt basse'},
 {name:'Rolle / Vermentino',color:'Blanc',regions:['Provence','Corse','Languedoc'],markers:['agrumes','poire','herbes','salinité'],body:'Léger à moyen',acid:'Moyenne à élevée'}
];
const BLIND_GRAPE_DETAILS={
  "Cabernet Sauvignon": {
    "look": "Robe souvent sombre et concentrée.",
    "feel": "Tanins fermes, structure droite, finale souvent sérieuse.",
    "orientation": [
      "Pense-y si le nez part sur le cassis, le cèdre ou un léger graphite.",
      "En bouche, les gencives sèchent un peu plus que sur un Merlot.",
      "Le vin paraît plus strict, plus vertical que charmeur dans sa jeunesse."
    ],
    "confusions": [
      "Merlot : plus rond, plus prune, tanins plus souples.",
      "Cabernet Franc : plus floral, plus framboise, poivron plus frais.",
      "Syrah : plus poivrée, violette, parfois olive."
    ],
    "questions": [
      "Les tanins dominent-ils vraiment ?",
      "L’aromatique est-elle cassis / cèdre plus que prune ?",
      "Le vin garde-t-il une colonne vertébrale très droite ?"
    ]
  },
  "Merlot": {
    "look": "Robe rubis à grenat, souvent assez dense.",
    "feel": "Texture ronde, tanins souples à moyens, sensation plus caressante.",
    "orientation": [
      "Pense-y si tu sens la prune, la cerise noire ou le chocolat léger.",
      "Le milieu de bouche paraît souvent moelleux, avec moins d’angle qu’un Cabernet Sauvignon.",
      "Très bon candidat quand le vin semble immédiatement aimable."
    ],
    "confusions": [
      "Cabernet Sauvignon : plus structuré et cassis/cèdre.",
      "Malbec : plus sombre, plus violet, plus ferme.",
      "Grenache : plus chaleureux et épicé."
    ],
    "questions": [
      "Est-ce rond dès l’attaque ?",
      "Le fruit évoque-t-il davantage la prune que le cassis ?",
      "Les tanins restent-ils polis ?"
    ]
  },
  "Cabernet Franc": {
    "look": "Robe moyenne, rarement la plus opaque du panel.",
    "feel": "Corps moyen, tanins présents mais moins durs que Cabernet Sauvignon.",
    "orientation": [
      "Pense-y si tu retrouves framboise, violette, graphite ou poivron frais.",
      "Très souvent plus élancé et plus floral que Merlot.",
      "En Loire, il peut être juteux, frais et légèrement végétal noble."
    ],
    "confusions": [
      "Cabernet Sauvignon : plus cassis, plus ferme, plus sombre.",
      "Pinot noir : plus léger, plus délicat, moins végétal.",
      "Gamay : plus simple, plus croquant, moins graphite."
    ],
    "questions": [
      "Y a-t-il un côté floral / herbacé noble ?",
      "Le vin combine-t-il fraîcheur et structure modérée ?",
      "La bouche reste-t-elle plus fine qu’imposante ?"
    ]
  },
  "Pinot noir": {
    "look": "Robe plutôt claire à moyenne, translucide dans beaucoup de styles.",
    "feel": "Tanins fins, toucher soyeux, corps léger à moyen.",
    "orientation": [
      "Pense-y si tu sens la cerise, la framboise, les épices fines et parfois le sous-bois.",
      "La bouche paraît plus délicate que puissante.",
      "Très crédible quand le vin est élégant, allongé, sans lourdeur."
    ],
    "confusions": [
      "Gamay : plus bonbon/primeur et souvent plus croquant.",
      "Poulsard : encore plus pâle, plus aérien.",
      "Cabernet Franc : plus végétal/floral et plus anguleux."
    ],
    "questions": [
      "La couleur semble-t-elle plus claire ?",
      "Les tanins sont-ils très fins ?",
      "La finesse domine-t-elle la puissance ?"
    ]
  },
  "Gamay": {
    "look": "Robe rubis vive, souvent brillante.",
    "feel": "Bouche croquante, juteuse, tanins modérés.",
    "orientation": [
      "Pense-y si tu retrouves cerise, fraise, violette, poivre léger.",
      "Quand le vin paraît gourmand, digeste et assez immédiat, Gamay devient crédible.",
      "Le fruit prime souvent sur l’élevage."
    ],
    "confusions": [
      "Pinot noir : plus fin, plus terrien, moins croquant.",
      "Cabernet Franc : plus floral/herbacé et plus structuré.",
      "Mondeuse : plus poivrée et plus nerveuse."
    ],
    "questions": [
      "La bouche donne-t-elle envie de reboire tout de suite ?",
      "Le fruit est-il rouge et croquant ?",
      "L’ensemble reste-t-il plus festif que profond ?"
    ]
  },
  "Syrah": {
    "look": "Robe soutenue, souvent violacée dans la jeunesse.",
    "feel": "Corps moyen à puissant, tanins présents, acidité qui garde de l’élan.",
    "orientation": [
      "Pense-y si poivre noir, violette, mûre, olive ou fumé ressortent.",
      "Dans le Rhône nord, la Syrah peut être droite et fraîche ; plus au sud, plus solaire.",
      "Très bon repère quand le vin est épicé sans basculer dans la douceur."
    ],
    "confusions": [
      "Cabernet Sauvignon : plus cassis/cèdre, moins violette.",
      "Grenache : plus chaud, moins poivré, tanins plus souples.",
      "Mondeuse : très poivrée aussi mais souvent plus légère et plus acide."
    ],
    "questions": [
      "Le poivre noir saute-t-il au nez ?",
      "Y a-t-il une note violette / olive ?",
      "Le vin garde-t-il de la tension malgré la matière ?"
    ]
  },
  "Grenache": {
    "look": "Robe moyenne, moins noire qu’on l’imagine souvent.",
    "feel": "Alcool/chaleur perceptible, tanins souples à moyens, texture ample.",
    "orientation": [
      "Pense-y si le vin est généreux, fruit mûr, cerise, fraise confite, garrigue.",
      "La bouche paraît large, chaleureuse, parfois un peu douce dans sa sensation.",
      "Souvent plus solaire que Syrah."
    ],
    "confusions": [
      "Syrah : plus poivrée, plus fraîche, plus violette.",
      "Merlot : moins épicé/garrigue et moins chaud.",
      "Mourvèdre : plus sauvage, plus tannique."
    ],
    "questions": [
      "Sens-tu une chaleur d’alcool ?",
      "Le fruit paraît-il mûr voire confituré ?",
      "La garrigue / les épices douces ressortent-elles ?"
    ]
  },
  "Mourvèdre": {
    "look": "Robe foncée, dense.",
    "feel": "Tanins marqués, texture ferme, allonge parfois austère jeune.",
    "orientation": [
      "Pense-y si le vin a un côté sombre, cuiré, viande fumée, herbes méditerranéennes.",
      "Souvent plus sérieux et plus sauvage qu’un Grenache.",
      "Bandol est un repère mental utile pour ce profil."
    ],
    "confusions": [
      "Syrah : plus violette/poivre, moins animal.",
      "Tannat : tanins encore plus massifs et profil moins méditerranéen.",
      "Grenache : plus rond, plus fruité, moins sévère."
    ],
    "questions": [
      "Le vin semble-t-il sauvage ?",
      "Les tanins sont-ils costauds ?",
      "Les herbes sèches et la viande fumée apparaissent-elles ?"
    ]
  },
  "Carignan": {
    "look": "Robe profonde à moyenne selon âge/rendement.",
    "feel": "Acidité assez sensible, structure ferme, fruit noir épicé.",
    "orientation": [
      "Pense-y si tu as fruits noirs, garrigue, épices et une fraîcheur plus marquée qu’attendu dans le sud.",
      "Souvent plus rustique, plus nerveux qu’un Grenache."
    ],
    "confusions": [
      "Syrah : plus poivrée et violette.",
      "Grenache : plus doux, plus chaud, moins nerveux.",
      "Malbec : plus violet/prune, moins garrigue."
    ],
    "questions": [
      "Le sud est-il présent sans lourdeur ?",
      "Y a-t-il une acidité qui porte le vin ?",
      "L’ensemble paraît-il un peu rustique mais sincère ?"
    ]
  },
  "Cinsault": {
    "look": "Robe légère à moyenne.",
    "feel": "Souple, peu tannique, facile d’accès.",
    "orientation": [
      "Pense-y si tu trouves fraise, framboise, fleurs et beaucoup de souplesse.",
      "Très crédible quand un rouge du sud reste léger et glissant."
    ],
    "confusions": [
      "Gamay : plus acidulé/croquant.",
      "Grenache : plus chaud et plus ample.",
      "Pinot noir : plus fin et plus terrien."
    ],
    "questions": [
      "Le vin est-il très souple ?",
      "Le fruit est-il rouge et simple ?",
      "Manque-t-il volontairement de dureté ?"
    ]
  },
  "Tannat": {
    "look": "Robe très sombre.",
    "feel": "Tanins massifs, charpente puissante, forte présence en bouche.",
    "orientation": [
      "Pense-y si tu te dis immédiatement : ‘ça accroche’.",
      "Le fruit noir et la structure prennent le dessus sur la délicatesse.",
      "Repère classique du Sud-Ouest quand le vin paraît robuste."
    ],
    "confusions": [
      "Cabernet Sauvignon : ferme mais généralement moins massif.",
      "Mourvèdre : plus méditerranéen/sauvage.",
      "Malbec : plus floral/violet et un peu moins austère."
    ],
    "questions": [
      "Est-ce le vin le plus tannique de la série ?",
      "La matière semble-t-elle compacte ?",
      "Le fruit noir domine-t-il largement ?"
    ]
  },
  "Malbec": {
    "look": "Robe profonde, souvent violacée.",
    "feel": "Corps puissant, tanins présents, fruit noir charnu.",
    "orientation": [
      "Pense-y si prune, mûre, violette, réglisse ressortent ensemble.",
      "Plus voluptueux que Tannat, souvent plus floral aussi."
    ],
    "confusions": [
      "Merlot : plus rond mais souvent moins violet / réglissé.",
      "Tannat : plus strict et tannique.",
      "Syrah : plus poivrée et olive."
    ],
    "questions": [
      "Y a-t-il un duo prune + violette ?",
      "La bouche reste-t-elle puissante sans sécheresse extrême ?",
      "La réglisse apparaît-elle ?"
    ]
  },
  "Mondeuse": {
    "look": "Robe moyenne à soutenue.",
    "feel": "Acidité vive, poivre marqué, structure nerveuse.",
    "orientation": [
      "Pense-y si tu retrouves beaucoup de poivre, de violette et une fraîcheur montagnarde.",
      "Elle peut rappeler une mini-Syrah alpine, plus nerveuse et plus légère."
    ],
    "confusions": [
      "Syrah : plus profonde et souvent plus ample.",
      "Gamay : plus fruit croquant, moins poivré.",
      "Cabernet Franc : plus végétal/floral."
    ],
    "questions": [
      "Le poivre prend-il le dessus ?",
      "La bouche a-t-elle une nervosité alpine ?",
      "Le vin semble-t-il épicé mais pas massif ?"
    ]
  },
  "Poulsard": {
    "look": "Robe très pâle, parfois étonnamment claire pour un rouge.",
    "feel": "Très léger, délicat, tanins bas.",
    "orientation": [
      "Pense-y si tu as presque l’impression d’un rouge très clair ou d’un rosé foncé.",
      "Fraise, groseille, délicatesse et fraîcheur sont les meilleurs repères."
    ],
    "confusions": [
      "Pinot noir : un peu plus de matière et de profondeur.",
      "Gamay : plus croquant et coloré.",
      "Trousseau : bien plus structuré."
    ],
    "questions": [
      "La couleur est-elle étonnamment claire ?",
      "La bouche semble-t-elle aérienne ?",
      "Le fruit reste-t-il rouge, fragile, délicat ?"
    ]
  },
  "Trousseau": {
    "look": "Robe plus soutenue que Poulsard.",
    "feel": "Plus structuré, plus épicé, plus charpenté que son voisin jurassien Poulsard.",
    "orientation": [
      "Pense-y si tu sens cerise noire, poivre et un noyau épicé.",
      "Dans le Jura, c’est souvent le rouge qui ‘tient’ le plus la route en structure."
    ],
    "confusions": [
      "Pinot noir : plus soyeux et moins épicé.",
      "Poulsard : plus clair et plus léger.",
      "Syrah : plus poivrée mais plus méditerranéenne / profonde."
    ],
    "questions": [
      "Y a-t-il plus de structure que prévu pour un rouge léger ?",
      "Les épices ressortent-elles ?",
      "Le vin paraît-il jurassien mais sérieux ?"
    ]
  },
  "Chardonnay": {
    "look": "Robe de pâle à dorée selon maturité/élevage.",
    "feel": "Texture très variable : tendue et citronnée ou ample et beurrée.",
    "orientation": [
      "Pense-y si tu vois le grand caméléon des blancs : citron, pomme, beurre, noisette selon élevage.",
      "Le Chardonnay est souvent un bon candidat quand rien n’est très exubérant mais que tout est cohérent.",
      "Selon terroir, il va de Chablis tendu à Meursault plus ample."
    ],
    "confusions": [
      "Sémillon : plus cire/miel.",
      "Roussanne / Grenache blanc : plus sudistes, plus herbacés ou gras.",
      "Altesse : plus florale/poire et moins universelle."
    ],
    "questions": [
      "L’élevage boisé/beurré est-il perceptible ?",
      "Le vin est-il plus polyvalent que démonstratif ?",
      "La trame reste-t-elle nette même quand la matière est ample ?"
    ]
  },
  "Sauvignon blanc": {
    "look": "Robe pâle, éclatante.",
    "feel": "Tension immédiate, sensation vive, finale nette.",
    "orientation": [
      "Pense-y si tu sens agrumes, buis, herbe fraîche, parfois fruit de la passion.",
      "Très bon candidat quand l’acidité est haute et le nez expressif."
    ],
    "confusions": [
      "Riesling : plus citron/minéral, moins buis.",
      "Chenin blanc : plus pomme/coing/miel, moins herbacé.",
      "Melon de Bourgogne : plus discret, plus salin, moins explosif."
    ],
    "questions": [
      "Le nez crie-t-il ‘vert noble’ / agrumes ?",
      "La bouche est-elle très tendue ?",
      "Le buis ou l’herbe apparaissent-ils ?"
    ]
  },
  "Chenin blanc": {
    "look": "Robe pâle à dorée selon style.",
    "feel": "Très forte acidité, matière souvent plus large qu’un Sauvignon.",
    "orientation": [
      "Pense-y si pomme, coing, miel et tension coexistent.",
      "Sec, moelleux ou effervescent : le fil conducteur reste la grande acidité.",
      "Souvent plus laineux/miellé qu’un Sauvignon."
    ],
    "confusions": [
      "Sauvignon blanc : plus herbacé et plus direct.",
      "Riesling : plus citronné/minéral.",
      "Chardonnay : moins acide en moyenne, plus beurré/noisette selon élevage."
    ],
    "questions": [
      "La bouche salive-t-elle fortement ?",
      "Y a-t-il du coing, de la pomme, un miel naissant ?",
      "La matière est-elle tendue mais pas maigre ?"
    ]
  },
  "Riesling": {
    "look": "Robe très pâle à jaune clair.",
    "feel": "Très droit, très acide, sensation cristalline.",
    "orientation": [
      "Pense-y si le vin est citronné, minéral, très tendu, parfois avec une note pétrolée avec l’âge.",
      "Quand tout semble ciselé et précis, Riesling monte vite en tête."
    ],
    "confusions": [
      "Sauvignon blanc : plus buis / herbe.",
      "Chenin blanc : plus pomme/coing/miel.",
      "Jacquère : légère et fraîche mais plus simple."
    ],
    "questions": [
      "La tension est-elle presque tranchante ?",
      "Les arômes restent-ils très nets et citronnés ?",
      "Une note minérale / pétrole apparaît-elle ?"
    ]
  },
  "Gewurztraminer": {
    "look": "Robe assez soutenue pour un blanc.",
    "feel": "Texture ample, faible sensation acide, bouche expressive.",
    "orientation": [
      "Pense-y si tu retrouves litchi, rose, épices, fruits exotiques.",
      "C’est rarement discret : le cépage s’annonce volontiers."
    ],
    "confusions": [
      "Viognier : plus abricot/pêche que rose/litchi.",
      "Muscat (hors atlas) : plus raisin frais.",
      "Rolle/Vermentino : bien plus frais et herbacé."
    ],
    "questions": [
      "Le nez est-il très parfumé ?",
      "La rose ou le litchi sautent-ils au visage ?",
      "L’acidité paraît-elle plutôt basse ?"
    ]
  },
  "Viognier": {
    "look": "Robe jaune clair à dorée.",
    "feel": "Texture ample, acidité modérée, sensation veloutée.",
    "orientation": [
      "Pense-y si l’abricot, la pêche et la violette dominent.",
      "Le vin paraît riche et parfumé sans aller sur la rose/litchi du Gewurztraminer."
    ],
    "confusions": [
      "Gewurztraminer : plus exubérant sur rose/litchi.",
      "Chardonnay boisé : plus beurre/noisette.",
      "Grenache blanc : plus herbes/fenouil et moins floral."
    ],
    "questions": [
      "L’abricot est-il évident ?",
      "La bouche est-elle ample plutôt que nerveuse ?",
      "Y a-t-il une touche florale violette ?"
    ]
  },
  "Sémillon": {
    "look": "Robe jaune paille à dorée.",
    "feel": "Matière large, texture cireuse, acidité modérée.",
    "orientation": [
      "Pense-y si tu sens cire, miel léger, citron mûr, fruits secs avec le temps.",
      "Souvent plus gras qu’un Sauvignon, moins exubérant qu’un Gewurztraminer."
    ],
    "confusions": [
      "Chardonnay : plus beurre/noisette selon élevage.",
      "Chenin blanc : plus acide et plus coing.",
      "Grenache blanc : plus sudiste et herbacé."
    ],
    "questions": [
      "La texture est-elle cireuse ?",
      "Le miel apparaît-il doucement ?",
      "La bouche semble-t-elle ample sans grande nervosité ?"
    ]
  },
  "Melon de Bourgogne": {
    "look": "Robe très pâle.",
    "feel": "Corps léger, acidité haute, finale saline et simple.",
    "orientation": [
      "Pense-y si le vin paraît citronné, discret, iodé, très frais.",
      "Le Muscadet se repère souvent par sa sobriété et sa sensation de salinité."
    ],
    "confusions": [
      "Sauvignon blanc : plus aromatique et herbacé.",
      "Jacquère : fraîche aussi mais plus florale/herbacée alpine.",
      "Picpoul : aussi très vif mais souvent plus citronné démonstratif."
    ],
    "questions": [
      "La salinité ressort-elle ?",
      "Le vin est-il discret mais très net ?",
      "La levure / les lies apportent-elles une touche supplémentaire ?"
    ]
  },
  "Savagnin": {
    "look": "Robe jaune assez soutenue selon style.",
    "feel": "Acidité vive, structure médiane, personnalité marquée.",
    "orientation": [
      "Pense-y si tu sens pomme, noix, épices et parfois curry en style sous voile.",
      "C’est un cépage de caractère, rarement anonyme."
    ],
    "confusions": [
      "Chardonnay jurassien : plus universel et moins noix/curry.",
      "Riesling : plus citron/minéral.",
      "Chenin blanc : plus pomme/coing/miel, moins noix."
    ],
    "questions": [
      "La noix apparaît-elle ?",
      "Le vin a-t-il une singularité presque oxydative noble ?",
      "L’épice curry / noix te met-elle sur la piste du Jura ?"
    ]
  },
  "Jacquère": {
    "look": "Robe pâle et très légère.",
    "feel": "Corps léger, acidité haute, grande buvabilité.",
    "orientation": [
      "Pense-y si le blanc est très frais, citronné, floral et discret.",
      "Elle se repère davantage par sa légèreté alpine que par un parfum explosif."
    ],
    "confusions": [
      "Melon de Bourgogne : plus salin/iodé.",
      "Riesling : plus précis et plus intense.",
      "Picpoul : plus citron mordant."
    ],
    "questions": [
      "Le vin semble-t-il montagnard, léger ?",
      "La fraîcheur domine-t-elle ?",
      "Le profil reste-t-il fin plutôt qu’ample ?"
    ]
  },
  "Altesse": {
    "look": "Robe claire à légèrement dorée.",
    "feel": "Milieu de bouche plus large qu’une Jacquère, sans lourdeur.",
    "orientation": [
      "Pense-y si tu trouves poire, fleurs, miel léger, amande.",
      "Très bon repère quand un blanc alpin gagne en noblesse et en texture."
    ],
    "confusions": [
      "Chardonnay : plus beurre/noisette ou plus neutre.",
      "Viognier : plus abricot et plus ample.",
      "Chenin blanc : plus acide et plus coing."
    ],
    "questions": [
      "La poire ressort-elle ?",
      "Le vin est-il alpin mais plus large qu’une Jacquère ?",
      "L’amande douce apparaît-elle ?"
    ]
  },
  "Tressallier": {
    "look": "Robe pâle.",
    "feel": "Corps léger à moyen, tension fraîche, bouche simple mais nette.",
    "orientation": [
      "Pense-y si le vin est discret, floral, agrumes/poire, avec une fraîcheur droite.",
      "C’est une piste utile pour Saint-Pourçain et l’Auvergne."
    ],
    "confusions": [
      "Sauvignon blanc : plus herbacé et plus démonstratif.",
      "Chardonnay : plus large ou plus beurré selon élevage.",
      "Jacquère : plus alpine / citronnée simple."
    ],
    "questions": [
      "Le vin semble-t-il frais et peu démonstratif ?",
      "Agrumes + poire + fleurs se tiennent-ils ensemble ?",
      "Le contexte Auvergne / Saint-Pourçain serait-il logique ?"
    ]
  },
  "Picpoul": {
    "look": "Robe très pâle.",
    "feel": "Acidité élevée, profil droit, bouche tonique.",
    "orientation": [
      "Pense-y si tu sens citron, iode, fleurs blanches et beaucoup de vivacité.",
      "Picpoul est souvent plus piquant et citronné qu’un Muscadet."
    ],
    "confusions": [
      "Melon de Bourgogne : plus discret et salin.",
      "Sauvignon blanc : plus herbacé/buis.",
      "Jacquère : plus montagnarde et moins iodée."
    ],
    "questions": [
      "Le citron domine-t-il ?",
      "L’acidité paraît-elle très franche ?",
      "Y a-t-il un petit air marin ?"
    ]
  },
  "Grenache blanc": {
    "look": "Robe jaune paille.",
    "feel": "Texture ample, acidité modérée, sensation sudiste.",
    "orientation": [
      "Pense-y si poire, fenouil, fleurs blanches et rondeur dominent.",
      "Le vin peut être assez généreux, presque huileux selon assemblage."
    ],
    "confusions": [
      "Viognier : plus abricot/pêche.",
      "Sémillon : plus cire/miel.",
      "Rolle / Vermentino : plus vif, plus salin/herbacé."
    ],
    "questions": [
      "La bouche est-elle ample ?",
      "Les herbes/fenouil apparaissent-elles ?",
      "Le sud se ressent-il plus que la tension ?"
    ]
  },
  "Rolle / Vermentino": {
    "look": "Robe claire et lumineuse.",
    "feel": "Léger à moyen, fraîcheur salivante, texture souple.",
    "orientation": [
      "Pense-y si agrumes, poire, herbes, amertume noble et salinité ressortent.",
      "Très bon repère en Provence/Corse quand le blanc est frais mais méditerranéen."
    ],
    "confusions": [
      "Sauvignon blanc : plus herbacé/buis et plus tranchant.",
      "Picpoul : plus citronné et acide.",
      "Grenache blanc : plus ample et moins salin."
    ],
    "questions": [
      "Y a-t-il une petite amertume noble ?",
      "Le vin est-il méditerranéen sans lourdeur ?",
      "Les herbes et la salinité ressortent-elles ?"
    ]
  }
};


let blindAtlasState={tab:'map',region:null,grape:null,compare:[]};
let blindAtlasReturnFocus=null;

function blindWineAtlasButtonHtml(){
 return `<button type="button" class="blind-atlas-launch" onclick="openBlindWineAtlas()"><span>🗺️</span><div><b>Atlas du blind</b><small>Carte de France · régions · cépages · comparer</small></div><span class="blind-atlas-launch-arrow">→</span></button>`;
}

const BLIND_MAP_GEO={
 champagne:[4.03,49.25,'Champagne',10,-14],lorraine:[5.90,48.68,'Lorraine',12,-12],alsace:[7.36,48.08,'Alsace',13,2],
 bourgogne:[4.84,47.03,'Bourgogne',12,-5],jura:[5.77,46.90,'Jura',12,8],savoie:[5.92,45.57,'Savoie',14,13],bugey:[5.69,45.76,'Bugey',-56,-10],
 beaujolais:[4.68,46.15,'Beaujolais',-72,-13],'lyonnais-forez':[4.15,45.65,'Lyonnais / Forez',-96,13],auvergne:[3.08,45.78,'Auvergne',-70,18],
 'loire-centre':[2.84,47.33,'Centre-Loire',-86,-15],'loire-touraine':[0.68,47.39,'Touraine',-67,12],'loire-anjou':[-0.08,47.26,'Anjou-Saumur',-84,-18],
 'loire-nantes':[-1.55,47.20,'Nantais',-65,12],charentes:[-0.33,45.70,'Charentes',-74,-4],bordeaux:[-0.58,44.84,'Bordeaux',-68,11],
 'sud-ouest':[1.44,44.45,'Sud-Ouest',-72,22],'rhone-nord':[4.84,45.07,'Rhône Nord',12,-13],'rhone-sud':[4.81,43.95,'Rhône Sud',12,4],
 languedoc:[3.88,43.61,'Languedoc',-85,18],roussillon:[2.90,42.70,'Roussillon',-71,18],provence:[5.45,43.53,'Provence',18,12],corse:[8.74,41.92,'Corse',12,8]
};
function blindMapProject(lon,lat){
 const x=217.8987341772152+(lon*35.696202531645575);
 const y=1910.949367088608-(lat*35.696202531645575);
 return {x:(x/600)*100,y:(y/520)*100};
}
function blindFranceMapSvg(){
 const dots=BLIND_WINE_REGIONS.map(r=>{
   const geo=BLIND_MAP_GEO[r.id]||[0,46,r.name,10,-10];const p=blindMapProject(geo[0],geo[1]);
   const selected=blindAtlasState.region===r.id?' sel':'';
   return `<button type="button" class="blind-map-hotspot${selected}" style="--x:${p.x.toFixed(2)}%;--y:${p.y.toFixed(2)}%;--lx:${geo[3]}px;--ly:${geo[4]}px" onclick="selectBlindAtlasRegion('${r.id}')" aria-label="${esc(r.name)}" title="${esc(r.name)}"><span class="blind-map-dot"></span><b>${esc(geo[2])}</b></button>`;
 }).join('');
 return `<div class="blind-map-shell"><div class="blind-map-kicker"><span>FRANCE MÉTROPOLITAINE</span><small>23 repères viticoles</small></div><div class="blind-france-map" aria-label="Carte des régions viticoles françaises">
   <svg viewBox="0 0 600 520" role="img" aria-label="Contour géographique de la France métropolitaine et de la Corse">
    <defs><linearGradient id="franceFill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f8f2ee"/><stop offset="1" stop-color="#eadfd8"/></linearGradient><filter id="franceShadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#4a2834" flood-opacity=".14"/></filter></defs>
    <path class="blind-france-shape" filter="url(#franceShadow)" d="M438.7 145.3 L455.6 154.6 L507.0 161.2 L489.0 185.6 L484.4 211.1 L474.6 217.2 L458.4 213.9 L459.5 223.0 L433.4 243.0 L432.9 259.2 L449.9 253.6 L462.2 269.2 L460.7 279.3 L471.2 292.7 L458.8 303.6 L468.0 331.2 L487.4 335.8 L483.3 351.2 L451.0 371.4 L380.6 361.7 L328.6 373.3 L324.5 394.8 L283.1 399.5 L242.9 383.3 L230.0 391.0 L164.3 374.8 L150.0 360.9 L168.5 339.5 L175.3 268.4 L138.4 230.9 L112.1 212.9 L57.6 199.1 L54.0 173.1 L100.3 165.3 L160.2 174.5 L148.9 134.1 L182.6 149.4 L265.7 121.6 L276.4 92.3 L307.6 85.1 L312.8 97.7 L329.4 98.3 L346.0 112.6 L370.9 129.4 L389.2 126.7 L420.4 142.9 L428.4 146.0 L438.7 145.3 Z"/>
    <path class="blind-corsica" filter="url(#franceShadow)" d="M530.1 389.3 L553.1 375.7 L559.2 406.3 L547.4 433.8 L531.2 426.6 L522.9 402.6 L530.1 389.3 Z"/>
    <path class="blind-map-relief" d="M426 190 C445 230 450 278 435 320 M365 325 C405 337 446 340 480 326 M274 103 C285 151 304 199 327 241 C345 274 347 318 333 358"/>
   </svg>${dots}</div><div class="blind-map-legend"><span><i></i> Vignoble</span><span>Appuie sur un point pour ouvrir sa fiche</span></div></div>`;
}

function blindRegionCard(r,compact=false){
 if(!r)return '';
 return `<article class="blind-atlas-card ${compact?'compact':''}"><div class="blind-atlas-card-head"><span>${r.icon}</span><div><small>RÉGION</small><h3>${esc(r.name)}</h3></div></div>
  <div class="blind-atlas-facts"><div><span>🌤️ Climat</span><b>${esc(r.climate)}</b></div><div><span>🍷 Style</span><b>${esc(r.style)}</b></div></div>
  <div class="blind-atlas-block"><b>🍇 Cépages rouges</b><div class="chips">${r.reds.length?r.reds.map(x=>`<span class="chip static">${esc(x)}</span>`).join(''):'<span class="muted small">Peu représentés ici</span>'}</div></div>
  <div class="blind-atlas-block"><b>🥂 Cépages blancs</b><div class="chips">${r.whites.length?r.whites.map(x=>`<span class="chip static">${esc(x)}</span>`).join(''):'<span class="muted small">Peu représentés ici</span>'}</div></div>
  <div class="blind-atlas-block"><b>👃 Repères fréquents</b><p>${r.markers.map(esc).join(' · ')}</p></div>
  <div class="blind-atlas-note">🗺️ Dans le jeu, retiens la <b>région</b> : les appellations ne sont plus demandées.</div></article>`;
}


function blindGrapeMeta(name){return BLIND_GRAPE_DETAILS[name]||{orientation:[],confusions:[],questions:[]};}
function blindHintList(items,cls=''){
 if(!items||!items.length)return `<p class="muted small">Aide en cours d’enrichissement.</p>`;
 return `<ul class="blind-hint-list ${cls}">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
}

function blindGrapeCard(g){
 if(!g)return '';
 const d=blindGrapeMeta(g.name);
 const extraFacts=g.color==='Rouge'
   ? `<div><span>🧱 Structure</span><b>${esc(d.feel||'Repère de structure en cours')}</b></div><div><span>👁️ À l’œil</span><b>${esc(d.look||'Repère visuel en cours')}</b></div>`
   : `<div><span>🧴 Texture</span><b>${esc(d.feel||'Repère de texture en cours')}</b></div><div><span>👁️ À l’œil</span><b>${esc(d.look||'Repère visuel en cours')}</b></div>`;
 return `<article class="blind-atlas-card blind-grape-card"><div class="blind-atlas-card-head"><span>${g.color==='Rouge'?'🍷':'🥂'}</span><div><small>CÉPAGE ${esc(g.color.toUpperCase())}</small><h3>${esc(g.name)}</h3></div></div>
  <div class="blind-atlas-facts blind-grape-facts"><div><span>💪 Corps</span><b>${esc(g.body)}</b></div><div><span>🍋 Acidité</span><b>${esc(g.acid)}</b></div>${extraFacts}</div>
  <div class="blind-atlas-block"><b>🗺️ Où le chercher ?</b><div class="chips">${g.regions.map(x=>`<span class="chip static">${esc(x)}</span>`).join('')}</div></div>
  <div class="blind-atlas-block"><b>👃 Marqueurs classiques</b><p>${g.markers.map(esc).join(' · ')}</p></div>
  <div class="blind-atlas-grid-two">
    <div class="blind-atlas-softbox"><b>🧭 Pour t’orienter</b>${blindHintList(d.orientation)}</div>
    <div class="blind-atlas-softbox"><b>❓ Questions à te poser</b>${blindHintList(d.questions)}</div>
  </div>
  <div class="blind-atlas-softbox"><b>⚠️ À ne pas confondre</b>${blindHintList(d.confusions,'compact')}</div>
  <div class="blind-atlas-note">💡 Un marqueur n’est jamais une preuve. Utilise d’abord la structure du vin (corps, acidité, tanins / texture), puis confirme avec les arômes et les régions probables.</div></article>`;
}

function blindAtlasCompareHtml(){
 const selected=blindAtlasState.compare.map(id=>BLIND_WINE_REGIONS.find(r=>r.id===id)).filter(Boolean);
 const buttons=BLIND_WINE_REGIONS.map(r=>`<button type="button" class="blind-compare-chip ${blindAtlasState.compare.includes(r.id)?'sel':''}" onclick="toggleBlindCompareRegion('${r.id}')">${r.icon} ${esc(r.name)}</button>`).join('');
 if(selected.length<2)return `<div class="blind-compare-picker"><p><b>Choisis deux régions que tu hésites à jouer.</b><br><span class="muted">L’atlas te montre leurs différences générales, jamais laquelle correspond au vin en cours.</span></p><div class="blind-compare-grid">${buttons}</div></div>`;
 const [a,b]=selected;
 const common=[...new Set([...a.reds,...a.whites])].filter(x=>[...b.reds,...b.whites].includes(x));
 return `<div class="blind-compare-picker"><div class="blind-compare-grid">${buttons}</div></div>
 <div class="blind-versus"><div>${blindRegionCard(a,true)}</div><div class="blind-vs-badge">VS</div><div>${blindRegionCard(b,true)}</div></div>
 <div class="blind-compare-summary"><h3>⚡ Différence rapide</h3><div class="blind-compare-cols"><div><b>${esc(a.name)}</b><p>${esc(a.climate)}. ${esc(a.style)}</p></div><div><b>${esc(b.name)}</b><p>${esc(b.climate)}. ${esc(b.style)}</p></div></div>${common.length?`<p class="small muted"><b>Point commun possible :</b> ${common.map(esc).join(', ')}</p>`:''}</div>`;
}

function blindAtlasBodyHtml(){
 if(blindAtlasState.tab==='map'){
   const r=BLIND_WINE_REGIONS.find(x=>x.id===blindAtlasState.region)||null;
   return `<div class="blind-atlas-map-layout"><div>${blindFranceMapSvg()}<p class="blind-atlas-disclaimer">Carte pédagogique : positionnement géographique des vignobles, sans prétendre reproduire les limites exactes des AOP.</p><div class="blind-map-region-index">${BLIND_WINE_REGIONS.map(x=>`<button type="button" onclick="selectBlindAtlasRegion('${x.id}')">${x.icon} ${esc(x.name)}</button>`).join('')}</div></div><div class="blind-atlas-side">${r?blindRegionCard(r):'<div class="blind-atlas-empty"><span>🗺️</span><b>Touche une région</b><p>Tu verras ses cépages fréquents, son style et ses repères aromatiques.</p></div>'}</div></div>`;
 }
 if(blindAtlasState.tab==='regions'){
   const q='';
   return `<div class="blind-atlas-search"><input type="search" placeholder="Rechercher Bordeaux, Rhône, Pinot…" oninput="filterBlindAtlasRegions(this.value)"></div><div class="blind-atlas-region-list" id="blind-atlas-region-list">${BLIND_WINE_REGIONS.map(r=>`<button type="button" class="blind-atlas-list-item" data-search="${esc([r.name,...r.reds,...r.whites,...r.markers].join(' '))}" onclick="selectBlindAtlasRegion('${r.id}',true)"><span>${r.icon}</span><div><b>${esc(r.name)}</b><small>${esc([...r.reds,...r.whites].slice(0,4).join(' · '))}</small></div><span>→</span></button>`).join('')}</div><div id="blind-atlas-detail">${blindAtlasState.region?blindRegionCard(BLIND_WINE_REGIONS.find(r=>r.id===blindAtlasState.region)):''}</div>`;
 }
 if(blindAtlasState.tab==='grapes'){
   return `<div class="blind-atlas-search"><input type="search" placeholder="Rechercher Syrah, Chardonnay, cassis…" oninput="filterBlindAtlasGrapes(this.value)"></div><div class="blind-grape-layout"><div class="blind-grape-list" id="blind-grape-list">${BLIND_GRAPE_PROFILES.map(g=>`<button type="button" data-search="${esc(([g.name,g.color,...g.regions,...g.markers,...(blindGrapeMeta(g.name).orientation||[]),...(blindGrapeMeta(g.name).confusions||[]),...(blindGrapeMeta(g.name).questions||[]),blindGrapeMeta(g.name).look||'',blindGrapeMeta(g.name).feel||'']).join(' '))}" class="blind-grape-row ${blindAtlasState.grape===g.name?'sel':''}" onclick="selectBlindAtlasGrape(decodeURIComponent('${encodeURIComponent(g.name)}'))"><span>${g.color==='Rouge'?'🍷':'🥂'}</span><div><b>${esc(g.name)}</b><small>${esc(g.regions.join(' · '))}</small></div></button>`).join('')}</div><div id="blind-grape-detail">${blindAtlasState.grape?blindGrapeCard(BLIND_GRAPE_PROFILES.find(g=>g.name===blindAtlasState.grape)):'<div class="blind-atlas-empty"><span>🍇</span><b>Choisis un cépage</b><p>Repères de structure, de texture, de régions et d’arômes pour mieux t’orienter.</p></div>'}</div></div>`;
 }
 return blindAtlasCompareHtml();
}

function renderBlindAtlasModal(){
 const modal=document.getElementById('blind-atlas-overlay');
 if(!modal)return;
 modal.querySelector('.blind-atlas-tabs').innerHTML=[['map','🗺️ Carte'],['regions','📍 Régions'],['grapes','🍇 Cépages'],['compare','⚖️ Comparer']].map(([id,label])=>`<button type="button" class="${blindAtlasState.tab===id?'sel':''}" onclick="switchBlindAtlasTab('${id}')">${label}</button>`).join('');
 modal.querySelector('.blind-atlas-content').innerHTML=blindAtlasBodyHtml();
}

function openBlindWineAtlas(tab='map'){
 blindAtlasState.tab=tab;
 blindAtlasReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
 if(document.getElementById('blind-atlas-overlay'))return renderBlindAtlasModal();
 const overlay=document.createElement('div');overlay.id='blind-atlas-overlay';overlay.className='blind-atlas-overlay';
 overlay.innerHTML=`<section class="blind-atlas-modal" role="dialog" aria-modal="true" aria-label="Atlas du blind"><header class="blind-atlas-head"><div><small>AIDE GÉNÉRALE · AUCUN INDICE SUR CE VIN</small><h2>🗺️ Atlas du blind</h2></div><button type="button" onclick="closeBlindWineAtlas()" aria-label="Fermer">×</button></header><nav class="blind-atlas-tabs"></nav><div class="blind-atlas-content"></div></section>`;
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeBlindWineAtlas()});document.body.appendChild(overlay);document.body.classList.add('blind-atlas-open');renderBlindAtlasModal();
 requestAnimationFrame(()=>overlay.querySelector('.blind-atlas-head button')?.focus());
}
function closeBlindWineAtlas(){
 const overlay=document.getElementById('blind-atlas-overlay');
 if(!overlay)return;
 overlay.remove();document.body.classList.remove('blind-atlas-open');
 const target=blindAtlasReturnFocus;blindAtlasReturnFocus=null;
 if(target&&document.contains(target))requestAnimationFrame(()=>target.focus());
}
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.getElementById('blind-atlas-overlay'))closeBlindWineAtlas();
});
function switchBlindAtlasTab(tab){blindAtlasState.tab=tab;renderBlindAtlasModal()}
function selectBlindAtlasRegion(id,fromList=false){blindAtlasState.region=id;if(fromList)blindAtlasState.tab='regions';renderBlindAtlasModal();if(fromList)setTimeout(()=>document.getElementById('blind-atlas-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}
function selectBlindAtlasGrape(name){blindAtlasState.grape=name;renderBlindAtlasModal();setTimeout(()=>document.getElementById('blind-grape-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}
function toggleBlindCompareRegion(id){const a=blindAtlasState.compare;if(a.includes(id))blindAtlasState.compare=a.filter(x=>x!==id);else blindAtlasState.compare=[...a.slice(-1),id];renderBlindAtlasModal()}
function filterBlindAtlasRegions(value){const q=normalizeChoiceSearch(value);document.querySelectorAll('#blind-atlas-region-list [data-search]').forEach(el=>el.hidden=!!q&&!normalizeChoiceSearch(el.dataset.search).includes(q))}
function filterBlindAtlasGrapes(value){const q=normalizeChoiceSearch(value);document.querySelectorAll('#blind-grape-list [data-search]').forEach(el=>el.hidden=!!q&&!normalizeChoiceSearch(el.dataset.search).includes(q))}
