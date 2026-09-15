/* Blind Wine — Static Blind-mode wine atlas. General reference only; never reads current wine secrets. */
'use strict';

const BLIND_WINE_REGIONS=[
 {id:'bordeaux',name:'Bordeaux',icon:'🍷',x:142,y:326,climate:'Océanique, tempéré',reds:['Merlot','Cabernet Sauvignon','Cabernet Franc','Petit Verdot'],whites:['Sauvignon blanc','Sémillon'],markers:['cassis','prune','cèdre','tabac','tanins structurés'],appellations:['Médoc','Saint-Émilion','Pomerol','Graves','Sauternes'],style:'Rouges souvent structurés et assemblés ; blancs secs ou liquoreux.'},
 {id:'bourgogne',name:'Bourgogne',icon:'🍇',x:318,y:222,climate:'Continental, frais à modéré',reds:['Pinot noir'],whites:['Chardonnay','Aligoté'],markers:['cerise','framboise','sous-bois','beurre','agrumes','minéralité'],appellations:['Chablis','Côte de Nuits','Côte de Beaune','Mâconnais'],style:'Grande lisibilité du terroir ; rouges fins et blancs très variés.'},
 {id:'champagne',name:'Champagne',icon:'🥂',x:305,y:112,climate:'Septentrional, frais',reds:['Pinot noir','Meunier'],whites:['Chardonnay'],markers:['agrumes','pomme','brioche','craie','forte acidité'],appellations:['Montagne de Reims','Côte des Blancs','Vallée de la Marne'],style:'Effervescents tendus, acidité élevée, notes autolytiques avec l’âge.'},
 {id:'alsace',name:'Alsace',icon:'🌼',x:410,y:172,climate:'Continental, sec',reds:['Pinot noir'],whites:['Riesling','Gewurztraminer','Pinot gris','Pinot blanc'],markers:['fleurs','agrumes','fruits exotiques','épices','forte expression aromatique'],appellations:['Alsace','Alsace Grand Cru','Crémant d’Alsace'],style:'Blancs très aromatiques, du sec au moelleux, souvent mono-cépage.'},
 {id:'loire',name:'Loire',icon:'🌿',x:205,y:210,climate:'Océanique à continental',reds:['Cabernet Franc','Gamay','Pinot noir'],whites:['Sauvignon blanc','Chenin blanc','Melon de Bourgogne'],markers:['agrumes','pomme','fleurs','herbes','minéralité','acidité'],appellations:['Muscadet','Sancerre','Vouvray','Chinon','Saumur'],style:'Styles très divers, souvent marqués par fraîcheur et tension.'},
 {id:'beaujolais',name:'Beaujolais',icon:'🍒',x:315,y:270,climate:'Semi-continental',reds:['Gamay'],whites:['Chardonnay'],markers:['cerise','framboise','violette','poivre','corps léger à moyen'],appellations:['Morgon','Fleurie','Moulin-à-Vent','Brouilly'],style:'Rouges fruités et digestes, parfois plus structurés dans les crus.'},
 {id:'rhone-nord',name:'Rhône Nord',icon:'🌄',x:336,y:302,climate:'Continental à méditerranéen',reds:['Syrah'],whites:['Viognier','Marsanne','Roussanne'],markers:['mûre','violette','poivre noir','olive','fumé'],appellations:['Côte-Rôtie','Hermitage','Crozes-Hermitage','Condrieu'],style:'Syrah plus tendue et épicée ; blancs expressifs et structurés.'},
 {id:'rhone-sud',name:'Rhône Sud',icon:'☀️',x:327,y:374,climate:'Méditerranéen, chaud',reds:['Grenache','Syrah','Mourvèdre','Cinsault'],whites:['Grenache blanc','Roussanne','Marsanne'],markers:['fruits mûrs','garrigue','épices','chaleur','corps généreux'],appellations:['Châteauneuf-du-Pape','Gigondas','Vacqueyras','Côtes-du-Rhône'],style:'Assemblages solaires, généreux, épicés et souvent alcoolisés.'},
 {id:'jura',name:'Jura',icon:'⛰️',x:378,y:242,climate:'Continental, frais',reds:['Poulsard','Trousseau','Pinot noir'],whites:['Savagnin','Chardonnay'],markers:['noix','pomme','épices','minéralité','acidité'],appellations:['Arbois','Côtes du Jura','Château-Chalon'],style:'Styles singuliers, dont vins ouillés et vins sous voile.'},
 {id:'savoie',name:'Savoie',icon:'🏔️',x:397,y:294,climate:'Alpin, frais',reds:['Mondeuse','Gamay','Pinot noir'],whites:['Jacquère','Altesse','Chasselas'],markers:['agrumes','fleurs blanches','herbes','forte fraîcheur','corps léger'],appellations:['Apremont','Chignin','Roussette de Savoie'],style:'Vins frais, légers à moyens, très adaptés aux climats alpins.'},
 {id:'provence',name:'Provence',icon:'🌸',x:355,y:430,climate:'Méditerranéen, chaud et sec',reds:['Grenache','Cinsault','Syrah','Mourvèdre','Tibouren'],whites:['Rolle / Vermentino'],markers:['fruits rouges','agrumes','herbes','garrigue','fraîcheur saline'],appellations:['Côtes de Provence','Bandol','Coteaux d’Aix-en-Provence'],style:'Référence du rosé, mais aussi rouges méditerranéens et blancs salins.'},
 {id:'languedoc',name:'Languedoc-Roussillon',icon:'🌞',x:252,y:423,climate:'Méditerranéen, chaud',reds:['Grenache','Syrah','Mourvèdre','Carignan','Cinsault'],whites:['Picpoul','Grenache blanc','Roussanne'],markers:['fruits mûrs','épices','garrigue','réglisse','chaleur'],appellations:['Pic Saint-Loup','Corbières','Minervois','Collioure'],style:'Très large palette, souvent solaire et méditerranéenne.'},
 {id:'sud-ouest',name:'Sud-Ouest',icon:'🧭',x:172,y:390,climate:'Océanique à continental',reds:['Malbec','Tannat','Négrette','Fer Servadou'],whites:['Gros Manseng','Petit Manseng','Colombard'],markers:['fruits noirs','violette','épices','tanins','fruits exotiques pour les blancs'],appellations:['Cahors','Madiran','Jurançon','Fronton','Gaillac'],style:'Forte identité de cépages locaux, rouges parfois puissants.'},
 {id:'corse',name:'Corse',icon:'🏝️',x:444,y:446,climate:'Méditerranéen insulaire',reds:['Niellucciu','Sciaccarellu','Grenache'],whites:['Rolle / Vermentino'],markers:['maquis','herbes','fruits rouges','agrumes','salinité'],appellations:['Patrimonio','Ajaccio','Figari'],style:'Vins méditerranéens avec fraîcheur maritime et cépages insulaires.'}
];

const BLIND_GRAPE_PROFILES=[
 {name:'Cabernet Sauvignon',color:'Rouge',regions:['Bordeaux','Sud-Ouest'],markers:['cassis','cèdre','poivron mûr','tanins fermes'],body:'Moyen à puissant',acid:'Moyenne à élevée'},
 {name:'Merlot',color:'Rouge',regions:['Bordeaux','Sud-Ouest'],markers:['prune','cerise noire','chocolat','texture ronde'],body:'Moyen à puissant',acid:'Moyenne'},
 {name:'Cabernet Franc',color:'Rouge',regions:['Loire','Bordeaux'],markers:['framboise','violette','poivron','graphite'],body:'Léger à moyen',acid:'Moyenne à élevée'},
 {name:'Pinot noir',color:'Rouge',regions:['Bourgogne','Champagne','Alsace','Jura'],markers:['cerise','framboise','sous-bois','épices fines'],body:'Léger à moyen',acid:'Élevée'},
 {name:'Gamay',color:'Rouge',regions:['Beaujolais','Loire'],markers:['cerise','fraise','violette','poivre'],body:'Léger à moyen',acid:'Moyenne à élevée'},
 {name:'Syrah',color:'Rouge',regions:['Rhône Nord','Rhône Sud','Languedoc-Roussillon'],markers:['mûre','poivre noir','violette','olive'],body:'Moyen à puissant',acid:'Moyenne à élevée'},
 {name:'Grenache',color:'Rouge',regions:['Rhône Sud','Provence','Languedoc-Roussillon'],markers:['fraise mûre','cerise','garrigue','épices'],body:'Moyen à puissant',acid:'Plutôt basse'},
 {name:'Mourvèdre',color:'Rouge',regions:['Provence','Rhône Sud','Languedoc-Roussillon'],markers:['mûre','viande','herbes','tanins élevés'],body:'Puissant',acid:'Moyenne'},
 {name:'Tannat',color:'Rouge',regions:['Sud-Ouest'],markers:['mûre','prune','épices','tanins très fermes'],body:'Puissant',acid:'Moyenne à élevée'},
 {name:'Malbec',color:'Rouge',regions:['Sud-Ouest'],markers:['prune','mûre','violette','réglisse'],body:'Moyen à puissant',acid:'Moyenne'},
 {name:'Chardonnay',color:'Blanc',regions:['Bourgogne','Champagne','Jura'],markers:['citron','pomme','beurre','noisette selon élevage'],body:'Léger à puissant',acid:'Moyenne à élevée'},
 {name:'Sauvignon blanc',color:'Blanc',regions:['Loire','Bordeaux'],markers:['agrumes','buis','herbe','fruit de la passion'],body:'Léger à moyen',acid:'Élevée'},
 {name:'Chenin blanc',color:'Blanc',regions:['Loire'],markers:['pomme','coing','miel','fleurs'],body:'Léger à moyen',acid:'Très élevée'},
 {name:'Riesling',color:'Blanc',regions:['Alsace'],markers:['citron','pomme','fleurs','pétrole avec l’âge'],body:'Léger à moyen',acid:'Très élevée'},
 {name:'Gewurztraminer',color:'Blanc',regions:['Alsace'],markers:['litchi','rose','épices','fruits exotiques'],body:'Moyen à ample',acid:'Plutôt basse'},
 {name:'Viognier',color:'Blanc',regions:['Rhône Nord'],markers:['abricot','pêche','violette','texture ample'],body:'Moyen à ample',acid:'Plutôt basse'},
 {name:'Sémillon',color:'Blanc',regions:['Bordeaux'],markers:['citron','cire','miel','fruits secs avec l’âge'],body:'Moyen à ample',acid:'Moyenne'},
 {name:'Melon de Bourgogne',color:'Blanc',regions:['Loire'],markers:['citron','pomme verte','iode','levure'],body:'Léger',acid:'Élevée'},
 {name:'Savagnin',color:'Blanc',regions:['Jura'],markers:['pomme','noix','épices','curry sous voile'],body:'Moyen',acid:'Élevée'},
 {name:'Rolle / Vermentino',color:'Blanc',regions:['Provence','Corse'],markers:['agrumes','poire','herbes','salinité'],body:'Léger à moyen',acid:'Moyenne à élevée'}
];

let blindAtlasState={tab:'map',region:null,grape:null,compare:[]};

function blindWineAtlasButtonHtml(){
 return `<button type="button" class="blind-atlas-launch" onclick="openBlindWineAtlas()"><span>🗺️</span><div><b>Atlas du blind</b><small>Carte de France · régions · cépages · comparer</small></div><span class="blind-atlas-launch-arrow">→</span></button>`;
}

function blindFranceMapSvg(){
 const dots=BLIND_WINE_REGIONS.map(r=>`<button type="button" class="blind-map-hotspot" style="--x:${r.x/5}%;--y:${r.y/5.6}%" onclick="selectBlindAtlasRegion('${r.id}')" aria-label="${esc(r.name)}"><span class="blind-map-dot"></span><b>${esc(r.name.replace('Languedoc-Roussillon','Languedoc').replace('Rhône ','Rh. '))}</b></button>`).join('');
 return `<div class="blind-france-map" aria-label="Carte des grandes régions viticoles françaises">
   <svg viewBox="0 0 500 560" role="img" aria-label="Silhouette de la France">
    <path class="blind-france-shape" d="M153 55 L235 35 L322 58 L390 111 L430 181 L405 252 L427 325 L390 392 L356 455 L284 494 L205 475 L157 430 L102 396 L76 329 L88 261 L58 198 L91 134 Z"/>
    <path class="blind-france-river" d="M245 80 C240 150 270 210 300 255 C315 280 320 340 304 410"/>
    <path class="blind-france-river" d="M115 220 C175 212 210 205 265 190"/>
    <path class="blind-corsica" d="M440 414 C456 420 465 444 459 477 C455 501 441 512 431 492 C425 469 430 436 440 414Z"/>
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
   return `<div class="blind-atlas-map-layout"><div>${blindFranceMapSvg()}<p class="blind-atlas-disclaimer">Carte pédagogique simplifiée : les zones indiquent les grands bassins viticoles, pas les limites exactes des appellations.</p></div><div class="blind-atlas-side">${r?blindRegionCard(r):'<div class="blind-atlas-empty"><span>🗺️</span><b>Touche une région</b><p>Tu verras ses cépages fréquents, ses repères aromatiques et quelques appellations.</p></div>'}</div></div>`;
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
 if(document.getElementById('blind-atlas-overlay'))return renderBlindAtlasModal();
 const overlay=document.createElement('div');overlay.id='blind-atlas-overlay';overlay.className='blind-atlas-overlay';
 overlay.innerHTML=`<section class="blind-atlas-modal" role="dialog" aria-modal="true" aria-label="Atlas du blind"><header class="blind-atlas-head"><div><small>AIDE GÉNÉRALE · AUCUN INDICE SUR CE VIN</small><h2>🗺️ Atlas du blind</h2></div><button type="button" onclick="closeBlindWineAtlas()" aria-label="Fermer">×</button></header><nav class="blind-atlas-tabs"></nav><div class="blind-atlas-content"></div></section>`;
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeBlindWineAtlas()});document.body.appendChild(overlay);document.body.classList.add('blind-atlas-open');renderBlindAtlasModal();
}
function closeBlindWineAtlas(){document.getElementById('blind-atlas-overlay')?.remove();document.body.classList.remove('blind-atlas-open')}
function switchBlindAtlasTab(tab){blindAtlasState.tab=tab;renderBlindAtlasModal()}
function selectBlindAtlasRegion(id,fromList=false){blindAtlasState.region=id;if(fromList)blindAtlasState.tab='regions';renderBlindAtlasModal();if(fromList)setTimeout(()=>document.getElementById('blind-atlas-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}
function selectBlindAtlasGrape(name){blindAtlasState.grape=name;renderBlindAtlasModal()}
function toggleBlindCompareRegion(id){const a=blindAtlasState.compare;if(a.includes(id))blindAtlasState.compare=a.filter(x=>x!==id);else blindAtlasState.compare=[...a.slice(-1),id];renderBlindAtlasModal()}
function filterBlindAtlasRegions(value){const q=normalizeChoiceSearch(value);document.querySelectorAll('#blind-atlas-region-list [data-search]').forEach(el=>el.hidden=!!q&&!normalizeChoiceSearch(el.dataset.search).includes(q))}
function filterBlindAtlasGrapes(value){const q=normalizeChoiceSearch(value);document.querySelectorAll('#blind-grape-list [data-search]').forEach(el=>el.hidden=!!q&&!normalizeChoiceSearch(el.dataset.search).includes(q))}
