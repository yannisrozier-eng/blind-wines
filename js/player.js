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
 </div>`;
}

async function requestBlindLock(wineId){
 const key=`${game.id}:${wineId}:${user.id}`;
 const pending=answerWriteQueues.get(key);if(pending)await pending.catch(()=>{});
 const a=await getAnswer(wineId,true);
 if(a.done)return;
 if(!a.note)return toast("Ajoute ta note plaisir avant de verrouiller.");
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
 const m={
  'Fruits rouges':['cerise','fraise','framboise','groseille'],
  'Fruits noirs':['mure','cassis','prune','cerise noire'],
  'Agrumes':['citron','agrumes'],
  'Fruits blancs':['pomme','poire','coing','peche'],
  'Fruits exotiques':['litchi','passion','exotique','abricot'],
  'Floral':['violette','rose','fleur'],
  'Épices':['poivre','epice','reglisse','curry','garrigue'],
  'Épicé':['poivre','epice','reglisse','curry','garrigue'],
  'Minéral':['pierre','iode','salin','mineral','graphite','craie'],
  'Boisé':['cedre','tabac','boise','beurre','noisette'],
  'Végétal':['herbe','buis','poivron','olive','fenouil'],
  'Cuir / tabac':['cuir','tabac','viande','fume']
 };
 return m[label]||[];
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
   const markerText=normalizeChoiceSearch(g.markers.join(' '));
   for(const aroma of aromas){const keys=blindAromaKeywords(aroma);if(keys.some(k=>markerText.includes(normalizeChoiceSearch(k)))){score+=2.2;why.push(aroma.toLowerCase())}}
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
 if(!filled)return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE</span><b>Donne-moi quelques repères</b></div><p>Renseigne surtout <strong>acidité</strong>, <strong>corps</strong> et quelques <strong>arômes</strong>. Je te proposerai ensuite des pistes à explorer.</p></div>`;
 const picks=blindGrapeAssistCandidates(w,a);
 if(!picks.length)return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE</span><b>Profil encore trop ouvert</b></div><p>Ajoute un repère de corps, d’acidité ou un arôme supplémentaire pour affiner les pistes.</p></div>`;
 const roseNote=w?.type==='rose'?'<p class="blind-assist-rose">🌸 Pour un rosé, pense en <b>cépages possibles d’assemblage</b> : la couleur et le style de pressurage rendent l’identification plus incertaine qu’en rouge ou en blanc.</p>':'';
 return `<div class="blind-grape-assist" id="blind-grape-assist"><div class="blind-assist-head"><span>🧭 AIDE CÉPAGE · SELON TES SENSATIONS</span><b>${picks.length} piste${picks.length>1?'s':''} à explorer</b></div>${roseNote}<div class="blind-assist-picks">${picks.map((x,i)=>`<button type="button" onclick="openBlindWineAtlas('grapes');setTimeout(()=>selectBlindAtlasGrape(decodeURIComponent('${encodeURIComponent(x.g.name)}')),60)"><span>${i===0?'🎯':'🍇'}</span><div><b>${esc(x.g.name)}</b><small>${x.why.length?esc(x.why.join(' · ')):'profil global compatible'}</small></div><em>Voir →</em></button>`).join('')}</div><p class="blind-assist-warning">Ce sont des <b>pistes générales</b> calculées uniquement à partir de ce que tu as renseigné, jamais à partir du vin caché.</p></div>`;
}
async function refreshBlindGrapeAssist(wineId){
 const el=document.getElementById('blind-grape-assist');if(!el)return;
 const [a,ws]=await Promise.all([getAnswer(wineId,true),getBlindWines()]);
 const w=ws.find(x=>x.id===wineId);if(w)el.outerHTML=blindGrapeAssistHtml(w,a);
}

function blindGuessForm(w,a){
 const grapes=answerGrapes(a);
 return `<div class="blind-senses-card">
   <div class="blind-section-head"><div><span>1 · TES SENSATIONS</span><h2>Lis le verre</h2></div><span class="blind-section-badge">Aide à la décision</span></div>
   <p class="muted">Note rapidement ce que tu ressens. Ici, aucun point : ces repères servent seulement à construire ton pari.</p>
   <div class="blind-sensory-grid">${metric("👁️ Visuel","look",a)}${metric("👃 Nez","nose",a)}${metric("🍋 Acidité","acid",a)}${metric("🍯 Douceur","sweet",a)}${metric("💪 Corps","body",a)}${metric("⏱️ Finale","finish",a)}</div>
   <details class="blind-aromas-details"><summary>👃 Arômes que je repère <span>${(a.aromas||[]).length?`· ${(a.aromas||[]).length} sélectionné${(a.aromas||[]).length>1?'s':''}`:'· facultatif'}</span></summary><div class="chips">${AROMAS[w.type].map(x=>`<button type="button" class="chip ${(a.aromas||[]).includes(x)?"sel":""}" onclick="toggleAroma('${w.id}',decodeURIComponent('${encodeURIComponent(x)}'),this)">${esc(x)}</button>`).join("")}</div></details>
   ${blindGrapeAssistHtml(w,a)}
   <div class="blind-pleasure"><span>❤️ Coup de cœur ?</span><div class="scale ten">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="${a.note===n?"sel":""}" onclick="setAnswerChoice('${w.id}','note',${n},this)">${n}</button>`).join("")}</div></div>
 </div>
 <div class="blind-bets-card">
   <div class="blind-section-head"><div><span>2 · TES PARIS</span><h2>Maintenant, engage-toi.</h2></div><span class="blind-section-badge hot">11 pts</span></div>
   <div class="blind-bet blind-bet-price"><div class="blind-bet-title"><span>💰 Combien coûte cette bouteille ?</span><small>Jusqu’à 5 points</small></div><div class="blind-price-wrap"><input type="number" inputmode="decimal" min=".01" step=".5" value="${a.price??""}" onchange="setAnswer('${w.id}','price',this.value===''?null:Number(this.value))" placeholder="00"><span>€</span></div><p class="blind-bet-whisper">${a.price?`${Number(a.price).toFixed(0)} €… tu assumes ? 👀`:'Pose ton estimation. Pas besoin d’être raisonnable.'}</p></div>
   <div class="blind-bet"><div class="blind-bet-title"><span>🗺️ Tu la places où ?</span><small>Jusqu’à 3 points</small></div>${regionPickerHtml(w.id,a.region||"","player")}</div>
   <div class="blind-bet"><div class="blind-bet-title"><span>🍇 Ton pari cépage</span><small>Jusqu’à 3 points</small></div>${grapePickerHtml(w.id,grapes,"player")}<p class="blind-bet-whisper">${grapes.length===1?`${esc(grapes[0])} seul ? Gros pari.`:grapes.length>1?`${grapes.length} cépages joués. Chaque choix compte.`:'Choisis seulement ceux que tu assumes.'}</p></div>
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
   <div class="card sticky player-action blind-lock-bar"><div><small>Quand tu es sûr de toi</small><b>Prix · Région · Cépages</b></div><button type="button" class="btn" onclick="requestBlindLock('${w.id}')">🔒 Verrouiller mon pari</button></div>
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
 if(saved)await refreshBlindGrapeAssist(wineId);
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
 if(saved)await refreshBlindGrapeAssist(wineId);
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
   <div class="blind-point-stack">
    ${blindPointLine("💰","Prix",parts.price,5,Number(a.price).toFixed(2)+" €",Number(rv.price).toFixed(2)+" €",80)}
    ${blindPointLine("🗺️","Région",parts.region,3,regionLabel(a.region),regionLabel(rv.region),300)}
    ${blindPointLine("🍇","Cépages",parts.grape,3,grapes.join(" / "),(rv.grapes||[]).join(" / "),520)}
   </div>
   ${momentum?.best?`<div class="blind-streak">🔥 <b>Streak !</b> ${esc(momentum.best.label)}</div>`:""}
   ${momentum?.style?`<div class="blind-player-style"><span>${momentum.style.icon}</span><div><small>TON STYLE CE SOIR</small><b>${esc(momentum.style.title)}</b><p>${esc(momentum.style.text)}</p></div></div>`:""}
   ${myRank?`<div class="blind-rank-callout">Classement général : <b>${myRank}${myRank===1?"er":"e"}</b> · ${dash.rows.length} joueur${dash.rows.length>1?"s":""}</div>`:""}
 </div>`:`<div class=notice>⚠️ Tu n’avais pas verrouillé ton pronostic avant la révélation : cette manche ne compte pas au classement.</div>`}
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

