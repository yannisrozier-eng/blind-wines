/* Blind Wine — Player-facing tasting sheets, answer persistence and final recap. */
'use strict';

async function renderPlayerLobby(){
 if(typeof closeBlindWineAtlas==="function")closeBlindWineAtlas();
 const ps=await getPlayers();
 document.getElementById("app").innerHTML=`<div class="card hero"><div class=emoji>${modeInfo().icon}</div><span class=pill>PARTIE ${esc(game.code)} · ${modeBadge()}</span><h1>Salut ${esc(player.name)} !</h1><p>Tu es connecté.</p>
 ${game.experience_mode==='discovery'?discoveryThemeSummary():''}<div class=notice>En attente du lancement de la dégustation…</div><h3>Joueurs</h3><div class=chips>${ps.filter(p=>p.user_id!==game.host_id).map(p=>`<span class=chip>👤 ${esc(p.name)}</span>`).join("")}</div></div>`;
}

async function getAnswer(wineId,force=false){
 const key=`${game.id}:${wineId}:${user.id}`;
 if(!force&&answerCache.has(key))return answerCache.get(key);
 const r=await supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("wine_id",wineId).eq("user_id",user.id).maybeSingle();
 if(r.error)toast(r.error.message);
 const value=r.data||{game_id:game.id,wine_id:wineId,user_id:user.id,scores:{},aromas:[],note:null,price:null,region:"",grapes:[],grape:"",hint_level:0,discovery_step:0,quiz_choice:null,discovery_compare:{},done:false};
 answerCache.set(key,value);return value;
}

async function renderPlayerTasting(){
 const ws=await getBlindWines(),w=ws[game.current];
 if(!w)return toast("Vin introuvable.");
 const a=await getAnswer(w.id);

 if(a.done){
   const waitTitle=game.experience_mode==="discovery"?"Étape enregistrée":game.experience_mode==="challenge"?"Pronostic verrouillé":"Pronostic verrouillé";
   const waitIcon=game.experience_mode==="discovery"?"🎓":game.experience_mode==="challenge"?"🥂":"🔒";
   const waitCopy=game.experience_mode==="blind"?"Ton pari est scellé. Maintenant, regarde les autres hésiter 👀":game.experience_mode==="discovery"?"Ton étape est enregistrée. Le groupe poursuit l’expérience.":"Ton pronostic est verrouillé.";
   const waitNotice=game.experience_mode==="blind"?"🔒 Plus de retour en arrière. Révélation dès que l’organisateur lance le 3… 2… 1…":"Cette réponse est verrouillée pour ce vin.";
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>VIN ${game.current+1}/${game.wine_count||ws.length}</span></header>
   <div class="card hero"><div class=emoji>${waitIcon}</div><h1>${waitTitle}</h1><p class=muted>${waitCopy}</p><div class=notice>${waitNotice}</div></div>`;
   return;
 }

 if(game.experience_mode==="discovery"){
   const [discovery,feedback,doneR,revealR]=await Promise.all([
    getDiscoveryWine(w.id),
    Number.isInteger(a.quiz_choice)?getDiscoveryQuizFeedback(w.id):Promise.resolve(null),
    supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("user_id",user.id).eq("done",true),
    supabaseClient.from("wine_reveals").select("*").eq("game_id",game.id)
   ]);
   const progressError=doneR.error||revealR.error;
   if(progressError)return toast(progressError.message);
   const previousWine=game.current>0?ws[game.current-1]:null;
   const previousAnswer=previousWine?await getAnswer(previousWine.id,true):null;
   const sessionProgress=discoveryProgressSummary(doneR.data||[],revealR.data||[],ws);
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>${esc(player.name)}</span></header>${renderDiscoveryJourney(w,a,discovery,feedback,previousAnswer,sessionProgress,ws.length)}`;
   return;
 }

 if(game.experience_mode==="challenge")return renderPlayerChallengeTasting(w,a,ws);
 return renderPlayerBlindTasting(w,a,ws);
}

function regionGrapeGuideHtml(){
 return `<details class="reference-guide">
   <summary><span>🗺️ Mémo général : régions & cépages</span><span>⌄</span></summary>
   <div class="reference-guide-body">
     <p class="small muted">Référence générale, indépendante de la bouteille en cours : principaux cépages par région, à titre indicatif.</p>
     <div class="reference-search-wrap"><input type="search" class="reference-search" placeholder="Rechercher Rhône, Syrah, Bourgogne…" oninput="filterRegionGrapeGuide(this)"></div>
     <div class="reference-grid">
       ${REGION_GRAPE_GUIDE.map(r=>`<div class="reference-card" data-guide-search="${esc([r.region,...r.grapes].join(" "))}">
         <h4>${r.icon} ${esc(r.region)}</h4>
         <div class=chips>${r.grapes.map(g=>`<span class="chip static">${esc(g)}</span>`).join("")}</div>
       </div>`).join("")}
     </div>
     <div class="reference-empty" hidden>Aucune région ou cépage trouvé.</div>
   </div>
 </details>`;
}

function filterRegionGrapeGuide(input){
 const q=normalizeChoiceSearch(input.value);
 const root=input.closest(".reference-guide");
 const cards=Array.from(root.querySelectorAll(".reference-card"));
 let visible=0;
 cards.forEach(card=>{
   const hay=normalizeChoiceSearch(card.dataset.guideSearch||"");
   const show=!q||hay.includes(q);
   card.hidden=!show;
   if(show)visible++;
 });
 const empty=root.querySelector(".reference-empty");
 if(empty)empty.hidden=visible>0;
}

function blindRoundIntroKey(wineId){return `blindwine:blind-round:${game.id}:${wineId}:${user.id}`}

function hasSeenBlindRoundIntro(wineId){return sessionStorage.getItem(blindRoundIntroKey(wineId))==="1"}

function startBlindRound(wineId){
 sessionStorage.setItem(blindRoundIntroKey(wineId),"1");
 renderPlayerTasting();
}

function blindRoundIntroHtml(w,ws){
 const round=game.current+1;
 const punchlines=["Fais confiance à ton nez.","Ton palais a peut-être déjà la réponse.","Pas d’étiquette. Juste toi et le verre.","Observe. Goûte. Puis ose ton pari."];
 return `<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎯 À L’AVEUGLE</span></header>
 <div class="blind-round-intro">
   <div class="blind-round-number">MANCHE ${round}<span>/ ${ws.length}</span></div>
   <div class="blind-round-glass">${ICON[w.type]}</div>
   <div class="blind-round-kicker">11 POINTS EN JEU</div>
   <h1>À toi de lire le verre.</h1>
   <p>${punchlines[(round-1)%punchlines.length]}</p>
   <div class="blind-round-objectives"><span><i class="blind-objective-icon" aria-hidden="true">💰</i><em>Prix</em><b>5 pts</b></span><span><i class="blind-objective-icon" aria-hidden="true">🗺️</i><em>Région</em><b>3 pts</b></span><span><i class="blind-objective-icon" aria-hidden="true">🍇</i><em>Cépages</em><b>3 pts</b></span></div>
   <button type="button" class="btn blind-round-start" onclick="startBlindRound('${w.id}')">🍷 Je déguste</button>
 </div>`;
}

function blindBetSummaryHtml(a){
 const grapes=answerGrapes(a);
 return `<div class="blind-lock-summary">
   <div><span>💰 Ton prix</span><b>${a.price!=null&&a.price>0?Number(a.price).toFixed(2)+" €":"—"}</b></div>
   <div><span>🗺️ Ta région</span><b>${a.region?esc(regionLabel(a.region)):"—"}</b></div>
   <div><span>🍇 Ton pari cépage</span><b>${grapes.length?esc(grapes.join(" / ")):"—"}</b></div>
 ${a.scores?.confidence?`<div><span>🎲 Ta confiance</span><b>${blindConfidenceMeta(a.scores.confidence).join(" ")}</b></div>`:""}
 </div>`;
}

async function requestBlindLock(wineId){
 const key=`${game.id}:${wineId}:${user.id}`;
 const pending=answerWriteQueues.get(key);if(pending)await pending.catch(()=>{});
 const a=await getAnswer(wineId,true);
 if(a.done)return;
 if(!a.note)return toast("Ajoute ta note plaisir avant de verrouiller.");
 if(!(a.aromas||[]).length)return toast("Choisis au moins un arôme avant de verrouiller.");
 if(!a.scores?.look||!a.scores?.nose||!a.scores?.acid||!a.scores?.sweet||!a.scores?.body||!a.scores?.finish)return toast("Termine les étapes Regarde, Sens et Goûte avant de verrouiller.");
 if(!a.scores?.confidence)return toast("Indique ton niveau de confiance avant de verrouiller.");
 if(a.price==null||a.price<=0||!a.region||!answerGrapes(a).length)return toast("Complète tes 3 paris : prix, région et cépage(s).");
 const overlay=document.createElement("div");
 overlay.className="blind-lock-overlay";
 overlay.innerHTML=`<div class="blind-lock-modal" role="dialog" aria-modal="true" aria-label="Confirmer le pronostic">
   <button type="button" class="blind-lock-close" aria-label="Fermer">×</button>
   <div class="blind-lock-icon">🔒</div><div class="blind-lock-kicker">DERNIER REGARD</div>
   <h2>Tu verrouilles ce pari ?</h2>
   <p class="muted">Après validation, plus de retour en arrière.</p>
   ${blindBetSummaryHtml(a)}
   <div class="blind-lock-actions"><button type="button" class="btn secondary blind-lock-cancel">Je vérifie encore</button><button type="button" class="btn blind-lock-confirm">🔥 Je verrouille</button></div>
 </div>`;
 const close=()=>overlay.remove();
 overlay.querySelector('.blind-lock-close').onclick=close;
 overlay.querySelector('.blind-lock-cancel').onclick=close;
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 overlay.querySelector('.blind-lock-confirm').onclick=async()=>{const b=overlay.querySelector('.blind-lock-confirm');b.disabled=true;b.textContent='🔒 Verrouillage…';await submitAnswer(wineId);close()};
 document.body.appendChild(overlay);
}


const BLIND_AROMA_GROUPS={
 red:[
  {name:'Fruits rouges',icon:'🍓',items:['Fraise','Framboise','Cerise','Griotte','Groseille','Cranberry']},
  {name:'Fruits noirs',icon:'🫐',items:['Cassis','Mûre','Prune','Myrtille','Cerise noire']},
  {name:'Floral',icon:'🌸',items:['Violette','Rose','Pivoine','Fleurs séchées']},
  {name:'Épices & herbes',icon:'🌿',items:['Poivre noir','Poivre blanc','Réglisse','Garrigue','Thym','Laurier','Menthe','Olive noire']},
  {name:'Élevage',icon:'🪵',items:['Vanille','Cèdre','Bois toasté','Café','Cacao','Tabac']},
  {name:'Évolution',icon:'🍂',items:['Cuir','Sous-bois','Champignon','Terre humide','Viande fumée','Truffe']},
  {name:'Minéral / autres',icon:'🪨',items:['Graphite','Pierre','Fumée','Sanguin / fer']}
 ],
 white:[
  {name:'Agrumes',icon:'🍋',items:['Citron','Citron vert','Pamplemousse','Orange','Mandarine','Zeste d’agrumes']},
  {name:'Fruits blancs',icon:'🍐',items:['Pomme verte','Pomme mûre','Poire','Coing']},
  {name:'Fruits jaunes',icon:'🍑',items:['Pêche','Abricot','Mirabelle','Nectarine']},
  {name:'Exotiques',icon:'🥭',items:['Ananas','Fruit de la passion','Mangue','Litchi']},
  {name:'Floral',icon:'🌼',items:['Fleurs blanches','Acacia','Chèvrefeuille','Rose','Violette']},
  {name:'Végétal / herbacé',icon:'🌿',items:['Herbe fraîche','Buis','Fenouil','Menthe','Foin']},
  {name:'Élevage / texture',icon:'🪵',items:['Vanille','Beurre','Noisette','Amande','Brioche','Levure','Pain grillé']},
  {name:'Évolution',icon:'🍯',items:['Miel','Cire','Fruits secs','Noix','Curry','Pétrole']},
  {name:'Minéral / marin',icon:'🪨',items:['Pierre à fusil','Craie','Silex','Iode','Salin']}
 ],
 rose:[
  {name:'Fruits rouges',icon:'🍓',items:['Fraise','Framboise','Groseille','Cerise','Pastèque']},
  {name:'Agrumes',icon:'🍊',items:['Pamplemousse','Orange','Citron','Zeste d’agrumes']},
  {name:'Fruits jaunes / exotiques',icon:'🍑',items:['Pêche','Abricot','Melon','Fruit de la passion']},
  {name:'Floral',icon:'🌸',items:['Rose','Fleurs blanches','Pivoine']},
  {name:'Herbes & épices',icon:'🌿',items:['Garrigue','Thym','Poivre blanc','Fenouil']},
  {name:'Minéral / marin',icon:'🪨',items:['Pierre','Iode','Salin']}
 ]
};
function blindAromaGroups(type){return BLIND_AROMA_GROUPS[type]||BLIND_AROMA_GROUPS.red;}
function blindAromaPickerHtml(w,a){
 const selected=a.aromas||[];
 return `<section class="blind-aromas-required"><div class="blind-aroma-title"><div><span>👃 ARÔMES · OBLIGATOIRE</span><b>Qu’est-ce que tu reconnais vraiment ?</b></div><em>${selected.length} sélectionné${selected.length>1?'s':''}</em></div><p class="muted small">Choisis au moins un arôme. Plus tes choix sont précis, plus l’aide cépage pourra affiner ses pistes.</p><div class="blind-aroma-groups">${blindAromaGroups(w.type).map(group=>`<div class="blind-aroma-group"><h4><span>${group.icon}</span>${esc(group.name)}</h4><div class="chips">${group.items.map(x=>`<button type="button" class="chip blind-aroma-chip ${selected.includes(x)?'sel':''}" onclick="toggleAroma('${w.id}',decodeURIComponent('${encodeURIComponent(x)}'),this)">${esc(x)}</button>`).join('')}</div></div>`).join('')}</div></section>`;
}

const BLIND_METRIC_OPTIONS={
 look:[['🌫️','Pâle'],['🌤️','Clair'],['🎨','Moyen'],['🌅','Soutenu'],['🌑','Intense']],
 nose:[['🤫','Discret'],['🌱','Léger'],['👃','Présent'],['🌺','Expressif'],['💥','Intense']],
 acid:[['🫧','Doux'],['🙂','Souple'],['🍋','Frais'],['⚡','Vif'],['🧊','Tranchant']],
 sweet:[['🪨','Sec'],['🌾','Presque sec'],['🍐','Tendre'],['🍯','Doux'],['🍬','Très doux']],
 body:[['🪶','Léger'],['🌿','Fin'],['⚖️','Moyen'],['💪','Charpenté'],['🗿','Puissant']],
 finish:[['⚡','Courte'],['⏱️','Brève'],['🕰️','Moyenne'],['🧵','Longue'],['♾️','Très longue']]
};

function blindScaleValue(text,kind){
 const s=normalizeChoiceSearch(text||'');
 if(kind==='acid'){if(s.includes('tres elevee'))return 5;if(s.includes('elevee'))return 4;if(s.includes('plutot basse'))return 2;if(s.includes('basse'))return 1;return 3}
 if(kind==='body'){if(s.includes('puissant'))return 5;if(s.includes('ample'))return 4;if(s.includes('moyen'))return 3;if(s.includes('leger'))return 2;return 3}
 return 3;
}
function blindAromaKeywords(label){
 const s=normalizeChoiceSearch(label||'');
 const direct={
  'fraise':['fraise'],'framboise':['framboise'],'cerise':['cerise'],'griotte':['cerise'],'groseille':['groseille','fruits rouges'],'cranberry':['fruits rouges'],
  'cassis':['cassis'],'mure':['mure','fruits noirs'],'prune':['prune'],'myrtille':['fruits noirs'],'cerise noire':['cerise noire','fruits noirs'],
  'violette':['violette'],'rose':['rose','fleurs'],'pivoine':['fleurs'],'fleurs sechees':['fleurs','floral'],'fleurs blanches':['fleurs','floral'],'acacia':['fleurs'],'chevrefeuille':['fleurs'],
  'poivre noir':['poivre'],'poivre blanc':['poivre'],'reglisse':['reglisse','epices'],'garrigue':['garrigue','herbes'],'thym':['herbes','garrigue'],'laurier':['herbes'],'menthe':['herbes'],'olive noire':['olive'],
  'vanille':['vanille','boise'],'cedre':['cedre','boise'],'bois toaste':['boise','toaste'],'cafe':['cafe','boise'],'cacao':['chocolat','cacao'],'tabac':['tabac','cedre'],'cuir':['cuir'],'sous bois':['sous-bois','terre'],'champignon':['sous-bois','champignon'],'terre humide':['terre','sous-bois'],'viande fumee':['viande','fume'],'truffe':['sous-bois','truffe'],
  'graphite':['graphite'],'pierre':['pierre','mineral'],'fumee':['fume'],'sanguin fer':['fer','sanguin'],
  'citron':['citron','agrumes'],'citron vert':['citron','agrumes'],'pamplemousse':['agrumes'],'orange':['agrumes'],'mandarine':['agrumes'],'zeste agrumes':['agrumes'],
  'pomme verte':['pomme'],'pomme mure':['pomme'],'poire':['poire'],'coing':['coing'],'peche':['peche'],'abricot':['abricot'],'mirabelle':['fruits jaunes'],'nectarine':['peche'],'ananas':['fruits exotiques'],'fruit de la passion':['passion','fruits exotiques'],'mangue':['fruits exotiques'],'litchi':['litchi','fruits exotiques'],
  'herbe fraiche':['herbe','vegetal'],'buis':['buis','vegetal'],'fenouil':['fenouil','herbes'],'foin':['herbe','vegetal'],
  'beurre':['beurre'],'noisette':['noisette'],'amande':['amande'],'brioche':['brioche','levure'],'levure':['levure'],'pain grille':['toaste','brioche'],'miel':['miel'],'cire':['cire'],'fruits secs':['fruits secs'],'noix':['noix'],'curry':['curry','epices'],'petrole':['petrole'],
  'pierre a fusil':['pierre','mineral','fumee'],'craie':['craie','mineral'],'silex':['pierre','mineral','fumee'],'iode':['iode','salin'],'salin':['salin','iode'],
  'pasteque':['fruits rouges'],'melon':['fruits jaunes']
 };
 if(direct[s])return direct[s];
 return [s];
}
function blindGrapeAssistCandidates(w,a){
 if(typeof BLIND_GRAPE_PROFILES==='undefined')return [];
 const isRose=w?.type==='rose';
 const type=w?.type==='white'?'Blanc':'Rouge';
 const rosePool=new Set(['Cinsault','Grenache','Syrah','Mourvèdre','Gamay','Pinot noir','Cabernet Franc','Cabernet Sauvignon','Merlot']);
 const body=a.scores?.body||null,acid=a.scores?.acid||null,look=a.scores?.look||null;
 const aromas=a.aromas||[];
 const ranked=BLIND_GRAPE_PROFILES.filter(g=>g.color===type&&(!isRose||rosePool.has(g.name))).map(g=>{
   let score=0;const why=[];
   if(body){const target=blindScaleValue(g.body,'body');const d=Math.abs(body-target);score+=Math.max(0,3-d);if(d<=1)why.push(`corps ${g.body.toLowerCase()}`)}
   if(acid){const target=blindScaleValue(g.acid,'acid');const d=Math.abs(acid-target);score+=Math.max(0,3-d);if(d<=1)why.push(`acidité ${g.acid.toLowerCase()}`)}
   if(look&&g.color==='Rouge'){const meta=typeof blindGrapeMeta==='function'?blindGrapeMeta(g.name):null;const l=normalizeChoiceSearch(meta?.look||'');if(look<=2&&(l.includes('pale')||l.includes('claire')||l.includes('legere'))){score+=1.5;why.push('robe plutôt claire')}if(look>=4&&(l.includes('sombre')||l.includes('profonde')||l.includes('dense')||l.includes('soutenue'))){score+=1.5;why.push('robe soutenue')}}
   const meta=typeof blindGrapeMeta==='function'?blindGrapeMeta(g.name):null;
   const markerText=normalizeChoiceSearch([...(g.markers||[]),meta?.look||'',meta?.feel||'',...(meta?.orientation||[]),...(meta?.confusions||[])].join(' '));
   let aromaHits=0;
   for(const aroma of aromas){const keys=blindAromaKeywords(aroma);if(keys.some(k=>markerText.includes(normalizeChoiceSearch(k)))){score+=3.2;aromaHits++;why.push(aroma.toLowerCase())}}
   if(aromaHits>=2)score+=1.4;
   if(aromaHits>=3)score+=1.2;
   if(isRose){
     if(['Cinsault','Grenache'].includes(g.name)){score+=1.1;why.push('cépage fréquent en rosé')}
     if(['Syrah','Mourvèdre'].includes(g.name)){score+=0.5}
   }
   return {g,score,why:[...new Set(why)].slice(0,3)};
 }).sort((a,b)=>b.score-a.score);
 return ranked.filter(x=>x.score>2.2).slice(0,3);
}
function blindGrapeAssistHtml(w,a){
 const filled=(a.scores?.acid||a.scores?.body||(a.aromas||[]).length);
 if(!filled)return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE</span><b>Donne-moi quelques repères</b></div><p>Commence par sélectionner tes <strong>arômes</strong>, puis ajoute acidité et corps. Les arômes précis pèsent fortement dans les pistes proposées.</p></div>`;
 const picks=blindGrapeAssistCandidates(w,a);
 if(!picks.length)return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE</span><b>Profil encore trop ouvert</b></div><p>Ajoute un ou deux arômes précis, puis affine avec le corps et l’acidité.</p></div>`;
 const roseNote=w?.type==='rose'?'<p class="blind-assist-rose">🌸 Pour un rosé, pense en <b>cépages possibles d’assemblage</b> : la couleur et le style de pressurage rendent l’identification plus incertaine qu’en rouge ou en blanc.</p>':'';
 return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE · SELON TES SENSATIONS</span><b>${picks.length} piste${picks.length>1?'s':''} à explorer</b></div>${roseNote}<div class="blind-assist-picks">${picks.map((x,i)=>`<button type="button" onclick="openBlindWineAtlas('grapes');setTimeout(()=>selectBlindAtlasGrape(decodeURIComponent('${encodeURIComponent(x.g.name)}')),60)"><span>${i===0?'🎯':'🍇'}</span><div><b>${esc(x.g.name)}</b><small>${x.why.length?esc(x.why.join(' · ')):'profil global compatible'}</small></div><em>Voir →</em></button>`).join('')}</div><p class="blind-assist-warning">Ce sont des <b>pistes générales</b> calculées uniquement à partir de ce que tu as renseigné, jamais à partir du vin caché.</p></div>`;
}
async function refreshBlindExperience(wineId){
 const [a,ws]=await Promise.all([getAnswer(wineId,true),getBlindWines()]);const w=ws.find(x=>x.id===wineId);if(!w)return;
 const nav=document.getElementById('blind-journey-nav');if(nav)nav.outerHTML=blindJourneyNavHtml(a);
 const dyn=document.getElementById('blind-dynamic-deduction');if(dyn)dyn.innerHTML=blindDeductionEngineHtml(w,a)+blindComparatorHtml(w,a);
 const count=document.querySelector('.blind-aroma-title em');if(count){const n=(a.aromas||[]).length;count.textContent=`${n} sélectionné${n>1?'s':''}`}
}
async function refreshBlindGrapeAssist(wineId){
 const el=document.getElementById('blind-grape-assist');if(!el)return;
 const [a,ws]=await Promise.all([getAnswer(wineId,true),getBlindWines()]);
 const w=ws.find(x=>x.id===wineId);if(w)el.outerHTML=blindGrapeAssistHtml(w,a);
}



// V4.2 — Blind deduction experience -------------------------------------------------
function blindConfidenceMeta(v){
 const m={1:['😬','Au pif'],2:['🤔','J’hésite'],3:['😎','Confiant'],4:['🔥','Certain']};return m[Number(v)]||['🎲','Non défini'];
}
function blindJourneyProgress(a){
 const observe=Boolean(a.scores?.look), smell=(a.aromas||[]).length>0;
 const taste=['acid','sweet','body','finish'].every(k=>Boolean(a.scores?.[k]));
 const deduce=Boolean(a.price>0&&a.region&&answerGrapes(a).length);
 return {observe,smell,taste,deduce,done:[observe,smell,taste,deduce].filter(Boolean).length};
}
function blindJourneyNavHtml(a){
 const p=blindJourneyProgress(a),steps=[['👁️','Regarde',p.observe],['👃','Sens',p.smell],['👅','Goûte',p.taste],['🧠','Déduis',p.deduce]];
 return `<div class="blind-journey-nav" id="blind-journey-nav" aria-label="Progression de dégustation">${steps.map((x,i)=>`<div class="${x[2]?'done':''}"><span>${x[2]?'✓':x[0]}</span><b>${x[1]}</b></div>${i<3?'<i></i>':''}`).join('')}</div>`;
}
function blindProfileSummary(w,a){
 const bits=[];
 if(a.scores?.look)bits.push(`${BLIND_METRIC_OPTIONS.look[a.scores.look-1][0]} ${BLIND_METRIC_OPTIONS.look[a.scores.look-1][1]}`);
 if(a.scores?.acid)bits.push(`🍋 ${BLIND_METRIC_OPTIONS.acid[a.scores.acid-1][1]}`);
 if(a.scores?.body)bits.push(`💪 ${BLIND_METRIC_OPTIONS.body[a.scores.body-1][1]}`);
 const aromas=(a.aromas||[]).slice(0,4); if(aromas.length)bits.push(`👃 ${aromas.join(' · ')}`);
 return bits.length?bits.join('  ·  '):'Commence à lire le verre : ton profil se construira ici.';
}
function blindRegionAssistCandidates(w,a){
 const grapes=blindGrapeAssistCandidates(w,a); if(!grapes.length)return [];
 const map=new Map();
 grapes.forEach((x,rank)=>{(x.g.regions||[]).forEach(r=>{const key=normalizeChoiceSearch(r);const cur=map.get(key)||{name:r,score:0,grapes:[]};cur.score+=x.score*(1-rank*.16);cur.grapes.push(x.g.name);map.set(key,cur)})});
 return [...map.values()].sort((a,b)=>b.score-a.score).slice(0,3);
}
function blindCoherenceLabel(i){return i===0?['🔥','Très cohérent']:i===1?['🟠','Possible']:['⚪','À explorer'];}
function blindDeductionEngineHtml(w,a){
 const grapes=blindGrapeAssistCandidates(w,a),regions=blindRegionAssistCandidates(w,a);
 if(!grapes.length)return `<section class="blind-deduction-engine"><div class="blind-engine-head"><span>🧠 MOTEUR DE DÉDUCTION</span><h3>Construis d’abord ton profil du verre</h3></div><p class="muted">Tes arômes, l’acidité et le corps feront émerger des hypothèses de cépages et de régions.</p></section>`;
 return `<section class="blind-deduction-engine"><div class="blind-engine-head"><span>🧠 TON ENQUÊTE</span><h3>Ce que tes observations rendent cohérent</h3></div><div class="blind-glass-profile">${esc(blindProfileSummary(w,a))}</div><div class="blind-engine-columns"><div><h4>🍇 Cépages à explorer</h4>${grapes.map((x,i)=>{const l=blindCoherenceLabel(i);return `<button type="button" class="blind-hypothesis" onclick="openBlindWineAtlas('grapes');setTimeout(()=>selectBlindAtlasGrape(decodeURIComponent('${encodeURIComponent(x.g.name)}')),60)"><span>${l[0]}</span><div><b>${esc(x.g.name)}</b><small>${esc(l[1])} · ${esc(x.why.join(' · ')||'profil compatible')}</small></div></button>`}).join('')}</div><div><h4>🗺️ Régions cohérentes</h4>${regions.map((x,i)=>{const l=blindCoherenceLabel(i);return `<div class="blind-hypothesis static"><span>${l[0]}</span><div><b>${esc(x.name)}</b><small>${esc(l[1])} · via ${esc([...new Set(x.grapes)].slice(0,2).join(' / '))}</small></div></div>`}).join('')}</div></div><p class="blind-assist-warning">Aucune donnée cachée n’est utilisée : ce moteur raisonne seulement à partir de tes sensations.</p></section>`;
}
function blindCompareModal(wineId,kind){
 getAnswer(wineId,true).then(async a=>{const ws=await getBlindWines(),w=ws.find(x=>x.id===wineId);if(!w)return;const candidates=kind==='region'?blindRegionAssistCandidates(w,a):blindGrapeAssistCandidates(w,a).map(x=>({name:x.g.name,g:x.g}));if(candidates.length<2)return toast('Ajoute encore quelques sensations pour faire émerger deux hypothèses.');
 const overlay=document.createElement('div');overlay.className='blind-lock-overlay';const a1=candidates[0],a2=candidates[1];
 const grapeRow=(label,fn)=>`<div class="blind-compare-row"><span>${label}</span><b>${esc(fn(a1))}</b><b>${esc(fn(a2))}</b></div>`;
 let rows='';
 if(kind==='grape') rows=[grapeRow('Corps',x=>x.g.body),grapeRow('Acidité',x=>x.g.acid),grapeRow('Marqueurs',x=>(x.g.markers||[]).slice(0,3).join(', ')),grapeRow('Régions',x=>(x.g.regions||[]).slice(0,3).join(', '))].join('');
 else {const find=n=>(typeof BLIND_WINE_REGIONS!=='undefined'?BLIND_WINE_REGIONS.find(r=>normalizeChoiceSearch(r.name)===normalizeChoiceSearch(n)):null);a1.r=find(a1.name);a2.r=find(a2.name);rows=[grapeRow('Climat',x=>x.r?.climate||'Variable'),grapeRow('Repères',x=>(x.r?.markers||[]).slice(0,3).join(', ')||'—'),grapeRow('Style',x=>x.r?.style||'—')].join('')}
 overlay.innerHTML=`<div class="blind-lock-modal blind-compare-modal"><button class="blind-lock-close">×</button><div class="blind-lock-kicker">⚔️ J’HÉSITE ENTRE…</div><h2>${kind==='grape'?'Deux cépages':'Deux régions'}</h2><div class="blind-compare-table"><div class="blind-compare-row head"><span></span><b>${esc(a1.name)}</b><b>${esc(a2.name)}</b></div>${rows}</div><div class="notice">💡 Reviens à ton verre : cherche le critère qui différencie le mieux ces deux pistes. L’app ne choisit pas à ta place.</div></div>`;overlay.querySelector('.blind-lock-close').onclick=()=>overlay.remove();overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};document.body.appendChild(overlay);
 });
}
function blindComparatorHtml(w,a){
 const g=blindGrapeAssistCandidates(w,a),r=blindRegionAssistCandidates(w,a);if(g.length<2&&r.length<2)return '';
 return `<section class="blind-comparator"><div><span>⚔️ TU HÉSITES ?</span><b>Compare tes deux meilleures hypothèses</b></div><div>${g.length>=2?`<button type="button" class="btn secondary" onclick="blindCompareModal('${w.id}','grape')">🍇 ${esc(g[0].g.name)} vs ${esc(g[1].g.name)}</button>`:''}${r.length>=2?`<button type="button" class="btn secondary" onclick="blindCompareModal('${w.id}','region')">🗺️ Comparer les régions</button>`:''}</div></section>`;
}
function blindConfidenceHtml(w,a){const v=Number(a.scores?.confidence||0);return `<div class="blind-confidence"><div><span>🎲 TON NIVEAU DE CONFIANCE</span><b>À quel point tu y crois ?</b><small>Ça ne change pas tes points. Ça rend juste le reveal plus savoureux.</small></div><div class="blind-confidence-options">${[1,2,3,4].map(n=>{const m=blindConfidenceMeta(n);return `<button type="button" class="${v===n?'sel':''}" onclick="setScore('${w.id}','confidence',${n},this)"><span>${m[0]}</span><b>${m[1]}</b></button>`}).join('')}</div></div>`}
function blindConfidenceReveal(a,total){const v=Number(a.scores?.confidence||0);if(!v)return '';const m=blindConfidenceMeta(v);let verdict='';if(v===4&&total>=9)verdict='💥 TU SAVAIS.';else if(v===4&&total<=3)verdict='💀 SURCONFIANCE.';else if(v===1&&total>=8)verdict='🎭 LE « AU PIF » QUI FAIT MAL.';else if(v>=3&&total>=7)verdict='😎 CONFIANCE JUSTIFIÉE.';else verdict='🎲 INTUITION ENREGISTRÉE.';return `<div class="blind-confidence-reveal"><span>${m[0]} Tu étais <b>${esc(m[1].toLowerCase())}</b></span><strong>${verdict}</strong></div>`}
function blindRoundEvents(a,rv,parts,dash){
 const events=[];
 const exactPrice=Math.abs(Number(a.price)-Number(rv.price))<0.005;
 const priceErr=Number(rv.price)>0?Math.abs(Number(a.price)-Number(rv.price))/Number(rv.price):Infinity;
 const sameRegion=(dash?.current||[]).filter(x=>regionScore(x.region,rv.region)===3).length;
 const confidence=Number(a.scores?.confidence||0);
 const push=(priority,icon,title,text)=>events.push({priority,icon,title,text});
 if(parts.total===11)push(100,'💎','PERFECT WINE','11/11 : prix, région et cépages parfaitement lus.');
 if(parts.total===0)push(95,'💀','ZERO ABSOLU','0/11. Ce verre t’a complètement envoyé sur une fausse piste.');
 if(exactPrice)push(90,'🎯','PRIX PARFAIT','Tu as annoncé exactement le prix de la bouteille.');
 else if(priceErr<=.05)push(75,'🎯','SNIPER','Prix estimé à moins de 5 % du prix réel.');
 if(parts.region===3&&sameRegion===1)push(88,'🐺','LOUP SOLITAIRE','Tu es le seul joueur à avoir trouvé la bonne région.');
 else if(parts.region===3)push(55,'🧭','CARTOGRAPHE','Région trouvée exactement.');
 if(parts.grape===3)push(70,'🍇','NEZ ABSOLU','Cépages parfaitement trouvés.');
 if(confidence===4&&parts.total>=9)push(80,'🔥','SANG-FROID','Tu étais certain et ton score confirme ton intuition.');
 if(confidence===1&&parts.total>=9)push(78,'🎭','COUP DE BLUFF','Tu disais être au pif… mais tu viens de sortir un énorme score.');
 return events.sort((a,b)=>b.priority-a.priority).slice(0,2);
}
function blindRoundExploit(a,rv,parts,dash){return blindRoundEvents(a,rv,parts,dash).map(e=>[e.icon,e.title,e.text])}

function blindRivalryData(dash,rv){
 const me=(dash?.rows||[]).find(x=>x.user_id===user.id);if(!me)return null;
 const others=(dash?.rows||[]).filter(x=>x.user_id!==user.id&&x.count>0);if(!others.length)return null;
 const rival=[...others].sort((a,b)=>Math.abs(a.score-me.score)-Math.abs(b.score-me.score)||a.rank-b.rank)[0];
 const myCurrent=knowledgeScore((dash.current||[]).find(x=>x.user_id===user.id)||{},rv);
 const rivalCurrent=knowledgeScore((dash.current||[]).find(x=>x.user_id===rival.user_id)||{},rv);
 const beforeMe=me.score-myCurrent,beforeRival=rival.score-rivalCurrent;
 const beforeDiff=beforeMe-beforeRival,nowDiff=me.score-rival.score;
 let moment='';
 if(beforeDiff<=0&&nowDiff>0)moment=`🔥 Tu passes devant ${rival.name}.`;
 else if(beforeDiff>=0&&nowDiff<0)moment=`⚠️ ${rival.name} passe devant toi.`;
 else if(nowDiff===0)moment='🤝 Égalité parfaite : la prochaine bouteille départagera votre duel.';
 else if(Math.abs(nowDiff)<=2)moment='👀 Rien n’est joué : votre duel se tient en 2 points ou moins.';
 else moment=nowDiff>0?`Tu gardes ${Math.abs(nowDiff)} point${Math.abs(nowDiff)>1?'s':''} d’avance.`:`Il te manque ${Math.abs(nowDiff)} point${Math.abs(nowDiff)>1?'s':''} pour revenir.`;
 return {me,rival,gap:Math.abs(nowDiff),moment};
}
function blindRivalryHtml(dash,rv){
 const r=blindRivalryData(dash,rv);if(!r)return '';
 return `<section class="blind-rivalry-card"><div class="blind-rivalry-kicker">⚔️ RIVALITÉ</div><div class="blind-rivalry-duel"><div class="me"><small>TOI</small><b>${esc(r.me.name)}</b><strong>${r.me.score}</strong></div><span>VS</span><div><small>RIVAL</small><b>${esc(r.rival.name)}</b><strong>${r.rival.score}</strong></div></div><p>${esc(r.moment)}</p></section>`;
}
function blindLearningGrapeProfile(name){
 if(typeof BLIND_GRAPE_PROFILES==='undefined')return null;
 const n=normalizeChoiceSearch(name||'');return BLIND_GRAPE_PROFILES.find(g=>normalizeChoiceSearch(g.name)===n)||null;
}
function blindLearningMarkerText(name){
 const g=blindLearningGrapeProfile(name),m=typeof blindGrapeMeta==='function'?blindGrapeMeta(name):null;
 return normalizeChoiceSearch([...(g?.markers||[]),m?.look||'',m?.feel||'',...(m?.orientation||[])].join(' '));
}
function blindLearningFromErrorHtml(w,a,rv,parts){
 if(!a?.done)return '';
 const realGrapes=Array.isArray(rv.grapes)?rv.grapes:parseGrapes(rv.grapes);
 const guessed=answerGrapes(a);
 const grapeWrong=parts.grape<3,regionWrong=parts.region<3;
 const observations=[];
 const misses=[];
 for(const real of realGrapes){
   const txt=blindLearningMarkerText(real);
   for(const aroma of (a.aromas||[])){
     if(blindAromaKeywords(aroma).some(k=>txt.includes(normalizeChoiceSearch(k))))observations.push(`${aroma} allait dans le sens de ${real}`);
   }
   const p=blindLearningGrapeProfile(real);
   if(p&&a.scores?.acid){const t=blindScaleValue(p.acid,'acid');if(Math.abs(Number(a.scores.acid)-t)<=1)observations.push(`ton acidité était cohérente avec ${real}`)}
   if(p&&a.scores?.body){const t=blindScaleValue(p.body,'body');if(Math.abs(Number(a.scores.body)-t)<=1)observations.push(`ton corps était cohérent avec ${real}`)}
 }
 const unique=[...new Set(observations)].slice(0,4);
 if(grapeWrong&&guessed.length){
   const wrong=guessed[0],meta=typeof blindGrapeMeta==='function'?blindGrapeMeta(wrong):null;
   const conf=(meta?.confusions||[]).find(c=>realGrapes.some(r=>normalizeChoiceSearch(c).includes(normalizeChoiceSearch(r))||normalizeChoiceSearch(r).includes(normalizeChoiceSearch(c))));
   if(conf)misses.push(`${wrong} peut justement se confondre avec ${realGrapes.join(' / ')} : ton hésitation était plausible.`);
   else misses.push(`Tu étais parti sur ${wrong}, mais ton profil du verre ne suffisait pas à départager cette piste de ${realGrapes.join(' / ')}.`);
 }
 if(regionWrong)misses.push(`Pour la région, repars d’abord du style et des cépages avant de t’appuyer sur un arôme isolé.`);
 const realMeta=realGrapes.map(r=>({name:r,meta:typeof blindGrapeMeta==='function'?blindGrapeMeta(r):null})).filter(x=>x.meta);
 const key=realMeta.flatMap(x=>(x.meta.questions||[]).slice(0,1).map(q=>`${x.name} : ${q}`)).slice(0,2);
 const title=(!grapeWrong&&!regionWrong)?'🎯 TON RAISONNEMENT ÉTAIT BON':'🧠 APPRENDS DE TON ERREUR';
 return `<section class="blind-learning-card"><div class="blind-learning-kicker">${title}</div><h3>${(!grapeWrong&&!regionWrong)?'Repère ce qui t’a conduit à la bonne piste.':'Comprends où ton enquête a bifurqué.'}</h3>${unique.length?`<div class="blind-learning-good"><b>✅ Ce que tu avais bien lu</b>${unique.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${misses.length?`<div class="blind-learning-trap"><b>⚠️ Ce qui pouvait te piéger</b>${misses.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${key.length?`<div class="blind-learning-key"><b>💡 À retenir pour la prochaine fois</b>${key.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}</section>`;
}

function blindGuessForm(w,a){
 const grapes=answerGrapes(a);
 return `${blindJourneyNavHtml(a)}
 <div class="blind-senses-card blind-guided-card">
   <section class="blind-journey-stage"><div class="blind-stage-number">01</div><div class="blind-section-head"><div><span>👁️ REGARDE</span><h2>Commence par la robe</h2></div><span class="blind-section-badge">Observation</span></div>${metric("👁️ Intensité visuelle","look",a)}</section>
   <section class="blind-journey-stage"><div class="blind-stage-number">02</div><div class="blind-section-head"><div><span>👃 SENS</span><h2>Qu’est-ce qui sort du verre ?</h2></div><span class="blind-section-badge">Arômes obligatoires</span></div>${metric("👃 Intensité du nez","nose",a)}${blindAromaPickerHtml(w,a)}</section>
   <section class="blind-journey-stage"><div class="blind-stage-number">03</div><div class="blind-section-head"><div><span>👅 GOÛTE</span><h2>Lis la structure en bouche</h2></div><span class="blind-section-badge">Structure</span></div><div class="blind-sensory-grid">${metric("🍋 Acidité","acid",a)}${metric("🍯 Douceur","sweet",a)}${metric("💪 Corps","body",a)}${metric("⏱️ Finale","finish",a)}</div></section>
   <div class="blind-pleasure"><span>❤️ Coup de cœur ?</span><div class="scale ten">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="${a.note===n?"sel":""}" onclick="setAnswerChoice('${w.id}','note',${n},this)">${n}</button>`).join("")}</div></div>
 </div>
 <div class="blind-deduce-card"><div class="blind-stage-number">04</div><div class="blind-section-head"><div><span>🧠 DÉDUIS</span><h2>Transforme tes sensations en hypothèses</h2></div><span class="blind-section-badge hot">Enquête</span></div>
   <div id="blind-dynamic-deduction">${blindDeductionEngineHtml(w,a)}${blindComparatorHtml(w,a)}</div>
   <div class="blind-bets-card"><div class="blind-section-head"><div><span>TES PARIS</span><h2>Maintenant, engage-toi.</h2></div><span class="blind-section-badge hot">11 pts</span></div>
   <div class="blind-bet blind-bet-price"><div class="blind-bet-title"><span>💰 Combien coûte cette bouteille ?</span><small>Jusqu’à 5 points</small></div><div class="blind-price-wrap"><input type="number" inputmode="decimal" min=".01" step=".5" value="${a.price??""}" onchange="setAnswer('${w.id}','price',this.value===''?null:Number(this.value))" placeholder="00"><span>€</span></div></div>
   <div class="blind-bet"><div class="blind-bet-title"><span>🗺️ Tu la places où ?</span><small>Jusqu’à 3 points</small></div>${regionPickerHtml(w.id,a.region||"","player")}</div>
   <div class="blind-bet"><div class="blind-bet-title"><span>🍇 Ton pari cépage</span><small>Jusqu’à 3 points</small></div>${grapePickerHtml(w.id,grapes,"player")}</div></div>
   ${blindConfidenceHtml(w,a)}
 </div>`;
}

function renderPlayerBlindTasting(w,a,ws){
 if(!hasSeenBlindRoundIntro(w.id)){
   document.getElementById("app").innerHTML=blindRoundIntroHtml(w,ws);
   return;
 }
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>VIN ${game.current+1}/${ws.length}</span></header>
 <div class="card player-sheet blind-player-sheet">
   <div class="blind-play-head"><div><span class="blind-live-pill">● MANCHE ${game.current+1}</span><h1>Quel vin se cache ici ?</h1><p class=muted>Construis ton intuition, puis engage tes 3 paris.</p></div><div class="blind-points-orbit"><b>11</b><span>PTS</span></div></div>
   ${blindGuessForm(w,a)}
   ${blindWineAtlasButtonHtml()}
   <div class="card sticky player-action blind-lock-bar"><div><small>Quand tu es sûr de toi</small><b>Arômes · Prix · Région · Cépages</b></div><button type="button" class="btn" onclick="requestBlindLock('${w.id}')">🔒 Verrouiller mon pari</button></div>
 </div>`;
}

function metric(label,key,a){
 const opts=BLIND_METRIC_OPTIONS[key]||[1,2,3,4,5].map(n=>['',String(n)]);
 return `<div class="section player-metric blind-visual-metric"><h3>${label}</h3><div class="scale blind-icon-scale">${opts.map((opt,i)=>{const n=i+1;return `<button type="button" class="${a.scores?.[key]===n?'sel':''}" onclick="setScore('${a.wine_id||''}','${key}',${n},this)" aria-label="${esc(opt[1])}"><span>${opt[0]}</span><small>${esc(opt[1])}</small></button>`}).join('')}</div></div>`;
}

async function setScore(wineId,key,n,button=null){
 if(button){
   button.parentElement?.querySelectorAll("button").forEach(b=>b.classList.remove("sel"));
   button.classList.add("sel");
 }
 const a=await getAnswer(wineId),scores={...(a.scores||{}),[key]:n};
 const saved=await upsertAnswer(wineId,{scores});
 if(saved)await refreshBlindExperience(wineId);
 if(!saved&&button){
   button.classList.remove("sel");
   renderPlayerTasting();
 }
}

async function setAnswer(wineId,key,val){return await upsertAnswer(wineId,{[key]:val})}

async function setAnswerChoice(wineId,key,val,button){
 if(button){
   button.parentElement?.querySelectorAll("button").forEach(b=>b.classList.remove("sel"));
   button.classList.add("sel");
 }
 const saved=await setAnswer(wineId,key,val);
 if(!saved&&button)renderPlayerTasting();
}

async function toggleAroma(wineId,x,button=null){
 const a=await getAnswer(wineId),ar=a.aromas||[];
 const next=ar.includes(x)?ar.filter(v=>v!==x):[...ar,x];
 if(button)button.classList.toggle("sel",next.includes(x));
 const saved=await upsertAnswer(wineId,{aromas:next});
 if(saved)await refreshBlindExperience(wineId);
 if(!saved&&button)renderPlayerTasting();
}

async function setPlayerGrapes(wineId,values){
 return await upsertAnswer(wineId,{grapes:values});
}

async function upsertAnswer(wineId,patch){
 const cacheKey=`${game.id}:${wineId}:${user.id}`;
 const current=await getAnswer(wineId);
 if(current.done){toast("Réponse déjà validée.");return null;}

 const optimistic={...current,...patch};
 delete optimistic.id;
 delete optimistic.created_at;
 answerCache.set(cacheKey,optimistic);

 const previous=answerWriteQueues.get(cacheKey)||Promise.resolve();
 const task=previous.catch(()=>{}).then(async()=>{
   const latest=answerCache.get(cacheKey)||optimistic;
   if(latest.done)return latest;

   const payload={...latest};
   delete payload.id;
   delete payload.created_at;

   const r=await supabaseClient.from("answers")
     .upsert(payload,{onConflict:"game_id,wine_id,user_id"})
     .select()
     .single();

   if(r.error){
     const now=answerCache.get(cacheKey);
     if(now===latest||JSON.stringify(now)===JSON.stringify(latest)){
       answerCache.set(cacheKey,current);
     }
     toast(r.error.message);
     return null;
   }

   const now=answerCache.get(cacheKey);
   const newerPending=now&&JSON.stringify(now)!==JSON.stringify(latest);
   if(!newerPending)answerCache.set(cacheKey,r.data);
   return r.data;
 });

 answerWriteQueues.set(cacheKey,task);
 try{return await task}
 finally{
   if(answerWriteQueues.get(cacheKey)===task)answerWriteQueues.delete(cacheKey);
 }
}

async function submitAnswer(wineId){
 const key=`${game.id}:${wineId}:${user.id}`;

 // A mobile user can tap "Valider" immediately after changing a criterion.
 // Wait for the pending serialized save so validation always uses the latest state.
 const pending=answerWriteQueues.get(key);
 if(pending)await pending.catch(()=>{});

 const a=await getAnswer(wineId,true);
 if(a.done)return;
 if(!a.note)return toast("Ajoute ta note globale.");
 if(game.experience_mode==="discovery"){
   const requiredScores=['look','nose','acid','sweet','body','finish'];
   if(requiredScores.some(key=>!a.scores?.[key]))return toast("Complète les repères sensoriels avant de terminer ce verre.");
   if(!(a.aromas||[]).length)return toast("Choisis au moins une famille d’arômes avant de terminer.");
   if(!Number.isInteger(a.quiz_choice))return toast("Réponds au mini-quiz avant de terminer.");
 }
 if(game.experience_mode==="discovery"&&game.current>0&&!a.discovery_compare?.choice)return toast("Compare ce vin avec le précédent avant de terminer.");
 if(game.experience_mode==="blind"&&!(a.aromas||[]).length)return toast("Choisis au moins un arôme avant de verrouiller ton blind.");
 if(game.experience_mode!=="discovery"&&(a.price==null||a.price<=0||!a.region||!answerGrapes(a).length))return toast("Ajoute un prix positif, une région et au moins un cépage.");

 const r=await supabaseClient.from("answers")
   .update({done:true})
   .eq("game_id",game.id)
   .eq("wine_id",wineId)
   .eq("user_id",user.id)
   .eq("done",false)
   .select()
   .maybeSingle();

 if(r.error)return toast(r.error.message);
 if(!r.data)return toast("Cette réponse n’a pas pu être verrouillée. Vérifie que le vin est toujours ouvert.");

 answerCache.set(key,r.data);
 renderPlayerTasting();
}

function blindPerformanceLabel(total){
 if(total>=11)return {icon:"💎",title:"PARFAIT",text:"11/11. Tu viens de lire le verre comme une étiquette."};
 if(total>=9)return {icon:"🔥",title:"PRESQUE PARFAIT",text:"Très grosse manche. Tu étais tout près du sans-faute."};
 if(total>=7)return {icon:"🎯",title:"BIEN VU",text:"Solide. Ton intuition était clairement dans la bonne direction."};
 if(total>=4)return {icon:"👀",title:"TU CHAUFFES",text:"Quelques bons signaux. La prochaine bouteille peut faire basculer la soirée."};
 return {icon:"🍷",title:"PIÈGE DU VERRE",text:"Cette bouteille t’a eu. C’est exactement pour ça qu’on joue à l’aveugle."};
}

function blindStreakCount(items,predicate){
 let n=0;for(let i=items.length-1;i>=0;i--){if(predicate(items[i]))n++;else break}return n;
}

async function getBlindMomentum(){
 const [ws,answersR,revealsR]=await Promise.all([
   getBlindWines(),
   supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("user_id",user.id).eq("done",true),
   supabaseClient.from("wine_reveals").select("*").eq("game_id",game.id)
 ]);
 const err=answersR.error||revealsR.error;if(err){toast(err.message);return null}
 const answerByWine=new Map((answersR.data||[]).map(x=>[x.wine_id,x]));
 const revealByWine=new Map((revealsR.data||[]).map(x=>[x.wine_id,x]));
 const played=ws.filter(w=>answerByWine.has(w.id)&&revealByWine.has(w.id)&&w.position<=game.current).map(w=>({w,a:answerByWine.get(w.id),r:revealByWine.get(w.id)}));
 const price=blindStreakCount(played,x=>priceScore(x.a.price,x.r.price)>=4);
 const region=blindStreakCount(played,x=>regionScore(x.a.region,x.r.region)===3);
 const grape=blindStreakCount(played,x=>grapeScore(answerGrapes(x.a),x.r.grapes)===3);
 const best=[{icon:"💰",label:`${price} prix précis d’affilée`,n:price},{icon:"🗺️",label:`${region} régions exactes d’affilée`,n:region},{icon:"🍇",label:`${grape} cépages parfaits d’affilée`,n:grape}].sort((a,b)=>b.n-a.n)[0];
 const totals=played.reduce((acc,x)=>{const sc=scoreParts(x.a,x.r,"blind");acc.price+=sc.price;acc.region+=sc.region;acc.grape+=sc.grape;return acc},{price:0,region:0,grape:0});
 const count=Math.max(1,played.length);
 const profiles=[
   {key:"price",pct:totals.price/(count*5),icon:"💰",title:"Œil du marché",text:"Tu lis particulièrement bien la valeur des bouteilles."},
   {key:"region",pct:totals.region/(count*3),icon:"🗺️",title:"Cartographe",text:"Ta force du soir : replacer les vins sur la carte."},
   {key:"grape",pct:totals.grape/(count*3),icon:"🍇",title:"Nez à cépages",text:"Tu fais la différence quand il faut miser sur les cépages."}
 ].sort((a,b)=>b.pct-a.pct);
 return {price,region,grape,best:best.n>=2?best:null,style:played.length?profiles[0]:null};
}

function blindPointLine(icon,label,score,max,answer,truth,delay){
 return `<div class="blind-point-line" style="--delay:${delay}ms"><div class="blind-point-icon">${icon}</div><div class="blind-point-copy"><span>${label}</span><small>${esc(answer)} → ${esc(truth)}</small></div><div class="blind-point-score"><b>+${score}</b><span>/${max}</span></div></div>`;
}

async function renderPlayerReveal(){
 if(typeof closeBlindWineAtlas==="function")closeBlindWineAtlas();
 const rv=await getCurrentReveal();
 if(!rv){
   document.getElementById("app").innerHTML=`<div class="card hero"><h1>Révélation…</h1><p class=muted>Chargement du vin.</p></div>`;
   return;
 }
 await playRevealIntro(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const [a,dash,momentum]=await Promise.all([getAnswer(rv.wine_id,true),getRevealDashboardData(rv),getBlindMomentum()]);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const validated=a.done===true;
 const parts=validated?scoreParts(a,rv,"blind"):{price:0,region:0,grape:0,total:0,factor:1};
 const total=parts.total;
 const myRank=dash.rows.find(x=>x.user_id===user.id)?.rank||0;
 const perf=blindPerformanceLabel(total);
 const grapes=answerGrapes(a);
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>RÉVÉLATION</span></header>
 <div class="card blind-reveal-hero"><div class="blind-reveal-kicker">LE VIN ÉTAIT</div><div class="blind-reveal-icon">${ICON[rv.type]}</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p><div class="blind-reveal-realprice">${Number(rv.price).toFixed(2)} €</div></div>
 ${validated?`<div class="card blind-score-drop"><div class="blind-score-head"><div><span>${perf.icon} ${perf.title}</span><h2>${total}<small>/11</small></h2></div><p>${perf.text}</p></div>
   ${blindConfidenceReveal(a,total)}
   ${blindRoundExploit(a,rv,parts,dash).length?`<div class="blind-exploits">${blindRoundExploit(a,rv,parts,dash).map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('')}</div>`:""}
   <div class="blind-point-stack">
    ${blindPointLine("💰","Prix",parts.price,5,Number(a.price).toFixed(2)+" €",Number(rv.price).toFixed(2)+" €",80)}
    ${blindPointLine("🗺️","Région",parts.region,3,regionLabel(a.region),regionLabel(rv.region),300)}
    ${blindPointLine("🍇","Cépages",parts.grape,3,grapes.join(" / "),(rv.grapes||[]).join(" / "),520)}
   </div>
   ${momentum?.best?`<div class="blind-streak">🔥 <b>Streak !</b> ${esc(momentum.best.label)}</div>`:""}
   ${momentum?.style?`<div class="blind-player-style"><span>${momentum.style.icon}</span><div><small>TON STYLE CE SOIR</small><b>${esc(momentum.style.title)}</b><p>${esc(momentum.style.text)}</p></div></div>`:""}
   ${myRank?`<div class="blind-rank-callout">Classement général : <b>${myRank}${myRank===1?"er":"e"}</b> · ${dash.rows.length} joueur${dash.rows.length>1?"s":""}</div>`:""}
 </div>${blindRivalryHtml(dash,rv)}${blindLearningFromErrorHtml(null,a,rv,parts)}`:`<div class=notice>⚠️ Tu n’avais pas verrouillé ton pronostic avant la révélation : cette manche ne compte pas au classement.</div>`}
 <div class=card><h2>📊 Et le groupe ?</h2><div class=reveal-summary>
   <div class=stat><span>Prix moyen joué</span><strong>${dash.group.count?dash.group.avgPrice.toFixed(2)+" €":"—"}</strong></div>
   <div class=stat><span>Prix réel</span><strong>${Number(rv.price).toFixed(2)} €</strong></div>
   <div class=stat><span>Coup de cœur moyen</span><strong>${dash.group.count?dash.group.avgNote.toFixed(1)+"/10":"—"}</strong></div>
 </div></div>
 <div class=card><h2>🏁 La course</h2>${rankingHtml(dash.rows)}<p class=muted style="margin-top:14px">L’organisateur lancera la prochaine manche.</p></div>`;
}

async function renderPlayerFinished(){
 if(typeof closeBlindWineAtlas==="function")closeBlindWineAtlas();
 const [ws,rr,ar]=await Promise.all([
  getBlindWines(),
  supabaseClient.from("wine_reveals").select("*").eq("game_id",game.id),
  supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("user_id",user.id).eq("done",true)
 ]);
 const err=rr.error||ar.error;if(err)return toast(err.message);
 const reveals=rr.data||[],as=ar.data||[];

 if(game.experience_mode==="discovery"){
   const progress=discoveryProgressSummary(as,reveals,ws);
   const recap=ws.map((w,i)=>{
     const rv=reveals.find(x=>x.wine_id===w.id),a=as.find(x=>x.wine_id===w.id);
     if(!rv||!a)return "";
     const ed=discoveryDefaults(rv);
     const opts=ed.options;
     const correct=ed.correct;
     const explanation=ed.explanation;
     const question=ed.question;
     const qc=Number(a.quiz_choice),ok=Number.isInteger(qc)&&qc===correct;
     return `<div class=wine-row><div class=wine-head><b>${ICON[w.type]} Vin #${i+1} — ${esc(rv.name)}</b><span class=pill>${a.note||"—"}/10</span></div>
       <p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €</p>
       ${rv.learning_note?`<div class=learning-card><b>💡 À retenir</b><div>${esc(rv.learning_note)}</div></div>`:""}
       <div class=edu-tip><strong>🧠 ${esc(question)}</strong>${ok?"✅ Bonne réponse":"Réponse : "+esc(opts[correct]||"—")}<br>${esc(explanation)}</div>
     </div>`;
   }).join("");
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 TON PARCOURS</span></header>
    <div class="card hero">${discoveryThemeSummary()}<div class=emoji>🎓</div><h1>Ton parcours Découverte</h1><p class=muted>Tu as observé, senti, goûté et appris sur ${as.length} vin${as.length>1?"s":""}.</p>
      <div class="discovery-progress-kpis"><div><span>Mini-quiz</span><b>${progress.total?Math.round(progress.correct/progress.total*100):0}%</b></div><div><span>Comparaisons</span><b>${progress.comparisons}</b></div><div><span>Notions explorées</span><b>${progress.notions.length}</b></div></div></div>
    <div class=card><h2>📈 Ta progression</h2>${progress.total>=2?`<div class="progress-evolution"><div><span>Première moitié</span><b>${progress.firstRate}%</b></div><div class="progress-arrow">→</div><div><span>Deuxième moitié</span><b>${progress.lastRate}%</b></div></div><p class="${progress.delta>=0?'progress-positive':'muted'}">${progress.delta>0?`+${progress.delta} points de réussite aux mini-quiz entre les deux moitiés.`:progress.delta===0?'Réussite stable aux mini-quiz sur les deux moitiés de la soirée.':'Certaines notions de fin de soirée étaient plus difficiles : c’est un bon repère pour la prochaine dégustation.'}</p>`:`<p class=muted>La progression apparaîtra après plusieurs verres.</p>`}
      <div class="notion-grid">${progress.notions.map(n=>`<div class="notion-card ${n.rate>=.67?'mastered':'learning'}"><span>${n.icon}</span><div><b>${esc(n.label)}</b><small>${n.ok}/${n.total} réponse${n.total>1?'s':''} comprise${n.ok>1?'s':''}</small></div></div>`).join('')}</div></div>
    <div class=card><h2>Ce que tu as découvert</h2>${recap||"<p class=muted>Aucune fiche enregistrée.</p>"}</div>
    <div class=card><button type="button" class=btn onclick="renderProfile()">📚 Voir mon historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>`;
   return;
 }

 if(game.experience_mode==="challenge"){
   let adjusted=0,raw=0,hints=0;
   const recap=ws.map((w,i)=>{
     const rv=reveals.find(x=>x.wine_id===w.id),a=as.find(x=>x.wine_id===w.id);
     if(!rv||!a)return "";
     const r=knowledgeScore(a,rv,"blind"),s=scoreParts(a,rv,"challenge");
     raw+=r;adjusted+=s.total;hints+=Number(a.hint_level||0);
     return `<div class=wine-row><div class=wine-head><b>🥂 Challenge #${i+1} — ${esc(rv.name)}</b><span class=pill>${s.total}/11</span></div>
       <div class=scorebox><div class=scoreitem><span>Brut</span><b>${r}/11</b></div><div class=scoreitem><span>Indices</span><b>${Number(a.hint_level||0)}</b></div><div class=scoreitem><span>Multiplicateur</span><b>×${s.factor}</b></div></div>
       <p class=muted>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €</p></div>`;
   }).join("");
   const eff=raw>0?Math.round(adjusted/raw*100):0;
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 TON CHALLENGE</span></header>
     <div class="card hero"><div class=emoji>🥂</div><h1>${Math.round(adjusted*100)/100} points</h1><div class=scorebox><div class=scoreitem><span>Score brut</span><b>${raw}</b></div><div class=scoreitem><span>Indices utilisés</span><b>${hints}</b></div><div class=scoreitem><span>Efficacité</span><b>${eff}%</b></div></div><p class=muted>Ton résultat mesure à la fois ta précision et ta prise de risque.</p></div>
     <div class=card><h2>Challenge par challenge</h2>${recap||"<p class=muted>Aucune réponse enregistrée.</p>"}</div>
     <div class=card><button type="button" class=btn onclick="renderProfile()">📚 Voir mon historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>`;
   return;
 }

 let total=0;
 const recap=ws.map((w,i)=>{
   const rv=reveals.find(x=>x.wine_id===w.id),a=as.find(x=>x.wine_id===w.id);
   if(!rv||!a)return "";
   const s=scoreParts(a,rv,game.experience_mode);total+=s.total;
   const hintText=game.experience_mode==="challenge"&&a.hint_level?` · ${a.hint_level} indice${a.hint_level>1?"s":""} utilisé${a.hint_level>1?"s":""} (×${s.factor})`:"";
   return `<div class=wine-row><div class=wine-head><b>${ICON[w.type]} Vin #${i+1} — ${esc(rv.name)}</b><span class=pill>${s.total}/11 pts</span></div>
   <div class=grid style="margin-top:10px"><div><b>Ton prix</b><br>${Number(a.price).toFixed(2)} € <span class=muted>→ ${Number(rv.price).toFixed(2)} €</span><br><small>${s.price}/5 pts</small></div>
   <div><b>Ta région</b><br>${esc(regionLabel(a.region))}<br><span class=muted>Vrai : ${esc(regionLabel(rv.region))}</span><br><small>${s.region}/3 pts</small></div>
   <div><b>Tes cépages</b><br>${esc(answerGrapes(a).join(" / "))}<br><span class=muted>Vrai : ${esc((rv.grapes||[]).join(" / "))}</span><br><small>${s.grape}/3 pts</small></div></div>
   <div class=notice style="margin-top:10px"><b>Réponse réelle :</b> ${esc(rv.name)} · ${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €${hintText}</div>
   <p class=muted>Ta note plaisir : <b>${a.note}/10</b></p></div>`;
 }).join("");
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>TON RÉCAP</span></header>
 <div class="card hero"><div class=emoji>🏆</div><h1>${Math.round(total*100)/100} points</h1><p class=muted>Maximum théorique : ${ws.length*11} points.</p></div>
 <div class=card><h2>Ton récapitulatif</h2>${recap||"<p class=muted>Aucune réponse enregistrée.</p>"}</div>
 <div class=card><button type="button" class="btn" onclick="renderProfile()">📚 Voir mon historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>`;
}

