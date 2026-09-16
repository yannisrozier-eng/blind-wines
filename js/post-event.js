/* Blind Wine V4.4 — Post-event caviste report, CRM-ready opportunities and email trigger. */
'use strict';

let postEventMailState={status:'idle',message:''};

function postEventCsvCell(v){
 const s=String(v??'');
 return /[";\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}
function postEventDownload(name,text,type='text/csv;charset=utf-8'){
 const blob=new Blob(['\ufeff',text],{type});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function postEventStd(values){
 if(!values.length)return 0;const m=values.reduce((a,b)=>a+b,0)/values.length;
 return Math.sqrt(values.reduce((s,x)=>s+(x-m)*(x-m),0)/values.length);
}
function postEventAffinityLabel(score){
 if(score>=80)return {key:'strong',icon:'🔥',label:'Forte opportunité'};
 if(score>=68)return {key:'good',icon:'👍',label:'Bonne affinité'};
 return {key:'explore',icon:'👀',label:'À explorer'};
}
function postEventTypeLabel(type){return type==='red'?'Rouges':type==='white'?'Blancs':'Rosés'}

async function loadPostEventReportData(){
 if(!game||role!=='host'||game.status!=='finished')throw new Error('Le rapport est disponible après la fin de la soirée.');
 const [playersR,winesR,revealsR,answersR,contactsR,reportsR]=await Promise.all([
  supabaseClient.from('players').select('user_id,name,commercial_consent,commercial_consent_at').eq('game_id',game.id),
  supabaseClient.from('wines').select('id,position,type').eq('game_id',game.id).order('position'),
  supabaseClient.from('wine_reveals').select('*').eq('game_id',game.id),
  supabaseClient.from('answers').select('*').eq('game_id',game.id).eq('done',true),
  supabaseClient.rpc('get_post_event_contacts',{p_game_id:game.id}),
  supabaseClient.from('post_event_reports').select('*').eq('game_id',game.id).maybeSingle()
 ]);
 const err=playersR.error||winesR.error||revealsR.error||answersR.error||contactsR.error;
 if(err)throw err;
 const players=(playersR.data||[]).filter(p=>p.user_id!==game.host_id);
 const wines=winesR.data||[],reveals=revealsR.data||[],answers=answersR.data||[],contacts=contactsR.data||[];
 const revealByWine=new Map(reveals.map(r=>[r.wine_id,r]));
 const wineById=new Map(wines.map(w=>[w.id,w]));
 const contactByUser=new Map(contacts.map(c=>[c.user_id,c]));
 const answersByUser=new Map(),answersByWine=new Map();
 for(const a of answers){
  if(a.user_id===game.host_id)continue;
  if(!answersByUser.has(a.user_id))answersByUser.set(a.user_id,[]);answersByUser.get(a.user_id).push(a);
  if(!answersByWine.has(a.wine_id))answersByWine.set(a.wine_id,[]);answersByWine.get(a.wine_id).push(a);
 }

 const wineStats=wines.map(w=>{
  const rv=revealByWine.get(w.id),list=answersByWine.get(w.id)||[];
  const notes=list.map(a=>Number(a.note||0)).filter(n=>n>0);
  const avg=notes.length?notes.reduce((s,n)=>s+n,0)/notes.length:0;
  return {w,rv,list,avg,std:postEventStd(notes),count:notes.length};
 }).filter(x=>x.rv);

 const userPreferenceMaps=new Map();
 for(const p of players){
  const list=(answersByUser.get(p.user_id)||[]).filter(a=>revealByWine.has(a.wine_id));
  const sorted=[...list].sort((a,b)=>Number(b.note||0)-Number(a.note||0));
  const grapeNotes=new Map(),regionNotes=new Map(),typeNotes=new Map();
  for(const a of list){
   const rv=revealByWine.get(a.wine_id),w=wineById.get(a.wine_id),note=Number(a.note||0);
   for(const g of (rv?.grapes||[])){if(!grapeNotes.has(g))grapeNotes.set(g,[]);grapeNotes.get(g).push(note)}
   if(rv?.region){if(!regionNotes.has(rv.region))regionNotes.set(rv.region,[]);regionNotes.get(rv.region).push(note)}
   if(w?.type){if(!typeNotes.has(w.type))typeNotes.set(w.type,[]);typeNotes.get(w.type).push(note)}
  }
  userPreferenceMaps.set(p.user_id,{list,sorted,grapeNotes,regionNotes,typeNotes});
 }

 const opportunities=[];
 for(const p of players){
  const prefs=userPreferenceMaps.get(p.user_id),contact=contactByUser.get(p.user_id)||{};
  for(const a of prefs.list){
   const rv=revealByWine.get(a.wine_id),w=wineById.get(a.wine_id);if(!rv||!w)continue;
   const note=Number(a.note||0);if(note<6)continue;
   const rank=Math.max(0,prefs.sorted.findIndex(x=>x.wine_id===a.wine_id));
   let score=Math.min(70,note*7);
   const reasons=[];
   if(rank===0){score+=15;reasons.push('vin préféré')}
   else if(rank<=2){score+=8;reasons.push('top 3 personnel')}
   const grapeAffinity=(rv.grapes||[]).map(g=>prefs.grapeNotes.get(g)||[]).flat().filter(Boolean);
   const grapeAvg=grapeAffinity.length?grapeAffinity.reduce((s,n)=>s+n,0)/grapeAffinity.length:0;
   if(grapeAffinity.length>=2&&grapeAvg>=8){score+=7;reasons.push('cépage régulièrement apprécié')}
   const regionAffinity=prefs.regionNotes.get(rv.region)||[];
   const regAvg=regionAffinity.length?regionAffinity.reduce((s,n)=>s+n,0)/regionAffinity.length:0;
   if(regionAffinity.length>=2&&regAvg>=8){score+=5;reasons.push('région régulièrement appréciée')}
   if(game.experience_mode!=='discovery'&&a.price&&rv.price){
    const ratio=Number(a.price)/Number(rv.price);
    if(ratio>=1){score+=10;reasons.push('valeur perçue ≥ prix réel')}
    else if(ratio>=.8){score+=7;reasons.push('prix perçu proche du réel')}
    else if(ratio>=.65){score+=3;reasons.push('prix perçu compatible')}
   }
   score=Math.min(100,Math.round(score));
   if(score<58)continue;
   const level=postEventAffinityLabel(score);
   opportunities.push({user_id:p.user_id,name:p.name,email:contact.email||'',consent:Boolean(contact.commercial_consent),consent_at:contact.commercial_consent_at||null,wine_id:a.wine_id,wine:rv.name||`Vin ${w.position+1}`,region:regionLabel(rv.region),grapes:(rv.grapes||[]).join(' / '),price:Number(rv.price||0),estimated_price:a.price?Number(a.price):null,note,score,level,reasons:[...new Set(reasons)].slice(0,3),type:w.type});
  }
 }
 opportunities.sort((a,b)=>b.score-a.score||b.note-a.note||a.name.localeCompare(b.name,'fr'));

 const topWeighted=(kind)=>{
  const m=new Map();
  for(const a of answers){
   if(a.user_id===game.host_id)continue;const rv=revealByWine.get(a.wine_id),w=wineById.get(a.wine_id),note=Number(a.note||0);if(!rv||!w||!note)continue;
   const keys=kind==='grape'?(rv.grapes||[]):kind==='region'?[regionLabel(rv.region)]:[postEventTypeLabel(w.type)];
   for(const k of keys){if(!m.has(k))m.set(k,{sum:0,n:0});const x=m.get(k);x.sum+=note;x.n++}
  }
  return [...m.entries()].map(([name,x])=>({name,avg:x.sum/x.n,n:x.n})).filter(x=>x.n>=1).sort((a,b)=>b.avg-a.avg||b.n-a.n).slice(0,4);
 };
 const consented=players.filter(p=>contactByUser.get(p.user_id)?.commercial_consent);
 const completed=players.filter(p=>(answersByUser.get(p.user_id)||[]).length>=Math.max(1,wines.length)).length;
 const strongest=opportunities.filter(o=>o.consent&&o.level.key==='strong');
 const good=opportunities.filter(o=>o.consent&&o.level.key==='good');
 return {players,wines,reveals,answers,wineStats,opportunities,consented,completed,strongest,good,topGrapes:topWeighted('grape'),topRegions:topWeighted('region'),topTypes:topWeighted('type'),mailReport:reportsR.data||null};
}

function postEventWineCommercialRows(data){
 return data.wineStats.map(x=>{
  const ops=data.opportunities.filter(o=>o.wine_id===x.w.id&&o.consent);
  return {...x,strong:ops.filter(o=>o.level.key==='strong').length,good:ops.filter(o=>o.level.key==='good').length,ops};
 }).sort((a,b)=>b.strong-a.strong||b.good-a.good||b.avg-a.avg);
}

async function renderPostEventReport(){
 try{
  const d=await loadPostEventReportData(),wineRows=postEventWineCommercialRows(d);
  const favorite=[...d.wineStats].filter(x=>x.count).sort((a,b)=>b.avg-a.avg)[0];
  const divisive=[...d.wineStats].filter(x=>x.count>=2).sort((a,b)=>b.std-a.std)[0];
  const actionable=d.opportunities.filter(o=>o.consent);
  const reportStatus=d.mailReport?.emailed_at?`✅ Rapport envoyé le ${new Date(d.mailReport.emailed_at).toLocaleString('fr-FR')}`:(postEventMailState.message||'Envoi automatique en attente / configuration email à vérifier.');
  document.body.dataset.screen='post-report';updateGlobalHomeButton();
  document.getElementById('app').innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>📈 APRÈS-SOIRÉE</span></header>
  <div class="card hero"><div class=emoji>📈</div><h1>Rapport caviste</h1><p class=muted>Comprendre ce qui a plu et identifier les opportunités à réinjecter dans ton CRM.</p><div class="report-mail-status">${esc(reportStatus)}</div></div>
  <div class=post-report-kpis>
   <div class=post-report-kpi><span>Participants</span><strong>${d.players.length}</strong></div>
   <div class=post-report-kpi><span>Parcours complets</span><strong>${d.completed}/${d.players.length}</strong></div>
   <div class=post-report-kpi><span>Contacts consentis</span><strong>${d.consented.length}</strong></div>
   <div class=post-report-kpi><span>Fortes opportunités</span><strong>${d.strongest.length}</strong></div>
  </div>
  <div class=card><h2>🍷 Lecture rapide de la soirée</h2>
   ${favorite?`<p><b>❤️ Vin préféré :</b> ${esc(favorite.rv.name)} · ${favorite.avg.toFixed(1)}/10 (${favorite.count} notes)</p>`:''}
   ${divisive?`<p><b>⚡ Vin le plus clivant :</b> ${esc(divisive.rv.name)} · dispersion ${divisive.std.toFixed(1)} pt</p>`:''}
   <div class=post-report-note><b>Profils dominants</b><p>${d.topTypes.map(x=>`<span class=taste-profile-chip>${esc(x.name)} · ${x.avg.toFixed(1)}/10</span>`).join('')||'—'}</p><p>${d.topGrapes.map(x=>`<span class=taste-profile-chip>🍇 ${esc(x.name)} · ${x.avg.toFixed(1)}</span>`).join('')}</p><p>${d.topRegions.map(x=>`<span class=taste-profile-chip>🗺️ ${esc(x.name)} · ${x.avg.toFixed(1)}</span>`).join('')}</p></div>
  </div>
  <div class=card><h2>🎯 Vins à potentiel commercial</h2>${wineRows.map(x=>`<div class=opportunity-row><div><b>${esc(x.rv.name)}</b><div class="small muted">${esc(regionLabel(x.rv.region))} · ${esc((x.rv.grapes||[]).join(' / '))} · ${Number(x.rv.price).toFixed(2)} €</div></div><div><b>${x.avg.toFixed(1)}/10</b><div class="small muted">${x.count} avis</div></div><div><span class="opportunity-level strong">🔥 ${x.strong}</span> <span class="opportunity-level good">👍 ${x.good}</span></div></div>`).join('')||'<p class=muted>Aucune donnée.</p>'}</div>
  <div class=card><div class=wine-head><div><h2>👥 Opportunités par participant</h2><p class=muted>Cette vue nominative contient uniquement les participants ayant donné leur consentement commercial explicite. Les autres participent seulement aux statistiques agrégées.</p></div><span class=pill>${actionable.length} signaux exploitables</span></div>
   <div class=report-table-wrap><table><tr><th>Participant</th><th>Vin</th><th>Plaisir</th><th>Affinité</th><th>Pourquoi</th><th>Contact</th></tr>${actionable.map(o=>`<tr><td>${esc(o.name)}</td><td><b>${esc(o.wine)}</b><br><span class="small muted">${esc(o.region)} · ${esc(o.grapes)}</span></td><td>${o.note}/10</td><td><span class="opportunity-level ${o.level.key}">${o.level.icon} ${esc(o.level.label)}</span></td><td>${esc(o.reasons.join(' · ')||'bonne note')}</td><td><span class=consent-ok>✓ ${esc(o.email)}</span></td></tr>`).join('')||'<tr><td colspan=6 class=muted>Aucune opportunité nominative : aucun participant consentant avec un signal exploitable.</td></tr>'}</table></div>
  </div>
  <div class=card><h2>📤 Exploiter dans ton CRM</h2><p class=muted>Le CSV contient uniquement les contacts ayant accepté la prospection, avec le vin, le niveau d’affinité et les signaux observés.</p><div class=report-actions><button type=button class=btn onclick="exportPostEventCsv()">⬇️ Exporter les opportunités CSV</button><button type=button class="btn secondary" onclick="sendPostEventEmailNow()">✉️ Renvoyer le rapport par email</button><button type=button class="btn secondary" onclick="renderHostResults()">← Résultats</button></div></div>`;
 }catch(e){toast(e.message||String(e));}
}

async function exportPostEventCsv(){
 try{
  const d=await loadPostEventReportData(),rows=d.opportunities.filter(o=>o.consent&&o.email);
  const head=['Prénom','Email','Vin','Note plaisir /10','Affinité','Score affinité /100','Région','Cépages','Prix réel €','Prix estimé €','Signaux'];
  const lines=[head,...rows.map(o=>[o.name,o.email,o.wine,o.note,o.level.label,o.score,o.region,o.grapes,o.price.toFixed(2),o.estimated_price==null?'':o.estimated_price.toFixed(2),o.reasons.join(' | ')])];
  const csv=lines.map(r=>r.map(postEventCsvCell).join(';')).join('\r\n');
  postEventDownload(`blind-wine-${game.code}-opportunites.csv`,csv);toast(`${rows.length} opportunité${rows.length>1?'s':''} exportée${rows.length>1?'s':''}.`);
 }catch(e){toast(e.message||String(e));}
}

async function ensurePostEventEmail(force=false){
 if(!game||role!=='host'||game.status!=='finished')return null;
 const key=`postMailAttempt:${game.id}`;
 if(!force&&sessionStorage.getItem(key))return null;
 try{
  const existing=await supabaseClient.from('post_event_reports').select('emailed_at').eq('game_id',game.id).maybeSingle();
  if(existing.data?.emailed_at&&!force){postEventMailState={status:'sent',message:'Rapport déjà envoyé.'};sessionStorage.setItem(key,'1');return existing.data}
  postEventMailState={status:'sending',message:'Envoi du rapport en cours…'};
  const r=await supabaseClient.functions.invoke('post-event-report',{body:{game_id:game.id,force:Boolean(force)}});
  if(r.error)throw r.error;
  postEventMailState={status:'sent',message:r.data?.already_sent?'Rapport déjà envoyé.':'Rapport envoyé par email.'};sessionStorage.setItem(key,'1');
  return r.data;
 }catch(e){postEventMailState={status:'error',message:`Email non envoyé : ${e.message||e}`};sessionStorage.setItem(key,'1');if(force)toast(postEventMailState.message);return null}
}
async function sendPostEventEmailNow(){
 sessionStorage.removeItem(`postMailAttempt:${game.id}`);const r=await ensurePostEventEmail(true);if(r){toast(r.already_sent?'Rapport déjà envoyé.':'Rapport envoyé.');renderPostEventReport()}
}
