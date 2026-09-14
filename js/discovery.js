/* Blind Wine — Discovery mode: guided learning journey and reveal. */
'use strict';

async function getDiscoveryWine(wineId){
 if(game.experience_mode!=="discovery")return null;
 const r=await supabaseClient.rpc("get_discovery_wine",{p_game_id:game.id,p_wine_id:wineId});
 return r.error?null:(Array.isArray(r.data)?r.data[0]:r.data);
}

async function getDiscoveryQuizFeedback(wineId){
 if(game.experience_mode!=="discovery")return null;
 const r=await supabaseClient.rpc("get_discovery_quiz_feedback",{p_game_id:game.id,p_wine_id:wineId});
 return r.error?null:(Array.isArray(r.data)?r.data[0]:r.data);
}

function discoveryDefaults(d){
 const grapes=(d?.grapes||[]).join(" / ");
 const identity=[regionLabel(d?.region),grapes].filter(Boolean).join(" · ");
 const customQuestion=String(d?.quiz_question||"").trim();
 const customOptions=Array.isArray(d?.quiz_options)?d.quiz_options:[];
 const hasCustomQuiz=customQuestion!==""&&customOptions.length>=2;
 const customCorrect=Number.isInteger(d?.quiz_correct)&&d.quiz_correct>=0&&d.quiz_correct<customOptions.length?d.quiz_correct:0;
 return {
   eye_tip:d?.eye_tip||"Observe d’abord la robe sans chercher à identifier le vin : intensité, limpidité et nuances donnent des indices sur son style et son évolution.",
   nose_tip:d?.nose_tip||"Commence par les grandes familles d’arômes. Il est plus utile d’identifier « agrumes » ou « fruits rouges » que de chercher immédiatement un arôme très précis.",
   palate_tip:d?.palate_tip||"En bouche, sépare les sensations : acidité, douceur, corps et longueur. Cette structure est souvent plus fiable que les arômes seuls.",
   question:hasCustomQuiz?customQuestion:"Quel est le meilleur réflexe pour progresser en dégustation ?",
   options:hasCustomQuiz?customOptions:["Mettre des mots sur ses sensations","Trouver absolument le domaine","Se fier uniquement au prix"],
   correct:hasCustomQuiz?customCorrect:0,
   explanation:hasCustomQuiz?(String(d?.quiz_explanation||"").trim()||"Observe la structure du vin et relie-la progressivement à son style."):"La progression vient surtout de la capacité à décrire ce que l’on ressent, puis à relier ces sensations au style du vin.",
   identity
 };
}

function discoveryProgress(step){return `<div class=discovery-progress>${[0,1,2,3,4].map(i=>`<span class="${i<=step?"on":""}"></span>`).join("")}</div>`}

async function setDiscoveryStep(wineId,step){
 await upsertAnswer(wineId,{discovery_step:Math.max(0,Math.min(4,step))});
 renderPlayerTasting();
}

async function chooseDiscoveryQuiz(wineId,index){
 const a=await getAnswer(wineId);
 if(Number.isInteger(a.quiz_choice))return toast("Ta première réponse au mini-quiz est déjà verrouillée.");
 await upsertAnswer(wineId,{quiz_choice:index});
 renderPlayerTasting();
}

function sensoryLabel(v){return v?`${v}/5`:"—"}

function renderDiscoveryJourney(w,a,d,feedback=null){
 const step=Math.max(0,Math.min(4,Number(a.discovery_step||0)));
 const e=discoveryDefaults(d);
 if(feedback){
   e.correct=Number.isInteger(feedback.quiz_correct)?feedback.quiz_correct:0;
   e.explanation=feedback.quiz_explanation||e.explanation;
 }
 const title=`${esc(d?.name||TYPES[w.type])}`;
 const identity=`${esc(regionLabel(d?.region)||"")} ${d?.grapes?.length?"· "+esc(d.grapes.join(" / ")):""} ${d?.price?`· ${Number(d.price).toFixed(2)} €`:""}`;
 let body="";
 if(step===0){
   body=`<div class=discovery-stage><div class=emoji>🎓</div><h2>${title}</h2><p class=muted>${identity}</p>
   ${d?.learning_goal?`<div class=learning-card><b>Objectif de ce verre</b><div>${esc(d.learning_goal)}</div></div>`:""}
   <div class=edu-tip><strong>Comment ça marche ?</strong>Tu vas avancer en 4 temps : observer, sentir, goûter puis comprendre. Il n’y a pas de “mauvaise” sensation : le but est d’apprendre à décrire ce que tu perçois.</div>
   <div class=discovery-nav><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',1)">Commencer par l’œil →</button></div></div>`;
 }
 if(step===1){
   body=`<div class=discovery-stage><div class=emoji>👁️</div><h2>1. Observe</h2><p class=muted>Regarde le vin avant de le sentir.</p>
   ${metric("Intensité visuelle","look",a)}
   <div class=edu-tip><strong>💡 Repère</strong>${esc(e.eye_tip)}</div>
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',0)">← Retour</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',2)">Passer au nez →</button></div></div>`;
 }
 if(step===2){
   body=`<div class=discovery-stage><div class=emoji>👃</div><h2>2. Sens</h2><p class=muted>Choisis les familles d’arômes qui te parlent le plus.</p>
   ${metric("Intensité aromatique","nose",a)}
   <div class=section><h3>Arômes perçus</h3><div class=chips>${AROMAS[w.type].map(x=>`<button type="button" class="chip ${(a.aromas||[]).includes(x)?"sel":""}" onclick="toggleAroma('${w.id}',decodeURIComponent('${encodeURIComponent(x)}'),this)">${esc(x)}</button>`).join("")}</div></div>
   <div class=edu-tip><strong>💡 Repère</strong>${esc(e.nose_tip)}</div>
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',1)">← L’œil</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',3)">Passer à la bouche →</button></div></div>`;
 }
 if(step===3){
   body=`<div class=discovery-stage><div class=emoji>👄</div><h2>3. Goûte</h2><p class=muted>Concentre-toi sur la structure du vin.</p>
   ${metric("🍋 Acidité","acid",a)}${metric("🍯 Douceur / sucrosité","sweet",a)}${metric("💪 Corps / puissance","body",a)}${metric("⏱️ Persistance","finish",a)}
   <div class=section><h3>❤️ Ton plaisir</h3><div class="scale ten">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="${a.note===n?"sel":""}" onclick="setAnswerChoice('${w.id}','note',${n},this)">${n}</button>`).join("")}</div></div>
   <div class=edu-tip><strong>💡 Repère</strong>${esc(e.palate_tip)}</div>
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',2)">← Le nez</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',4)">Comprendre →</button></div></div>`;
 }
 if(step===4){
   const choice=Number.isInteger(a.quiz_choice)?a.quiz_choice:null;
   const answered=choice!==null;
   const correct=answered&&choice===e.correct;
   body=`<div class=discovery-stage><div class=emoji>🧠</div><h2>4. Comprendre</h2>
   <div class=learning-card><b>Mini-quiz</b><div style="margin-top:8px">${esc(e.question)}</div></div>
   <div class=quiz-options>${e.options.slice(0,4).map((opt,i)=>`<button type="button" class="quiz-option ${choice===i?"selected":""} ${answered&&i===e.correct?"correct":""} ${answered&&choice===i&&i!==e.correct?"wrong":""}" ${answered?"disabled":""} onclick="chooseDiscoveryQuiz('${w.id}',${i})">${String.fromCharCode(65+i)}. ${esc(opt)}</button>`).join("")}</div>
   ${answered?`<div class=edu-tip><strong>${correct?"✅ Bien vu !":"💡 À retenir"}</strong>${esc(e.explanation)}</div>`:`<p class=muted>Choisis une réponse pour afficher l’explication.</p>`}
   ${d?.learning_note?`<div class=learning-card><b>La leçon de ce verre</b><div>${esc(d.learning_note)}</div></div>`:""}
   <div class=discovery-summary>
    <div class=row><span>👁️ Intensité visuelle</span><b>${sensoryLabel(a.scores?.look)}</b></div>
    <div class=row><span>👃 Intensité aromatique</span><b>${sensoryLabel(a.scores?.nose)}</b></div>
    <div class=row><span>🍋 Acidité</span><b>${sensoryLabel(a.scores?.acid)}</b></div>
    <div class=row><span>💪 Corps</span><b>${sensoryLabel(a.scores?.body)}</b></div>
    <div class=row><span>❤️ Plaisir</span><b>${a.note?`${a.note}/10`:"—"}</b></div>
   </div>
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',3)">← La bouche</button><button type="button" class=btn ${(!a.note||!answered)?"disabled":""} ${(!a.note||!answered)?'disabled aria-disabled="true"':""} onclick="submitAnswer('${w.id}')">Terminer ce verre</button></div>
   ${!a.note?`<p class=muted>Ajoute ta note de plaisir avant de terminer.</p>`:""}${!answered?`<p class=muted>Réponds au mini-quiz avant de terminer.</p>`:""}
   </div>`;
 }
 return `<div class="card player-sheet discovery-player-sheet"><span class=pill>VIN ${game.current+1} · 🎓 Découverte</span>${discoveryProgress(step)}${body}</div>${guideHtml()}`;
}

async function renderHostDiscoveryReveal(){
 const pos=game.current;
 const ws=await getBlindWines(),w=ws[pos];if(!w)return;
 const [rvR,ansR]=await Promise.all([
   supabaseClient.from("wine_reveals").select("*").eq("wine_id",w.id).maybeSingle(),
   supabaseClient.from("answers").select("note,quiz_choice").eq("game_id",game.id).eq("wine_id",w.id).eq("done",true)
 ]);
 if(rvR.error||ansR.error)return toast((rvR.error||ansR.error).message);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==pos)return requestRoute();
 const rv=rvR.data,aa=ansR.data||[];if(!rv)return requestRoute();
 const avg=aa.length?aa.reduce((s,a)=>s+Number(a.note||0),0)/aa.length:0;
 const edu=discoveryDefaults(rv);
 const quizCorrect=edu.correct;
 const quiz=aa.filter(a=>Number.isInteger(a.quiz_choice)&&Number(a.quiz_choice)===quizCorrect).length;
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 BILAN DU VERRE</span></header>
 <div class="card hero"><div class=emoji>${ICON[w.type]}</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))} · ${Number(rv.price).toFixed(2)} €</p></div>
 ${rv.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(rv.learning_note)}</p></div>`:""}
 <div class=card><h2>🧠 Mini-quiz</h2><p><b>${esc(edu.question)}</b></p><p>${quiz}/${aa.length} bonne${quiz>1?"s":""} réponse${aa.length>1?"s":""}.</p><div class=notice>${esc(edu.explanation)}</div></div>
 <div class=card><div class=stat><span>❤️ Note plaisir du groupe</span><strong>${aa.length?avg.toFixed(1)+"/10":"—"}</strong></div></div>
 <div class="card sticky"><button type="button" class=btn style="width:100%" onclick="nextWine()">${game.current+1>=game.wine_count?"Terminer la soirée":"Passer au vin suivant →"}</button></div>`;
}

async function renderPlayerDiscoveryReveal(){
 const pos=game.current;
 const ws=await getBlindWines(),w=ws[pos];if(!w)return;
 const [rvR,a]=await Promise.all([
   supabaseClient.from("wine_reveals").select("*").eq("wine_id",w.id).maybeSingle(),
   getAnswer(w.id,true)
 ]);
 if(rvR.error)return toast(rvR.error.message);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==pos)return requestRoute();
 const rv=rvR.data;if(!rv)return requestRoute();
 const edu=discoveryDefaults(rv);
 const opts=edu.options;
 const correct=edu.correct;
 const answered=Number.isInteger(a.quiz_choice)&&a.done===true;
 const ok=answered&&Number(a.quiz_choice)===correct;
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 BILAN</span></header>
 <div class="card hero"><div class=emoji>${ICON[w.type]}</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p></div>
 ${rv.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(rv.learning_note)}</p></div>`:""}
 <div class=card><h2>${!answered?"⏱️ Réponse non validée":ok?"✅ Bien vu":"🧠 Correction"}</h2><p><b>${esc(edu.question)}</b></p>${answered?`<p>Bonne réponse : <b>${esc(opts[correct]||"—")}</b></p>`:`<p class=muted>Tu n’avais pas terminé ce verre avant la révélation.</p>`}<div class=notice>${esc(edu.explanation)}</div></div>
 <div class=card><p class=muted>L’organisateur lancera le prochain vin.</p></div>`;
}

