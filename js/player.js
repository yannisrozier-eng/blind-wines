/* Blind Wine — Player-facing tasting sheets, answer persistence and final recap. */
'use strict';

async function renderPlayerLobby(){
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
   const waitTitle=game.experience_mode==="discovery"?"Étape enregistrée":game.experience_mode==="challenge"?"Pronostic verrouillé":"Réponse enregistrée";
   const waitIcon=game.experience_mode==="discovery"?"🎓":game.experience_mode==="challenge"?"🥂":"✅";
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>VIN ${game.current+1}/${game.wine_count||ws.length}</span></header>
   <div class="card hero"><div class=emoji>${waitIcon}</div><h1>${waitTitle}</h1><p class=muted>Attends que l'organisateur révèle le vin.</p><div class=notice>Cette réponse est verrouillée pour ce vin.</div></div>`;
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

function blindGuessForm(w,a){
 return `${metric("👁️ Intensité visuelle","look",a)}${metric("👃 Intensité aromatique","nose",a)}${metric("🍋 Acidité","acid",a)}${metric("🍯 Douceur / sucrosité","sweet",a)}${metric("💪 Corps / puissance","body",a)}${metric("⏱️ Persistance","finish",a)}
 <div class="section player-aromas"><h3>Arômes perçus</h3><div class=chips>${AROMAS[w.type].map(x=>`<button type="button" class="chip ${(a.aromas||[]).includes(x)?"sel":""}" onclick="toggleAroma('${w.id}',decodeURIComponent('${encodeURIComponent(x)}'),this)">${esc(x)}</button>`).join("")}</div></div>
 <div class="section player-note"><h3>❤️ Ta note globale</h3><div class="scale ten">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="${a.note===n?"sel":""}" onclick="setAnswerChoice('${w.id}','note',${n},this)">${n}</button>`).join("")}</div></div>
 <div class="grid player-guess-grid">
  <div><label>💰 Prix estimé (€)</label><input type=number min=.01 step=.5 value="${a.price??""}" onchange="setAnswer('${w.id}','price',this.value===''?null:Number(this.value))" placeholder="Ex. 15"></div>
  <div><label>🌍 Région / appellation</label>${regionPickerHtml(w.id,a.region||"","player")}</div>
  <div><label>🍇 Cépage(s)</label>${grapePickerHtml(w.id,answerGrapes(a),"player")}</div>
 </div>`;
}

function renderPlayerBlindTasting(w,a,ws){
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎯 À L’AVEUGLE</span></header>
 <div class="card player-sheet">
   <div class=wine-head><div><span class=pill>VIN ${game.current+1} / ${ws.length}</span><h1>À toi de trouver</h1><p class=muted>Aucun indice spécifique au vin. Fais confiance à tes sens et utilise le mémo général si besoin.</p></div><div class=emoji>${ICON[w.type]}</div></div>
   <div class=notice><b>🎯 Objectif :</b> identifier au mieux le prix, la région et les cépages. Maximum : 11 points.</div>
   ${regionGrapeGuideHtml()}
   ${blindGuessForm(w,a)}
   <div class="card sticky player-action" style="margin-top:18px"><button type="button" class=btn style="width:100%" onclick="submitAnswer('${w.id}')">🎯 Verrouiller ma réponse</button></div>
 </div>`;
}

function metric(label,key,a){
 return `<div class="section player-metric"><h3>${label}</h3><div class=scale>${[1,2,3,4,5].map(n=>`<button type="button" class="${a.scores?.[key]===n?"sel":""}" onclick="setScore('${a.wine_id||""}','${key}',${n},this)">${n}</button>`).join("")}</div></div>`;
}

async function setScore(wineId,key,n,button=null){
 if(button){
   button.parentElement?.querySelectorAll("button").forEach(b=>b.classList.remove("sel"));
   button.classList.add("sel");
 }
 const a=await getAnswer(wineId),scores={...(a.scores||{}),[key]:n};
 const saved=await upsertAnswer(wineId,{scores});
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

async function renderPlayerReveal(){
 const rv=await getCurrentReveal();
 if(!rv){
   document.getElementById("app").innerHTML=`<div class="card hero"><h1>Révélation…</h1><p class=muted>Chargement du vin.</p></div>`;
   return;
 }
 await playRevealIntro(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const [a,dash]=await Promise.all([getAnswer(rv.wine_id,true),getRevealDashboardData(rv)]);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const validated=a.done===true;
 const parts=validated?scoreParts(a,rv,game.experience_mode):{price:0,region:0,grape:0,total:0,factor:1};
 const ps=parts.price;
 const rs=parts.region;
 const gs=parts.grape;
 const total=parts.total;
 const myRank=dash.rows.find(x=>x.user_id===user.id)?.rank||0;
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>RÉVÉLATION</span></header>
 <div class="card hero"><div class=emoji>${ICON[rv.type]}</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p><div class=code>${Number(rv.price).toFixed(2)} €</div>
 <div class=scorebox><div class=scoreitem><span>Prix</span><b>${ps}/5</b></div><div class=scoreitem><span>Région</span><b>${rs}/3</b></div><div class=scoreitem><span>Cépages</span><b>${gs}/3</b></div></div>
 <h2 style="margin-top:18px">${total}/11 points</h2>${validated&&game.experience_mode==="challenge"&&parts.factor<1?`<div class=muted>Multiplicateur d’indices : ×${parts.factor}</div>`:""}${!validated?`<div class=notice>⚠️ Tu n’avais pas validé ta réponse avant la révélation : elle ne compte pas au classement.</div>`:myRank?`<div class=notice>Tu es actuellement <b>${myRank}${myRank===1?"er":"e"}</b> du classement général.</div>`:""}</div>
 <div class=card><h2>📊 Le groupe sur ce vin</h2><div class=reveal-summary>
   <div class=stat><span>Prix estimé moyen</span><strong>${dash.group.count?dash.group.avgPrice.toFixed(2)+" €":"—"}</strong></div>
   <div class=stat><span>Prix réel</span><strong>${Number(rv.price).toFixed(2)} €</strong></div>
   <div class=stat><span>Note plaisir moyenne</span><strong>${dash.group.count?dash.group.avgNote.toFixed(1)+"/10":"—"}</strong></div>
 </div></div>
 <div class=card><h2>🎖️ Récompenses du vin</h2>${awardCardsHtml(dash.awards)}</div>
 <div class=card><h2>🏁 Classement intermédiaire</h2>${rankingHtml(dash.rows)}<p class=muted style="margin-top:14px">L'organisateur lancera le vin suivant.</p></div>`;
}

async function renderPlayerFinished(){
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

