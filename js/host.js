/* Blind Wine — Host lobby, bottle configuration, game control, results and stats. */
'use strict';

async function renderHostLobby(){
 const [ws,ps]=await Promise.all([getHostWines(),getPlayers()]);
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>ORGANISATEUR</span></header>
 <div class="card center"><div class=muted>MODE DE LA SOIRÉE</div><h2 style="margin:6px 0 18px">${modeBadge()}</h2><div class=muted>CODE DE LA PARTIE</div><div class=code>${esc(game.code)}</div>
 <div class=row style="justify-content:center"><button type="button" class="btn secondary" onclick="navigator.clipboard?.writeText(game.code)">Copier le code</button><button type="button" class="btn secondary" onclick="navigator.clipboard?.writeText(document.getElementById('joinUrl').textContent)">Copier le lien</button></div>
 <div id=qrcode style="display:flex;justify-content:center;margin:18px 0"></div><div id=joinUrl class="small muted"></div><p class=muted>Scanne le QR code : le code est prérempli.</p></div>
 <div class=card><h2>👥 Joueurs <span class=muted>(${Math.max(0,ps.length-1)})</span></h2><div class=chips>${ps.filter(p=>p.user_id!==game.host_id).map(p=>`<span class=player-chip>👤 ${esc(p.name)} <button type="button" class=kick title="Retirer ce joueur" onclick="removePlayer('${p.id}')">×</button></span>`).join("")||"<span class=muted>En attente…</span>"}</div></div>
 <div class=card><h2>🍷 Bouteilles · ${modeBadge()}</h2><p class=muted>La couleur, la région et les cépages se sélectionnent dans des listes. Les vraies réponses restent privées jusqu'à la révélation.</p>
 ${ws.map((w,i)=>`<div class=wine-row><div class=wine-head><b>${ICON[w.type]} Vin #${i+1}</b><span class=pill>${TYPES[w.type]}</span></div>
 <div class=config-simple>
  <div><label>Couleur du vin</label><select onchange="updateWineType('${w.id}',this.value)">${typeOptions(w.type)}</select></div>
  <div><label>Nom du vin / cuvée</label><input value="${esc(w.name||"")}" onchange="updateWineSecret('${w.id}','name',this.value)" placeholder="Ex. Whispering Angel"></div>
  <div><label>Prix réel (€)</label><input type=number min=.01 step=.01 value="${w.price??""}" onchange="updateWineSecret('${w.id}','price',this.value===''?null:Number(this.value))"></div>
  <div><label>Région / appellation</label>${regionPickerHtml(w.id,w.region||"","host")}</div>
  <div style="grid-column:1/-1"><label>Cépage(s) / assemblage</label>${grapePickerHtml(w.id,w.grapes||w.grape,"host")}</div>
  ${game.experience_mode==="discovery"?`<div style="grid-column:1/-1"><label>🎓 Objectif pédagogique</label><input value="${esc(w.learning_goal||"")}" onchange="updateWineSecret('${w.id}','learning_goal',this.value)" placeholder="Ex. Reconnaître l’acidité et les agrumes d’un Sauvignon"></div>
  <div style="grid-column:1/-1"><label>💡 À retenir</label><textarea onchange="updateWineSecret('${w.id}','learning_note',this.value)" placeholder="Le message principal que les participants doivent retenir.">${esc(w.learning_note||"")}</textarea></div>`:""}
  ${game.experience_mode==="discovery"?`
  <div style="grid-column:1/-1"><h3 style="margin-bottom:0">Parcours Découverte</h3><p class=muted>Ces contenus apparaissent au bon moment : Œil → Nez → Bouche → Comprendre.</p></div>
  <div style="grid-column:1/-1"><label>👁️ Repère visuel</label><textarea onchange="updateWineSecret('${w.id}','eye_tip',this.value)" placeholder="Ex. Une robe pâle peut évoquer un vin jeune ou un cépage peu colorant.">${esc(w.eye_tip||"")}</textarea></div>
  <div style="grid-column:1/-1"><label>👃 Repère aromatique</label><textarea onchange="updateWineSecret('${w.id}','nose_tip',this.value)" placeholder="Ex. Cherche les agrumes, les fleurs blanches et une éventuelle note végétale.">${esc(w.nose_tip||"")}</textarea></div>
  <div style="grid-column:1/-1"><label>👄 Repère en bouche</label><textarea onchange="updateWineSecret('${w.id}','palate_tip',this.value)" placeholder="Ex. Observe l’acidité, la texture et la longueur plutôt que de chercher tout de suite à identifier le vin.">${esc(w.palate_tip||"")}</textarea></div>
  <div style="grid-column:1/-1"><label>🧠 Question du mini-quiz</label><input value="${esc(w.quiz_question||"")}" onchange="updateWineSecret('${w.id}','quiz_question',this.value)" placeholder="Ex. Quel élément explique le mieux la sensation de fraîcheur ?"></div>
  <div style="grid-column:1/-1"><label>Réponses du quiz (une par ligne, 2 à 4)</label><textarea onchange="updateQuizOptions('${w.id}',this.value)" placeholder="L’acidité&#10;Le sucre&#10;Les tanins">${esc((Array.isArray(w.quiz_options)?w.quiz_options:[]).join("\n"))}</textarea></div>
  <div><label>Bonne réponse</label><select onchange="updateWineSecret('${w.id}','quiz_correct',this.value===''?null:Number(this.value))"><option value="">Choisir…</option>${[0,1,2,3].map(i=>`<option value="${i}" ${Number.isInteger(w.quiz_correct)&&w.quiz_correct===i?"selected":""}>Réponse ${i+1}</option>`).join("")}</select></div>
  <div style="grid-column:1/-1"><label>Explication après le quiz</label><textarea onchange="updateWineSecret('${w.id}','quiz_explanation',this.value)" placeholder="Ex. L’acidité provoque la salivation et donne cette impression de fraîcheur.">${esc(w.quiz_explanation||"")}</textarea></div>`:""}
  ${game.experience_mode==="challenge"?`<div style="grid-column:1/-1"><label>💡 Explication après révélation</label><textarea onchange="updateWineSecret('${w.id}','learning_note',this.value)" placeholder="Ce que les joueurs doivent retenir une fois le vin révélé.">${esc(w.learning_note||"")}</textarea></div><div><label>Indice 1 · léger</label><input value="${esc(w.hint1||"")}" onchange="updateWineSecret('${w.id}','hint1',this.value)" placeholder="Ex. Cherche le poivre et les fruits noirs"></div><div><label>Indice 2 · précis</label><input value="${esc(w.hint2||"")}" onchange="updateWineSecret('${w.id}','hint2',this.value)" placeholder="Ex. Rhône Nord"></div>`:""}
 </div></div>`).join("")}</div>
 <div class="card sticky"><button type="button" class=btn style="width:100%" onclick="startGame()">🚀 Lancer la dégustation</button></div>`;
 setTimeout(qrForGame,0);
}

async function removePlayer(playerId){
 if(game.status!=="lobby")return toast("Tu peux retirer un joueur uniquement avant le lancement.");
 if(!confirm("Retirer ce joueur de la partie ?"))return;
 const r=await supabaseClient.from("players").delete().eq("id",playerId);
 if(r.error)toast(r.error.message);
 else renderHostLobby();
}

async function updateWineType(id,type){
 wineCache=null;
 const r=await supabaseClient.from("wines").update({type}).eq("id",id);
 if(r.error)toast(r.error.message);
}

async function updateWineSecret(wineId,key,val){
 const patch={[key]:val};
 const r=await supabaseClient.from("wine_secrets").update(patch).eq("wine_id",wineId);
 if(r.error){toast(r.error.message);return null}
 return true;
}

async function updateQuizOptions(wineId,text){
 const options=String(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,4);
 await updateWineSecret(wineId,"quiz_options",options);
}

async function updateWineGrapes(wineId,values){
 const r=await supabaseClient.from("wine_secrets").update({grapes:values}).eq("wine_id",wineId);
 if(r.error){toast(r.error.message);return null}
 return true;
}

async function startGame(){
 const ws=await getHostWines();
 const missing=ws.filter(w=>!w.name||!w.price||!w.region||!(w.grapes||[]).length);
 if(missing.length)return toast(`Complète les informations des vins : ${missing.map(w=>"#"+(w.position+1)).join(", ")}.`);
 if(game.experience_mode==="discovery"){
   const badQuiz=ws.filter(w=>{
     const q=String(w.quiz_question||"").trim();
     if(!q)return false;
     const opts=Array.isArray(w.quiz_options)?w.quiz_options:[];
     return opts.length<2||!Number.isInteger(w.quiz_correct)||w.quiz_correct<0||w.quiz_correct>=opts.length;
   });
   if(badQuiz.length)return toast(`Vérifie les mini-quiz des vins : ${badQuiz.map(w=>"#"+(w.position+1)).join(", ")}.`);
 }
 if(game.experience_mode==="challenge"){
   const badHints=ws.filter(w=>!String(w.hint1||"").trim()||!String(w.hint2||"").trim());
   if(badHints.length)return toast(`Ajoute les 2 indices des vins : ${badHints.map(w=>"#"+(w.position+1)).join(", ")}.`);
 }
 const r=await supabaseClient.rpc("start_game",{p_game_id:game.id});
 if(r.error)toast(r.error.message);
}

async function renderHostTasting(){
 const [ws,ps]=await Promise.all([getBlindWines(),getPlayers()]);
 const w=ws[game.current];if(!w)return;
 const r=await supabaseClient.from("answers").select("id",{count:"exact",head:true}).eq("game_id",game.id).eq("wine_id",w.id).eq("done",true);
 const answered=r.count||0,total=Math.max(0,ps.filter(p=>p.user_id!==game.host_id).length);

 if(game.experience_mode==="discovery"){
   const d=await getDiscoveryWine(w.id);
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 DÉCOUVERTE</span></header>
   <div class="card hero"><div class=emoji>🎓</div><span class=pill>VIN ${game.current+1}/${game.wine_count||ws.length}</span><h1>${esc(d?.name||"Parcours guidé")}</h1>
   <p class=muted>${d?`${esc(regionLabel(d.region))} · ${esc((d.grapes||[]).join(" / "))}`:"Dégustation pédagogique en cours"}</p>
   <p><b>${answered}</b> / ${total} participants ont terminé le parcours.</p>
   <div class=notice>Découverte = observer → sentir → goûter → comprendre. Aucun classement de connaissance.</div>
   <button type="button" class="btn gold" onclick="revealWine()">🎓 Afficher le bilan du verre</button></div>`;
   return;
 }

 if(game.experience_mode==="challenge"){
   const ar=await supabaseClient.from("answers").select("hint_level,done").eq("game_id",game.id).eq("wine_id",w.id);
   const done=(ar.data||[]).filter(a=>a.done);
   const noHint=done.filter(a=>Number(a.hint_level||0)===0).length;
   const oneHint=done.filter(a=>Number(a.hint_level||0)===1).length;
   const twoHints=done.filter(a=>Number(a.hint_level||0)>=2).length;
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 CHALLENGE</span></header>
   <div class="card hero"><div class=emoji>🥂</div><span class=pill>VIN ${game.current+1}/${game.wine_count||ws.length}</span><h1>Le risque est lancé</h1>
   <p><b>${answered}</b> / ${total} joueurs ont verrouillé leur challenge.</p>
   <div class=scorebox><div class=scoreitem><span>Sans indice</span><b>${noHint}</b></div><div class=scoreitem><span>1 indice</span><b>${oneHint}</b></div><div class=scoreitem><span>2 indices</span><b>${twoHints}</b></div></div>
   <div class=notice>Les joueurs choisissent eux-mêmes entre risque maximal et aide progressive.</div>
   <button type="button" class="btn gold" onclick="revealWine()">🥂 Révéler et calculer les multiplicateurs</button></div>`;
   return;
 }

 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎯 À L’AVEUGLE</span></header>
 <div class="card hero"><div class=emoji>${ICON[w.type]}</div><span class=pill>${TYPES[w.type]}</span><h1>Vin #${game.current+1}</h1>
 <p><b>${answered}</b> / ${total} joueurs ont validé.</p><div class=notice>${answered===total&&total>0?"Tout le monde a répondu. La révélation peut commencer.":"Aucun indice spécifique à la bouteille n’est disponible dans ce mode."}</div>
 <button type="button" class="btn gold" onclick="revealWine()">✨ Révéler le vin</button></div>`;
}

async function revealWine(){
 const [ws,ps]=await Promise.all([getHostWines(),getPlayers()]);
 const w=ws[game.current];if(!w)return;
 const ar=await supabaseClient.from("answers").select("id",{count:"exact",head:true}).eq("game_id",game.id).eq("wine_id",w.id).eq("done",true);
 if(ar.error)return toast(ar.error.message);
 const answered=ar.count||0,total=Math.max(0,ps.filter(p=>p.user_id!==game.host_id).length);
 if(total===0)return toast("Ajoute au moins un joueur avant de révéler.");
 if(answered<total&&!confirm(`${total-answered} joueur(s) n'ont pas encore validé. Révéler quand même ?`))return;
 const rr=await supabaseClient.rpc("reveal_current_wine",{p_game_id:game.id});
 if(rr.error)return toast(rr.error.message);
}

async function nextWine(){
 if(game.phase!=="revealed")return;
 const r=await supabaseClient.rpc("advance_game",{p_game_id:game.id});
 if(r.error)toast(r.error.message);
}

async function renderHostResults(){
 const [ws,pss,rr,aa] = await Promise.all([
   getBlindWines(),getPlayers(),
   supabaseClient.from("wine_reveals").select("*").eq("game_id",game.id),
   supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("done",true)
 ]);
 if(rr.error||aa.error)return toast((rr.error||aa.error).message);
 const ps=(pss||[]).filter(p=>p.user_id!==game.host_id),reveals=rr.data||[];
 const playerById=new Map(ps.map(p=>[p.user_id,p]));
 const revealByWine=new Map(reveals.map(r=>[r.wine_id,r]));
 const allAnswers=(aa.data||[]).map(a=>({...a,playerName:playerById.get(a.user_id)?.name||"Joueur"}));
 const answersByUser=new Map(),answersByWine=new Map();
 for(const a of allAnswers){
   if(!answersByUser.has(a.user_id))answersByUser.set(a.user_id,[]);answersByUser.get(a.user_id).push(a);
   if(!answersByWine.has(a.wine_id))answersByWine.set(a.wine_id,[]);answersByWine.get(a.wine_id).push(a);
 }

 if(game.experience_mode==="discovery"){
   const wineStats=ws.map((w,i)=>{
     const list=answersByWine.get(w.id)||[],rv=revealByWine.get(w.id);
     return {i,w,rv,count:list.length,avg:list.length?list.reduce((s,a)=>s+Number(a.note||0),0)/list.length:0};
   }).filter(x=>x.rv);
   const quizAnswers=allAnswers.filter(a=>Number.isInteger(a.quiz_choice)&&revealByWine.get(a.wine_id));
   const quizTotal=quizAnswers.filter(a=>{
     const rv=revealByWine.get(a.wine_id);
     const correct=discoveryDefaults(rv).correct;
     return Number(a.quiz_choice)===correct;
   }).length;
   const quizPossible=quizAnswers.length;
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 BILAN</span></header>
    <div class="card hero"><div class=emoji>🎓</div><h1>Soirée Découverte terminée</h1><p class=muted>${ps.length} participant${ps.length>1?"s":""} · ${ws.length} vins explorés</p></div>
    <div class=card><h2>Ce qu’a préféré le groupe</h2>${wineStats.sort((a,b)=>b.avg-a.avg).map(x=>`<div class=wine-row><b>${ICON[x.w.type]} ${esc(x.rv.name)}</b><span class=pill>${x.count?x.avg.toFixed(1):"—"}/10</span><p class=muted>${esc(x.rv.learning_note||"")}</p></div>`).join("")}</div>
    <div class=card><h2>🧠 Compréhension</h2><p><b>${quizPossible?Math.round(quizTotal/quizPossible*100):0}%</b> de bonnes réponses aux mini-quiz.</p><p class=muted>Le mode Découverte ne produit pas de classement compétitif : l’objectif est l’apprentissage collectif.</p></div>
    <div class=card><button type="button" class="btn secondary" onclick="renderHostStats()">📊 Voir les statistiques</button> <button type="button" class="btn secondary" onclick="renderProfile()">📚 Mon historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>`;
   return;
 }

 if(game.experience_mode==="challenge"){
   const rows=[];
   for(const p of ps){
     const as=answersByUser.get(p.user_id)||[];
     let adjusted=0,raw=0,hints=0,noHintScore=0;
     for(const a of as){
       const rv=revealByWine.get(a.wine_id);if(!rv)continue;
       const rawScore=knowledgeScore(a,rv,"blind");
       const scored=scoreParts(a,rv,"challenge");
       raw+=rawScore;adjusted+=scored.total;hints+=Number(a.hint_level||0);
       if(Number(a.hint_level||0)===0)noHintScore+=rawScore;
     }
     const efficiency=raw>0?adjusted/raw:0;
     rows.push({name:p.name,user_id:p.user_id,adjusted:Math.round(adjusted*100)/100,raw,hints,noHintScore,count:as.length,efficiency});
   }
   rows.sort((a,b)=>b.adjusted-a.adjusted||b.noHintScore-a.noHintScore||a.hints-b.hints||a.name.localeCompare(b.name,"fr"));
   let prev=null,rank=0;
   rows.forEach((r,i)=>{if(r.adjusted!==prev){rank=i+1;prev=r.adjusted}r.rank=rank});
   const champ=rows.filter(r=>r.rank===1).map(r=>r.name).join(" & ")||"—";
   const puristBest=rows.length?Math.max(...rows.map(r=>r.noHintScore)):0;
   const purists=rows.filter(r=>r.noHintScore===puristBest&&puristBest>0).map(r=>r.name).join(" & ")||"—";
   const lowHint=rows.filter(r=>r.count>0).sort((a,b)=>(a.hints/a.count)-(b.hints/b.count)||b.adjusted-a.adjusted)[0];
   const strategist=lowHint?.name||"—";
   const groupHints=allAnswers.length?allAnswers.reduce((s,a)=>s+Number(a.hint_level||0),0)/allAnswers.length:0;

   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🥂 FINAL CHALLENGE</span></header>
   <div class="card hero"><div class=emoji>🥂</div><h1>Champion du Challenge</h1><h2>${esc(champ)}</h2><p class=muted>Le classement récompense le bon équilibre entre précision et prise de risque.</p></div>
   <div class=podium>${rows.filter(r=>r.rank<=3).map(r=>`<div class=stat center><div class=emoji>${r.rank===1?"🥇":r.rank===2?"🥈":"🥉"}</div><h2>${esc(r.name)}</h2><strong>${r.adjusted} pts</strong><span class=muted>${r.raw} pts bruts · ${r.hints} indice${r.hints>1?"s":""}</span></div>`).join("")}</div>
   <div class=card><h2>🥂 Badges Challenge</h2><div class=grid>
     <div class=stat><span>🏆 Champion du risque</span><strong>${esc(champ)}</strong><span class=muted>Meilleur score ajusté</span></div>
     <div class=stat><span>🔥 Sans filet</span><strong>${esc(purists)}</strong><span class=muted>${puristBest} pts gagnés sans indice</span></div>
     <div class=stat><span>🧠 Stratège</span><strong>${esc(strategist)}</strong><span class=muted>Meilleure sobriété d’indices</span></div>
     <div class=stat><span>💡 Indices moyens du groupe</span><strong>${groupHints.toFixed(1)}</strong><span class=muted>par réponse</span></div>
   </div></div>
   <div class=card><h2>Classement complet</h2><table><tr><th>#</th><th>Joueur</th><th>Final</th><th>Brut</th><th>Indices</th><th>Efficacité</th></tr>${rows.map(r=>`<tr><td>${r.rank}</td><td>${esc(r.name)}</td><td><b>${r.adjusted}</b></td><td>${r.raw}</td><td>${r.hints}</td><td>${Math.round(r.efficiency*100)}%</td></tr>`).join("")}</table></div>
   <div class=card><button type="button" class="btn secondary" onclick="renderHostStats()">📊 Statistiques Challenge</button> <button type="button" class="btn secondary" onclick="renderProfile()">📚 Historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>`;
   return;
 }

 const rows=[];
 for(const p of ps){
   const as=answersByUser.get(p.user_id)||[];
   let score=0,pricePts=0,regionPts=0,grapePts=0,priceDelta=0;
   for(const a of as){
     const rv=revealByWine.get(a.wine_id);if(!rv)continue;
     const s=scoreParts(a,rv,game.experience_mode);
     pricePts+=s.price;regionPts+=s.region;grapePts+=s.grape;score+=s.total;
     priceDelta+=Math.abs(Number(a.price||0)-Number(rv.price||0));
   }
   rows.push({name:p.name,user_id:p.user_id,score,pricePts,regionPts,grapePts,priceDelta,count:as.length});
 }
 rows.sort((a,b)=>b.score-a.score||a.priceDelta-b.priceDelta||a.name.localeCompare(b.name,"fr"));
 let prevScore=null,competitionRank=0;
 rows.forEach((row,i)=>{if(row.score!==prevScore){competitionRank=i+1;prevScore=row.score}row.rank=competitionRank});
 const tiedRowNames=(key)=>{
   if(!rows.length)return "—";
   const best=Math.max(...rows.map(r=>Number(r[key]||0)));
   return rows.filter(r=>Number(r[key]||0)===best).map(r=>r.name).join(" & ");
 };
 const bestSommelier=tiedRowNames("score");
 const bestPrice=tiedRowNames("pricePts");
 const bestGrape=tiedRowNames("grapePts");
 const bestRegion=tiedRowNames("regionPts");
 const wineStats=ws.map(w=>{
   const list=answersByWine.get(w.id)||[],rv=revealByWine.get(w.id);
   return {w,rv,avg:list.length?list.reduce((s,a)=>s+Number(a.note||0),0)/list.length:0,count:list.length};
 }).filter(x=>x.rv&&x.count).sort((a,b)=>b.avg-a.avg);
 const favorite=wineStats[0];
 const tasteRows=ps.map(p=>{
   const deviations=[];
   for(const w of ws){
     const list=answersByWine.get(w.id)||[];if(!list.length)continue;
     const avg=list.reduce((s,a)=>s+Number(a.note||0),0)/list.length,pa=list.find(a=>a.user_id===p.user_id);
     if(pa)deviations.push(Math.abs(Number(pa.note||0)-avg));
   }
   return {name:p.name,dev:deviations.length?deviations.reduce((s,x)=>s+x,0)/deviations.length:Infinity};
 }).sort((a,b)=>a.dev-b.dev);
 const finiteTaste=tasteRows.filter(x=>isFinite(x.dev));
 const bestTasteDev=finiteTaste.length?finiteTaste[0].dev:null;
 const bestTaste=bestTasteDev==null?"—":finiteTaste.filter(x=>Math.abs(x.dev-bestTasteDev)<1e-9).map(x=>x.name).join(" & ");
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>FINAL</span></header>
 <div class="card hero"><div class=emoji>🏆</div><h1>Classement final</h1><p class=muted>Prix + région + cépages.</p></div>
 <div class=podium>${rows.filter(x=>x.rank<=3).map(x=>`<div class=stat center><div class=emoji>${x.rank===1?"🥇":x.rank===2?"🥈":"🥉"}</div><h2>${esc(x.name)}</h2><strong>${x.score} pts</strong><span class=muted>${x.count}/${game.wine_count} vins</span></div>`).join("")}</div>
 <div class=card><h2>🎖️ Badges de la soirée</h2><div class=grid>
  <div class=stat><span>🧠 Meilleur sommelier</span><strong>${esc(bestSommelier)}</strong><span class=muted>${rows.length?Math.max(...rows.map(r=>r.score)):0} pts</span></div>
  <div class=stat><span>💰 Meilleur estimateur</span><strong>${esc(bestPrice)}</strong><span class=muted>${rows.length?Math.max(...rows.map(r=>r.pricePts)):0} pts prix</span></div>
  <div class=stat><span>🍇 Expert cépages</span><strong>${esc(bestGrape)}</strong><span class=muted>${rows.length?Math.max(...rows.map(r=>r.grapePts)):0} pts cépages</span></div>
  <div class=stat><span>🗺️ Expert régions</span><strong>${esc(bestRegion)}</strong><span class=muted>${rows.length?Math.max(...rows.map(r=>r.regionPts)):0} pts régions</span></div>
  <div class=stat><span>❤️ Meilleur goût du groupe</span><strong>${esc(bestTaste)}</strong><span class=muted>Notes les plus proches du groupe</span></div>
 </div></div>
 <div class=card><h2>❤️ Favori de la soirée</h2>${favorite?`<div class=wine-row><div class=wine-head><b>${ICON[favorite.w.type]} ${esc(favorite.rv.name)}</b><span class=pill>${favorite.avg.toFixed(1)}/10</span></div><p>${esc(regionLabel(favorite.rv.region))} · ${esc((favorite.rv.grapes||[]).join(" / "))} · ${Number(favorite.rv.price).toFixed(2)} €</p></div>`:"<p class=muted>Aucune note.</p>"}</div>
 <div class=card><button type="button" class="btn secondary" onclick="renderHostStats()">📊 Voir les statistiques par bouteille</button></div>
 <div class=card><button type="button" class="btn secondary" onclick="renderProfile()">📚 Mon historique</button> <button type="button" class="btn secondary" onclick="home()">Accueil</button></div>
 <div class=card><h2>Classement dégustateurs</h2><table><tr><th>#</th><th>Joueur</th><th>Total</th><th>Prix</th><th>Région</th><th>Cépages</th></tr>${rows.map(x=>`<tr><td>${x.rank}</td><td>${esc(x.name)}</td><td><b>${x.score}</b></td><td>${x.pricePts}</td><td>${x.regionPts}</td><td>${x.grapePts}</td></tr>`).join("")}</table></div>`;
}

async function renderHostStats(){
 const [ws,rr,ar]=await Promise.all([
   getBlindWines(),
   supabaseClient.from("wine_reveals").select("*").eq("game_id",game.id),
   supabaseClient.from("answers").select("*").eq("game_id",game.id).eq("done",true)
 ]);
 const err=rr.error||ar.error;if(err)return toast(err.message);
 const reveals=rr.data||[],answers=ar.data||[];
 const revealByWine=new Map(reveals.map(r=>[r.wine_id,r]));
 const answersByWine=new Map();
 for(const a of answers){if(!answersByWine.has(a.wine_id))answersByWine.set(a.wine_id,[]);answersByWine.get(a.wine_id).push(a)}
 const cards=ws.map((w,i)=>{
   const rv=revealByWine.get(w.id),aa=answersByWine.get(w.id)||[];
   if(!rv)return "";
   const avgPrice=game.experience_mode!=="discovery"&&aa.length?aa.reduce((s,a)=>s+Number(a.price||0),0)/aa.length:0;
   const avgNote=aa.length?aa.reduce((s,a)=>s+Number(a.note||0),0)/aa.length:0;
   const avgErr=game.experience_mode!=="discovery"&&aa.length?aa.reduce((s,a)=>s+Math.abs(Number(a.price||0)-Number(rv.price||0)),0)/aa.length:0;
   const avgHints=game.experience_mode==="challenge"&&aa.length?aa.reduce((s,a)=>s+Number(a.hint_level||0),0)/aa.length:0;
   const avgChallenge=game.experience_mode==="challenge"&&aa.length?aa.reduce((s,a)=>s+scoreParts(a,rv,"challenge").total,0)/aa.length:0;
   const quizAnswered=game.experience_mode==="discovery"?aa.filter(a=>Number.isInteger(a.quiz_choice)):[];
   const quizCorrect=game.experience_mode==="discovery"&&quizAnswered.length?quizAnswered.filter(a=>Number(a.quiz_choice)===discoveryDefaults(rv).correct).length:0;
   const dist=Array.from({length:10},(_,idx)=>aa.filter(a=>Number(a.note)===idx+1).length);
   const max=Math.max(1,...dist);
   return `<div class=card><div class=wine-head><div><span class=pill>VIN ${i+1}</span><h2 style="margin-top:8px">${ICON[w.type]} ${esc(rv.name)}</h2><p class=muted>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p></div><b>${Number(rv.price).toFixed(2)} €</b></div>
   <div class=stats-grid>
    ${game.experience_mode!=="discovery"?`<div class=stats-kpi><span>Prix estimé moyen</span><b>${avgPrice.toFixed(2)} €</b></div><div class=stats-kpi><span>Écart moyen au vrai prix</span><b>${avgErr.toFixed(2)} €</b></div>`:""}
    ${game.experience_mode==="challenge"?`<div class=stats-kpi><span>Indices moyens</span><b>${avgHints.toFixed(1)}</b></div><div class=stats-kpi><span>Score Challenge moyen</span><b>${avgChallenge.toFixed(2)}/11</b></div>`:""}
    ${game.experience_mode==="discovery"?`<div class=stats-kpi><span>Mini-quiz</span><b>${quizAnswered.length?Math.round(quizCorrect/quizAnswered.length*100):0}%</b></div>`:""}
    <div class=stats-kpi><span>Note plaisir moyenne</span><b>${avgNote.toFixed(1)}/10</b></div>
   </div>
   <h3>Distribution des notes</h3><div class=stats-bars>${dist.map((n,idx)=>`<div class=stats-line><span>${idx+1}</span><div class=stats-track><div class=stats-fill style="width:${(n/max)*100}%"></div></div><b>${n}</b></div>`).join("")}</div>
   <p class="small muted">${aa.length} réponse${aa.length>1?"s":""}</p></div>`;
 }).join("");
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>STATISTIQUES</span></header>
 <div class="card hero"><div class=emoji>📊</div><h1>${game.experience_mode==="discovery"?"Statistiques pédagogiques":game.experience_mode==="challenge"?"Statistiques Challenge":"Statistiques à l’aveugle"}</h1><p class=muted>${game.experience_mode==="discovery"?"Notes de plaisir et progression collective.":game.experience_mode==="challenge"?"Précision, prise de risque et résultats bouteille par bouteille.":"Prix estimés, écarts et notes bouteille par bouteille."}</p><button type="button" class="btn secondary" onclick="renderHostResults()">← Retour aux résultats</button></div>
 ${cards||"<div class=card><p class=muted>Aucune statistique disponible.</p></div>"}`;
}

