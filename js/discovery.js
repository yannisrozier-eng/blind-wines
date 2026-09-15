/* Blind Wine — Discovery mode: guided learning journey and reveal. */
'use strict';


const DISCOVERY_GOALS=[
 {id:'visual',icon:'👁️',label:'Comprendre la couleur et l’évolution',short:'Observer ce que la robe raconte sur le style et l’évolution du vin.',eye_tip:'Observe la profondeur de la couleur, ses reflets et sa limpidité. Compare surtout l’intensité et les nuances plutôt que de chercher immédiatement à deviner le vin.',nose_tip:'Après l’œil, vérifie si le nez confirme une impression de jeunesse, de maturité ou d’évolution.',palate_tip:'En bouche, relie ce que tu as observé à la fraîcheur, à la matière et à l’évolution générale du vin.',learning_note:'La robe donne des indices, mais elle ne suffit jamais à identifier un vin. Elle devient utile quand on la relie au nez et à la bouche.',question:'Quel est le meilleur usage de la couleur en dégustation ?',options:['La considérer comme un indice parmi d’autres','Identifier à elle seule le domaine','Déterminer précisément le prix','Deviner automatiquement le cépage'],correct:0,explanation:'La couleur est un indice sur le style, l’âge ou certains cépages, mais elle doit toujours être croisée avec le nez et la bouche.'},
 {id:'aromas',icon:'👃',label:'Reconnaître les familles d’arômes',short:'Apprendre à partir de grandes familles avant de chercher un arôme précis.',eye_tip:'Observe rapidement la robe, puis garde ton attention pour le nez : ici, l’objectif principal est de mettre des mots sur les arômes.',nose_tip:'Commence par une grande famille : fruité, floral, végétal, épicé, boisé ou évolué. Affine seulement ensuite vers un arôme plus précis.',palate_tip:'Vérifie si les arômes du nez se retrouvent en bouche et si certains apparaissent seulement après avoir goûté.',learning_note:'On progresse plus vite en reconnaissant d’abord une famille aromatique qu’en cherchant immédiatement un parfum très précis.',question:'Quel est le meilleur réflexe pour reconnaître les arômes ?',options:['Identifier d’abord une grande famille','Chercher immédiatement un arôme très précis','Se fier uniquement à la couleur','Commencer par le prix'],correct:0,explanation:'Classer d’abord les sensations dans une grande famille rend l’analyse plus fiable et facilite ensuite l’identification d’arômes précis.'},
 {id:'acidity',icon:'🍋',label:'Ressentir l’acidité',short:'Repérer la fraîcheur et la salivation provoquées par l’acidité.',eye_tip:'La robe ne permet pas de mesurer directement l’acidité. Observe-la rapidement puis concentre-toi surtout sur ce que ta bouche va ressentir.',nose_tip:'Au nez, des impressions d’agrumes ou de fraîcheur peuvent accompagner un vin vif, mais l’acidité se juge surtout en bouche.',palate_tip:'Après avoir avalé ou recraché, observe ta salivation sur les côtés de la langue et sous la langue : plus elle est nette, plus la sensation d’acidité est marquée.',learning_note:'L’acidité apporte fraîcheur, tension et salivation. Elle est une composante essentielle de l’équilibre d’un vin.',question:'Quel signe permet le mieux de ressentir l’acidité ?',options:['Une salivation plus importante','Une sensation de bouche sèche','Un goût obligatoirement sucré','Une couleur plus foncée'],correct:0,explanation:'L’acidité stimule la salivation et donne souvent une sensation de fraîcheur ou de tension en bouche.'},
 {id:'tannins',icon:'🌵',label:'Comprendre les tanins',short:'Identifier la sensation d’assèchement et de structure liée aux tanins.',eye_tip:'Sur un vin rouge, observe l’intensité de la robe, mais ne déduis pas automatiquement le niveau de tanins à partir de la couleur.',nose_tip:'Le nez ne mesure pas les tanins. Utilise-le pour comprendre le style aromatique avant de te concentrer sur la texture en bouche.',palate_tip:'Passe la langue sur les gencives après avoir goûté. Une sensation d’accroche, de rugosité ou d’assèchement correspond aux tanins.',learning_note:'Les tanins sont une sensation tactile : ils donnent de la structure et peuvent assécher légèrement les gencives et la bouche.',question:'Comment les tanins se manifestent-ils principalement ?',options:['Par une sensation d’assèchement','Par davantage de salivation','Par une sensation obligatoirement sucrée','Par des bulles'],correct:0,explanation:'Les tanins créent surtout une sensation tactile d’astringence ou d’assèchement, notamment sur les gencives.'},
 {id:'sweetness',icon:'🍯',label:'Identifier le sucre et la douceur',short:'Distinguer le sucre réel d’une simple impression fruitée ou ronde.',eye_tip:'La couleur seule ne permet pas de savoir si un vin est sec ou doux. Garde cette question ouverte jusqu’à la dégustation.',nose_tip:'Un nez très fruité peut donner une impression de douceur sans qu’il reste forcément beaucoup de sucre dans le vin.',palate_tip:'Cherche une douceur réellement perceptible sur la langue et distingue-la du fruit, de l’alcool ou de la rondeur de texture.',learning_note:'Un vin très fruité n’est pas forcément sucré. La sucrosité est une sensation gustative qu’il faut distinguer des arômes.',question:'Un vin très fruité est-il forcément sucré ?',options:['Non, fruité et sucre sont deux notions différentes','Oui, toujours','Seulement s’il est rouge','Seulement s’il est jeune'],correct:0,explanation:'Les arômes fruités viennent du profil aromatique alors que la douceur dépend notamment du sucre résiduel. Les deux peuvent être indépendants.'},
 {id:'body',icon:'💪',label:'Comprendre le corps et la puissance',short:'Évaluer le poids, la matière et la présence du vin en bouche.',eye_tip:'Une robe intense peut parfois accompagner un vin plus concentré, mais le corps se confirme surtout en bouche.',nose_tip:'Observe l’intensité aromatique sans la confondre avec la puissance : un vin très parfumé peut rester léger en bouche.',palate_tip:'Demande-toi si le vin paraît léger, intermédiaire ou ample. Observe la matière, l’alcool, la concentration et la sensation de volume.',learning_note:'Le corps correspond à la sensation de poids et de volume du vin en bouche. Il ne dépend pas uniquement de l’intensité aromatique.',question:'Que décrit principalement le corps d’un vin ?',options:['Sa sensation de poids et de volume en bouche','Uniquement sa couleur','Uniquement son prix','Le nombre d’arômes identifiés'],correct:0,explanation:'Le corps décrit la présence et le volume ressentis en bouche, issus de plusieurs éléments comme l’alcool, la matière et la concentration.'},
 {id:'length',icon:'⏱️',label:'Comprendre la longueur en bouche',short:'Mesurer combien de temps les sensations agréables restent après avoir goûté.',eye_tip:'Observe normalement le vin : la longueur ne peut pas être évaluée visuellement.',nose_tip:'Repère les arômes dominants : ils te serviront de référence pour voir combien de temps ils persistent après la gorgée.',palate_tip:'Après avoir avalé ou recraché, attends quelques secondes sans reprendre de vin et observe combien de temps les arômes et sensations persistent.',learning_note:'La longueur mesure la persistance des sensations après la dégustation. Elle est différente de la simple puissance au moment où le vin est en bouche.',question:'Quand évalue-t-on surtout la longueur d’un vin ?',options:['Après avoir avalé ou recraché','Avant de sentir le vin','Uniquement en regardant la robe','En lisant l’étiquette'],correct:0,explanation:'La longueur correspond à la persistance des sensations après la gorgée : il faut donc observer ce qui reste une fois le vin quitté de la bouche.'},
 {id:'grape',icon:'🍇',label:'Découvrir un cépage',short:'Relier un cépage à un ensemble de sensations plutôt qu’à un seul arôme.',eye_tip:'Observe si la couleur et l’intensité sont cohérentes avec le style du cépage, sans chercher une règle absolue.',nose_tip:'Repère les grandes familles aromatiques dominantes et demande-toi lesquelles pourraient devenir des marqueurs utiles de ce cépage.',palate_tip:'Observe surtout la structure : acidité, tanins, corps et longueur. Le profil d’un cépage est une combinaison de plusieurs sensations.',learning_note:'Un cépage ne se résume pas à un arôme. On le reconnaît mieux en combinant profil aromatique, structure et contexte de production.',question:'Quel est le meilleur moyen d’apprendre à reconnaître un cépage ?',options:['Combiner arômes et structure en bouche','Mémoriser un seul arôme','Se baser uniquement sur le prix','Regarder uniquement la couleur'],correct:0,explanation:'Les marqueurs d’un cépage sont un ensemble de caractéristiques. Les comparer sur plusieurs vins est plus fiable que retenir un seul arôme.'},
 {id:'region',icon:'🗺️',label:'Découvrir une région ou une appellation',short:'Comprendre comment une origine se traduit dans le style du vin.',eye_tip:'Observe le style général du vin sans chercher à identifier immédiatement son origine.',nose_tip:'Repère les familles aromatiques et demande-toi si elles correspondent au style habituel de la région présentée.',palate_tip:'Concentre-toi sur l’équilibre entre fraîcheur, maturité, corps et tanins : ces éléments aident à comprendre le style d’une origine.',learning_note:'Une région n’a pas un goût unique : son identité vient de l’association du climat, des sols, des cépages et des choix de production.',question:'Pourquoi deux régions peuvent-elles produire des vins très différents ?',options:['Parce que climat, sols, cépages et pratiques diffèrent','Uniquement à cause de la forme des bouteilles','Uniquement à cause du prix','Parce que toutes utilisent des cépages différents'],correct:0,explanation:'Le style régional résulte de plusieurs facteurs : climat, sols, cépages autorisés ou habituels et décisions du vigneron.'},
 {id:'terroir',icon:'🌱',label:'Comprendre le terroir et le climat',short:'Relier fraîcheur, maturité et structure aux conditions dans lesquelles la vigne pousse.',eye_tip:'Observe la maturité apparente du vin, mais garde en tête que la couleur dépend aussi du cépage et de la vinification.',nose_tip:'Cherche si le profil semble davantage frais et tendu ou mûr et solaire, sans transformer cela en règle absolue.',palate_tip:'Compare acidité, maturité du fruit, alcool et structure : ce sont des indices utiles pour comprendre l’influence du climat et du lieu.',learning_note:'Le terroir est l’interaction d’un lieu, d’un climat, d’un sol, d’une vigne et du travail humain. Il influence le style sans produire une signature unique.',question:'Le terroir correspond-il uniquement au sol ?',options:['Non, il combine plusieurs facteurs du lieu et du travail humain','Oui, uniquement au type de roche','Oui, uniquement au climat','Non, il correspond seulement au cépage'],correct:0,explanation:'Le terroir est une notion globale qui associe notamment sol, climat, exposition, matériel végétal et pratiques humaines.'},
 {id:'oak',icon:'🪵',label:'Comprendre l’élevage en fût',short:'Repérer ce que le bois peut apporter aux arômes et à la texture.',eye_tip:'La couleur peut évoluer avec le temps et l’élevage, mais elle ne permet pas à elle seule de conclure à un passage en fût.',nose_tip:'Cherche éventuellement des notes toastées, vanillées, épicées, fumées ou de café, sans oublier qu’elles ne sont pas systématiques.',palate_tip:'Observe si l’élevage apporte du volume, une texture différente ou une structure supplémentaire en plus de ses éventuels arômes.',learning_note:'Le bois peut modifier les arômes et la texture du vin. Son impact dépend du type de contenant, de son âge, de sa chauffe et de la durée d’élevage.',question:'Quel indice peut évoquer un élevage en bois ?',options:['Des notes toastées, vanillées ou épicées','Une forte acidité à elle seule','Une couleur claire à elle seule','La présence obligatoire de sucre'],correct:0,explanation:'Le bois peut apporter des notes toastées, vanillées, fumées ou épicées, mais il faut les replacer dans l’ensemble du vin.'},
 {id:'age',icon:'🕰️',label:'Comprendre l’effet de l’âge',short:'Observer comment les arômes, la couleur et la structure évoluent avec le temps.',eye_tip:'Cherche des nuances d’évolution dans la robe et compare-les au style attendu du vin, sans utiliser la couleur comme seul critère.',nose_tip:'Repère si les arômes semblent très frais et primaires ou s’ils évoluent vers des notes plus complexes, séchées, épicées ou tertiaires.',palate_tip:'Observe si les tanins et l’acidité paraissent intégrés et comment la texture a évolué. L’âge transforme l’équilibre, pas seulement les arômes.',learning_note:'Avec le temps, le vin évolue : les arômes changent, la texture peut s’assouplir et la couleur se transforme. Tous les vins ne vieillissent cependant pas de la même manière.',question:'Que peut modifier le vieillissement d’un vin ?',options:['Les arômes, la texture et la couleur','Uniquement le prix','Uniquement le degré d’alcool','Uniquement la forme de la bouteille'],correct:0,explanation:'L’évolution peut toucher plusieurs dimensions du vin : profil aromatique, couleur, intégration des tanins et équilibre général.'}
];



const DISCOVERY_THEMES=[
 {id:'initiation',icon:'🍷',label:'Initiation au vin',desc:'Construire les bases : observer, sentir, goûter et mettre des mots sur ses sensations.',sequence:['visual','aromas','acidity','tannins','body','length']},
 {id:'grapes',icon:'🍇',label:'Découvrir les cépages',desc:'Comparer les profils aromatiques et les structures pour créer des repères de cépages.',sequence:['grape','aromas','acidity','body','grape','length']},
 {id:'regions',icon:'🗺️',label:'Découvrir une région',desc:'Relier climat, terroir, cépages et style à travers plusieurs bouteilles.',sequence:['region','terroir','grape','acidity','body','region']},
 {id:'comparison',icon:'⚖️',label:'Comparer des styles de vins',desc:'Apprendre par contraste : fraîcheur, intensité, corps, douceur et longueur.',sequence:['acidity','body','aromas','sweetness','length','tannins']},
 {id:'oak_age',icon:'🪵',label:'Élevage & évolution',desc:'Comprendre l’effet du bois, du temps et de l’évolution sur les arômes et la texture.',sequence:['visual','oak','aromas','age','body','length']},
 {id:'custom',icon:'✍️',label:'Parcours personnalisé',desc:'Construire librement le fil rouge de la soirée.',sequence:[]}
];

function discoveryThemePreset(value){
 const v=String(value||'').trim();
 return DISCOVERY_THEMES.find(t=>t.id===v||t.label===v)||null;
}
function discoveryThemeOptionsHtml(current){
 const id=discoveryThemePreset(current)?.id||'';
 return `<option value="">Choisir un thème de soirée…</option>`+DISCOVERY_THEMES.map(t=>`<option value="${t.id}" ${id===t.id?'selected':''}>${t.icon} ${esc(t.label)}</option>`).join('');
}
function discoveryThemeSummary(){
 if(game?.experience_mode!=="discovery")return '';
 const p=discoveryThemePreset(game.discovery_theme);
 const label=p?.label||game.discovery_theme||'Parcours Découverte';
 const goal=String(game.discovery_theme_goal||'').trim();
 return `<div class="discovery-theme-banner"><span class="pill">${p?.icon||'🎓'} FIL ROUGE</span><b>${esc(label)}</b>${goal?`<small>${esc(goal)}</small>`:''}</div>`;
}
function discoverySuggestedGoal(theme,index){
 const p=discoveryThemePreset(theme);
 if(!p?.sequence?.length)return null;
 return p.sequence[index%p.sequence.length]||null;
}
function discoveryComparisonSpec(d){
 const goal=discoveryGoalPreset(d?.learning_goal);
 const map={
   visual:{key:'look',icon:'👁️',label:'intense visuellement'},
   aromas:{key:'nose',icon:'👃',label:'intense aromatiquement'},
   acidity:{key:'acid',icon:'🍋',label:'acide / vif'},
   sweetness:{key:'sweet',icon:'🍯',label:'doux / sucré'},
   body:{key:'body',icon:'💪',label:'ample / puissant'},
   length:{key:'finish',icon:'⏱️',label:'long en bouche'},
   tannins:{key:'body',icon:'🌵',label:'structuré en bouche'},
   grape:{key:'nose',icon:'🍇',label:'expressif aromatiquement'},
   region:{key:'acid',icon:'🗺️',label:'frais / tendu'},
   terroir:{key:'acid',icon:'🌱',label:'frais / tendu'},
   oak:{key:'body',icon:'🪵',label:'ample / marqué par la matière'},
   age:{key:'nose',icon:'🕰️',label:'évolué aromatiquement'}
 };
 return map[goal?.id]||{key:'body',icon:'⚖️',label:'ample en bouche'};
}
function discoveryCompareChoiceLabel(choice){
 return {previous:'Vin précédent',current:'Ce vin',similar:'Très proches'}[choice]||'—';
}
function discoveryComparisonDistributionHtml(rows,d){
 const choices=(rows||[]).map(a=>a.discovery_compare?.choice).filter(x=>['previous','current','similar'].includes(x));
 if(!choices.length)return '<p class="muted">Aucune comparaison enregistrée.</p>';
 const counts={previous:0,current:0,similar:0};choices.forEach(x=>counts[x]++);
 const total=choices.length,spec=discoveryComparisonSpec(d||{});
 const items=[['previous','Vin précédent'],['similar','Très proches'],['current','Ce vin']];
 return `<div class="comparison-result"><p><b>${spec.icon} Lequel paraît le plus ${esc(spec.label)} ?</b></p>${items.map(([k,l])=>`<div class="comparison-result-row"><span>${l}</span><div><i style="width:${Math.round(counts[k]/total*100)}%"></i></div><b>${Math.round(counts[k]/total*100)}%</b></div>`).join('')}<small class="muted">${total} comparaison${total>1?'s':''} · perception collective, pas correction.</small></div>`;
}

function discoveryProgressSummary(answers,reveals,wines=[]){
 const revealByWine=new Map((reveals||[]).map(r=>[r.wine_id,r]));
 const orderByWine=new Map((wines||[]).map((w,i)=>[w.id,Number.isInteger(w.position)?w.position:i]));
 const rows=(answers||[]).filter(a=>a.done&&revealByWine.has(a.wine_id)).map(a=>{
   const rv=revealByWine.get(a.wine_id), ed=discoveryDefaults(rv);
   return {a,rv,goal:discoveryGoalPreset(rv.learning_goal),ok:Number.isInteger(a.quiz_choice)&&Number(a.quiz_choice)===ed.correct};
 }).sort((x,y)=>(orderByWine.get(x.a.wine_id)??Number.MAX_SAFE_INTEGER)-(orderByWine.get(y.a.wine_id)??Number.MAX_SAFE_INTEGER));
 const byGoal=new Map();
 rows.forEach(r=>{
   const key=r.goal?.id||r.rv.learning_goal||'general';
   if(!byGoal.has(key))byGoal.set(key,{label:r.goal?.label||r.rv.learning_goal||'Compréhension générale',icon:r.goal?.icon||'🎓',ok:0,total:0});
   const x=byGoal.get(key);x.total++;if(r.ok)x.ok++;
 });
 const notions=[...byGoal.values()].map(x=>({...x,rate:x.total?x.ok/x.total:0}));
 const half=Math.ceil(rows.length/2);
 const first=rows.slice(0,half),last=rows.slice(half);
 const rate=list=>list.length?Math.round(list.filter(x=>x.ok).length/list.length*100):null;
 const firstRate=rate(first), lastRate=rate(last.length?last:first);
 return {rows,notions,correct:rows.filter(x=>x.ok).length,total:rows.length,firstRate,lastRate,delta:(firstRate!=null&&lastRate!=null)?lastRate-firstRate:null,comparisons:rows.filter(x=>x.a.discovery_compare?.choice).length};
}

function discoveryGoalPreset(value){
 const v=String(value||'').trim();
 return DISCOVERY_GOALS.find(g=>g.id===v||g.label===v)||null;
}

function discoveryGoalId(value){return discoveryGoalPreset(value)?.id||''}

function discoveryGoalOptionsHtml(current){
 const id=discoveryGoalId(current);
 const isCustom=String(current||'').trim()&&!id;
 return `<option value="">Choisir ce que ce vin doit faire découvrir…</option>`+
  DISCOVERY_GOALS.map(g=>`<option value="${g.id}" ${g.id===id?'selected':''}>${g.icon} ${esc(g.label)}</option>`).join('')+
  `<option value="custom" ${isCustom?'selected':''}>✍️ Objectif personnalisé</option>`;
}

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
 const preset=discoveryGoalPreset(d?.learning_goal);
 const customQuestion=String(d?.quiz_question||"").trim();
 const customOptions=Array.isArray(d?.quiz_options)?d.quiz_options:[];
 const presetOptions=preset?.options||[];
 const activeOptions=customOptions.length>=2?customOptions:presetOptions;
 const hasQuiz=customQuestion!==""&&customOptions.length>=2;
 const fallbackQuestion=preset?.question||"Quel est le meilleur réflexe pour progresser en dégustation ?";
 const fallbackOptions=presetOptions.length>=2?presetOptions:["Mettre des mots sur ses sensations","Trouver absolument le domaine","Se fier uniquement au prix"];
 const options=hasQuiz?customOptions:(activeOptions.length>=2?activeOptions:fallbackOptions);
 const customCorrect=Number.isInteger(d?.quiz_correct)&&d.quiz_correct>=0&&d.quiz_correct<options.length?d.quiz_correct:null;
 const correct=customCorrect!=null?customCorrect:(Number.isInteger(preset?.correct)?preset.correct:0);
 return {
   goal:preset,
   eye_tip:d?.eye_tip||preset?.eye_tip||"Observe d’abord la robe sans chercher à identifier le vin : intensité, limpidité et nuances donnent des indices sur son style et son évolution.",
   nose_tip:d?.nose_tip||preset?.nose_tip||"Commence par les grandes familles d’arômes. Il est plus utile d’identifier « agrumes » ou « fruits rouges » que de chercher immédiatement un arôme très précis.",
   palate_tip:d?.palate_tip||preset?.palate_tip||"En bouche, sépare les sensations : acidité, douceur, corps et longueur. Cette structure est souvent plus fiable que les arômes seuls.",
   question:hasQuiz?customQuestion:fallbackQuestion,
   options,
   correct,
   explanation:String(d?.quiz_explanation||"").trim()||preset?.explanation||"La progression vient surtout de la capacité à décrire ce que l’on ressent, puis à relier ces sensations au style du vin.",
   learning_note:String(d?.learning_note||"").trim()||preset?.learning_note||"",
   identity
 };
}


function discoveryFocusHtml(goal,step){
 if(!goal)return '';
 const focusStep={visual:1,aromas:2,acidity:3,tannins:3,sweetness:3,body:3,length:3,grape:2,region:3,terroir:3,oak:2,age:2}[goal.id]??3;
 if(step!==focusStep)return '';
 return `<div class="discovery-focus"><span>🎯 Focus du verre</span><b>${goal.icon} ${esc(goal.label)}</b><small>${esc(goal.short)}</small></div>`;
}

function discoveryProgress(step){return `<div class=discovery-progress>${[0,1,2,3,4].map(i=>`<span class="${i<=step?"on":""}"></span>`).join("")}</div>`}

async function setDiscoveryStep(wineId,step){
 const target=Math.max(0,Math.min(4,step));
 const a=await getAnswer(wineId);
 const current=Math.max(0,Math.min(4,Number(a.discovery_step||0)));
 if(target>current){
   if(current===1&&!a.scores?.look)return toast("Positionne d’abord l’intensité visuelle.");
   if(current===2){
     if(!a.scores?.nose)return toast("Positionne d’abord l’intensité aromatique.");
     if(!(a.aromas||[]).length)return toast("Choisis au moins une famille d’arômes avant de continuer.");
   }
   if(current===3){
     const missing=[['acid','l’acidité'],['sweet','la douceur'],['body','le corps'],['finish','la persistance']].find(([key])=>!a.scores?.[key]);
     if(missing)return toast(`Positionne d’abord ${missing[1]} du vin.`);
     if(!a.note)return toast("Ajoute ta note de plaisir avant de passer à la compréhension.");
   }
 }
 const saved=await upsertAnswer(wineId,{discovery_step:target});
 if(saved)renderPlayerTasting();
}

async function chooseDiscoveryQuiz(wineId,index){
 const a=await getAnswer(wineId);
 if(Number.isInteger(a.quiz_choice))return toast("Ta première réponse au mini-quiz est déjà verrouillée.");
 await upsertAnswer(wineId,{quiz_choice:index});
 renderPlayerTasting();
}

function sensoryLabel(v){return v?`${v}/5`:"—"}

function discoveryQuestionType(type,title,text){
 const meta={perception:['💭','PERCEPTION'],observation:['👀','OBSERVATION'],knowledge:['🧠','CONNAISSANCE']}[type]||['🎓','DÉCOUVERTE'];
 return `<div class="discovery-question-type ${type}"><span>${meta[0]} ${meta[1]}</span><b>${esc(title)}</b><small>${esc(text)}</small></div>`;
}
function discoveryComparisonHtml(current,previous,d=null,wineId=null,interactive=false){
 if(!previous)return '';
 const spec=discoveryComparisonSpec(d||{});
 const a=Number(current.scores?.[spec.key]||0),b=Number(previous.scores?.[spec.key]||0);
 const saved=current.discovery_compare||{};
 const choice=saved.choice||'';
 const verdict=a&&b?(a===b?'≈ tes notes sont identiques':a>b?'↑ tu as noté ce vin plus haut':'↓ tu as noté ce vin plus bas'):'';
 if(interactive&&wineId){
   return `<div class="learning-card discovery-compare advanced"><b>${spec.icon} Compare avec le vin précédent</b><p>Lequel te paraît le plus <strong>${esc(spec.label)}</strong> ?</p>
    <div class="comparison-options">
      ${[['previous','← Vin précédent'],['similar','≈ Très proches'],['current','Ce vin →']].map(([v,l])=>`<button type="button" class="comparison-option ${choice===v?'selected':''}" onclick="setDiscoveryComparison('${wineId}','${spec.key}','${v}',this)">${l}</button>`).join('')}
    </div>${verdict?`<small class="muted">Repère personnel : ${verdict} (${b}/5 → ${a}/5).</small>`:''}</div>`;
 }
 if(!a||!b)return '';
 return `<div class="learning-card discovery-compare"><b>${spec.icon} Ton repère avec le vin précédent</b><p><strong>${esc(discoveryCompareChoiceLabel(choice))}</strong>${choice?' était ton ressenti.':''}</p><div class="row"><span>${esc(spec.label)}</span><b>${verdict}</b><small>Vin précédent ${b}/5 → ce vin ${a}/5</small></div></div>`;
}

async function setDiscoveryComparison(wineId,metric,choice,button=null){
 if(!['previous','current','similar'].includes(choice))return;
 if(button){button.parentElement?.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');}
 const saved=await upsertAnswer(wineId,{discovery_compare:{metric,choice}});
 if(!saved)renderPlayerTasting();
}


function discoverySensoryScaleMeta(key){
 const map={
  look:{icon:'👁️',low:'Pâle',high:'Intense',labels:['Très légère','Légère','Moyenne','Marquée','Très marquée']},
  nose:{icon:'👃',low:'Discret',high:'Expressif',labels:['Très discret','Discret','Présent','Expressif','Très expressif']},
  acid:{icon:'🍋',low:'Souple',high:'Très vif',labels:['Très souple','Souple','Équilibré','Vif','Très vif']},
  sweet:{icon:'🍯',low:'Très sec',high:'Doux',labels:['Très sec','Sec','Tendre','Doux','Très doux']},
  body:{icon:'💪',low:'Léger',high:'Puissant',labels:['Très léger','Léger','Intermédiaire','Ample','Puissant']},
  finish:{icon:'⏱️',low:'Courte',high:'Longue',labels:['Très courte','Courte','Moyenne','Longue','Très longue']}
 };
 return map[key]||{icon:'🎓',low:'Faible',high:'Fort',labels:['Très faible','Faible','Moyen','Fort','Très fort']};
}

function discoveryMicroReveal(key,value,tip=''){
 if(!value)return '';
 const meta=discoverySensoryScaleMeta(key),label=meta.labels[Math.max(0,Math.min(4,Number(value)-1))];
 return `<div class="discovery-micro-reveal"><span>✨ TON REPÈRE</span><b>${meta.icon} ${esc(label)}</b>${tip?`<small>${esc(tip)}</small>`:''}</div>`;
}

function discoverySensoryMetric(label,key,a,tip=''){
 const meta=discoverySensoryScaleMeta(key),value=Number(a.scores?.[key]||0);
 return `<div class="section discovery-sensory-metric"><div class="sensory-head"><h3>${label}</h3>${value?`<span>${value}/5 · ${esc(meta.labels[value-1])}</span>`:''}</div>
  <div class="sensory-anchors"><small>${esc(meta.low)}</small><small>${esc(meta.high)}</small></div>
  <div class="scale discovery-scale">${[1,2,3,4,5].map(n=>`<button type="button" aria-label="${esc(meta.labels[n-1])}" title="${esc(meta.labels[n-1])}" class="${value===n?'sel':''}" onclick="setDiscoveryScore('${a.wine_id||''}','${key}',${n})"><span>${n}</span><small>${esc(meta.labels[n-1])}</small></button>`).join('')}</div>
  ${discoveryMicroReveal(key,value,tip)}
 </div>`;
}

async function setDiscoveryScore(wineId,key,n){
 if(game?.experience_mode!=='discovery')return;
 const a=await getAnswer(wineId),scores={...(a.scores||{}),[key]:n};
 const saved=await upsertAnswer(wineId,{scores});
 if(saved)renderPlayerTasting();
}

function discoveryMissionText(goal){
 const id=goal?.id||'';
 const map={
  visual:'Regarde d’abord le verre sans chercher à deviner. Ta mission : repérer ce que la robe peut raconter.',
  aromas:'Sens une première fois sans réfléchir, puis cherche seulement une grande famille aromatique.',
  acidity:'Après une gorgée, attends quelques secondes et observe si ta bouche se remet à saliver.',
  tannins:'Après avoir goûté, passe la langue sur tes gencives et repère une éventuelle sensation d’assèchement.',
  sweetness:'Distingue la vraie douceur en bouche d’une simple impression de fruit mûr.',
  body:'Demande-toi si le vin paraît léger, intermédiaire ou ample quand il occupe la bouche.',
  length:'Après la gorgée, ne reprends pas de vin tout de suite : observe combien de temps les sensations restent.',
  grape:'Cherche une combinaison de sensations plutôt qu’un arôme unique : nez, acidité, matière et longueur.',
  region:'Relie le style du vin à son origine : fraîcheur, maturité, structure et expression aromatique.',
  terroir:'Cherche ce qui évoque un style plus frais/tendu ou plus mûr/solaire, puis relie-le au contexte du vin.',
  oak:'Cherche des indices de texture et d’arômes toastés, épicés ou vanillés sans forcer la réponse.',
  age:'Observe si les arômes paraissent surtout frais et primaires ou plus évolués et complexes.'
 };
 return map[id]||'Goûte sans chercher la bonne réponse : observe une sensation précise et mets des mots dessus.';
}

function discoverySessionProgressHtml(progress,currentIndex,totalWines){
 const completed=Number(progress?.total||0),notions=Number(progress?.notions?.length||0),quizRate=completed?Math.round((progress.correct||0)/completed*100):null;
 const percent=Math.max(0,Math.min(100,Math.round(((currentIndex+1)/Math.max(1,totalWines))*100)));
 return `<div class="discovery-session-progress"><div class="session-progress-head"><span>TON PARCOURS</span><b>${currentIndex+1}/${totalWines} verres</b></div><div class="session-progress-track"><i style="width:${percent}%"></i></div><div class="session-progress-stats"><span>🎓 ${notions} notion${notions>1?'s':''} explorée${notions>1?'s':''}</span><span>${quizRate==null?'🧠 Premier quiz à venir':`🧠 ${quizRate}% aux mini-quiz`}</span></div></div>`;
}

function renderDiscoveryJourney(w,a,d,feedback=null,previousAnswer=null,sessionProgress=null,totalWines=null){
 const step=Math.max(0,Math.min(4,Number(a.discovery_step||0)));
 const e=discoveryDefaults(d);
 if(feedback){
   e.correct=Number.isInteger(feedback.quiz_correct)?feedback.quiz_correct:0;
   e.explanation=feedback.quiz_explanation||e.explanation;
 }
 const title=`${esc(d?.name||TYPES[w.type])}`;
 const compareSpec=previousAnswer?discoveryComparisonSpec(d):null;
 const identity=`${esc(regionLabel(d?.region)||"")} ${d?.grapes?.length?"· "+esc(d.grapes.join(" / ")):""} ${d?.price?`· ${Number(d.price).toFixed(2)} €`:""}`;
 let body="";
 if(step===0){
   body=`<div class=discovery-stage>${discoveryThemeSummary()}${discoverySessionProgressHtml(sessionProgress,game.current,totalWines||game.wine_count||1)}<div class="discovery-mission"><span class="mission-kicker">MISSION DU VERRE</span><div class=emoji>${e.goal?.icon||'🎓'}</div><h2>${esc(e.goal?.label||'Découvrir ce vin')}</h2><p>${esc(discoveryMissionText(e.goal))}</p><div class="mission-wine"><b>${title}</b><small>${identity}</small></div></div>
   <div class=edu-tip><strong>Un seul objectif</strong>Ne cherche pas à tout analyser parfaitement. Concentre-toi sur la sensation proposée : l’app t’expliquera ce que tu viens de ressentir au fur et à mesure.</div>
   <div class=discovery-nav><button type="button" class="btn discovery-start-btn" onclick="setDiscoveryStep('${w.id}',1)">🍷 Je suis prêt, je goûte</button></div></div>`;
 }
 if(step===1){
   body=`<div class=discovery-stage><div class=emoji>👁️</div><h2>1. Observe</h2><p class=muted>Regarde le vin avant de le sentir.</p>${discoveryQuestionType("observation","Où situes-tu ce vin ?","Il n’y a pas de note juste : positionne simplement ton ressenti sur l’échelle.")}${discoveryFocusHtml(e.goal,1)}
   ${discoverySensoryMetric("Intensité visuelle","look",a,e.eye_tip)}
   ${!a.scores?.look?`<div class=edu-tip><strong>💡 Avant de répondre</strong>${esc(e.eye_tip)}</div>`:''}
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',0)">← Retour</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',2)">Passer au nez →</button></div></div>`;
 }
 if(step===2){
   body=`<div class=discovery-stage><div class=emoji>👃</div><h2>2. Sens</h2><p class=muted>Choisis les familles d’arômes qui te parlent le plus.</p>${discoveryQuestionType("perception","Qu’est-ce que TOI tu sens ?","Aucune mauvaise réponse ici. Choisis les familles qui te viennent naturellement.")}${discoveryFocusHtml(e.goal,2)}
   ${discoverySensoryMetric("Intensité aromatique","nose",a,e.nose_tip)}
   <div class=section><h3>Arômes perçus</h3><div class=chips>${AROMAS[w.type].map(x=>`<button type="button" class="chip ${(a.aromas||[]).includes(x)?"sel":""}" onclick="toggleAroma('${w.id}',decodeURIComponent('${encodeURIComponent(x)}'),this)">${esc(x)}</button>`).join("")}</div></div>
   ${!a.scores?.nose?`<div class=edu-tip><strong>💡 Avant de répondre</strong>${esc(e.nose_tip)}</div>`:''}
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',1)">← L’œil</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',3)">Passer à la bouche →</button></div></div>`;
 }
 if(step===3){
   body=`<div class=discovery-stage><div class=emoji>👄</div><h2>3. Goûte</h2><p class=muted>Concentre-toi sur la structure du vin.</p>${discoveryQuestionType("observation","Décris la structure","Tes réponses serviront à comparer tes sensations avec celles du groupe.")}${discoveryFocusHtml(e.goal,3)}
   ${discoverySensoryMetric("🍋 Acidité","acid",a,e.goal?.id==='acidity'?e.palate_tip:'Observe la fraîcheur et la salivation.')}${discoverySensoryMetric("🍯 Douceur / sucrosité","sweet",a,e.goal?.id==='sweetness'?e.palate_tip:'Distingue le sucre réel du fruit et de la rondeur.')}${discoverySensoryMetric("💪 Corps / puissance","body",a,e.goal?.id==='body'?e.palate_tip:'Observe le poids et le volume du vin en bouche.')}${discoverySensoryMetric("⏱️ Persistance","finish",a,e.goal?.id==='length'?e.palate_tip:'Attends quelques secondes après la gorgée et observe ce qui reste.')}
   <div class=section><h3>❤️ Ton plaisir</h3><div class="scale ten">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="${a.note===n?"sel":""}" onclick="setAnswerChoice('${w.id}','note',${n},this)">${n}</button>`).join("")}</div></div>
   ${![a.scores?.acid,a.scores?.sweet,a.scores?.body,a.scores?.finish].some(Boolean)?`<div class=edu-tip><strong>💡 Avant de répondre</strong>${esc(e.palate_tip)}</div>`:''}
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',2)">← Le nez</button><button type="button" class=btn onclick="setDiscoveryStep('${w.id}',4)">Comprendre →</button></div></div>`;
 }
 if(step===4){
   const choice=Number.isInteger(a.quiz_choice)?a.quiz_choice:null;
   const answered=choice!==null;
   const correct=answered&&choice===e.correct;
   body=`<div class=discovery-stage><div class=emoji>🧠</div><h2>4. Comprendre</h2>
   ${discoveryQuestionType("knowledge","Teste ce que tu viens de comprendre","Ici seulement, il existe une bonne réponse. L’explication compte plus que le score.")}
   <div class=learning-card><b>Mini-quiz</b><div style="margin-top:8px">${esc(e.question)}</div></div>
   <div class=quiz-options>${e.options.slice(0,4).map((opt,i)=>`<button type="button" class="quiz-option ${choice===i?"selected":""} ${answered&&i===e.correct?"correct":""} ${answered&&choice===i&&i!==e.correct?"wrong":""}" ${answered?"disabled":""} onclick="chooseDiscoveryQuiz('${w.id}',${i})">${String.fromCharCode(65+i)}. ${esc(opt)}</button>`).join("")}</div>
   ${answered?`<div class=edu-tip><strong>${correct?"✅ Bien vu !":"💡 À retenir"}</strong>${esc(e.explanation)}</div>`:`<p class=muted>Choisis une réponse pour afficher l’explication.</p>`}
   ${e.learning_note?`<div class=learning-card><b>La leçon de ce verre</b><div>${esc(e.learning_note)}</div></div>`:""}
   ${previousAnswer?discoveryComparisonHtml(a,previousAnswer,d,w.id,true):''}
   <div class=discovery-summary>
    <div class=row><span>👁️ Intensité visuelle</span><b>${sensoryLabel(a.scores?.look)}</b></div>
    <div class=row><span>👃 Intensité aromatique</span><b>${sensoryLabel(a.scores?.nose)}</b></div>
    <div class=row><span>🍋 Acidité</span><b>${sensoryLabel(a.scores?.acid)}</b></div>
    <div class=row><span>💪 Corps</span><b>${sensoryLabel(a.scores?.body)}</b></div>
    <div class=row><span>❤️ Plaisir</span><b>${a.note?`${a.note}/10`:"—"}</b></div>
   </div>
   <div class=discovery-nav><button type="button" class="btn secondary" onclick="setDiscoveryStep('${w.id}',3)">← La bouche</button><button type="button" class=btn ${(!a.note||!answered||(previousAnswer&&!a.discovery_compare?.choice))?'disabled aria-disabled="true"':""} onclick="submitAnswer('${w.id}')">Terminer ce verre</button></div>
   ${!a.note?`<p class=muted>Ajoute ta note de plaisir avant de terminer.</p>`:''}${!answered?`<p class=muted>Réponds au mini-quiz avant de terminer.</p>`:''}${previousAnswer&&!a.discovery_compare?.choice?`<p class=muted>Compare ce vin avec le précédent avant de terminer.</p>`:''}
   </div>`;
 }
 return `<div class="card player-sheet discovery-player-sheet"><span class=pill>VIN ${game.current+1} · 🎓 Découverte</span>${step>0?discoverySessionProgressHtml(sessionProgress,game.current,totalWines||game.wine_count||1):''}${discoveryProgress(step)}${body}</div>${guideHtml()}`;
}

async function renderHostDiscoveryReveal(){
 const pos=game.current;
 const ws=await getBlindWines(),w=ws[pos];if(!w)return;
 const [rvR,ansR]=await Promise.all([
   supabaseClient.from("wine_reveals").select("*").eq("wine_id",w.id).maybeSingle(),
   supabaseClient.from("answers").select("note,quiz_choice,scores,aromas,discovery_compare").eq("game_id",game.id).eq("wine_id",w.id).eq("done",true)
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
 ${edu.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(edu.learning_note)}</p></div>`:""}
 ${game.current>0?`<div class=card><h2>⚖️ Ce qu’a ressenti le groupe</h2>${discoveryComparisonDistributionHtml(aa,rv)}</div>`:""}
 <div class=card><h2>🧠 Mini-quiz</h2><p><b>${esc(edu.question)}</b></p><p>${quiz}/${aa.length} bonne${quiz>1?"s":""} réponse${aa.length>1?"s":""}.</p><div class=notice>${esc(edu.explanation)}</div></div>
 <div class=card><div class=stat><span>❤️ Note plaisir du groupe</span><strong>${aa.length?avg.toFixed(1)+"/10":"—"}</strong></div></div>
 <div class="card sticky"><button type="button" class=btn style="width:100%" onclick="nextWine()">${game.current+1>=game.wine_count?"Terminer la soirée":"Passer au vin suivant →"}</button></div>`;
}

async function renderPlayerDiscoveryReveal(){
 const pos=game.current;
 const ws=await getBlindWines(),w=ws[pos];if(!w)return;
 const prevWine=pos>0?ws[pos-1]:null;
 const [rvR,a,prevA,groupR]=await Promise.all([
   supabaseClient.from("wine_reveals").select("*").eq("wine_id",w.id).maybeSingle(),
   getAnswer(w.id,true),
   prevWine?getAnswer(prevWine.id,true):Promise.resolve(null),
   supabaseClient.from("answers").select("discovery_compare").eq("game_id",game.id).eq("wine_id",w.id).eq("done",true)
 ]);
 const revealError=rvR.error||groupR.error;
 if(revealError)return toast(revealError.message);
 if(game.status!=="tasting"||game.phase!=="revealed"||game.current!==pos)return requestRoute();
 const rv=rvR.data;if(!rv)return requestRoute();
 const edu=discoveryDefaults(rv);
 const opts=edu.options;
 const correct=edu.correct;
 const answered=Number.isInteger(a.quiz_choice)&&a.done===true;
 const ok=answered&&Number(a.quiz_choice)===correct;
 document.getElementById("app").innerHTML=`<header><div class=logo>🍷 <span>BLIND WINE</span></div><span class=pill>🎓 BILAN</span></header>
 <div class="card hero"><div class=emoji>${ICON[w.type]}</div><h1>${esc(rv.name)}</h1><p>${esc(regionLabel(rv.region))} · ${esc((rv.grapes||[]).join(" / "))}</p></div>
 ${edu.learning_note?`<div class=card><h2>💡 À retenir</h2><p>${esc(edu.learning_note)}</p></div>`:""}
 ${prevA?`<div class=card><h2>⚖️ Mets ce vin en perspective</h2>${discoveryComparisonHtml(a,prevA,rv)}<h3 style="margin-top:16px">Et le groupe ?</h3>${discoveryComparisonDistributionHtml(groupR.data||[],rv)}</div>`:''}
 <div class=card><h2>${!answered?"⏱️ Réponse non validée":ok?"✅ Bien vu":"🧠 Correction"}</h2><p><b>${esc(edu.question)}</b></p>${answered?`<p>Bonne réponse : <b>${esc(opts[correct]||"—")}</b></p>`:`<p class=muted>Tu n’avais pas terminé ce verre avant la révélation.</p>`}<div class=notice>${esc(edu.explanation)}</div></div>
 <div class=card><p class=muted>L’organisateur lancera le prochain vin.</p></div>`;
}

