/* Blind Wine — Challenge mode: hints, risk multiplier and dedicated reveal. */
'use strict';

async function getChallengeHints(wineId){
 if(game.experience_mode!=="challenge")return {};
 const r=await supabaseClient.rpc("get_challenge_hints",{p_game_id:game.id,p_wine_id:wineId});
 return r.error?{}:(Array.isArray(r.data)?r.data[0]:r.data)||{};
}

async function revealHint(wineId,level){const a=await getAnswer(wineId);if(a.done)return;await upsertAnswer(wineId,{hint_level:Math.max(a.hint_level||0,level)});renderPlayerTasting()}

function challengeFactor(a){return a.hint_level===1?.75:a.hint_level===2?.5:1}

async function renderPlayerChallengeTasting(w,a,ws){
 const hints=await getChallengeHints(w.id);
 const level=Number(a.hint_level||0);
 const factor=challengeFactor(a);
 const potential=Math.round(11*factor*100)/100;
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 CHALLENGE</span></header>
 <div class="card player-sheet">
   <div class=wine-head><div><span class=pill>VIN ${game.current+1} / ${ws.length}</span><h1>Jusqu’où prends-tu le risque ?</h1><p class=muted>Tu peux demander de l’aide, mais chaque indice réduit ton score potentiel.</p></div><div class=emoji>🥂</div></div>
   <div class=scorebox>
     <div class=scoreitem><span>Indices utilisés</span><b>${level}/2</b></div>
     <div class=scoreitem><span>Multiplicateur</span><b>×${factor}</b></div>
     <div class=scoreitem><span>Maximum restant</span><b>${potential}/11</b></div>
   </div>
   <div class=learning-card>
     <b>💡 Zone d’indices</b>
     <div class=muted>0 indice = 100 % · 1 indice = 75 % · 2 indices = 50 %</div>
     ${level>=1?`<p><b>Indice 1 :</b> ${esc(hints.hint1||"Observe les marqueurs dominants.")}</p>`:`<button type="button" class="btn secondary" onclick="revealHint('${w.id}',1)">Débloquer l’indice 1 → score ×0,75</button>`}
     ${level>=2?`<p><b>Indice 2 :</b> ${esc(hints.hint2||"Replace le vin dans son origine probable.")}</p>`:level>=1?`<button type="button" class="btn secondary" onclick="revealHint('${w.id}',2)">Débloquer l’indice 2 → score ×0,50</button>`:""}
   </div>
   ${regionGrapeGuideHtml()}
   ${blindGuessForm(w,a)}
   <div class="card sticky player-action" style="margin-top:18px"><button type="button" class=btn style="width:100%" onclick="submitAnswer('${w.id}')">🥂 Valider mon challenge</button></div>
 </div>`;
}

async function renderPlayerChallengeReveal(){
 const rv=await getCurrentReveal();
 if(!rv)return requestRoute();
 await playRevealIntro(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const [a,dash]=await Promise.all([getAnswer(rv.wine_id,true),getRevealDashboardData(rv)]);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const validated=a.done===true;
 const raw=validated?knowledgeScore(a,rv,"blind"):0;
 const parts=validated?scoreParts(a,rv,"challenge"):{price:0,region:0,grape:0,total:0,factor:1};
 const myRank=dash.rows.find(x=>x.user_id===user.id)?.rank||0;
 const level=Number(a.hint_level||0);
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 RÉSULTAT CHALLENGE</span></header>
 <div class="card hero"><div class=emoji>🥂</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €</p>
 <div class=scorebox><div class=scoreitem><span>Score brut</span><b>${raw}/11</b></div><div class=scoreitem><span>Indices</span><b>${level}/2</b></div><div class=scoreitem><span>Multiplicateur</span><b>×${parts.factor}</b></div></div>
 <h1 style="margin-top:18px">${parts.total}/11</h1><p class=muted>Score Challenge après application du risque choisi.</p>
 ${!validated?`<div class=notice>⚠️ Réponse non validée : 0 point.</div>`:myRank?`<div class=notice>Classement provisoire : <b>${myRank}${myRank===1?"er":"e"}</b>.</div>`:""}</div>
 <div class=card><h2>🎯 Détail</h2><div class=scorebox><div class=scoreitem><span>Prix</span><b>${parts.price}/5</b></div><div class=scoreitem><span>Région</span><b>${parts.region}/3</b></div><div class=scoreitem><span>Cépages</span><b>${parts.grape}/3</b></div></div></div>
 ${rv.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(rv.learning_note)}</p></div>`:""}
 <div class=card><h2>🥂 Classement Challenge</h2>${rankingHtml(dash.rows)}<p class=muted>Les scores affichés intègrent les multiplicateurs d’indices.</p></div>`;
}

async function renderHostChallengeReveal(){
 const rv=await getCurrentReveal();
 if(!rv)return renderHostTasting();
 await playRevealIntro(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const dash=await getRevealDashboardData(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();

 const rows=dash.current.map(a=>{
   const raw=knowledgeScore(a,rv,"blind");
   const s=scoreParts(a,rv,"challenge");
   return {...a,raw,adjusted:s.total,factor:s.factor,hints:Number(a.hint_level||0)};
 });
 const noHint=rows.filter(a=>a.hints===0).length;
 const avgHints=rows.length?rows.reduce((s,a)=>s+a.hints,0)/rows.length:0;

 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 RÉVÉLATION CHALLENGE</span></header>
 <div class="card hero"><div class=emoji>🥂</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €</p>
 <div class=scorebox><div class=scoreitem><span>Sans indice</span><b>${noHint}/${rows.length}</b></div><div class=scoreitem><span>Indices moyens</span><b>${avgHints.toFixed(1)}</b></div><div class=scoreitem><span>Réponses</span><b>${rows.length}</b></div></div></div>
 <div class=card><h2>🥂 Risque vs résultat</h2><table><tr><th>Joueur</th><th>Indices</th><th>Brut</th><th>×</th><th>Final</th></tr>${rows.map(a=>`<tr><td>${esc(a.playerName)}</td><td>${a.hints}</td><td>${a.raw}/11</td><td>×${a.factor}</td><td><b>${a.adjusted}/11</b></td></tr>`).join("")}</table></div>
 ${rv.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(rv.learning_note)}</p></div>`:""}
 <div class=card><h2>🏁 Classement Challenge</h2>${rankingHtml(dash.rows)}<button type="button" class=btn style="margin-top:16px" onclick="nextWine()">${game.current<(game.wine_count-1)?"Challenge suivant":"Voir le résultat final"}</button></div>`;
}

