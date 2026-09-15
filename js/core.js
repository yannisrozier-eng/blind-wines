/* Blind Wine — Shared state, catalogs, scoring and UI primitives. */
'use strict';

const CONFIG={
 url:typeof SUPABASE_URL!=="undefined"?SUPABASE_URL:"",
 key:typeof SUPABASE_PUBLISHABLE_KEY!=="undefined"?SUPABASE_PUBLISHABLE_KEY:""
};

const SESSION_KEY="blindwine_v27_session";

let supabaseClient=null,user=null,profile=null,game=null,role=null,player=null,channel=null;

let wineCache=null;

const answerCache=new Map();

const answerWriteQueues=new Map();

let routeSeq=0;

const TYPES={rose:"Rosé",white:"Blanc",red:"Rouge"};

const ICON={rose:"🌸",white:"🥂",red:"🍷"};

const AROMAS={
  rose:["Fruits rouges","Agrumes","Fruits exotiques","Floral","Minéral","Épicé","Végétal"],
  white:["Agrumes","Fruits blancs","Fruits exotiques","Floral","Minéral","Boisé","Végétal"],
  red:["Fruits rouges","Fruits noirs","Épices","Floral","Minéral","Boisé","Végétal","Cuir / tabac"]
};

const REGION_CATALOG=[
 {id:"france",label:"France",level:"country",parent:null},
 {id:"france_sud",label:"Sud de la France",level:"macro",parent:"france"},
 {id:"provence",label:"Provence",level:"region",parent:"france_sud"},
 {id:"cotes_provence",label:"Côtes de Provence",level:"appellation",parent:"provence"},
 {id:"coteaux_aix",label:"Coteaux d’Aix-en-Provence",level:"appellation",parent:"provence"},
 {id:"bandol",label:"Bandol",level:"appellation",parent:"provence"},
 {id:"languedoc",label:"Languedoc",level:"region",parent:"france_sud"},
 {id:"pic_saint_loup",label:"Pic Saint-Loup",level:"appellation",parent:"languedoc"},
 {id:"corbieres",label:"Corbières",level:"appellation",parent:"languedoc"},
 {id:"minervois",label:"Minervois",level:"appellation",parent:"languedoc"},
 {id:"rhone",label:"Vallée du Rhône",level:"region",parent:"france_sud"},
 {id:"rhone_nord",label:"Rhône Nord",level:"subregion",parent:"rhone"},
 {id:"rhone_sud",label:"Rhône Sud",level:"subregion",parent:"rhone"},
 {id:"cotes_rhone",label:"Côtes-du-Rhône",level:"appellation",parent:"rhone_sud"},
 {id:"chateauneuf",label:"Châteauneuf-du-Pape",level:"appellation",parent:"rhone_sud"},
 {id:"gigondas",label:"Gigondas",level:"appellation",parent:"rhone_sud"},
 {id:"crozes",label:"Crozes-Hermitage",level:"appellation",parent:"rhone_nord"},
 {id:"hermitage",label:"Hermitage",level:"appellation",parent:"rhone_nord"},
 {id:"condrieu",label:"Condrieu",level:"appellation",parent:"rhone_nord"},
 {id:"france_ouest",label:"Ouest de la France",level:"macro",parent:"france"},
 {id:"bordeaux",label:"Bordeaux",level:"region",parent:"france_ouest"},
 {id:"medoc",label:"Médoc",level:"appellation",parent:"bordeaux"},
 {id:"margaux",label:"Margaux",level:"appellation",parent:"bordeaux"},
 {id:"pauillac",label:"Pauillac",level:"appellation",parent:"bordeaux"},
 {id:"saint_emilion",label:"Saint-Émilion",level:"appellation",parent:"bordeaux"},
 {id:"pomerol",label:"Pomerol",level:"appellation",parent:"bordeaux"},
 {id:"pessac",label:"Pessac-Léognan",level:"appellation",parent:"bordeaux"},
 {id:"sauternes",label:"Sauternes",level:"appellation",parent:"bordeaux"},
 {id:"loire",label:"Vallée de la Loire",level:"region",parent:"france_ouest"},
 {id:"sancerre",label:"Sancerre",level:"appellation",parent:"loire"},
 {id:"pouilly_fume",label:"Pouilly-Fumé",level:"appellation",parent:"loire"},
 {id:"muscadet",label:"Muscadet",level:"appellation",parent:"loire"},
 {id:"chinon",label:"Chinon",level:"appellation",parent:"loire"},
 {id:"vouvray",label:"Vouvray",level:"appellation",parent:"loire"},
 {id:"france_est",label:"Est de la France",level:"macro",parent:"france"},
 {id:"bourgogne",label:"Bourgogne",level:"region",parent:"france_est"},
 {id:"chablis",label:"Chablis",level:"appellation",parent:"bourgogne"},
 {id:"cote_nuits",label:"Côte de Nuits",level:"subregion",parent:"bourgogne"},
 {id:"cote_beaune",label:"Côte de Beaune",level:"subregion",parent:"bourgogne"},
 {id:"meursault",label:"Meursault",level:"appellation",parent:"cote_beaune"},
 {id:"gevrey",label:"Gevrey-Chambertin",level:"appellation",parent:"cote_nuits"},
 {id:"beaujolais",label:"Beaujolais",level:"region",parent:"france_est"},
 {id:"morgon",label:"Morgon",level:"appellation",parent:"beaujolais"},
 {id:"fleurie",label:"Fleurie",level:"appellation",parent:"beaujolais"},
 {id:"alsace",label:"Alsace",level:"region",parent:"france_est"},
 {id:"jura",label:"Jura",level:"region",parent:"france_est"},
 {id:"champagne",label:"Champagne",level:"region",parent:"france_est"},
 {id:"lorraine",label:"Lorraine",level:"region",parent:"france_est"},
 {id:"savoie",label:"Savoie",level:"region",parent:"france_est"},
 {id:"bugey",label:"Bugey",level:"region",parent:"france_est"},
 {id:"auvergne",label:"Auvergne",level:"region",parent:"france"},
 {id:"lyonnais_forez",label:"Lyonnais · Forez · Roannaise",level:"region",parent:"france"},
 {id:"charentes",label:"Charentes",level:"region",parent:"france_ouest"},
 {id:"corse",label:"Corse",level:"region",parent:"france_sud"},
 {id:"roussillon",label:"Roussillon",level:"region",parent:"france_sud"},
 {id:"loire_nantes",label:"Loire · Nantais",level:"subregion",parent:"loire"},
 {id:"loire_anjou",label:"Loire · Anjou-Saumur",level:"subregion",parent:"loire"},
 {id:"loire_touraine",label:"Loire · Touraine",level:"subregion",parent:"loire"},
 {id:"loire_centre",label:"Centre-Loire",level:"subregion",parent:"loire"},
 {id:"sud_ouest",label:"Sud-Ouest",level:"region",parent:"france_sud"},
 {id:"cahors",label:"Cahors",level:"appellation",parent:"sud_ouest"},
 {id:"madiran",label:"Madiran",level:"appellation",parent:"sud_ouest"},

 {id:"italy",label:"Italie",level:"country",parent:null},
 {id:"tuscany",label:"Toscane",level:"region",parent:"italy"},
 {id:"chianti",label:"Chianti / Chianti Classico",level:"appellation",parent:"tuscany"},
 {id:"brunello",label:"Brunello di Montalcino",level:"appellation",parent:"tuscany"},
 {id:"piedmont",label:"Piémont",level:"region",parent:"italy"},
 {id:"barolo",label:"Barolo",level:"appellation",parent:"piedmont"},
 {id:"barbaresco",label:"Barbaresco",level:"appellation",parent:"piedmont"},
 {id:"veneto",label:"Vénétie",level:"region",parent:"italy"},
 {id:"valpolicella",label:"Valpolicella / Amarone",level:"appellation",parent:"veneto"},
 {id:"sicily",label:"Sicile",level:"region",parent:"italy"},

 {id:"spain",label:"Espagne",level:"country",parent:null},
 {id:"rioja",label:"Rioja",level:"region",parent:"spain"},
 {id:"ribera",label:"Ribera del Duero",level:"region",parent:"spain"},
 {id:"priorat",label:"Priorat",level:"region",parent:"spain"},
 {id:"rias_baixas",label:"Rías Baixas",level:"region",parent:"spain"},
 {id:"cava",label:"Cava",level:"region",parent:"spain"},

 {id:"portugal",label:"Portugal",level:"country",parent:null},
 {id:"douro",label:"Douro",level:"region",parent:"portugal"},
 {id:"vinho_verde",label:"Vinho Verde",level:"region",parent:"portugal"},
 {id:"alentejo",label:"Alentejo",level:"region",parent:"portugal"},

 {id:"germany",label:"Allemagne",level:"country",parent:null},
 {id:"mosel",label:"Moselle",level:"region",parent:"germany"},
 {id:"rheingau",label:"Rheingau",level:"region",parent:"germany"},

 {id:"austria",label:"Autriche",level:"country",parent:null},
 {id:"wachau",label:"Wachau",level:"region",parent:"austria"},

 {id:"usa",label:"États-Unis",level:"country",parent:null},
 {id:"napa",label:"Napa Valley",level:"region",parent:"usa"},
 {id:"sonoma",label:"Sonoma",level:"region",parent:"usa"},
 {id:"oregon",label:"Oregon / Willamette Valley",level:"region",parent:"usa"},

 {id:"argentina",label:"Argentine",level:"country",parent:null},
 {id:"mendoza",label:"Mendoza",level:"region",parent:"argentina"},

 {id:"chile",label:"Chili",level:"country",parent:null},
 {id:"maipo",label:"Maipo Valley",level:"region",parent:"chile"},
 {id:"casablanca",label:"Casablanca Valley",level:"region",parent:"chile"},

 {id:"australia",label:"Australie",level:"country",parent:null},
 {id:"barossa",label:"Barossa Valley",level:"region",parent:"australia"},
 {id:"margaret_river",label:"Margaret River",level:"region",parent:"australia"},

 {id:"new_zealand",label:"Nouvelle-Zélande",level:"country",parent:null},
 {id:"marlborough",label:"Marlborough",level:"region",parent:"new_zealand"},
 {id:"central_otago",label:"Central Otago",level:"region",parent:"new_zealand"},

 {id:"south_africa",label:"Afrique du Sud",level:"country",parent:null},
 {id:"stellenbosch",label:"Stellenbosch",level:"region",parent:"south_africa"}
];

const GRAPES=[
 "Albariño","Aligoté","Barbera","Cabernet Franc","Cabernet Sauvignon","Carignan","Carmenère",
 "Chardonnay","Chenin blanc","Cinsault","Colombard","Corvina","Gamay","Garganega","Gewurztraminer",
 "Grenache","Grenache blanc","Grüner Veltliner","Gros Manseng","Malbec","Marsanne","Melon de Bourgogne",
 "Merlot","Meunier","Monastrell / Mourvèdre","Mourvèdre","Müller-Thurgau","Nebbiolo","Négrette",
 "Nero d’Avola","Petit Manseng","Petit Verdot","Picpoul","Pinot blanc","Pinot gris","Pinot noir",
 "Pinotage","Poulsard","Riesling","Rolle / Vermentino","Roussanne","Sangiovese","Sauvignon blanc",
 "Savagnin","Sémillon","Syrah / Shiraz","Syrah","Tannat","Tempranillo","Tibouren","Touriga Nacional",
 "Trousseau","Verdicchio","Viognier","Zinfandel"
];

const REGION_GRAPES={
 provence:["Grenache","Cinsault","Mourvèdre","Syrah","Tibouren","Rolle / Vermentino"],
 languedoc:["Grenache","Syrah","Mourvèdre","Carignan","Cinsault","Picpoul"],
 rhone_nord:["Syrah","Viognier","Marsanne","Roussanne"],
 rhone_sud:["Grenache","Syrah","Mourvèdre","Cinsault","Roussanne"],
 bordeaux:["Merlot","Cabernet Sauvignon","Cabernet Franc","Sauvignon blanc","Sémillon"],
 loire:["Sauvignon blanc","Chenin blanc","Cabernet Franc","Melon de Bourgogne","Gamay"],
 bourgogne:["Chardonnay","Pinot noir","Aligoté"],
 beaujolais:["Gamay"],
 alsace:["Riesling","Gewurztraminer","Pinot gris","Pinot blanc","Pinot noir"],
 jura:["Savagnin","Chardonnay","Poulsard","Trousseau","Pinot noir"],
 champagne:["Chardonnay","Pinot noir","Meunier"],
 sud_ouest:["Malbec","Tannat","Négrette","Colombard","Gros Manseng","Petit Manseng"],
 lorraine:["Pinot noir","Gamay","Auxerrois","Pinot gris"],
 savoie:["Mondeuse","Gamay","Pinot noir","Jacquère","Altesse","Chasselas","Roussanne"],
 bugey:["Gamay","Pinot noir","Mondeuse","Altesse","Chardonnay"],
 auvergne:["Gamay","Pinot noir","Chardonnay","Tressallier"],
 lyonnais_forez:["Gamay","Chardonnay"],
 charentes:["Merlot","Cabernet Franc","Cabernet Sauvignon","Ugni blanc","Colombard","Sauvignon blanc"],
 corse:["Niellucciu","Sciaccarellu","Grenache","Rolle / Vermentino"],
 roussillon:["Grenache","Carignan","Syrah","Mourvèdre","Grenache blanc"],
 loire_nantes:["Melon de Bourgogne","Folle blanche","Gamay","Pinot noir"],
 loire_anjou:["Chenin blanc","Cabernet Franc","Cabernet Sauvignon","Grolleau"],
 loire_touraine:["Chenin blanc","Sauvignon blanc","Cabernet Franc","Gamay","Côt"],
 loire_centre:["Sauvignon blanc","Pinot noir","Chasselas"]
};

const EXPERIENCE={
 blind:{icon:"🎯",name:"À l’aveugle",desc:"Pur jeu de déduction : aucun indice spécifique au vin, 11 points à aller chercher sur prix, région et cépages."},
 discovery:{icon:"🎓",name:"Découverte",desc:"Parcours pédagogique : identité connue, Œil → Nez → Bouche → mini-quiz, sans classement compétitif."},
 challenge:{icon:"🥂",name:"Challenge",desc:"Jeu de prise de risque : demande des indices si nécessaire, mais sacrifie une partie de ton score."}
};

let routePending=false;

const REGION_GRAPE_GUIDE=[
 {region:"Bordeaux",icon:"🍷",grapes:["Cabernet Sauvignon","Merlot","Cabernet Franc","Petit Verdot","Sémillon","Sauvignon blanc"]},
 {region:"Bourgogne",icon:"🍇",grapes:["Pinot noir","Chardonnay","Aligoté","Gamay"]},
 {region:"Rhône Nord",icon:"🌄",grapes:["Syrah","Viognier","Marsanne","Roussanne"]},
 {region:"Rhône Sud",icon:"☀️",grapes:["Grenache","Syrah","Mourvèdre","Cinsault","Roussanne","Grenache blanc"]},
 {region:"Loire",icon:"🌿",grapes:["Sauvignon blanc","Chenin blanc","Cabernet Franc","Melon de Bourgogne","Gamay"]},
 {region:"Alsace",icon:"🌼",grapes:["Riesling","Gewurztraminer","Pinot gris","Pinot blanc"]},
 {region:"Champagne",icon:"🥂",grapes:["Chardonnay","Pinot noir","Meunier"]},
 {region:"Provence",icon:"🌸",grapes:["Grenache","Cinsault","Syrah","Mourvèdre","Tibouren","Rolle / Vermentino"]},
 {region:"Languedoc-Roussillon",icon:"🌞",grapes:["Grenache","Syrah","Mourvèdre","Carignan","Cinsault","Picpoul"]},
 {region:"Sud-Ouest",icon:"🗺️",grapes:["Malbec","Tannat","Négrette","Gros Manseng","Petit Manseng","Colombard"]},
 {region:"Beaujolais",icon:"🍒",grapes:["Gamay","Chardonnay"]},
 {region:"Jura",icon:"⛰️",grapes:["Savagnin","Chardonnay","Poulsard","Trousseau","Pinot noir"]}
];

let activeRevealIntro=null;

function esc(v){
  return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function toast(msg){ alert(String(msg||"Une erreur est survenue.")); }

function saveSession(){
  if(!game||!role)return;
  localStorage.setItem(SESSION_KEY,JSON.stringify({gameId:game.id,role}));
}

function clearSession(){
  localStorage.removeItem(SESSION_KEY);
  game=role=player=null;
  answerWriteQueues.clear();
  if(channel&&supabaseClient){supabaseClient.removeChannel(channel);channel=null;}
}

function regionObj(id){return REGION_CATALOG.find(r=>r.id===id)}

function regionAncestors(id){
 let out=[],cur=regionObj(id);
 while(cur){out.push(cur.id);cur=cur.parent?regionObj(cur.parent):null}
 return out;
}

function canonicalRegionId(id){
 let cur=regionObj(id);
 while(cur&&!["region","subregion"].includes(cur.level))cur=cur.parent?regionObj(cur.parent):null;
 return cur?.id||id||"";
}

function regionScore(guess,real){
 guess=canonicalRegionId(guess);real=canonicalRegionId(real);
 if(!guess||!real)return 0;
 if(guess===real)return 3;
 const ga=regionAncestors(guess),ra=regionAncestors(real);
 if(ga.includes(real)||ra.includes(guess))return 2;
 const shared=ga.find(x=>ra.includes(x));
 if(shared){
   const common=regionObj(shared);
   // 1 point seulement pour une vraie proximité macro-régionale ; partager uniquement le pays ne suffit plus.
   if(common?.level==="macro")return 1;
 }
 return 0;
}

function parseGrapes(v){
 if(Array.isArray(v))return v.filter(Boolean);
 const text=String(v||"").trim();
 if(!text)return [];
 // Compatibilité avec les anciennes V2.x qui stockaient un assemblage dans une chaîne
 // séparée par " / ", y compris lorsque le nom du cépage contient lui-même un slash.
 const memo=new Map();
 function walk(rest){
   if(memo.has(rest))return memo.get(rest);
   if(!rest){memo.set(rest,[]);return []}
   const exact=GRAPES.find(g=>g===rest);
   if(exact){const r=[exact];memo.set(rest,r);return r}
   for(const g of [...GRAPES].sort((a,b)=>b.length-a.length)){
     const prefix=g+" / ";
     if(rest.startsWith(prefix)){
       const tail=walk(rest.slice(prefix.length));
       if(tail){const r=[g,...tail];memo.set(rest,r);return r}
     }
   }
   memo.set(rest,null);return null;
 }
 return walk(text)||[text];
}

function canonicalGrape(g){
 const x=String(g||"").trim().toLowerCase();
 const aliases={
   "syrah / shiraz":"syrah","syrah":"syrah","shiraz":"syrah",
   "monastrell / mourvèdre":"mourvedre","mourvèdre":"mourvedre","monastrell":"mourvedre",
   "rolle / vermentino":"vermentino","rolle":"vermentino","vermentino":"vermentino"
 };
 return aliases[x]||x.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function grapeScore(guess,real){
 const g=[...new Set(parseGrapes(guess).map(canonicalGrape))];
 const r=[...new Set(parseGrapes(real).map(canonicalGrape))];
 if(!g.length||!r.length)return 0;
 const hits=g.filter(x=>r.includes(x)).length;
 const wrong=g.filter(x=>!r.includes(x)).length;
 if(!hits)return 0;
 if(hits===r.length && wrong===0)return 3;
 let base=Math.min(2,hits);
 if(r.length===1&&hits===1)base=3;
 return Math.max(0,base-Math.min(wrong,base));
}

function answerGrapes(a){
 return Array.isArray(a?.grapes)&&a.grapes.length?a.grapes:parseGrapes(a?.grape);
}

function priceScore(guess,real){
 guess=Number(guess);real=Number(real);
 if(!isFinite(guess)||!isFinite(real)||real<=0)return 0;
 const pct=Math.abs(guess-real)/real;
 if(pct<=.10)return 5;
 if(pct<=.20)return 4;
 if(pct<=.35)return 3;
 if(pct<=.50)return 2;
 if(pct<=.75)return 1;
 return 0;
}

function scoreParts(a,w,mode=game?.experience_mode||"blind"){
 const rawPrice=priceScore(a.price,w.price);
 const rawRegion=regionScore(a.region,w.region);
 const rawGrape=grapeScore(answerGrapes(a),w.grapes??w.grape);
 const factor=mode==="challenge"?challengeFactor(a):1;
 const eff=x=>Math.round(x*factor*100)/100;
 return {
   factor,
   rawPrice,rawRegion,rawGrape,
   price:eff(rawPrice),region:eff(rawRegion),grape:eff(rawGrape),
   total:eff(rawPrice+rawRegion+rawGrape)
 };
}

function knowledgeScore(a,w,mode=game?.experience_mode||"blind"){
 return scoreParts(a,w,mode).total;
}

function regionLabel(id){return regionObj(id)?.label||id||""}

function typeOptions(selected=""){
 return [["rose","Rosé 🌸"],["white","Blanc 🥂"],["red","Rouge 🍷"]]
  .map(([v,l])=>`<option value="${v}" ${selected===v?"selected":""}>${l}</option>`).join("");
}

function normalizeChoiceSearch(value){
 return String(value||"")
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"")
   .replace(/œ/g,"oe")
   .replace(/æ/g,"ae")
   .replace(/[’'`´]/g," ")
   .replace(/[-_/.,;:()]/g," ")
   .toLowerCase()
   .replace(/\s+/g," ")
   .trim();
}

function filterChoiceOptions(input){
 const root=input.closest(".searchable-picker");
 if(!root)return;
 const q=normalizeChoiceSearch(input.value);
 const options=Array.from(root.querySelectorAll("[data-search-value]"));
 let visibleCount=0;
 for(const el of options){
   const haystack=normalizeChoiceSearch(el.dataset.searchValue||el.textContent||"");
   const visible=!q||haystack.includes(q);
   el.hidden=!visible;
   el.classList.toggle("search-hidden",!visible);
   if(visible)visibleCount++;
 }
 const empty=root.querySelector(".choice-empty");
 if(empty)empty.hidden=visibleCount!==0;
}

function bindSearchablePickers(root=document){
 root.querySelectorAll(".choice-search").forEach(input=>{
   if(input.dataset.searchBound==="1")return;
   input.dataset.searchBound="1";
   input.addEventListener("input",()=>filterChoiceOptions(input));
   input.addEventListener("search",()=>filterChoiceOptions(input));
 });
}

function clearChoiceSearch(input){
 input.value="";
 filterChoiceOptions(input);
 input.focus();
}

function regionTrail(id){
 const out=[];
 let cur=regionObj(id);
 while(cur){
   out.push(cur.label);
   cur=cur.parent?regionObj(cur.parent):null;
 }
 return out;
}

function regionPickerHtml(id,selected="",mode="player"){
 const selectedRegion=canonicalRegionId(selected);
 const current=selectedRegion?regionLabel(selectedRegion):"Choisir une région";
 const rows=REGION_CATALOG
   .filter(r=>["region","subregion"].includes(r.level))
   .map(r=>{
     const trail=regionTrail(r.id).filter(x=>!["France","Sud de la France","Ouest de la France","Est de la France"].includes(x));
     const context=trail.slice(1).join(" · ");
     const search=trail.join(" ");
     return `<button type="button" class="choice-option ${selectedRegion===r.id?"selected":""}" data-search-value="${esc(search)}" onclick="chooseRegion('${mode}','${esc(id)}','${esc(r.id)}',this)">
       <span><b>${esc(r.label)}</b>${context?`<small>${esc(context)}</small>`:""}</span>${selectedRegion===r.id?"<span>✓</span>":""}
     </button>`;
   }).join("");
 return `<details class="searchable-picker region-picker">
   <summary><span>${esc(current)}</span><span>⌄</span></summary>
   <div class="choice-picker-body">
     <div class="choice-search-wrap">
       <input type="search" class="choice-search" placeholder="Rechercher une région…" autocomplete="off" oninput="filterChoiceOptions(this)">
       <button type="button" class="choice-search-clear" onclick="clearChoiceSearch(this.previousElementSibling)" aria-label="Effacer la recherche">×</button>
     </div>
     <button type="button" class="choice-option choice-clear" data-search-value="aucune effacer vide" onclick="chooseRegion('${mode}','${esc(id)}','',this)"><span>Effacer la sélection</span></button>
     <div class="choice-list">${rows}</div>
     <div class="choice-empty" hidden>Aucun résultat.</div>
   </div>
 </details>`;
}

async function chooseRegion(mode,id,regionId,button){
 const picker=button.closest(".region-picker");
 const summary=picker?.querySelector("summary span:first-child");
 const oldLabel=summary?.textContent||"";
 const oldSelected=picker?.querySelector(".choice-option.selected")||null;

 if(summary)summary.textContent=regionId?regionLabel(regionId):"Choisir une région";
 picker?.querySelectorAll(".choice-option").forEach(x=>x.classList.remove("selected"));
 if(regionId)button.classList.add("selected");

 const saved=mode==="host"
   ? await updateWineSecret(id,"region",regionId||null)
   : await setAnswer(id,"region",regionId||null);

 if(!saved){
   if(summary)summary.textContent=oldLabel;
   picker?.querySelectorAll(".choice-option").forEach(x=>x.classList.remove("selected"));
   oldSelected?.classList.add("selected");
   return;
 }
 if(picker)picker.open=false;
}

function grapePickerHtml(id,selected,mode){
 const chosen=parseGrapes(selected);
 const count=chosen.length;
 return `<details class="grape-picker searchable-picker" data-picker="${esc(id)}"><summary><span>${count?`${count} cépage${count>1?"s":""} sélectionné${count>1?"s":""}`:"Choisir les cépages"}</span><span>⌄</span></summary>
 <div class="grape-picker-body choice-picker-body">
   <div class="choice-search-wrap">
     <input type="search" class="choice-search" placeholder="Rechercher un cépage…" autocomplete="off" oninput="filterChoiceOptions(this)">
     <button type="button" class="choice-search-clear" onclick="clearChoiceSearch(this.previousElementSibling)" aria-label="Effacer la recherche">×</button>
   </div>
   <div class="choice-list grape-choice-list">${GRAPES.map(g=>`<label class="grape-option ${chosen.includes(g)?"selected":""}" data-search-value="${esc(g)}"><input type=checkbox value="${esc(g)}" ${chosen.includes(g)?"checked":""} onchange="handleGrapeCheck('${mode}','${esc(id)}',this)"><span>${esc(g)}</span></label>`).join("")}</div>
   <div class="choice-empty" hidden>Aucun cépage trouvé.</div>
 </div></details>`;
}

async function handleGrapeCheck(mode,id,input){
 const box=input.closest(".grape-picker");
 const option=input.closest(".grape-option");
 const previousChecked=!input.checked;
 const oldSummary=box.querySelector("summary span:first-child")?.textContent||"";

 option?.classList.toggle("selected",input.checked);
 const values=Array.from(box.querySelectorAll("input[type=checkbox]:checked")).map(x=>x.value);
 const summary=box.querySelector("summary span:first-child");
 if(summary)summary.textContent=values.length?`${values.length} cépage${values.length>1?"s":""} sélectionné${values.length>1?"s":""}`:"Choisir les cépages";

 const saved=mode==="host"
   ? await updateWineGrapes(id,values)
   : await setPlayerGrapes(id,values);

 if(!saved){
   input.checked=previousChecked;
   option?.classList.toggle("selected",previousChecked);
   if(summary)summary.textContent=oldSummary;
 }
}

function guideHtml(){
 return `<div class=card><h2>🗺️ Aide régions & cépages</h2><p class=muted>Repère rapide pour t'aider pendant la dégustation.</p><div class=grid>${
   REGION_CATALOG.filter(r=>["region","subregion"].includes(r.level)).map(r=>{
     const grapes=REGION_GRAPES[r.id]||REGION_GRAPES[r.parent]||[];
     return `<div class=region-card><h4>${esc(r.label)}</h4><div class=grapes>${grapes.map(g=>"• "+esc(g)).join("<br>")||"Voir les appellations associées"}</div></div>`;
   }).join("")
 }</div></div>`;
}

function qrForGame(){
 const joinUrl=location.origin+location.pathname+"?game="+encodeURIComponent(game.code);
 const el=document.getElementById("qrcode");
 if(el&&window.QRCode){el.innerHTML="";new QRCode(el,{text:joinUrl,width:180,height:180})}
 const l=document.getElementById("joinUrl");if(l)l.textContent=joinUrl;
}

