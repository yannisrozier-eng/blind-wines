/* Blind Wine — Personal profile, history and progression analytics. */
'use strict';

function progressTrendStats(points){
 if(!points.length)return {firstAvg:0,lastAvg:0,delta:0,best:null};
 const avg=list=>list.reduce((sum,x)=>sum+x.percent,0)/Math.max(1,list.length);

 // With few tastings compare first vs last; with more history smooth the trend.
 const windowSize=points.length>=6?3:points.length>=4?2:1;
 const firstAvg=avg(points.slice(0,windowSize));
 const lastAvg=avg(points.slice(-windowSize));
 const best=points.reduce((a,b)=>b.percent>a.percent?b:a,points[0]);

 return {firstAvg,lastAvg,delta:lastAvg-firstAvg,best};
}

function progressChartHtml(points){
 if(!points.length){
   return `<div class="progress-empty"><div class=emoji>📈</div><b>Pas encore assez de données</b><p class=muted>Termine une dégustation À l’aveugle ou Challenge pour commencer à suivre ta progression.</p></div>`;
 }

 const W=Math.max(720,points.length*110),H=320;
 const left=58,right=28,top=28,bottom=58;
 const innerW=W-left-right,innerH=H-top-bottom;
 const x=i=>points.length===1?left+innerW/2:left+(i/(points.length-1))*innerW;
 const y=p=>top+innerH-(Math.max(0,Math.min(100,p))/100)*innerH;
 const path=points.map((pt,i)=>`${i?"L":"M"} ${x(i).toFixed(1)} ${y(pt.percent).toFixed(1)}`).join(" ");
 const grid=[0,25,50,75,100].map(v=>{
   const yy=y(v);
   return `<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" class="progress-grid-line"/><text x="${left-10}" y="${yy+4}" text-anchor="end" class="progress-axis-label">${v}%</text>`;
 }).join("");

 const dots=points.map((pt,i)=>{
   const xx=x(i),yy=y(pt.percent);
   const shortDate=new Date(pt.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
   return `<g class="progress-point">
     <circle cx="${xx}" cy="${yy}" r="8" tabindex="0">
       <title>${shortDate} · ${pt.modeName} · ${pt.score}/${pt.possible} pts · ${pt.percent.toFixed(0)}%</title>
     </circle>
     <text x="${xx}" y="${Math.max(18,yy-14)}" text-anchor="middle" class="progress-value">${pt.percent.toFixed(0)}%</text>
     <text x="${xx}" y="${H-22}" text-anchor="middle" class="progress-date">${shortDate}</text>
   </g>`;
 }).join("");

 return `<div class="progress-chart-scroll"><svg class="progress-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution du pourcentage de points obtenus par dégustation">
   ${grid}
   <path d="${path}" class="progress-line"/>
   ${dots}
 </svg></div>`;
}

async function renderProfile(){
 if(!user||!profile)return home();
 document.body.dataset.screen="profile";updateGlobalHomeButton();

 const playersR=await supabaseClient.from("players")
   .select("game_id,user_id,name,created_at")
   .eq("user_id",user.id)
   .order("created_at",{ascending:false});
 if(playersR.error)return toast(playersR.error.message);

 const participations=playersR.data||[];
 const gameIds=[...new Set(participations.map(p=>p.game_id))];
 let games=[],answers=[],reveals=[];

 if(gameIds.length){
   const [gamesR,answersR,revealsR]=await Promise.all([
     supabaseClient.from("games").select("id,code,status,current,phase,wine_count,host_id,experience_mode,created_at").in("id",gameIds).order("created_at",{ascending:false}),
     supabaseClient.from("answers").select("game_id,wine_id,note,price,region,grapes,grape,hint_level,quiz_choice,done").eq("user_id",user.id).eq("done",true).in("game_id",gameIds),
     supabaseClient.from("wine_reveals").select("wine_id,game_id,name,price,region,grapes,revealed_at").in("game_id",gameIds)
   ]);
   const err=gamesR.error||answersR.error||revealsR.error;
   if(err)return toast(err.message);
   games=gamesR.data||[];
   answers=answersR.data||[];
   reveals=revealsR.data||[];
 }

 const revealByWine=new Map(reveals.map(r=>[r.wine_id,r]));
 const gameById=new Map(games.map(g=>[g.id,g]));
 const answersByGame=new Map();
 for(const a of answers){
   if(!answersByGame.has(a.game_id))answersByGame.set(a.game_id,[]);
   answersByGame.get(a.game_id).push(a);
 }

 const completedGames=participations.map(p=>gameById.get(p.game_id)).filter(g=>g?.status==="finished");
 const completedPlayedGames=completedGames.filter(g=>g.host_id!==user.id);
 const completedCompetitivePlayedGames=completedPlayedGames.filter(g=>g.experience_mode!=="discovery");
 const completedCompetitivePlayedIds=new Set(completedCompetitivePlayedGames.map(g=>g.id));

 let totalPts=0,maxPts=0,pricePts=0,regionPts=0,grapePts=0,totalPriceErr=0,priceCount=0;
 let favorite=null;

 for(const a of answers){
   const rv=revealByWine.get(a.wine_id);
   if(!rv)continue;
   const gm=gameById.get(a.game_id)?.experience_mode||"blind";
   if(gm!=="discovery"&&completedCompetitivePlayedIds.has(a.game_id)){
     const s=scoreParts(a,rv,gm);
     totalPts+=s.total;
     pricePts+=s.price;
     regionPts+=s.region;
     grapePts+=s.grape;
     if(Number(rv.price)>0&&Number.isFinite(Number(a.price))){
       totalPriceErr+=Math.abs(Number(a.price)-Number(rv.price))/Number(rv.price);
       priceCount++;
     }
   }
   if(!favorite||Number(a.note||0)>favorite.note)favorite={note:Number(a.note||0),rv};
 }

 // Maximum global basé sur toutes les bouteilles des dégustations compétitives terminées.
 // Une absence de réponse compte donc bien comme 0 au lieu de réduire artificiellement le dénominateur.
 maxPts=completedCompetitivePlayedGames
   .reduce((sum,g)=>sum+(Number(g.wine_count||0)*11),0);

 const avgScore=maxPts?totalPts/maxPts*100:0;
 const avgPriceErr=priceCount?totalPriceErr/priceCount*100:0;

 const history=participations.map(p=>{
   const g=gameById.get(p.game_id);
   if(!g)return null;
   const ga=answersByGame.get(g.id)||[];
   let score=0;

   for(const a of ga){
     const rv=revealByWine.get(a.wine_id);
     if(!rv||g.experience_mode==="discovery")continue;
     score+=knowledgeScore(a,rv,g.experience_mode);
   }

   const competitive=g.experience_mode!=="discovery";
   const possible=competitive
     ? (g.status==="finished"?Number(g.wine_count||0)*11:ga.length*11)
     : 0;

   return {
     g,
     score:Math.round(score*100)/100,
     possible,
     percent:possible?score/possible*100:null,
     count:ga.length,
     host:g.host_id===user.id
   };
 }).filter(Boolean).sort((a,b)=>new Date(b.g.created_at)-new Date(a.g.created_at));

 const progression=history
   .filter(h=>h.g.status==="finished"&&h.g.host_id!==user.id&&h.g.experience_mode!=="discovery"&&h.possible>0)
   .sort((a,b)=>new Date(a.g.created_at)-new Date(b.g.created_at))
   .map((h,i)=>({
     index:i+1,
     date:h.g.created_at,
     score:h.score,
     possible:h.possible,
     percent:h.percent,
     mode:h.g.experience_mode,
     modeName:(EXPERIENCE[h.g.experience_mode]||EXPERIENCE.blind).name
   }));

 const trend=progressTrendStats(progression);
 const deltaLabel=progression.length<2
   ?"Encore trop tôt pour mesurer une tendance."
   :trend.delta>1
     ?`Tu progresses de ${trend.delta.toFixed(0)} points de pourcentage entre tes premières et dernières dégustations.`
     :trend.delta<-1
       ?`Tes dernières dégustations sont ${Math.abs(trend.delta).toFixed(0)} points sous tes premières.`
       :"Ton niveau est globalement stable pour le moment.";

 const deltaClass=trend.delta>1?"positive":trend.delta<-1?"negative":"neutral";

 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><button type="button" class="btn secondary" onclick="home()">← Accueil</button></header>

 <div class=card>
  <div class=profile-name>
   <div class=avatar>${esc((profile.display_name||"?")[0].toUpperCase())}</div>
   <div><span class=pill>MON PROFIL</span><h1 style="margin:5px 0">${esc(profile.display_name)}</h1><div class="small muted">${esc(user.email||"")}</div></div>
  </div>
  <div class=grid style="margin-top:18px"><div><label>Prénom / pseudo</label><input id=profileDisplayName maxlength=30 value="${esc(profile.display_name)}"></div></div>
  <button type="button" class="btn secondary" onclick="saveProfile()">Enregistrer le profil</button>
 </div>

 <div class=card><h2>📊 Mes statistiques</h2><div class=metric-grid>
  <div class=metric-card><span>Dégustations jouées</span><strong>${completedPlayedGames.length}</strong></div>
  <div class=metric-card><span>Soirées organisées</span><strong>${completedGames.filter(g=>g.host_id===user.id).length}</strong></div>
  <div class=metric-card><span>Vins notés</span><strong>${answers.length}</strong></div>
  <div class=metric-card><span>Score global compétitif</span><strong>${avgScore.toFixed(0)}%</strong><small>${Math.round(totalPts*100)/100}/${maxPts||0} pts</small></div>
  <div class=metric-card><span>Erreur prix moyenne</span><strong>${avgPriceErr.toFixed(0)}%</strong></div>
  <div class=metric-card><span>Points prix</span><strong>${Math.round(pricePts*100)/100}</strong></div>
  <div class=metric-card><span>Points régions</span><strong>${Math.round(regionPts*100)/100}</strong></div>
  <div class=metric-card><span>Points cépages</span><strong>${Math.round(grapePts*100)/100}</strong></div>
  <div class=metric-card><span>Vin préféré</span><strong style="font-size:15px">${favorite?esc(favorite.rv.name):"—"}</strong></div>
 </div></div>

 <div class=card>
   <div class=progress-head>
     <div><span class=pill>PROGRESSION</span><h2 style="margin:8px 0 4px">📈 Est-ce que je m’améliore ?</h2><p class=muted>Chaque point représente une dégustation terminée. Le score est normalisé sur le maximum théorique, donc les soirées restent comparables quel que soit le nombre de vins.</p></div>
     ${progression.length?`<div class="progress-best"><span>Record personnel</span><strong>${trend.best.percent.toFixed(0)}%</strong><small>${trend.best.score}/${trend.best.possible} pts</small></div>`:""}
   </div>
   ${progressChartHtml(progression)}
   <div class="progress-summary ${deltaClass}">
     <strong>${deltaLabel}</strong>
     ${progression.length>=2?`<span>Début : ${trend.firstAvg.toFixed(0)}% · Récent : ${trend.lastAvg.toFixed(0)}%</span>`:""}
   </div>
   <p class="small muted" style="margin-top:10px">Les soirées 🎓 Découverte ne sont pas incluses dans cette courbe car elles n’utilisent pas le même système de points compétitif.</p>
 </div>

 <div class=card><h2>📚 Historique</h2><div class=history-list>${history.map(h=>`<div class=history-item>
  <div><h3>${h.host?"👑 Soirée organisée":"🍷 Dégustation"} · ${new Date(h.g.created_at).toLocaleDateString("fr-FR")}</h3>
  <div class=muted>${(EXPERIENCE[h.g.experience_mode]||EXPERIENCE.blind).icon} ${(EXPERIENCE[h.g.experience_mode]||EXPERIENCE.blind).name} · Code ${esc(h.g.code)} · ${h.g.wine_count} vins · ${h.g.status==="finished"?"Terminée":h.g.status==="tasting"?"En cours":"Lobby"}</div></div>
  <div class=history-score><b>${h.possible?`${h.score}/${h.possible} pts`:"—"}</b>${h.percent!=null?`<strong>${h.percent.toFixed(0)}%</strong>`:""}<span class="small muted">${h.count} réponse${h.count>1?"s":""}</span></div>
 </div>`).join("")||"<p class=muted>Aucune dégustation pour le moment.</p>"}</div></div>`;
}

