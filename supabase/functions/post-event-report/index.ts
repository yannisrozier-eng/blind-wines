import { createClient } from 'npm:@supabase/supabase-js@2'

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods':'POST, OPTIONS'
}
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))
const avg=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0
const REGION_LABELS:Record<string,string>={
 "provence":"Provence",
 "languedoc":"Languedoc",
 "rhone":"Vallée du Rhône",
 "rhone_nord":"Rhône Nord",
 "rhone_sud":"Rhône Sud",
 "bordeaux":"Bordeaux",
 "loire":"Vallée de la Loire",
 "bourgogne":"Bourgogne",
 "cote_nuits":"Côte de Nuits",
 "cote_beaune":"Côte de Beaune",
 "beaujolais":"Beaujolais",
 "alsace":"Alsace",
 "jura":"Jura",
 "champagne":"Champagne",
 "lorraine":"Lorraine",
 "savoie":"Savoie",
 "bugey":"Bugey",
 "auvergne":"Auvergne",
 "lyonnais_forez":"Lyonnais · Forez · Roannaise",
 "charentes":"Charentes",
 "corse":"Corse",
 "roussillon":"Roussillon",
 "loire_nantes":"Loire · Nantais",
 "loire_anjou":"Loire · Anjou-Saumur",
 "loire_touraine":"Loire · Touraine",
 "loire_centre":"Centre-Loire",
 "sud_ouest":"Sud-Ouest",
 "tuscany":"Toscane",
 "piedmont":"Piémont",
 "veneto":"Vénétie",
 "sicily":"Sicile",
 "rioja":"Rioja",
 "ribera":"Ribera del Duero",
 "priorat":"Priorat",
 "rias_baixas":"Rías Baixas",
 "cava":"Cava",
 "douro":"Douro",
 "vinho_verde":"Vinho Verde",
 "alentejo":"Alentejo",
 "mosel":"Moselle",
 "rheingau":"Rheingau",
 "wachau":"Wachau",
 "napa":"Napa Valley",
 "sonoma":"Sonoma",
 "oregon":"Oregon / Willamette Valley",
 "mendoza":"Mendoza",
 "maipo":"Maipo Valley",
 "casablanca":"Casablanca Valley",
 "barossa":"Barossa Valley",
 "margaret_river":"Margaret River",
 "marlborough":"Marlborough",
 "central_otago":"Central Otago",
 "stellenbosch":"Stellenbosch"
}
const regionLabel=(id:unknown)=>REGION_LABELS[String(id??'')]||String(id??'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 try{
  const auth=req.headers.get('Authorization');if(!auth)throw new Error('Authentification requise.')
  const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!,SUPABASE_ANON_KEY=Deno.env.get('SUPABASE_ANON_KEY')!
  const RESEND_API_KEY=Deno.env.get('RESEND_API_KEY');if(!RESEND_API_KEY)throw new Error('RESEND_API_KEY non configurée.')
  const REPORT_FROM_EMAIL=Deno.env.get('REPORT_FROM_EMAIL')||'reports@your-domain.example'
  const REPORT_FROM_NAME=Deno.env.get('REPORT_FROM_NAME')||'Blind Wine'
  const SITE_URL=Deno.env.get('SITE_URL')||'https://blind-wines.vercel.app/'
  const sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{global:{headers:{Authorization:auth}}})
  const {data:{user},error:userErr}=await sb.auth.getUser();if(userErr||!user?.email)throw new Error('Session invalide.')
  const body=await req.json();const gameId=body?.game_id,force=Boolean(body?.force);if(!gameId)throw new Error('game_id requis.')
  const {data:g,error:ge}=await sb.from('games').select('*').eq('id',gameId).single();if(ge||!g)throw new Error('Partie introuvable.')
  if(g.host_id!==user.id)throw new Error('Action réservée à l’organisateur.')
  if(g.status!=='finished')throw new Error('La partie doit être terminée.')
  const {data:existing}=await sb.from('post_event_reports').select('*').eq('game_id',gameId).maybeSingle()
  if(existing?.emailed_at&&!force)return Response.json({ok:true,already_sent:true,emailed_at:existing.emailed_at},{headers:cors})

  const [playersR,winesR,revealsR,answersR,contactsR]=await Promise.all([
   sb.from('players').select('user_id,name,commercial_consent').eq('game_id',gameId),
   sb.from('wines').select('id,position,type').eq('game_id',gameId).order('position'),
   sb.from('wine_reveals').select('*').eq('game_id',gameId),
   sb.from('answers').select('*').eq('game_id',gameId).eq('done',true),
   sb.rpc('get_post_event_contacts',{p_game_id:gameId})
  ])
  const err=playersR.error||winesR.error||revealsR.error||answersR.error||contactsR.error;if(err)throw err
  const players=(playersR.data||[]).filter((p:any)=>p.user_id!==g.host_id),wines=winesR.data||[],reveals=revealsR.data||[],answers=(answersR.data||[]).filter((a:any)=>a.user_id!==g.host_id),contacts=contactsR.data||[]
  const rvMap=new Map(reveals.map((r:any)=>[r.wine_id,r])),wMap=new Map(wines.map((w:any)=>[w.id,w])),cMap=new Map(contacts.map((c:any)=>[c.user_id,c]))
  const byWine=new Map<string,any[]>(),byUser=new Map<string,any[]>()
  for(const a of answers){if(!byWine.has(a.wine_id))byWine.set(a.wine_id,[]);byWine.get(a.wine_id)!.push(a);if(!byUser.has(a.user_id))byUser.set(a.user_id,[]);byUser.get(a.user_id)!.push(a)}
  const wineStats=wines.map((w:any)=>{const rv:any=rvMap.get(w.id),aa=byWine.get(w.id)||[],notes=aa.map(a=>Number(a.note||0)).filter(Boolean);const m=avg(notes),std=notes.length?Math.sqrt(notes.reduce((z,n)=>z+(n-m)*(n-m),0)/notes.length):0;return {w,rv,avg:m,std,n:notes.length}}).filter((x:any)=>x.rv).sort((a:any,b:any)=>b.avg-a.avg)
  const opportunities:any[]=[]
  for(const p of players){
   const list=(byUser.get(p.user_id)||[]).filter((a:any)=>rvMap.has(a.wine_id));
   const sorted=[...list].sort((a:any,b:any)=>Number(b.note||0)-Number(a.note||0));
   const grapeNotes=new Map<string,number[]>(),regionNotes=new Map<string,number[]>();
   for(const a of list){
    const rv:any=rvMap.get(a.wine_id),note=Number(a.note||0);
    for(const grape of (rv?.grapes||[])){if(!grapeNotes.has(grape))grapeNotes.set(grape,[]);grapeNotes.get(grape)!.push(note)}
    if(rv?.region){if(!regionNotes.has(rv.region))regionNotes.set(rv.region,[]);regionNotes.get(rv.region)!.push(note)}
   }
   for(const a of list){
    const rv:any=rvMap.get(a.wine_id),w:any=wMap.get(a.wine_id),note=Number(a.note||0);if(note<6||!rv||!w)continue
    const rank=Math.max(0,sorted.findIndex((x:any)=>x.wine_id===a.wine_id));
    let score=Math.min(70,note*7);const reasons:string[]=[];
    if(rank===0){score+=15;reasons.push('vin préféré')}else if(rank<=2){score+=8;reasons.push('top 3 personnel')}
    const grapeAffinity=(rv.grapes||[]).flatMap((grape:string)=>grapeNotes.get(grape)||[]).filter(Boolean);
    const grapeAvg=avg(grapeAffinity);
    if(grapeAffinity.length>=2&&grapeAvg>=8){score+=7;reasons.push('cépage régulièrement apprécié')}
    const regionAffinity=regionNotes.get(rv.region)||[],regionAvg=avg(regionAffinity);
    if(regionAffinity.length>=2&&regionAvg>=8){score+=5;reasons.push('région régulièrement appréciée')}
    if(g.experience_mode!=='discovery'&&a.price&&rv.price){const ratio=Number(a.price)/Number(rv.price);if(ratio>=1){score+=10;reasons.push('valeur perçue ≥ prix réel')}else if(ratio>=.8){score+=7;reasons.push('prix perçu proche du réel')}else if(ratio>=.65){score+=3;reasons.push('prix perçu compatible')}}
    score=Math.min(100,Math.round(score));if(score<58)continue;const contact:any=cMap.get(p.user_id)||{};const level=score>=80?'🔥 Forte':score>=68?'👍 Bonne':'👀 À explorer';
    opportunities.push({wine_id:a.wine_id,name:p.name,email:contact.email||'',consent:Boolean(contact.commercial_consent),wine:rv.name||`Vin ${w.position+1}`,region:regionLabel(rv.region),grapes:(rv.grapes||[]).join(' / '),note,score,level,reasons:[...new Set(reasons)].slice(0,3)})
   }
  }
  opportunities.sort((a,b)=>b.score-a.score||b.note-a.note||a.name.localeCompare(b.name,'fr'))
  const actionable=opportunities.filter(o=>o.consent&&o.email),strong=actionable.filter(o=>o.score>=80),good=actionable.filter(o=>o.score>=68&&o.score<80)
  const favorite=wineStats[0],divisive=[...wineStats].filter((x:any)=>x.n>=2).sort((a:any,b:any)=>b.std-a.std)[0]
  const completed=players.filter((p:any)=>(byUser.get(p.user_id)||[]).length>=Math.max(1,wines.length)).length
  const weighted=(kind:'type'|'grape'|'region')=>{const m=new Map<string,{sum:number,n:number}>();for(const a of answers){const rv:any=rvMap.get(a.wine_id),w:any=wMap.get(a.wine_id),note=Number(a.note||0);if(!rv||!w||!note)continue;const keys=kind==='grape'?(rv.grapes||[]):kind==='region'?[regionLabel(rv.region)]:[w.type==='red'?'Rouges':w.type==='white'?'Blancs':'Rosés'];for(const k of keys){if(!m.has(k))m.set(k,{sum:0,n:0});const x=m.get(k)!;x.sum+=note;x.n++}}return [...m.entries()].map(([name,x])=>({name,avg:x.sum/x.n,n:x.n})).sort((a,b)=>b.avg-a.avg||b.n-a.n).slice(0,4)}
  const topTypes=weighted('type'),topGrapes=weighted('grape'),topRegions=weighted('region')
  const wineRows=wineStats.slice(0,8).map((x:any)=>{const ops=actionable.filter(o=>o.wine_id===x.w.id);return `<tr><td><b>${esc(x.rv.name)}</b><br><small>${esc(regionLabel(x.rv.region))} · ${esc((x.rv.grapes||[]).join(' / '))}</small></td><td>${x.avg.toFixed(1)}/10</td><td>🔥 ${ops.filter(o=>o.score>=80).length} · 👍 ${ops.filter(o=>o.score>=68&&o.score<80).length}</td></tr>`}).join('')
  const oppRows=actionable.slice(0,30).map(o=>`<tr><td>${esc(o.name)}<br><small>${esc(o.email)}</small></td><td><b>${esc(o.wine)}</b><br><small>${esc(o.region)} · ${esc(o.grapes)}</small></td><td>${o.note}/10</td><td>${esc(o.level)}</td><td>${esc(o.reasons.join(' · ')||'bonne note')}</td></tr>`).join('')
  const html=`<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f3f4;color:#231b1e;margin:0;padding:24px"><div style="max-width:760px;margin:auto;background:white;border-radius:20px;padding:28px"><div style="font-size:13px;color:#6f243d;font-weight:700">BLIND WINE · RAPPORT POST-SOIRÉE</div><h1 style="margin:8px 0">Synthèse de la dégustation ${esc(g.code)}</h1><p>${players.length} participant(s) · ${completed}/${players.length} parcours complets · ${wines.length} vin(s) · ${actionable.length} signal(s) CRM exploitable(s)</p><div style="display:flex;gap:12px;flex-wrap:wrap"><div style="padding:14px;background:#f8f1f3;border-radius:12px"><b>${strong.length}</b><br>fortes opportunités</div><div style="padding:14px;background:#f8f1f3;border-radius:12px"><b>${good.length}</b><br>bonnes affinités</div><div style="padding:14px;background:#f8f1f3;border-radius:12px"><b>${contacts.filter((c:any)=>c.commercial_consent).length}</b><br>contacts consentis</div></div>${favorite?`<h2>❤️ Vin préféré</h2><p><b>${esc(favorite.rv.name)}</b> · ${favorite.avg.toFixed(1)}/10 · ${esc(regionLabel(favorite.rv.region))}</p>`:''}${divisive?`<p><b>⚡ Vin le plus clivant :</b> ${esc(divisive.rv.name)} · dispersion ${divisive.std.toFixed(1)} pt</p>`:''}<h2>👥 Tendances du groupe</h2><p><b>Styles :</b> ${topTypes.map(x=>`${esc(x.name)} ${x.avg.toFixed(1)}/10`).join(' · ')||'—'}</p><p><b>Cépages :</b> ${topGrapes.map(x=>`${esc(x.name)} ${x.avg.toFixed(1)}/10`).join(' · ')||'—'}</p><p><b>Régions :</b> ${topRegions.map(x=>`${esc(x.name)} ${x.avg.toFixed(1)}/10`).join(' · ')||'—'}</p><h2>🎯 Vins à potentiel</h2><table style="width:100%;border-collapse:collapse"><tr><th align=left>Vin</th><th>Note</th><th>Opportunités</th></tr>${wineRows}</table><h2>👥 Opportunités commerciales</h2>${actionable.length?`<table style="width:100%;border-collapse:collapse"><tr><th align=left>Contact</th><th align=left>Vin</th><th>Note</th><th>Affinité</th><th>Signal</th></tr>${oppRows}</table>`:'<p>Aucun contact commercial consentant exploitable sur cette soirée.</p>'}<p style="margin-top:26px;color:#666">Le rapport détaillé et l’export CSV sont disponibles dans Blind Wine. Les contacts sans consentement commercial ne sont pas inclus dans les opportunités nominatives.</p><p><a href="${esc(SITE_URL)}" style="display:inline-block;background:#6f243d;color:white;text-decoration:none;padding:12px 18px;border-radius:10px">Ouvrir Blind Wine</a></p></div></body></html>`
  const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${RESEND_API_KEY}`,'Idempotency-Key':force?`blind-wine-post-event/${gameId}/manual/${crypto.randomUUID()}`:`blind-wine-post-event/${gameId}`},body:JSON.stringify({from:`${REPORT_FROM_NAME} <${REPORT_FROM_EMAIL}>`,to:[user.email],subject:`Synthèse dégustation ${g.code} — ${players.length} participants`,html})})
  const out=await mail.json();if(!mail.ok)throw new Error(out?.message||'Erreur fournisseur email.')
  const {error:reportErr}=await sb.from('post_event_reports').upsert({game_id:gameId,host_id:user.id,emailed_at:new Date().toISOString(),provider_id:out.id||null})
  if(reportErr)throw new Error(`Email envoyé mais statut non enregistré : ${reportErr.message}`)
  return Response.json({ok:true,id:out.id,already_sent:false},{headers:cors})
 }catch(e){return Response.json({ok:false,error:e instanceof Error?e.message:String(e)},{status:500,headers:cors})}
})
