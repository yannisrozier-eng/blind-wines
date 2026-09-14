/* Blind Wine — Shared reveal animation, scoring dashboard and blind reveal helpers. */
'use strict';

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}

function revealSeenKey(rv){return `blindwine:v32:reveal:${game.id}:${rv.wine_id}:${role}`}

async function playRevealIntro(rv){
 const key=revealSeenKey(rv);
 if(sessionStorage.getItem(key)==="1")return;
 if(activeRevealIntro?.key===key)return activeRevealIntro.promise;
 const promise=(async()=>{
   const app=document.getElementById("app");
   const particles=`<div class=reveal-particles>${"<i></i>".repeat(8)}</div>`;
   for(const n of ["3","2","1"]){
     app.innerHTML=`<div class=reveal-stage>${particles}<div><div class=reveal-kicker>Préparez-vous</div><div class=reveal-count>${n}</div></div></div>`;
     await sleep(650);
   }
   app.innerHTML=`<div class=reveal-stage>${particles}<div><div class=reveal-bottle-icon>${ICON[rv.type]||"🍷"}</div><div class=reveal-kicker>Le vin était…</div><h1 class=reveal-wine-name>${esc(rv.name)}</h1><div>${esc(regionLabel(rv.region))}</div><div class=reveal-price>${Number(rv.price).toFixed(2)} €</div></div></div>`;
   await sleep(1500);
   sessionStorage.setItem(key,"1");
 })();
 activeRevealIntro={key,promise};
 try{await promise}finally{if(activeRevealIntro?.key===key)activeRevealIntro=null}
}

function tiedNames(items,scoreFn,{requirePositive=false}={}){
 if(!items.length)return "—";
 const scored=items.map(x=>({x,v:Number(scoreFn(x))})).filter(y=>Number.isFinite(y.v));
 if(!scored.length)return "—";
 const best=Math.max(...scored.map(y=>y.v));
 if(requirePositive&&best<=0)return "Personne";
 return scored.filter(y=>y.v===best).map(y=>y.x.playerName||"Joueur").join(" & ");
}

function closestPriceNames(items,realPrice){
 if(!items.length)return "—";
 const scored=items.map(x=>({x,v:Math.abs(Number(x.price)-Number(realPrice))})).filter(y=>Number.isFinite(y.v));
 if(!scored.length)return "—";
 const best=Math.min(...scored.map(y=>y.v));
 return scored.filter(y=>Math.abs(y.v-best)<1e-9).map(y=>y.x.playerName||"Joueur").join(" & ");
}

async function getRevealDashboardData(rv){
 const [playersR,answersR,revealsR]=await Promise.all([
   supabaseClient.from("players").select("user_id,name").eq("game_id",game.id).order("created_at"),
   supabaseClient.from("answers").select("user_id,wine_id,note,price,region,grapes,grape,hint_level,done").eq("game_id",game.id).eq("done",true),
   supabaseClient.from("wine_reveals").select("wine_id,game_id,name,price,region,grapes,learning_note,revealed_at").eq("game_id",game.id)
 ]);
 const err=playersR.error||answersR.error||revealsR.error;
 if(err){toast(err.message);return {rows:[],current:[],awards:{},group:{}}}
 const players=(playersR.data||[]).filter(p=>p.user_id!==game.host_id);
 const playerById=new Map(players.map(p=>[p.user_id,p]));
 const reveals=revealsR.data||[];
 const revealByWine=new Map(reveals.map(r=>[r.wine_id,r]));
 const answers=(answersR.data||[]).map(a=>({...a,playerName:playerById.get(a.user_id)?.name||"Joueur"}));
 const answersByUser=new Map(),answersByWine=new Map();
 for(const a of answers){
   if(!answersByUser.has(a.user_id))answersByUser.set(a.user_id,[]);
   answersByUser.get(a.user_id).push(a);
   if(!answersByWine.has(a.wine_id))answersByWine.set(a.wine_id,[]);
   answersByWine.get(a.wine_id).push(a);
 }
 const rows=players.map(p=>{
   const mine=(answersByUser.get(p.user_id)||[]).filter(a=>revealByWine.has(a.wine_id));
   const score=mine.reduce((sum,a)=>sum+knowledgeScore(a,revealByWine.get(a.wine_id)),0);
   return {user_id:p.user_id,name:p.name,score,count:mine.length};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,"fr"));
 let lastScore=null,lastRank=0;
 rows.forEach((row,i)=>{if(row.score!==lastScore){lastRank=i+1;lastScore=row.score}row.rank=lastRank});
 const current=answersByWine.get(rv.wine_id)||[];
 const avgPrice=current.length?current.reduce((s,a)=>s+Number(a.price||0),0)/current.length:0;
 const avgNote=current.length?current.reduce((s,a)=>s+Number(a.note||0),0)/current.length:0;
 const awards={
   top:tiedNames(current,a=>knowledgeScore(a,rv),{requirePositive:true}),
   price:closestPriceNames(current,rv.price),
   region:tiedNames(current,a=>regionScore(a.region,rv.region),{requirePositive:true}),
   grape:tiedNames(current,a=>grapeScore(answerGrapes(a),rv.grapes),{requirePositive:true}),
   heart:tiedNames(current,a=>Number(a.note||0),{requirePositive:true})
 };
 return {rows,current,awards,group:{avgPrice,avgNote,count:current.length}};
}

function awardCardsHtml(awards){
 return `<div class=round-awards>
   <div class=round-award><div class=award-icon>🏆</div><span>Meilleur score du vin</span><strong>${esc(awards.top||"—")}</strong></div>
   <div class=round-award><div class=award-icon>🎯</div><span>Prix le plus proche</span><strong>${esc(awards.price||"—")}</strong></div>
   <div class=round-award><div class=award-icon>🗺️</div><span>Meilleure région</span><strong>${esc(awards.region||"—")}</strong></div>
   <div class=round-award><div class=award-icon>🍇</div><span>Meilleurs cépages</span><strong>${esc(awards.grape||"—")}</strong></div>
   <div class=round-award><div class=award-icon>❤️</div><span>Plus gros coup de cœur</span><strong>${esc(awards.heart||"—")}</strong></div>
 </div>`;
}

function rankingHtml(rows){
 if(!rows.length)return `<p class=muted>Aucun classement disponible.</p>`;
 const medal=r=>r===1?"🥇":r===2?"🥈":r===3?"🥉":r;
 return `<div class=live-ranking>${rows.map(x=>`<div class="live-rank-row ${x.user_id===user?.id?"me":""}">
   <div class=live-rank-pos>${medal(x.rank)}</div>
   <div><b>${esc(x.name)}</b><div class="small muted">${x.count} vin${x.count>1?"s":""} comptabilisé${x.count>1?"s":""}</div></div>
   <div class=live-rank-score>${x.score} pts</div>
 </div>`).join("")}</div>`;
}

async function getCurrentReveal(){
 const ws=await getBlindWines(),w=ws[game.current];if(!w)return null;
 const r=await supabaseClient.from("wine_reveals").select("wine_id,game_id,name,price,region,grapes,learning_note,revealed_at").eq("wine_id",w.id).maybeSingle();
 return r.data?{...r.data,type:w.type,position:w.position}:null;
}

async function renderHostReveal(){
 const rv=await getCurrentReveal();
 if(!rv)return renderHostTasting();
 await playRevealIntro(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 const dash=await getRevealDashboardData(rv);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==rv.position)return requestRoute();
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>RÉVÉLATION · VIN ${game.current+1}</span></header>
 <div class="card hero"><div class=emoji>${ICON[rv.type]}</div><span class=pill>${TYPES[rv.type]}</span>
 <h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p><div class=code>${Number(rv.price).toFixed(2)} €</div></div>
 <div class=card><h2>📊 Le groupe sur ce vin</h2><div class=reveal-summary>
   <div class=stat><span>Prix estimé moyen</span><strong>${dash.group.count?dash.group.avgPrice.toFixed(2)+" €":"—"}</strong></div>
   <div class=stat><span>Prix réel</span><strong>${Number(rv.price).toFixed(2)} €</strong></div>
   <div class=stat><span>Note plaisir moyenne</span><strong>${dash.group.count?dash.group.avgNote.toFixed(1)+"/10":"—"}</strong></div>
 </div></div>
 <div class=card><h2>🎖️ Récompenses du vin</h2>${awardCardsHtml(dash.awards)}</div>
 <div class=card><h2>🏁 Classement intermédiaire</h2><p class=muted>Classement cumulé après ${game.current+1} vin${game.current+1>1?"s":""}.</p>${rankingHtml(dash.rows)}</div>
 <div class=card><h2>🔎 Réponses détaillées</h2><table><tr><th>Joueur</th><th>Prix</th><th>Région</th><th>Cépage</th><th>Score</th></tr>${dash.current.map(a=>`<tr><td>${esc(a.playerName)}</td><td>${Number(a.price).toFixed(2)} €</td><td>${esc(regionLabel(a.region))}</td><td>${esc(answerGrapes(a).join(" / "))}</td><td><b>${scoreParts(a,rv,"blind").total}/11</b></td></tr>`).join("")}</table>
 <button type="button" class=btn style="margin-top:16px" onclick="nextWine()">${game.current<(game.wine_count-1)?"Vin suivant":"Voir les résultats"}</button></div>`;
}

