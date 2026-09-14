/* Blind Wine — Game session, navigation, realtime routing and shared data access. */
'use strict';

async function restoreSession(){
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}catch{}
 if(!saved?.gameId)return false;
 const g=await supabaseClient.from("games")
   .select("id,code,status,current,phase,wine_count,host_id,experience_mode,created_at")
   .eq("id",saved.gameId).maybeSingle();
 if(g.error||!g.data){clearSession();return false}
 game=g.data;wineCache=null;answerCache.clear();
 // Le rôle ne vient jamais de localStorage : l'identité serveur fait foi.
 role=game.host_id===user.id?"host":"player";
 if(role==="player"){
   const p=await supabaseClient.from("players").select("id,game_id,user_id,name,created_at").eq("game_id",game.id).eq("user_id",user.id).maybeSingle();
   if(p.error||!p.data){clearSession();return false}
   player=p.data;
 }else player=null;
 saveSession();subscribe();route();return true;
}

function modeInfo(){return EXPERIENCE[game?.experience_mode||"blind"]||EXPERIENCE.blind}

function modeBadge(){let m=modeInfo();return `${m.icon} ${m.name}`}

function selectExperience(m){
 if(!EXPERIENCE[m])return;
 const input=document.getElementById("experienceMode");
 if(input)input.value=m;
 document.querySelectorAll(".mode-card").forEach(x=>x.classList.toggle("selected",x.dataset.mode===m));
 const confirm=document.getElementById("selectedModeSummary");
 if(confirm){
   const e=EXPERIENCE[m];
   confirm.innerHTML=`<div class="notice"><b>${e.icon} ${esc(e.name)}</b><br><span class=muted>${esc(e.desc)}</span></div>`;
 }
}

function updateGlobalHomeButton(){
 const b=document.getElementById("globalHomeBtn");
 if(!b)return;
 const onHome=document.body.dataset.screen==="home";
 b.classList.toggle("show",Boolean(game)&&!onHome);
}

function goHomeFromGame(){
 document.body.dataset.screen="home";
 home();
}

function resumeCurrentGame(){
 if(!game)return home();
 document.body.dataset.screen="game";
 route();
}

function closeCurrentSession(){
 if(!game)return home();
 const label=game.status==="finished"?"Fermer cette session sur cet appareil ?":"Quitter cette session sur cet appareil ?";
 if(!confirm(`${label}\n\nLa partie et son historique ne seront pas supprimés.`))return;
 clearSession();
 home();
 toast("Session fermée. L’historique est conservé.");
}

async function deleteCurrentGame(){
 if(!game||role!=="host")return;
 const ok=confirm(`Supprimer définitivement la partie ${game.code||""} ?\n\nCette action supprimera la partie et ses données associées.`);
 if(!ok)return;
 const r=await supabaseClient.rpc("delete_game",{p_game_id:game.id});
 if(r.error)return toast(r.error.message);
 try{await channel?.unsubscribe?.()}catch(e){}
 channel=null;
 localStorage.removeItem(SESSION_KEY);
 game=null;role=null;player=null;wineCache=null;answerCache.clear();
 toast("Partie supprimée.");
 home();
}

function home(){
 wineCache=null;answerCache.clear();answerWriteQueues.clear();
 document.body.dataset.screen="home";
 const preset=new URLSearchParams(location.search).get("game")||"";
 const pname=profile?.display_name||"Joueur";
 const activeGame=game?`<div class="card active-game-card" style="max-width:820px;margin:0 auto 22px">
   <div class=wine-head>
     <div>
       <span class=pill>${game.status==="finished"?"PARTIE TERMINÉE":"PARTIE EN COURS"}</span>
       <h2 style="margin:8px 0 4px">${modeBadge()}</h2>
       <p class=muted>${role==="host"?"Tu organises":"Tu participes à"} la partie <b>${esc(game.code||"")}</b>${game.status==="finished"?" · terminée":game.status==="lobby"?" · en attente":" · dégustation en cours"}.</p>
     </div>
     <div class=emoji>${game.experience_mode==="discovery"?"🎓":game.experience_mode==="challenge"?"🥂":"🎯"}</div>
   </div>
   <div class=row style="margin-top:10px;gap:10px;flex-wrap:wrap">
     <button type="button" class=btn style="flex:1;min-width:220px" onclick="resumeCurrentGame()">${game.status==="finished"?"🏁 Voir les résultats":"↩ Reprendre la partie en cours"}</button>
     <button type="button" class="btn secondary" style="flex:1;min-width:220px" onclick="closeCurrentSession()">${game.status==="finished"?"✓ Fermer cette session":"↪ Quitter cette session"}</button>
     ${role==="host"&&game.status!=="finished"?`<button type="button" class="btn secondary" style="flex:1;min-width:220px" onclick="deleteCurrentGame()">🗑️ Abandonner et supprimer</button>`:""}
   </div>
 </div>`:"";

 document.getElementById("app").innerHTML=`<header>
 <div class="logo">🍷 <span>BLIND WINE</span></div>
 <div class=account-bar><button type="button" class="btn secondary" onclick="renderProfile()">👤 ${esc(pname)}</button><button type="button" class="btn secondary" onclick="logout()">Déconnexion</button></div>
 </header>
 ${activeGame}
 <div class="card hero"><div class="emoji">🍷</div><h1>Blind Wine</h1><p class="muted">Joue, découvre et apprends le vin ensemble.</p>
 <div class="grid" style="max-width:820px;margin:30px auto 0">
  <div class="card">
    <div class=emoji>🎉</div>
    <h2>Organiser une soirée</h2>
    <p class=muted>Choisis d’abord le type d’expérience, puis configure tes bouteilles.</p>
    <button type="button" class="btn" style="margin-top:10px;width:100%" onclick="renderCreateExperience()">Créer une soirée</button>
  </div>
  <div class="card"><h2>Rejoindre une soirée</h2><label>Code</label><input id="joinCode" maxlength="5" placeholder="ABCDE" style="text-transform:uppercase" value="${esc(preset.toUpperCase())}">
   <p class=muted>Tu participeras sous le nom <b>${esc(pname)}</b>.</p>
   <button type="button" class="btn" style="margin-top:10px;width:100%" onclick="joinGame()">Rejoindre</button></div>
 </div>
 <button type="button" class="btn secondary" style="margin-top:18px" onclick="renderProfile()">📚 Mon historique & mes statistiques</button>
 <div class=install-hint>📱 Sur iPhone : Safari → Partager → Ajouter à l’écran d’accueil.</div></div>`;
 updateGlobalHomeButton();
}

function renderCreateExperience(){
 document.body.dataset.screen="create";updateGlobalHomeButton();
 document.getElementById("app").innerHTML=`<header>
   <div class=logo>🍷 <span>BLIND WINE</span></div>
   <button type="button" class="btn secondary" onclick="home()">← Retour</button>
 </header>
 <div class="card hero">
   <div class=muted>ÉTAPE 1 SUR 2</div>
   <h1>Quelle soirée veux-tu organiser ?</h1>
   <p class=muted>Le mode choisi change réellement le déroulé, les écrans joueurs et le scoring.</p>

   <div class="grid mode-grid" style="margin-top:24px">
     ${Object.entries(EXPERIENCE).map(([k,m])=>`
       <button type="button" class="mode-card" data-mode="${k}" onclick="selectExperience('${k}')">
         <span class=emoji>${m.icon}</span>
         <b>${m.name}</b>
         <small>${m.desc}</small>
       </button>`).join("")}
   </div>

   <input id=experienceMode type=hidden value="">
   <div id=selectedModeSummary style="margin-top:18px"><div class="notice">Choisis un mode pour continuer.</div></div>

   <div style="margin-top:22px;text-align:left">
     <label>Nombre de vins</label>
     <select id=wineCount>
       ${Array.from({length:18},(_,i)=>i+3).map(n=>`<option value="${n}" ${n===6?"selected":""}>${n} vins</option>`).join("")}
     </select>
   </div>

   <button type="button" class=btn style="margin-top:18px;width:100%" onclick="confirmCreateExperience()">Continuer vers la configuration des vins →</button>
 </div>`;
}

function confirmCreateExperience(){
 const mode=document.getElementById("experienceMode")?.value||"";
 if(!EXPERIENCE[mode])return toast("Choisis d’abord un mode de jeu.");
 createGame();
}

async function createGame(){
 const wineCount=Math.max(3,Math.min(20,Number(document.getElementById("wineCount")?.value||9)));
 const experienceMode=document.getElementById("experienceMode")?.value||"";
 if(!EXPERIENCE[experienceMode])return toast("Choisis d’abord un mode de jeu.");
 const r=await supabaseClient.rpc("create_game",{p_wine_count:wineCount,p_experience_mode:experienceMode});
 if(r.error)return toast(r.error.message);
 const row=Array.isArray(r.data)?r.data[0]:r.data;
 if(!row)return toast("Impossible de créer la partie.");
 game={id:row.game_id,code:row.code,status:row.status,current:row.current,phase:row.phase,wine_count:row.wine_count,host_id:row.host_id,experience_mode:row.experience_mode||'blind'};
 wineCache=null;answerCache.clear();
 role="host";player=null;saveSession();subscribe();route();
}

async function joinGame(){
 const code=document.getElementById("joinCode").value.trim().toUpperCase();
 const name=(profile?.display_name||"").trim();
 if(!code||!name)return toast("Code de partie ou profil incomplet.");
 const r=await supabaseClient.rpc("join_game",{p_code:code,p_name:name});
 if(r.error)return toast(r.error.message);
 const row=Array.isArray(r.data)?r.data[0]:r.data;
 if(!row)return toast("Partie introuvable.");
 game={id:row.game_id,code:row.code,status:row.status,current:row.current,phase:row.phase,wine_count:row.wine_count,host_id:row.host_id,experience_mode:row.experience_mode||'blind'};
 wineCache=null;answerCache.clear();
 role=game.host_id===user.id?"host":"player";
 if(role==="player"){
   const p=await supabaseClient.from("players").select("id,game_id,user_id,name,created_at").eq("game_id",game.id).eq("user_id",user.id).single();
   if(p.error)return toast(p.error.message);
   player=p.data;
 }else player=null;
 saveSession();subscribe();route();
}

function subscribe(){
 if(channel)supabaseClient.removeChannel(channel);
 channel=supabaseClient.channel("game:"+game.id)
  .on("postgres_changes",{event:"*",schema:"public",table:"games",filter:"id=eq."+game.id},async()=>{const alive=await refreshGame();if(alive)requestRoute()})
  .on("postgres_changes",{event:"*",schema:"public",table:"players",filter:"game_id=eq."+game.id},()=>handlePlayersChange())
  .on("postgres_changes",{event:"*",schema:"public",table:"answers",filter:"game_id=eq."+game.id},payload=>handleAnswerRealtime(payload))
  .on("postgres_changes",{event:"*",schema:"public",table:"wine_reveals",filter:"game_id=eq."+game.id},async()=>{await refreshGame();requestRoute()})
  .subscribe();
}

async function handlePlayersChange(){
 if(role==="player"){
   const p=await supabaseClient.from("players").select("id,name").eq("game_id",game.id).eq("user_id",user.id).maybeSingle();
   if(!p.data){
     clearSession();
     home();
     return toast("L’organisateur t’a retiré de la partie.");
   }
   player={...player,...p.data};
 }
 requestRoute();
}

async function handleAnswerRealtime(payload){
 if(role!=="host"||game?.status!=="tasting"||game?.phase!=="answering")return;
 if(payload?.new?.done!==true&&payload?.old?.done!==true)return;
 requestRoute();
}

async function refreshGame(){
 if(!game)return false;
 const r=await supabaseClient.from("games").select("id,code,status,current,phase,wine_count,host_id,experience_mode,created_at").eq("id",game.id).maybeSingle();
 if(r.error){toast(r.error.message);return false}
 if(!r.data){
   clearSession();
   home();
   toast("Cette partie n’existe plus ou a été supprimée.");
   return false;
 }
 game=r.data;saveSession();return true;
}

function requestRoute(){
 if(document.body.dataset.screen!=="game")return;
 if(routePending)return;routePending=true;
 queueMicrotask(()=>{routePending=false;if(document.body.dataset.screen==="game")route()});
}

function route(){
 document.body.dataset.screen="game";
 updateGlobalHomeButton();
 routeSeq++;
 if(!game)return home();
 if(role==="host"){
   if(game.status==="lobby")return renderHostLobby();
   if(game.status==="tasting")return game.phase==="revealed"?(game.experience_mode==="discovery"?renderHostDiscoveryReveal():game.experience_mode==="challenge"?renderHostChallengeReveal():renderHostReveal()):renderHostTasting();
   return renderHostResults();
 }else{
   if(game.status==="lobby")return renderPlayerLobby();
   if(game.status==="tasting")return game.phase==="revealed"?(game.experience_mode==="discovery"?renderPlayerDiscoveryReveal():game.experience_mode==="challenge"?renderPlayerChallengeReveal():renderPlayerReveal()):renderPlayerTasting();
   return renderPlayerFinished();
 }
}

async function getBlindWines(force=false){
 if(!force&&wineCache?.gameId===game.id)return wineCache.rows;
 const r=await supabaseClient.from("wines").select("id,game_id,position,type").eq("game_id",game.id).order("position");
 if(r.error){toast(r.error.message);return []}
 const rows=r.data||[];wineCache={gameId:game.id,rows};return rows;
}

async function getHostWines(){
 const [w,s]=await Promise.all([
  supabaseClient.from("wines").select("id,game_id,position,type").eq("game_id",game.id).order("position"),
  supabaseClient.from("wine_secrets").select("wine_id,game_id,name,price,region,grapes,learning_goal,learning_note,hint1,hint2,eye_tip,nose_tip,palate_tip,quiz_question,quiz_options,quiz_correct,quiz_explanation").eq("game_id",game.id)
 ]);
 if(w.error||s.error){toast((w.error||s.error).message);return []}
 const map=new Map((s.data||[]).map(x=>[x.wine_id,x]));
 return (w.data||[]).map(x=>({...x,...(map.get(x.id)||{}),id:x.id,grape:(map.get(x.id)?.grapes||[]).join(" / ")}));
}

async function getPlayers(){
 const r=await supabaseClient.from("players").select("id,game_id,user_id,name,created_at").eq("game_id",game.id).order("created_at");
 if(r.error){toast(r.error.message);return []}
 return r.data||[];
}

