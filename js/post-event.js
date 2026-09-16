/* Blind Wine V4.5 — Post-event caviste report, CRM export and local mail composer. */
'use strict';


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

function postEventFriendlyError(err){
 const raw=String(err?.message||err||'').trim();
 const lower=raw.toLowerCase();
 if(lower.includes('get_post_event_contacts')||lower.includes('commercial_consent')||lower.includes('schema cache')||lower.includes('does not exist')){
  return 'Le module après-soirée n’est pas totalement installé sur Supabase. Pour une installation neuve, exécute le fichier supabase.sql fourni avec cette version.';
 }
 return raw||'Une erreur est survenue pendant la préparation du rapport.';
}
function renderPostEventReportError(message){
 document.body.dataset.screen='post-report';updateGlobalHomeButton();
 document.getElementById('app').innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>📈 APRÈS-SOIRÉE</span></header>
 <div class=card><div class=emoji>⚠️</div><h1>Rapport indisponible</h1><p>${esc(message)}</p><p class=muted>Les données de la partie ne sont pas supprimées. Vérifie la migration Supabase puis réessaie.</p><button type=button class="btn secondary" onclick="renderHostResults()">← Résultats</button></div>`;
}

async function loadPostEventReportData(){
 if(!game||role!=='host'||game.status!=='finished')throw new Error('Le rapport est disponible après la fin de la soirée.');
 const warnings=[];
 let playersR=await supabaseClient.from('players').select('user_id,name,commercial_consent,commercial_consent_at').eq('game_id',game.id);
 let commercialSchemaReady=!playersR.error;
 if(playersR.error){
  warnings.push(postEventFriendlyError(playersR.error));
  playersR=await supabaseClient.from('players').select('user_id,name').eq('game_id',game.id);
 }
 const [winesR,revealsR,answersR]=await Promise.all([
  supabaseClient.from('wines').select('id,position,type').eq('game_id',game.id).order('position'),
  supabaseClient.from('wine_reveals').select('*').eq('game_id',game.id),
  supabaseClient.from('answers').select('*').eq('game_id',game.id).eq('done',true)
 ]);
 const coreErr=playersR.error||winesR.error||revealsR.error||answersR.error;
 if(coreErr)throw coreErr;

 let contacts=[],crmReady=commercialSchemaReady;
 if(commercialSchemaReady){
  const contactsR=await supabaseClient.rpc('get_post_event_contacts',{p_game_id:game.id});
  if(contactsR.error){crmReady=false;warnings.push(postEventFriendlyError(contactsR.error))}
  else contacts=contactsR.data||[];
 }

 const players=(playersR.data||[]).filter(p=>p.user_id!==game.host_id);
 const wines=winesR.data||[],reveals=revealsR.data||[],answers=answersR.data||[];
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
  const avg=notes.length?notes.reduce((sum,n)=>sum+n,0)/notes.length:0;
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
   const grapeAvg=grapeAffinity.length?grapeAffinity.reduce((sum,n)=>sum+n,0)/grapeAffinity.length:0;
   if(grapeAffinity.length>=2&&grapeAvg>=8){score+=7;reasons.push('cépage régulièrement apprécié')}
   const regionAffinity=prefs.regionNotes.get(rv.region)||[];
   const regAvg=regionAffinity.length?regionAffinity.reduce((sum,n)=>sum+n,0)/regionAffinity.length:0;
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
 return {players,wines,reveals,answers,wineStats,opportunities,consented,completed,strongest,good,topGrapes:topWeighted('grape'),topRegions:topWeighted('region'),topTypes:topWeighted('type'),crmReady,warnings:[...new Set(warnings)]};
}

function postEventWineCommercialRows(data){
 return data.wineStats.map(x=>{
  const ops=data.opportunities.filter(o=>o.wine_id===x.w.id);
  return {...x,strong:ops.filter(o=>o.level.key==='strong').length,good:ops.filter(o=>o.level.key==='good').length,ops};
 }).sort((a,b)=>b.strong-a.strong||b.good-a.good||b.avg-a.avg);
}

async function renderPostEventReport(){
 try{
  const d=await loadPostEventReportData(),wineRows=postEventWineCommercialRows(d);
  const favorite=[...d.wineStats].filter(x=>x.count).sort((a,b)=>b.avg-a.avg)[0];
  const divisive=[...d.wineStats].filter(x=>x.count>=2).sort((a,b)=>b.std-a.std)[0];
  const actionable=d.opportunities;
  const setupWarning=d.warnings.length?`<div class=notice>⚙️ <b>Configuration incomplète</b><br>${d.warnings.map(x=>esc(x)).join('<br>')}</div>`:'';
  document.body.dataset.screen='post-report';updateGlobalHomeButton();
  document.getElementById('app').innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>📈 APRÈS-SOIRÉE</span></header>
  <div class="card hero"><div class=emoji>📈</div><h1>Rapport caviste</h1><p class=muted>Comprendre ce qui a plu et identifier les opportunités à réinjecter dans ton CRM.</p><p class="small muted">📧 Le bouton email ouvre ta messagerie avec un résumé déjà préparé. Aucun service d’envoi externe n’est nécessaire.</p>${setupWarning}</div>
  <div class=post-report-kpis>
   <div class=post-report-kpi><span>Participants</span><strong>${d.players.length}</strong></div>
   <div class=post-report-kpi><span>Parcours complets</span><strong>${d.completed}/${d.players.length}</strong></div>
   <div class=post-report-kpi><span>Contacts consentis</span><strong>${d.consented.length}</strong></div>
   <div class=post-report-kpi><span>Fortes affinités</span><strong>${d.opportunities.filter(o=>o.level.key==='strong').length}</strong></div>
  </div>
  <div class=card><h2>🍷 Lecture rapide de la soirée</h2>
   ${favorite?`<p><b>❤️ Vin préféré :</b> ${esc(favorite.rv.name)} · ${favorite.avg.toFixed(1)}/10 (${favorite.count} notes)</p>`:''}
   ${divisive?`<p><b>⚡ Vin le plus clivant :</b> ${esc(divisive.rv.name)} · dispersion ${divisive.std.toFixed(1)} pt</p>`:''}
   <div class=post-report-note><b>Profils dominants</b><p>${d.topTypes.map(x=>`<span class=taste-profile-chip>${esc(x.name)} · ${x.avg.toFixed(1)}/10</span>`).join('')||'—'}</p><p>${d.topGrapes.map(x=>`<span class=taste-profile-chip>🍇 ${esc(x.name)} · ${x.avg.toFixed(1)}</span>`).join('')}</p><p>${d.topRegions.map(x=>`<span class=taste-profile-chip>🗺️ ${esc(x.name)} · ${x.avg.toFixed(1)}</span>`).join('')}</p></div>
  </div>
  <div class=card><h2>🎯 Vins à potentiel commercial</h2>${wineRows.map(x=>`<div class=opportunity-row><div><b>${esc(x.rv.name)}</b><div class="small muted">${esc(regionLabel(x.rv.region))} · ${esc((x.rv.grapes||[]).join(' / '))} · ${Number(x.rv.price).toFixed(2)} €</div></div><div><b>${x.avg.toFixed(1)}/10</b><div class="small muted">${x.count} avis</div></div><div><span class="opportunity-level strong">🔥 ${x.strong}</span> <span class="opportunity-level good">👍 ${x.good}</span></div></div>`).join('')||'<p class=muted>Aucune donnée.</p>'}</div>
  <div class=card><div class=wine-head><div><h2>👥 Opportunités par participant</h2><p class=muted>Cette vue présente les affinités de tous les participants. L’adresse email n’est affichée que si le participant a donné son consentement commercial explicite.</p></div><span class=pill>${actionable.length} signaux exploitables</span></div>
   <div class=report-table-wrap><table><tr><th>Participant</th><th>Vin</th><th>Plaisir</th><th>Affinité</th><th>Pourquoi</th><th>Contact</th></tr>${actionable.map(o=>`<tr><td>${esc(o.name)}</td><td><b>${esc(o.wine)}</b><br><span class="small muted">${esc(o.region)} · ${esc(o.grapes)}</span></td><td>${o.note}/10</td><td><span class="opportunity-level ${o.level.key}">${o.level.icon} ${esc(o.level.label)}</span></td><td>${esc(o.reasons.join(' · ')||'bonne note')}</td><td>${o.consent&&o.email?`<span class=consent-ok>✓ ${esc(o.email)}</span>`:'<span class="small muted">Email non partagé</span>'}</td></tr>`).join('')||'<tr><td colspan=6 class=muted>Aucune affinité exploitable détectée sur cette soirée.</td></tr>'}</table></div>
  </div>
  <div class=card><h2>📤 Exploiter le rapport</h2><p class=muted>Le résumé email est préparé localement dans ta messagerie. Le CSV contient uniquement les contacts ayant accepté la prospection.</p><div class=report-actions><button type=button class=btn onclick="openPostEventMail()">📧 Ouvrir dans ma boîte mail</button><button type=button class="btn secondary" onclick="copyPostEventSummary()">📋 Copier le résumé</button><button type=button class="btn secondary" ${d.crmReady?'':'disabled aria-disabled="true"'} onclick="exportPostEventCsv()">⬇️ Exporter le CSV CRM</button><button type=button class="btn secondary" onclick="renderHostResults()">← Résultats</button></div>${d.crmReady?'':'<p class="small muted">Les statistiques restent disponibles, mais les emails consentis nécessitent le schéma Supabase de cette version.</p>'}</div>`;
 }catch(e){renderPostEventReportError(postEventFriendlyError(e));}
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


function postEventMailText(d){
 const wineRows=postEventWineCommercialRows(d);
 const favorite=[...d.wineStats].filter(x=>x.count).sort((a,b)=>b.avg-a.avg)[0];
 const divisive=[...d.wineStats].filter(x=>x.count>=2).sort((a,b)=>b.std-a.std)[0];
 const lines=[];
 const date=new Date().toLocaleDateString('fr-FR');
 lines.push(`SYNTHÈSE DÉGUSTATION — ${date}`);
 lines.push(`Partie : ${game?.code||'—'} · Mode : ${game?.experience_mode||'—'}`);
 lines.push('');
 lines.push('VUE D’ENSEMBLE');
 lines.push(`Participants : ${d.players.length}`);
 lines.push(`Parcours complets : ${d.completed}/${d.players.length}`);
 lines.push(`Contacts consentis : ${d.consented.length}`);
 lines.push(`Fortes affinités détectées : ${d.opportunities.filter(o=>o.level.key==='strong').length}`);
 if(favorite)lines.push(`Vin préféré : ${favorite.rv.name} — ${favorite.avg.toFixed(1)}/10 (${favorite.count} avis)`);
 if(divisive)lines.push(`Vin le plus clivant : ${divisive.rv.name} — dispersion ${divisive.std.toFixed(1)} pt`);
 lines.push('');
 if(d.topTypes.length||d.topGrapes.length||d.topRegions.length){
  lines.push('TENDANCES DU GROUPE');
  if(d.topTypes.length)lines.push(`Styles : ${d.topTypes.map(x=>`${x.name} ${x.avg.toFixed(1)}/10`).join(' · ')}`);
  if(d.topGrapes.length)lines.push(`Cépages appréciés : ${d.topGrapes.map(x=>`${x.name} ${x.avg.toFixed(1)}/10`).join(' · ')}`);
  if(d.topRegions.length)lines.push(`Régions appréciées : ${d.topRegions.map(x=>`${x.name} ${x.avg.toFixed(1)}/10`).join(' · ')}`);
  lines.push('');
 }
 lines.push('VINS À POTENTIEL COMMERCIAL');
 for(const x of wineRows){
  lines.push(`• ${x.rv.name} — ${x.avg.toFixed(1)}/10 — 🔥 ${x.strong} forte(s) · 👍 ${x.good} bonne(s)`);
 }
 lines.push('');
 lines.push('OPPORTUNITÉS PAR PARTICIPANT');
 const maxMailRows=20;
 for(const o of d.opportunities.slice(0,maxMailRows)){
  const contact=o.consent&&o.email?o.email:'Email non partagé';
  lines.push(`• ${o.name} — ${o.wine} — ${o.note}/10 — ${o.level.label} — ${contact}`);
  if(o.reasons.length)lines.push(`  ${o.reasons.join(' · ')}`);
 }
 if(d.opportunities.length>maxMailRows)lines.push(`… ${d.opportunities.length-maxMailRows} autre(s) signal(aux) dans le rapport de l’application / export CSV.`);
 lines.push('');
 lines.push('Note : les adresses email ne figurent dans ce résumé que pour les participants ayant donné leur consentement commercial explicite.');
 return lines.join('\n');
}

async function openPostEventMail(){
 try{
  const d=await loadPostEventReportData();
  const recipient=String(user?.email||'').trim();
  if(!recipient)return toast('Aucune adresse email trouvée sur ton compte caviste.');
  const subject=`Synthèse dégustation Blind Wine — ${game?.code||''}`.trim();
  const body=postEventMailText(d);
  const href=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href=href;
 }catch(e){toast(postEventFriendlyError(e));}
}

async function copyPostEventSummary(){
 try{
  const d=await loadPostEventReportData(),text=postEventMailText(d);
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);toast('Résumé copié.');return}
  const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Résumé copié.');
 }catch(e){toast(postEventFriendlyError(e));}
}
