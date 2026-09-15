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

let blindAtlasState={tab:'map',region:null,grape:null,compare:[]};
let blindAtlasReturnFocus=null;

function blindWineAtlasButtonHtml(){
 return `<button type="button" class="blind-atlas-launch" onclick="openBlindWineAtlas()"><span>🗺️</span><div><b>Atlas du blind</b><small>Carte de France · régions · cépages · comparer</small></div><span class="blind-atlas-launch-arrow">→</span></button>`;
}

function blindFranceMapSvg(){
 const dots=BLIND_WINE_REGIONS.map(r=>`<button type="button" class="blind-map-hotspot" style="--x:${r.x/5}%;--y:${r.y/5.6}%" onclick="selectBlindAtlasRegion('${r.id}')" aria-label="${esc(r.name)}" title="${esc(r.name)}"><span class="blind-map-dot"></span><b>${esc(r.name.replace('Lyonnais · Forez · Roannaise','Lyonnais/Forez').replace('Loire · ','').replace('Rhône ','Rh. '))}</b></button>`).join('');
 return `<div class="blind-france-map" aria-label="Carte des régions viticoles françaises">
   <svg viewBox="0 0 500 560" role="img" aria-label="Silhouette géographique simplifiée de la France métropolitaine">
    <path class="blind-france-shape" d="M106 92 L150 70 L204 76 L240 48 L302 52 L337 76 L374 80 L397 110 L430 128 L444 168 L431 207 L448 242 L428 277 L440 316 L415 346 L404 385 L378 409 L360 451 L322 468 L288 500 L240 492 L205 469 L169 458 L148 424 L112 410 L94 379 L65 363 L62 325 L77 292 L62 258 L77 226 L55 197 L65 162 L89 139 Z"/>
    <path class="blind-france-coast" d="M106 92 L84 82 L58 91 L72 109 L49 118 L63 136 L89 139"/>
    <path class="blind-france-coast" d="M148 424 L132 447 L158 459 L169 458"/>
    <path class="blind-france-river" d="M260 69 C250 130 270 182 304 223 C323 247 330 305 322 381"/>
    <path class="blind-france-river" d="M88 224 C151 214 213 207 286 191"/>
    <path class="blind-corsica" d="M452 414 C469 423 477 448 469 483 C465 508 449 520 438 499 C431 474 438 435 452 414Z"/>
   </svg>${dots}</div>`;
}

function blindRegionCard(r,compact=false){
 if(!r)return '';
 return `<article class="blind-atlas-card ${compact?'compact':''}"><div class="blind-atlas-card-head"><span>${r.icon}</span><div><small>RÉGION</small><h3>${esc(r.name)}</h3></div></div>
  <div class="blind-atlas-facts"><div><span>🌤️ Climat</span><b>${esc(r.climate)}</b></div><div><span>🍷 Style</span><b>${esc(r.style)}</b></div></div>
  <div class="blind-atlas-block"><b>🍇 Cépages rouges</b><div class="chips">${r.reds.length?r.reds.map(x=>`<span class="chip static">${esc(x)}</span>`).join(''):'<span class="muted small">Peu représentés ici</span>'}</div></div>
  <div class="blind-atlas-block"><b>🥂 Cépages blancs</b><div class="chips">${r.whites.length?r.whites.map(x=>`<span class="chip static">${esc(x)}</span>`).join(''):'<span class="muted small">Peu représentés ici</span>'}</div></div>
  <div class="blind-atlas-block"><b>👃 Repères fréquents</b><p>${r.markers.map(esc).join(' · ')}</p></div>
  <div class="blind-atlas-block"><b>📍 Appellations à retenir</b><p>${r.appellations.map(esc).join(' · ')}</p></div></article>`;
}

function blindGrapeCard(g){
 if(!g)return '';
 return `<article class="blind-atlas-card"><div class="blind-atlas-card-head"><span>${g.color==='Rouge'?'🍷':'🥂'}</span><div><small>CÉPAGE ${esc(g.color.toUpperCase())}</small><h3>${esc(g.name)}</h3></div></div>
  <div class="blind-atlas-facts"><div><span>💪 Corps</span><b>${esc(g.body)}</b></div><div><span>🍋 Acidité</span><b>${esc(g.acid)}</b></div></div>
  <div class="blind-atlas-block"><b>🗺️ Où le chercher ?</b><div class="chips">${g.regions.map(x=>`<span class="chip static">${esc(x)}</span>`).join('')}</div></div>
  <div class="blind-atlas-block"><b>👃 Marqueurs classiques</b><p>${g.markers.map(esc).join(' · ')}</p></div>
  <div class="blind-atlas-note">💡 Un marqueur est une piste, jamais une preuve. Millésime, terroir et vinification peuvent changer fortement le profil.</div></article>`;
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
   return `<div class="blind-atlas-map-layout"><div>${blindFranceMapSvg()}<p class="blind-atlas-disclaimer">Carte pédagogique : positionnement géographique des vignobles, sans prétendre reproduire les limites exactes des AOP.</p><div class="blind-map-region-index">${BLIND_WINE_REGIONS.map(x=>`<button type="button" onclick="selectBlindAtlasRegion('${x.id}')">${x.icon} ${esc(x.name)}</button>`).join('')}</div></div><div class="blind-atlas-side">${r?blindRegionCard(r):'<div class="blind-atlas-empty"><span>🗺️</span><b>Touche une région</b><p>Tu verras ses cépages fréquents, ses repères aromatiques et quelques appellations.</p></div>'}</div></div>`;
 }
 if(blindAtlasState.tab==='regions'){
   const q='';
   return `<div class="blind-atlas-search"><input type="search" placeholder="Rechercher Bordeaux, Rhône, Pinot…" oninput="filterBlindAtlasRegions(this.value)"></div><div class="blind-atlas-region-list" id="blind-atlas-region-list">${BLIND_WINE_REGIONS.map(r=>`<button type="button" class="blind-atlas-list-item" data-search="${esc([r.name,...r.reds,...r.whites,...r.markers].join(' '))}" onclick="selectBlindAtlasRegion('${r.id}',true)"><span>${r.icon}</span><div><b>${esc(r.name)}</b><small>${esc([...r.reds,...r.whites].slice(0,4).join(' · '))}</small></div><span>→</span></button>`).join('')}</div><div id="blind-atlas-detail">${blindAtlasState.region?blindRegionCard(BLIND_WINE_REGIONS.find(r=>r.id===blindAtlasState.region)):''}</div>`;
 }
 if(blindAtlasState.tab==='grapes'){
   return `<div class="blind-atlas-search"><input type="search" placeholder="Rechercher Syrah, Chardonnay, cassis…" oninput="filterBlindAtlasGrapes(this.value)"></div><div class="blind-grape-layout"><div class="blind-grape-list" id="blind-grape-list">${BLIND_GRAPE_PROFILES.map(g=>`<button type="button" data-search="${esc([g.name,g.color,...g.regions,...g.markers].join(' '))}" class="blind-grape-row ${blindAtlasState.grape===g.name?'sel':''}" onclick="selectBlindAtlasGrape(decodeURIComponent('${encodeURIComponent(g.name)}'))"><span>${g.color==='Rouge'?'🍷':'🥂'}</span><div><b>${esc(g.name)}</b><small>${esc(g.regions.join(' · '))}</small></div></button>`).join('')}</div><div id="blind-grape-detail">${blindAtlasState.grape?blindGrapeCard(BLIND_GRAPE_PROFILES.find(g=>g.name===blindAtlasState.grape)):'<div class="blind-atlas-empty"><span>🍇</span><b>Choisis un cépage</b><p>Repères de corps, acidité, régions et arômes classiques.</p></div>'}</div></div>`;
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
