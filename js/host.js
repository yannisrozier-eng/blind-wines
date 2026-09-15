/* Blind Wine — Host lobby, bottle configuration, game control, results and stats. */
'use strict';

function quizCorrectOptionsHtml(options,correct){
 const list=Array.isArray(options)?options.slice(0,4):[];
 return `<option value="">Choisir la bonne réponse…</option>`+list.map((opt,i)=>`<option value="${i}" ${Number.isInteger(correct)&&correct===i?"selected":""}>${String.fromCharCode(65+i)}. ${esc(opt)}</option>`).join("");
}

function refreshQuizCorrectSelect(wineId,options,preferredIndex=null){
 const select=document.querySelector(`[data-quiz-correct="${wineId}"]`);
 if(!select)return;
 const valid=Number.isInteger(preferredIndex)&&preferredIndex>=0&&preferredIndex<options.length?preferredIndex:null;
 select.innerHTML=quizCorrectOptionsHtml(options,valid);
 select.value=valid==null?"":String(valid);
 select.disabled=options.length<2;
 const hint=document.querySelector(`[data-quiz-correct-hint="${wineId}"]`);
 if(hint)hint.textContent=options.length<2?"Ajoute au moins 2 réponses pour pouvoir choisir la bonne.":"Choisis directement la bonne réponse parmi les propositions ci-dessus.";
}


function discoveryHasPedagogicalContent(w){
 return [w.learning_note,w.eye_tip,w.nose_tip,w.palate_tip,w.quiz_question,w.quiz_explanation]
  .some(v=>String(v||'').trim()) || (Array.isArray(w.quiz_options)&&w.quiz_options.length>0);
}

function discoveryConfigHtml(w){
 const preset=discoveryGoalPreset(w.learning_goal);
 const options=Array.isArray(w.quiz_options)?w.quiz_options:[];
 const hasPreset=!!preset;
 return `<div class="discovery-config" style="grid-column:1/-1">
   <div class="discovery-config-intro">
     <span class=pill>🎓 PARCOURS PÉDAGOGIQUE</span>
     <h3>1. Que veux-tu faire découvrir avec ce vin ?</h3>
     <p class=muted>Choisis l’idée principale à transmettre. Blind Wine prépare ensuite un parcours Œil → Nez → Bouche → Comprendre que tu peux modifier librement.</p>
     <div class="discovery-goal-row">
       <select data-discovery-goal="${w.id}" onchange="selectDiscoveryGoal('${w.id}',this.value,${discoveryHasPedagogicalContent(w)?'true':'false'},this)">${discoveryGoalOptionsHtml(w.learning_goal)}</select>
       ${hasPreset?`<button type="button" class="btn secondary discovery-reapply" onclick="reapplyDiscoveryGoal('${w.id}','${preset.id}')">↻ Réappliquer</button>`:''}
     </div>
     ${preset?`<div class="discovery-goal-preview"><div class="discovery-goal-icon">${preset.icon}</div><div><b>${esc(preset.label)}</b><p>${esc(preset.short)}</p></div></div>`:`<div class="discovery-goal-preview custom"><div class="discovery-goal-icon">✍️</div><div><b>${w.learning_goal?'Objectif personnalisé':'Choisis un objectif'}</b><p>${w.learning_goal?esc(w.learning_goal):'Le parcours proposé apparaîtra ici.'}</p></div></div>`}
     <label>Objectif affiché aux participants</label>
     <input data-discovery-custom-goal="${w.id}" value="${esc(w.learning_goal||'')}" onchange="updateWineSecret('${w.id}','learning_goal',this.value)" placeholder="Ex. Ressentir l’acidité et comprendre son rôle dans l’équilibre du vin">
   </div>

   <details class="discovery-config-details" ${hasPreset?'':'open'}>
     <summary><span>2. Personnaliser le parcours proposé</span><span>Œil · Nez · Bouche · Quiz</span></summary>
     <div class="discovery-config-body config-simple">
       <div style="grid-column:1/-1"><label>💡 Message à retenir</label><textarea onchange="updateWineSecret('${w.id}','learning_note',this.value)" placeholder="Le message principal que les participants doivent retenir.">${esc(w.learning_note||preset?.learning_note||'')}</textarea></div>
       <div style="grid-column:1/-1"><label>👁️ Repère visuel</label><textarea onchange="updateWineSecret('${w.id}','eye_tip',this.value)" placeholder="Ce que le participant doit observer dans la robe.">${esc(w.eye_tip||preset?.eye_tip||'')}</textarea></div>
       <div style="grid-column:1/-1"><label>👃 Repère aromatique</label><textarea onchange="updateWineSecret('${w.id}','nose_tip',this.value)" placeholder="Ce que le participant doit chercher au nez.">${esc(w.nose_tip||preset?.nose_tip||'')}</textarea></div>
       <div style="grid-column:1/-1"><label>👄 Repère en bouche</label><textarea onchange="updateWineSecret('${w.id}','palate_tip',this.value)" placeholder="La sensation principale à observer en bouche.">${esc(w.palate_tip||preset?.palate_tip||'')}</textarea></div>
       <div style="grid-column:1/-1" class="discovery-quiz-config">
         <h3>🧠 Vérifier que le message est compris</h3>
         <p class=muted>Le mini-quiz sert à fixer une seule idée clé, pas à piéger les participants.</p>
       </div>
       <div style="grid-column:1/-1"><label>Question du mini-quiz</label><input value="${esc(w.quiz_question||preset?.question||'')}" onchange="updateWineSecret('${w.id}','quiz_question',this.value)" placeholder="Ex. Quel signe permet le mieux de ressentir l’acidité ?"></div>
       <div style="grid-column:1/-1"><label>Réponses du quiz (une par ligne, 2 à 4)</label><textarea data-quiz-options="${w.id}" oninput="previewQuizOptions('${w.id}',this.value)" onchange="updateQuizOptions('${w.id}',this.value)" placeholder="Une salivation plus importante&#10;Une sensation de bouche sèche&#10;Une couleur plus foncée">${esc((options.length?options:(preset?.options||[])).join('\n'))}</textarea><p class="small muted" style="margin:6px 0 0">Écris 2 à 4 propositions, une par ligne.</p></div>
       <div style="grid-column:1/-1"><label>✅ Quelle est la bonne réponse ?</label><select data-quiz-correct="${w.id}" ${(options.length?options:(preset?.options||[])).length<2?'disabled':''} onchange="updateWineSecret('${w.id}','quiz_correct',this.value===''?null:Number(this.value))">${quizCorrectOptionsHtml(options.length?options:(preset?.options||[]),Number.isInteger(w.quiz_correct)?w.quiz_correct:preset?.correct)}</select><p class="small muted" data-quiz-correct-hint="${w.id}" style="margin:6px 0 0">Choisis directement la bonne réponse parmi les propositions ci-dessus.</p></div>
       <div style="grid-column:1/-1"><label>Explication après le quiz</label><textarea onchange="updateWineSecret('${w.id}','quiz_explanation',this.value)" placeholder="Explique simplement pourquoi cette réponse est correcte.">${esc(w.quiz_explanation||preset?.explanation||'')}</textarea></div>
       <div style="grid-column:1/-1" class="host-private-note"><label>🎤 Note privée pour animer ce verre</label><textarea onchange="updateWineSecret('${w.id}','host_note',this.value)" placeholder="Ex. Laisser chacun sentir 20 secondes. Demander : qu'est-ce qui vous fait dire fruité ? Ne donner la réponse qu'après 2 ou 3 avis.">${esc(w.host_note||'')}</textarea><p class="small muted" style="margin:6px 0 0">Visible uniquement par l'organisateur. Elle n'est jamais envoyée aux participants.</p></div>
     </div>
   </details>
 </div>`;
}

async function applyDiscoveryGoalPreset(wineId,goalId,{confirmReplace=true}={}){
 const preset=DISCOVERY_GOALS.find(g=>g.id===goalId);
 if(!preset)return null;
 if(confirmReplace&&!confirm(`Utiliser le parcours « ${preset.label} » ?\n\nLes conseils et le mini-quiz pédagogiques actuels de ce vin seront remplacés. Les informations du vin (nom, prix, région, cépages) ne seront pas modifiées.`))return false;
 const patch={
   learning_goal:preset.label,
   learning_note:preset.learning_note,
   eye_tip:preset.eye_tip,
   nose_tip:preset.nose_tip,
   palate_tip:preset.palate_tip,
   quiz_question:preset.question,
   quiz_options:preset.options,
   quiz_correct:preset.correct,
   quiz_explanation:preset.explanation
 };
 const r=await supabaseClient.from('wine_secrets').update(patch).eq('wine_id',wineId);
 if(r.error){toast(r.error.message);return null}
 wineCache=null;
 return true;
}

async function selectDiscoveryGoal(wineId,goalId,hasContent,select){
 if(goalId==='custom'){
   document.querySelector(`[data-discovery-custom-goal="${wineId}"]`)?.focus();
   return;
 }
 if(!goalId){
   await updateWineSecret(wineId,'learning_goal','');
   return;
 }
 const saved=await applyDiscoveryGoalPreset(wineId,goalId,{confirmReplace:hasContent});
 if(saved===false){
   const ws=await getHostWines();
   const w=ws.find(x=>x.id===wineId);
   if(select)select.value=discoveryGoalId(w?.learning_goal)|| (w?.learning_goal?'custom':'');
   return;
 }
 if(saved)await renderHostLobby();
}

async function reapplyDiscoveryGoal(wineId,goalId){
 const saved=await applyDiscoveryGoalPreset(wineId,goalId,{confirmReplace:true});
 if(saved)await renderHostLobby();
}


function discoveryThemeConfigHtml(ws){
 const preset=discoveryThemePreset(game.discovery_theme);
 const suggested=(ws||[]).map((w,i)=>{
   const id=discoverySuggestedGoal(game.discovery_theme,i),goal=id?DISCOVERY_GOALS.find(g=>g.id===id):null;
   return goal?`<span class="chip static">${i+1}. ${goal.icon} ${esc(goal.label)}</span>`:'';
 }).filter(Boolean).join('');
 return `<div class="card discovery-theme-config"><span class="pill">🎓 FIL ROUGE DE LA SOIRÉE</span><h2>Quelle histoire veux-tu faire vivre au groupe ?</h2><p class=muted>Le thème relie les bouteilles entre elles. Il ne remplace pas les objectifs de chaque vin : il donne une progression cohérente à la soirée.</p>
   <div class="grid"><div><label>Thème</label><select onchange="updateDiscoverySetup(this.value,null)">${discoveryThemeOptionsHtml(game.discovery_theme)}</select></div><div><label>Ce que les participants doivent retenir</label><textarea id="discoveryThemeGoal" onchange="updateDiscoverySetup(null,this.value)" placeholder="Ex. À la fin, savoir distinguer acidité, tanins et corps.">${esc(game.discovery_theme_goal||preset?.desc||'')}</textarea></div></div>
   ${preset?.sequence?.length?`<div class="theme-sequence"><b>💡 Trame suggérée</b><div class="chips">${suggested}</div><small class=muted>Suggestion uniquement : les objectifs déjà configurés sur les bouteilles restent inchangés.</small></div>`:''}
 </div>`;
}
async function updateDiscoverySetup(theme=null,goal=null){
 const previousPreset=discoveryThemePreset(game.discovery_theme);
 const nextTheme=theme===null?(game.discovery_theme||''):theme;
 const preset=discoveryThemePreset(nextTheme);
 const currentGoal=document.getElementById('discoveryThemeGoal')?.value||game.discovery_theme_goal||'';
 const canReplaceDefault=!currentGoal.trim()||currentGoal.trim()===(previousPreset?.desc||'').trim();
 const nextGoal=goal===null?(canReplaceDefault?(preset?.desc||''):currentGoal):goal;
 const r=await supabaseClient.rpc('set_discovery_setup',{p_game_id:game.id,p_theme:nextTheme,p_goal:nextGoal});
 if(r.error)return toast(r.error.message);
 game.discovery_theme=nextTheme;game.discovery_theme_goal=nextGoal;saveSession();
 await renderHostLobby();
}

async function renderHostLobby(){
 const [ws,ps]=await Promise.all([getHostWines(),getPlayers()]);
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>ORGANISATEUR</span></header>
 <div class="card center"><div class=muted>MODE DE LA SOIRÉE</div><h2 style="margin:6px 0 18px">${modeBadge()}</h2><div class=muted>CODE DE LA PARTIE</div><div class=code>${esc(game.code)}</div>
 <div class=row style="justify-content:center"><button type="button" class="btn secondary" onclick="navigator.clipboard?.writeText(game.code)">Copier le code</button><button type="button" class="btn secondary" onclick="navigator.clipboard?.writeText(document.getElementById('joinUrl').textContent)">Copier le lien</button></div>
 <div id=qrcode style="display:flex;justify-content:center;margin:18px 0"></div><div id=joinUrl class="small muted"></div><p class=muted>Scanne le QR code : le code est prérempli.</p></div>
 ${game.experience_mode==="discovery"?discoveryThemeConfigHtml(ws):""}
 <div class=card><h2>👥 Joueurs <span class=muted>(${Math.max(0,ps.length-1)})</span></h2><div class=chips>${ps.filter(p=>p.user_id!==game.host_id).map(p=>`<span class=player-chip>👤 ${esc(p.name)} <button type="button" class=kick title="Retirer ce joueur" onclick="removePlayer('${p.id}')">×</button></span>`).join("")||"<span class=muted>En attente…</span>"}</div></div>
 <div class=card><h2>🍷 Bouteilles · ${modeBadge()}</h2><p class=muted>La couleur, la région et les cépages se sélectionnent dans des listes. Les vraies réponses restent privées jusqu'à la révélation.</p>
 ${ws.map((w,i)=>`<div class=wine-row><div class=wine-head><b>${ICON[w.type]} Vin #${i+1}</b><span class=pill>${TYPES[w.type]}</span></div>
 <div class=config-simple>
  <div><label>Couleur du vin</label><select onchange="updateWineType('${w.id}',this.value)">${typeOptions(w.type)}</select></div>
  <div><label>Nom du vin / cuvée</label><input value="${esc(w.name||"")}" onchange="updateWineSecret('${w.id}','name',this.value)" placeholder="Ex. Whispering Angel"></div>
  <div><label>Prix réel (€)</label><input type=number min=.01 step=.01 value="${w.price??""}" onchange="updateWineSecret('${w.id}','price',this.value===''?null:Number(this.value))"></div>
  <div><label>Région</label>${regionPickerHtml(w.id,w.region||"","host")}</div>
  <div style="grid-column:1/-1"><label>Cépage(s) / assemblage</label>${grapePickerHtml(w.id,w.grapes||w.grape,"host")}</div>
  ${game.experience_mode==="discovery"?discoveryConfigHtml(w):""}
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

function parseQuizOptions(text){
 return String(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,4);
}

function previewQuizOptions(wineId,text){
 const options=parseQuizOptions(text);
 const select=document.querySelector(`[data-quiz-correct="${wineId}"]`);
 const previous=select?.value!==""?Number(select.value):null;
 refreshQuizCorrectSelect(wineId,options,previous);
}

async function updateQuizOptions(wineId,text){
 const options=parseQuizOptions(text);
 const select=document.querySelector(`[data-quiz-correct="${wineId}"]`);
 const selected=select?.value!==""?Number(select.value):null;
 const validSelected=Number.isInteger(selected)&&selected>=0&&selected<options.length?selected:null;

 const saved=await updateWineSecret(wineId,"quiz_options",options);
 if(!saved)return;

 // Si la bonne réponse n'existe plus après édition, on la remet volontairement à vide.
 if(validSelected==null){
   await updateWineSecret(wineId,"quiz_correct",null);
 }
 refreshQuizCorrectSelect(wineId,options,validSelected);
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
   if(!String(game.discovery_theme||"").trim())return toast("Choisis le fil rouge de la soirée Découverte.");
   if(!String(game.discovery_theme_goal||"").trim())return toast("Précise ce que les participants doivent retenir à la fin de la soirée.");
   const missingGoal=ws.filter(w=>!String(w.learning_goal||"").trim());
   if(missingGoal.length)return toast(`Choisis l’objectif pédagogique des vins : ${missingGoal.map(w=>"#"+(w.position+1)).join(", ")}.`);
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

function discoveryStageLabel(step){
 return ['Introduction','Œil','Nez','Bouche','Comprendre'][Math.max(0,Math.min(4,Number(step||0)))]||'Introduction';
}
function discoveryAverage(rows,key){
 const vals=rows.map(a=>Number(a.scores?.[key])).filter(v=>v>=1&&v<=5);
 return vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:null;
}
function discoveryTopAromas(rows,limit=4){
 const counts=new Map();
 rows.forEach(a=>(a.aromas||[]).forEach(x=>counts.set(x,(counts.get(x)||0)+1)));
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit);
}
function discoveryHostGuide(d){
 const goal=discoveryGoalPreset(d?.learning_goal);
 const focus=goal?.label||d?.learning_goal||'le thème du verre';
 const ask=goal?.id==='aromas'?"Demande d'abord une grande famille : fruit, fleur, épice, végétal ou bois. Puis demande ce qui leur fait choisir cette famille.":
   goal?.id==='acidity'?"Après une gorgée, demande : est-ce que votre bouche se remet à saliver ? Fais comparer les réponses avant d'expliquer l'acidité.":
   goal?.id==='tannins'?"Demande où ils ressentent l'assèchement : gencives, langue, joues. Fais décrire la sensation avant de prononcer le mot tanins.":
   goal?.id==='body'?"Demande : ce vin vous paraît-il léger comme de l'eau, ou plus ample et dense ? Fais justifier les extrêmes.":
   goal?.id==='oak'?"Fais chercher d'abord librement les arômes. Ensuite seulement, propose toasté, vanille, fumé ou épices comme pistes.":
   `Demande à 2 ou 3 participants de décrire ce qu'ils ressentent sur « ${focus} » avant de donner l'explication.`;
 return {ask,reveal:goal?.learning_note||d?.learning_note||"Relie les sensations exprimées par le groupe à l'objectif pédagogique du verre."};
}
function discoveryLiveDashboard(rows,total,d=null){
 const stages=[0,1,2,3,4].map(step=>({step,count:rows.filter(a=>Number(a.discovery_step||0)===step&&!a.done).length}));
 const aromas=discoveryTopAromas(rows);
 const acid=discoveryAverage(rows,'acid'), body=discoveryAverage(rows,'body'), nose=discoveryAverage(rows,'nose');
 const compareRows=rows.filter(a=>a.discovery_compare?.choice);
 const compareCounts={previous:0,current:0,similar:0};compareRows.forEach(a=>compareCounts[a.discovery_compare.choice]=(compareCounts[a.discovery_compare.choice]||0)+1);
 const spec=discoveryComparisonSpec(d||{});
 return `<div class="card discovery-live"><div class="discovery-live-head"><div><span class="pill">👥 EN DIRECT</span><h2>Ce que vit le groupe</h2></div><b>${rows.filter(a=>a.done).length}/${total} terminés</b></div>
 <div class="discovery-stage-live">${stages.map(x=>`<div><span>${discoveryStageLabel(x.step)}</span><b>${x.count}</b></div>`).join('')}</div>
 <div class="discovery-live-grid"><div><span>👃 Intensité nez</span><b>${nose?nose.toFixed(1)+'/5':'—'}</b></div><div><span>🍋 Acidité</span><b>${acid?acid.toFixed(1)+'/5':'—'}</b></div><div><span>💪 Corps</span><b>${body?body.toFixed(1)+'/5':'—'}</b></div></div>
 <div class="discovery-live-aromas"><b>👃 Arômes qui ressortent</b>${aromas.length?`<div class="chips">${aromas.map(([x,n])=>`<span class="chip static">${esc(x)} · ${n}</span>`).join('')}</div>`:`<p class="muted">Les réponses apparaîtront ici pendant la dégustation.</p>`}</div>
 ${game.current>0?`<div class="live-comparison"><b>${spec.icon} Comparaison : lequel paraît le plus ${esc(spec.label)} ?</b><div class="comparison-bars"><span>Vin précédent <b>${compareCounts.previous}</b></span><span>Très proches <b>${compareCounts.similar}</b></span><span>Ce vin <b>${compareCounts.current}</b></span></div></div>`:''}
 <p class="small muted">Ces données servent à lancer la discussion : ce sont des perceptions du groupe, pas des bonnes ou mauvaises réponses.</p></div>`;
}

async function renderHostTasting(){
 const [ws,ps]=await Promise.all([getBlindWines(),getPlayers()]);
 const w=ws[game.current];if(!w)return;
 const r=await supabaseClient.from("answers").select("id",{count:"exact",head:true}).eq("game_id",game.id).eq("wine_id",w.id).eq("done",true);
 const answered=r.count||0,total=Math.max(0,ps.filter(p=>p.user_id!==game.host_id).length);

 if(game.experience_mode==="discovery"){
   const [d,secretR,liveR]=await Promise.all([
     getDiscoveryWine(w.id),
     supabaseClient.from("wine_secrets").select("host_note").eq("wine_id",w.id).maybeSingle(),
     supabaseClient.from("answers").select("scores,aromas,note,discovery_step,quiz_choice,discovery_compare,done").eq("game_id",game.id).eq("wine_id",w.id)
   ]);
   const live=liveR.data||[], guide=discoveryHostGuide(d);
   const privateNote=secretR.data?.host_note||'';
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 DÉCOUVERTE</span></header>
   <div class="card hero">${discoveryThemeSummary()}<div class=emoji>🎓</div><span class=pill>VIN ${game.current+1}/${game.wine_count||ws.length}</span><h1>${esc(d?.name||"Parcours guidé")}</h1>
   <p class=muted>${d?`${esc(regionLabel(d.region))} · ${esc((d.grapes||[]).join(" / "))}`:"Dégustation pédagogique en cours"}</p>
   ${d?.learning_goal?`<div class="discovery-host-goal"><b>🎯 Objectif :</b> ${esc(discoveryGoalPreset(d.learning_goal)?.label||d.learning_goal)}</div>`:""}</div>
   <div class="card facilitator-card"><span class="pill">🎤 COPILOTE CAVISTE · PRIVÉ</span><h2>Fais parler le groupe avant d'expliquer</h2><div class="facilitator-step"><b>1 · Question à lancer</b><p>${esc(guide.ask)}</p></div><div class="facilitator-step"><b>2 · Puis à révéler</b><p>${esc(guide.reveal)}</p></div>${privateNote?`<div class="facilitator-note"><b>📝 Ta note</b><p>${esc(privateNote)}</p></div>`:''}</div>
   ${discoveryLiveDashboard(live,total,d)}
   <div class="card sticky"><button type="button" class="btn gold" style="width:100%" onclick="revealWine()">🎓 Afficher le bilan du verre</button></div>`;
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
   const groupByGoal=new Map();
   allAnswers.forEach(a=>{const rv=revealByWine.get(a.wine_id);if(!rv||!Number.isInteger(a.quiz_choice))return;const ed=discoveryDefaults(rv),goal=discoveryGoalPreset(rv.learning_goal);const key=goal?.id||rv.learning_goal||'general';if(!groupByGoal.has(key))groupByGoal.set(key,{label:goal?.label||rv.learning_goal||'Compréhension générale',icon:goal?.icon||'🎓',ok:0,total:0});const x=groupByGoal.get(key);x.total++;if(Number(a.quiz_choice)===ed.correct)x.ok++;});
   const groupNotions=[...groupByGoal.values()].map(x=>({...x,rate:x.total?x.ok/x.total:0})).sort((a,b)=>b.rate-a.rate);
   document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 BILAN</span></header>
    <div class="card hero">${discoveryThemeSummary()}<div class=emoji>🎓</div><h1>Soirée Découverte terminée</h1><p class=muted>${ps.length} participant${ps.length>1?"s":""} · ${ws.length} vins explorés</p></div>
    <div class=card><h2>Ce qu’a préféré le groupe</h2>${wineStats.sort((a,b)=>b.avg-a.avg).map(x=>`<div class=wine-row><b>${ICON[x.w.type]} ${esc(x.rv.name)}</b><span class=pill>${x.count?x.avg.toFixed(1):"—"}/10</span><p class=muted>${esc(x.rv.learning_note||"")}</p></div>`).join("")}</div>
    <div class=card><h2>🧠 Compréhension du groupe</h2><p><b>${quizPossible?Math.round(quizTotal/quizPossible*100):0}%</b> de bonnes réponses aux mini-quiz.</p><div class="notion-grid">${groupNotions.map(n=>`<div class="notion-card ${n.rate>=.67?'mastered':'learning'}"><span>${n.icon}</span><div><b>${esc(n.label)}</b><small>${Math.round(n.rate*100)}% compris · ${n.total} réponse${n.total>1?'s':''}</small></div></div>`).join('')}</div><p class=muted>Pas de classement compétitif : ces données servent au caviste à voir les notions acquises et celles à retravailler.</p></div>
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

