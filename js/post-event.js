/* Blind Wine V4.6 — Commercial post-event report, CRM export and local/design email composer. */
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
   opportunities.push({user_id:p.user_id,name:p.name,email:contact.email||'',consent:Boolean(p.commercial_consent),consent_at:p.commercial_consent_at||null,wine_id:a.wine_id,wine:rv.name||`Vin ${w.position+1}`,region:regionLabel(rv.region),grapes:(rv.grapes||[]).join(' / '),price:Number(rv.price||0),estimated_price:a.price?Number(a.price):null,note,score,level,reasons:[...new Set(reasons)].slice(0,3),type:w.type});
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
 const consented=players.filter(p=>Boolean(p.commercial_consent));
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


function postEventCommercialSummary(d){
 const wineRows=postEventWineCommercialRows(d);
 const favorite=[...d.wineStats].filter(x=>x.count).sort((a,b)=>b.avg-a.avg||b.count-a.count)[0]||null;
 const divisive=[...d.wineStats].filter(x=>x.count>=2).sort((a,b)=>b.std-a.std)[0]||null;
 const hottest=wineRows[0]||null;
 const strong=d.opportunities.filter(o=>o.level.key==='strong');
 const good=d.opportunities.filter(o=>o.level.key==='good');
 const explore=d.opportunities.filter(o=>o.level.key==='explore');
 const consentedStrong=strong.filter(o=>o.consent&&o.email);
 const completion=d.players.length?Math.round((d.completed/d.players.length)*100):0;
 const commercialSignals=strong.length+good.length;
 const audienceLead=d.topTypes[0]?.name||d.topGrapes[0]?.name||d.topRegions[0]?.name||'profil encore dispersé';
 const actions=[];
 if(consentedStrong.length)actions.push(`Recontacter en priorité ${consentedStrong.length} participant${consentedStrong.length>1?'s':''} à forte affinité avec email partagé.`);
 if(hottest?.rv?.name)actions.push(`Mettre en avant ${hottest.rv.name} : c’est la référence qui concentre le plus de signaux commerciaux.`);
 if(d.topGrapes[0]?.name)actions.push(`Préparer une sélection autour de ${d.topGrapes[0].name}, l’un des cépages les mieux notés du groupe.`);
 if(d.topRegions[0]?.name)actions.push(`Capitaliser sur ${d.topRegions[0].name} pour une prochaine recommandation ou dégustation.`);
 if(!actions.length)actions.push('Accumuler davantage de retours avant de déclencher une campagne ciblée.');
 return {wineRows,favorite,divisive,hottest,strong,good,explore,consentedStrong,completion,commercialSignals,audienceLead,actions:actions.slice(0,4)};
}
function postEventAudienceSentence(d){
 const bits=[];
 if(d.topTypes[0])bits.push(`${d.topTypes[0].name.toLowerCase()} en tête (${d.topTypes[0].avg.toFixed(1)}/10)`);
 if(d.topGrapes[0])bits.push(`${d.topGrapes[0].name} parmi les cépages préférés`);
 if(d.topRegions[0])bits.push(`${d.topRegions[0].name} parmi les régions les mieux notées`);
 return bits.length?bits.join(' · '):'Pas encore assez de données pour dégager une tendance nette.';
}
function postEventBar(value,max=10){
 const pct=Math.max(0,Math.min(100,Math.round((Number(value||0)/max)*100)));
 return `<span class=post-commercial-bar><span style="width:${pct}%"></span></span>`;
}
function postEventOpportunityCards(items,limit=8){
 return items.slice(0,limit).map(o=>`<article class="commercial-person ${o.level.key}">
  <div class=commercial-person-head><div><strong>${esc(o.name)}</strong><span class="opportunity-level ${o.level.key}">${o.level.icon} ${esc(o.level.label)}</span></div><b>${o.note}/10</b></div>
  <div class=commercial-person-wine>🍷 ${esc(o.wine)}</div>
  <div class="small muted">${esc(o.region)}${o.grapes?` · ${esc(o.grapes)}`:''}</div>
  <p>${esc(o.reasons.join(' · ')||'bonne appréciation')}</p>
  <div class=commercial-contact>${o.consent&&o.email?`📩 ${esc(o.email)}`:'🔒 Email non partagé'}</div>
 </article>`).join('');
}
function postEventEmailHtml(d){
 const m=postEventCommercialSummary(d),date=new Date().toLocaleDateString('fr-FR');
 const wineRows=m.wineRows.slice(0,5);
 const opp=d.opportunities.slice(0,12);
 const cell=(label,value)=>`<td style="width:25%;padding:14px 10px;border:1px solid #eadde2;border-radius:12px;background:#ffffff;text-align:center"><div style="font-size:12px;color:#756970">${label}</div><div style="font-size:24px;font-weight:800;color:#4f172b;margin-top:5px">${value}</div></td>`;
 const rows=opp.map(o=>`<tr>
   <td style="padding:10px;border-bottom:1px solid #eee"><b>${esc(o.name)}</b><br><span style="font-size:12px;color:#777">${o.consent&&o.email?esc(o.email):'Email non partagé'}</span></td>
   <td style="padding:10px;border-bottom:1px solid #eee">${esc(o.wine)}<br><span style="font-size:12px;color:#777">${esc(o.region)}</span></td>
   <td style="padding:10px;border-bottom:1px solid #eee;text-align:center"><b>${o.note}/10</b></td>
   <td style="padding:10px;border-bottom:1px solid #eee">${o.level.icon} <b>${esc(o.level.label)}</b><br><span style="font-size:12px;color:#777">${esc(o.reasons.join(' · ')||'bonne note')}</span></td>
 </tr>`).join('');
 const wines=wineRows.map((x,i)=>`<tr>
   <td style="padding:11px;border-bottom:1px solid #eee"><b>${i+1}. ${esc(x.rv.name)}</b><br><span style="font-size:12px;color:#777">${esc(regionLabel(x.rv.region))} · ${esc((x.rv.grapes||[]).join(' / '))}</span></td>
   <td style="padding:11px;border-bottom:1px solid #eee;text-align:center"><b>${x.avg.toFixed(1)}/10</b></td>
   <td style="padding:11px;border-bottom:1px solid #eee;text-align:center">🔥 ${x.strong} · 👍 ${x.good}</td>
 </tr>`).join('');
 const actions=m.actions.map((a,i)=>`<tr><td style="padding:8px 0"><span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;border-radius:50%;background:#f4e8ed;color:#6f243d;font-weight:800;margin-right:8px">${i+1}</span>${esc(a)}</td></tr>`).join('');
 return `<!doctype html><html><body style="margin:0;background:#f6f3f4;font-family:Arial,Helvetica,sans-serif;color:#2a2326">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3f4"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden">
   <tr><td style="padding:28px;background:#5d1d34;color:#fff"><div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:.8">Blind Wine · Rapport caviste</div><h1 style="margin:8px 0 4px;font-size:28px">Votre dégustation en un coup d’œil</h1><div style="opacity:.85">${date} · Partie ${esc(game?.code||'—')}</div></td></tr>
   <tr><td style="padding:22px">
    <table role="presentation" width="100%" cellspacing="8" cellpadding="0"><tr>${cell('Participants',d.players.length)}${cell('Complétion',`${m.completion}%`)}${cell('Contacts',d.consented.length)}${cell('Signaux chauds',m.strong.length)}</tr></table>
    <div style="margin:20px 0;padding:18px;border-radius:14px;background:#fbf6f8;border-left:4px solid #6f243d">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7e6872">À retenir</div>
      <div style="font-size:18px;font-weight:800;color:#4f172b;margin:6px 0">${m.favorite?`❤️ ${esc(m.favorite.rv.name)} est le vin préféré (${m.favorite.avg.toFixed(1)}/10)`:'❤️ Pas encore de vin préféré net'}</div>
      <div style="font-size:14px;color:#5f565a">${esc(postEventAudienceSentence(d))}</div>
    </div>
    <h2 style="font-size:19px;color:#4f172b;margin-top:26px">🏆 Vins à potentiel commercial</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${wines||'<tr><td>Aucune donnée</td></tr>'}</table>
    <h2 style="font-size:19px;color:#4f172b;margin-top:26px">🎯 Opportunités participants</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr style="background:#f8f3f5"><th align="left" style="padding:10px">Participant</th><th align="left" style="padding:10px">Vin</th><th style="padding:10px">Plaisir</th><th align="left" style="padding:10px">Signal</th></tr>${rows||'<tr><td colspan="4" style="padding:12px">Aucune opportunité détectée.</td></tr>'}</table>
    <h2 style="font-size:19px;color:#4f172b;margin-top:26px">🚀 Plan d’action recommandé</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${actions}</table>
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#777">Les emails ne sont affichés que lorsque le participant a donné son consentement commercial explicite. Les autres apparaissent comme « Email non partagé ».</div>
   </td></tr>
  </table>
 </td></tr></table></body></html>`;
}
function postEventDownloadEml(filename,to,subject,html){
 const safeSubject=String(subject||'Rapport Blind Wine').replace(/[\r\n]+/g,' ');
 const safeTo=String(to||'').replace(/[\r\n]+/g,'');
 const eml=`X-Unsent: 1\r\nTo: ${safeTo}\r\nSubject: ${safeSubject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${html}`;
 const blob=new Blob([eml],{type:'message/rfc822;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function downloadPostEventDesignedEmail(){
 try{
  const d=await loadPostEventReportData(),recipient=String(user?.email||'').trim();
  if(!recipient)return toast('Aucune adresse email trouvée sur ton compte caviste.');
  const subject=`Rapport commercial Blind Wine — ${game?.code||''}`.trim();
  postEventDownloadEml(`blind-wine-${game?.code||'rapport'}-email.eml`,recipient,subject,postEventEmailHtml(d));
  toast('Email design créé. Ouvre le fichier .eml téléchargé dans ton logiciel mail pour l’envoyer.');
 }catch(e){toast(postEventFriendlyError(e));}
}

async function renderPostEventReport(){
 try{
  const d=await loadPostEventReportData(),m=postEventCommercialSummary(d);
  const setupWarning=d.warnings.length?`<div class=notice>⚙️ <b>Configuration incomplète</b><br>${d.warnings.map(x=>esc(x)).join('<br>')}</div>`:'';
  const hot=m.strong, warm=m.good, nurture=m.explore;
  document.body.dataset.screen='post-report';updateGlobalHomeButton();
  document.getElementById('app').innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>📈 APRÈS-SOIRÉE</span></header>
  <section class="commercial-hero">
    <div><span class=commercial-kicker>RAPPORT COMMERCIAL</span><h1>Votre dégustation, transformée en opportunités</h1><p>Les enseignements essentiels de la soirée et les actions commerciales les plus pertinentes, en un coup d’œil.</p></div>
    <div class=commercial-hero-score><span>Signaux commerciaux</span><strong>${m.commercialSignals}</strong><small>${m.strong.length} forts · ${m.good.length} bons</small></div>
  </section>
  ${setupWarning}
  <div class=post-report-kpis>
   <div class="post-report-kpi commercial"><span>👥 Participants</span><strong>${d.players.length}</strong><small>${d.completed} parcours complets</small></div>
   <div class="post-report-kpi commercial"><span>✅ Taux de complétion</span><strong>${m.completion}%</strong><small>${d.completed}/${d.players.length}</small></div>
   <div class="post-report-kpi commercial"><span>📩 Contacts exploitables</span><strong>${d.consented.filter(p=>d.opportunities.some(o=>o.user_id===p.user_id&&o.email)).length}</strong><small>consentement explicite</small></div>
   <div class="post-report-kpi commercial"><span>🔥 Opportunités chaudes</span><strong>${m.strong.length}</strong><small>${m.consentedStrong.length} avec email partagé</small></div>
  </div>

  <section class="card commercial-executive">
   <div class=commercial-section-title><div><span class=commercial-kicker>À RETENIR</span><h2>Lecture commerciale de la soirée</h2></div><span class="pill">30 sec</span></div>
   <div class=commercial-insight-grid>
    <div class="commercial-insight star"><span class=icon>❤️</span><div><small>VIN STAR</small><strong>${m.favorite?esc(m.favorite.rv.name):'—'}</strong><p>${m.favorite?`${m.favorite.avg.toFixed(1)}/10 · ${m.favorite.count} avis`:'Pas encore assez de notes'}</p></div></div>
    <div class=commercial-insight><span class=icon>🎯</span><div><small>RÉFÉRENCE À POUSSER</small><strong>${m.hottest?.rv?.name?esc(m.hottest.rv.name):'—'}</strong><p>${m.hottest?`🔥 ${m.hottest.strong} forte(s) · 👍 ${m.hottest.good} bonne(s)`:'Pas encore de signal net'}</p></div></div>
    <div class=commercial-insight><span class=icon>👥</span><div><small>PROFIL DOMINANT</small><strong>${esc(m.audienceLead)}</strong><p>${esc(postEventAudienceSentence(d))}</p></div></div>
    <div class=commercial-insight><span class=icon>⚡</span><div><small>VIN LE PLUS CLIVANT</small><strong>${m.divisive?esc(m.divisive.rv.name):'—'}</strong><p>${m.divisive?`dispersion ${m.divisive.std.toFixed(1)} pt`:'Pas assez de données'}</p></div></div>
   </div>
  </section>

  <section class=card>
   <div class=commercial-section-title><div><span class=commercial-kicker>PERFORMANCE PRODUIT</span><h2>🏆 Les vins qui peuvent vendre</h2></div></div>
   <div class=commercial-wine-grid>${m.wineRows.map((x,i)=>`<article class="commercial-wine-card ${i===0?'winner':''}">
    <div class=commercial-rank>${i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
    <div class=commercial-wine-main><strong>${esc(x.rv.name)}</strong><span>${esc(regionLabel(x.rv.region))} · ${esc((x.rv.grapes||[]).join(' / '))}</span></div>
    <div class=commercial-wine-score><strong>${x.avg.toFixed(1)}</strong><span>/10</span></div>
    ${postEventBar(x.avg)}
    <div class=commercial-wine-signals><span class=hot>🔥 ${x.strong} forte${x.strong>1?'s':''}</span><span>👍 ${x.good} bonne${x.good>1?'s':''}</span><span>👥 ${x.count} avis</span></div>
   </article>`).join('')||'<p class=muted>Aucune donnée disponible.</p>'}</div>
  </section>

  <section class=card>
   <div class=commercial-section-title><div><span class=commercial-kicker>AUDIENCE</span><h2>🧭 Ce que votre public aime vraiment</h2></div></div>
   <p class=commercial-audience-lead>${esc(postEventAudienceSentence(d))}</p>
   <div class=commercial-preference-grid>
    <div><h3>🍷 Styles</h3>${d.topTypes.map(x=>`<div class=commercial-pref><span>${esc(x.name)}</span><b>${x.avg.toFixed(1)}/10</b>${postEventBar(x.avg)}</div>`).join('')||'<p class=muted>—</p>'}</div>
    <div><h3>🍇 Cépages</h3>${d.topGrapes.map(x=>`<div class=commercial-pref><span>${esc(x.name)}</span><b>${x.avg.toFixed(1)}/10</b>${postEventBar(x.avg)}</div>`).join('')||'<p class=muted>—</p>'}</div>
    <div><h3>🗺️ Régions</h3>${d.topRegions.map(x=>`<div class=commercial-pref><span>${esc(x.name)}</span><b>${x.avg.toFixed(1)}/10</b>${postEventBar(x.avg)}</div>`).join('')||'<p class=muted>—</p>'}</div>
   </div>
  </section>

  <section class=card>
   <div class=commercial-section-title><div><span class=commercial-kicker>VENTES</span><h2>🎯 Qui recontacter et avec quoi ?</h2><p>Les emails n’apparaissent que si le participant a donné son consentement.</p></div></div>
   <div class=commercial-opportunity-tabs>
    <div class="commercial-bucket hot"><h3>🔥 Opportunités chaudes <span>${hot.length}</span></h3><p>À traiter en priorité.</p><div class=commercial-person-grid>${postEventOpportunityCards(hot,8)||'<p class=muted>Aucune.</p>'}</div></div>
    <div class="commercial-bucket warm"><h3>👍 Bonnes affinités <span>${warm.length}</span></h3><p>Bon potentiel de recommandation.</p><div class=commercial-person-grid>${postEventOpportunityCards(warm,8)||'<p class=muted>Aucune.</p>'}</div></div>
    ${nurture.length?`<details class=commercial-nurture><summary>👀 ${nurture.length} signaux à explorer</summary><div class=commercial-person-grid>${postEventOpportunityCards(nurture,8)}</div></details>`:''}
   </div>
  </section>

  <section class="card commercial-action-plan">
   <div class=commercial-section-title><div><span class=commercial-kicker>PROCHAINE ACTION</span><h2>🚀 Plan d’action recommandé</h2></div></div>
   <div class=commercial-actions-list>${m.actions.map((a,i)=>`<div><span>${i+1}</span><p>${esc(a)}</p></div>`).join('')}</div>
  </section>

  <section class=card>
   <div class=commercial-section-title><div><span class=commercial-kicker>PARTAGE</span><h2>📤 Envoyer ou exploiter ce rapport</h2></div></div>
   <p class=muted>Le rapport dans l’app est le plus riche. Pour l’email, tu as deux options : un email design au format .eml, ou le mail rapide universel en texte structuré.</p>
   <div class=report-actions>
    <button type=button class=btn onclick="downloadPostEventDesignedEmail()">✨ Créer l’email design</button>
    <button type=button class="btn secondary" onclick="openPostEventMail()">📧 Email rapide</button>
    <button type=button class="btn secondary" onclick="copyPostEventSummary()">📋 Copier le résumé</button>
    <button type=button class="btn secondary" ${d.crmReady?'':'disabled aria-disabled="true"'} onclick="exportPostEventCsv()">⬇️ CSV CRM</button>
    <button type=button class="btn secondary" onclick="renderHostResults()">← Résultats</button>
   </div>
   <p class="small muted">✨ Email design : télécharge un fichier .eml avec une mise en page HTML proche du rapport. Ouvre-le dans Outlook, Apple Mail ou Thunderbird pour l’envoyer. Le bouton “Email rapide” reste la solution la plus compatible partout.</p>
  </section>`;
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
