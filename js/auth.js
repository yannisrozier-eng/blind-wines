/* Blind Wine — Authentication and profile identity lifecycle. */
'use strict';

async function boot(){
 document.body.dataset.screen="auth";updateGlobalHomeButton();
 if(!CONFIG.url||!CONFIG.key||CONFIG.url.includes("COLLE_TA_")||CONFIG.key.includes("COLLE_TA_")){
   document.getElementById("app").innerHTML=`<div class="card hero"><h1>Configuration requise</h1><p>Ajoute ta Publishable Key Supabase dans <b>config.js</b>.</p></div>`;
   return;
 }
 if(!window.supabase?.createClient){
   document.getElementById("app").innerHTML=`<div class="card hero"><h1>Chargement impossible</h1><p>Le SDK Supabase n’a pas pu être chargé. Vérifie ta connexion puis recharge la page.</p></div>`;
   return;
 }
 supabaseClient=window.supabase.createClient(CONFIG.url,CONFIG.key);
 const {data,error}=await supabaseClient.auth.getSession();
 if(error)return toast(error.message);
 user=data.session?.user||null;

 supabaseClient.auth.onAuthStateChange((event,session)=>{
   const previousId=user?.id||null;
   user=session?.user||null;
   if(event==="SIGNED_OUT"){
     profile=null;game=null;role=null;player=null;wineCache=null;answerCache.clear();clearSession();
     return authScreen();
   }
   if((event==="SIGNED_IN"||event==="USER_UPDATED") && user && (previousId!==user.id||!profile)){
     setTimeout(()=>resumeAuthenticatedUser(),0);
   }
 });

 if(!user)return authScreen();
 await resumeAuthenticatedUser();
}

async function resumeAuthenticatedUser(){
 if(!user)return authScreen();
 if(user.is_anonymous)return legacyAnonymousScreen();
 await ensureProfile();
 if(!profile)return;
 if(!(await restoreSession()))home();
}

async function ensureProfile(){
 if(!user)return null;
 const r=await supabaseClient.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(r.error)return toast(r.error.message);
 if(!r.data){
   const fallback=(user.user_metadata?.display_name||user.email?.split("@")[0]||"Joueur").slice(0,30);
   const ins=await supabaseClient.from("profiles").upsert({id:user.id,display_name:fallback}).select().single();
   if(ins.error)return toast(ins.error.message);
   profile=ins.data;
 }else profile=r.data;
 return profile;
}

function authScreen(message=""){
 document.body.dataset.screen="auth";updateGlobalHomeButton();
 clearSession();
 document.getElementById("app").innerHTML=`<div class="auth-shell">
 <div class="card hero">
  <div class=auth-mark>🍷</div>
  <span class=pill>BLIND WINE</span>
  <h1>Ton compte dégustateur</h1>
  <p class=muted>Connecte-toi par email pour garder ton historique, tes scores et tes statistiques sur tous tes appareils.</p>
  ${message?`<div class=notice>${esc(message)}</div>`:""}
  <div style="text-align:left;max-width:430px;margin:24px auto 0">
   <label>Prénom / pseudo</label>
   <input id=authName maxlength=30 autocomplete=name placeholder="Yannis">
   <label>Email</label>
   <input id=authEmail type=email autocomplete=email inputmode=email placeholder="toi@email.com">
   <button type="button" class=btn style="width:100%;margin-top:12px" onclick="sendMagicLink()">Recevoir mon lien de connexion</button>
  </div>
  <p class="small muted" style="margin-top:16px">Pas de mot de passe : tu reçois un lien sécurisé par email.</p>
 </div></div>`;
}

async function sendMagicLink(){
 const email=document.getElementById("authEmail")?.value.trim().toLowerCase();
 const displayName=document.getElementById("authName")?.value.trim();
 if(!email||!email.includes("@"))return toast("Entre une adresse email valide.");
 if(!displayName)return toast("Entre ton prénom ou ton pseudo.");
 const gameParam=new URLSearchParams(location.search).get("game");
 const redirect=location.origin+location.pathname+(gameParam?`?game=${encodeURIComponent(gameParam)}`:"");
 const r=await supabaseClient.auth.signInWithOtp({
   email,
   options:{emailRedirectTo:redirect,shouldCreateUser:true,data:{display_name:displayName}}
 });
 if(r.error)return toast(r.error.message);
 authScreen(`Lien envoyé à ${email}. Ouvre-le sur ce téléphone ou sur un autre appareil.`);
}

function legacyAnonymousScreen(){
 document.body.dataset.screen="auth";updateGlobalHomeButton();
 document.getElementById("app").innerHTML=`<div class="auth-shell"><div class="card hero">
  <div class=auth-mark>🍷</div><h1>Transforme ton ancien profil</h1>
  <p class=muted>Ce téléphone utilise encore l’ancien mode invité. Tu peux le convertir en compte email pour conserver l’identité associée à tes anciennes dégustations.</p>
  <div style="text-align:left;max-width:430px;margin:24px auto 0">
   <label>Prénom / pseudo</label><input id=legacyName maxlength=30 placeholder="Yannis">
   <label>Email</label><input id=legacyEmail type=email inputmode=email placeholder="toi@email.com">
   <button type="button" class=btn style="width:100%;margin-top:12px" onclick="upgradeAnonymous()">Convertir mon profil</button>
   <button type="button" class="btn secondary" style="width:100%;margin-top:8px" onclick="discardAnonymous()">Créer un nouveau compte à la place</button>
  </div>
 </div></div>`;
}

async function upgradeAnonymous(){
 const email=document.getElementById("legacyEmail")?.value.trim().toLowerCase();
 const name=document.getElementById("legacyName")?.value.trim();
 if(!email||!email.includes("@")||!name)return toast("Prénom et email requis.");
 const r=await supabaseClient.auth.updateUser({email,data:{display_name:name}});
 if(r.error)return toast(r.error.message);
 toast("Vérifie ton email et confirme l’adresse. Ton ancien identifiant sera conservé si la confirmation aboutit.");
}

async function discardAnonymous(){
 await supabaseClient.auth.signOut();
 profile=null;clearSession();authScreen();
}

async function logout(){
 await supabaseClient.auth.signOut();
}

async function saveProfile(){
 const name=document.getElementById("profileDisplayName")?.value.trim();
 if(!name)return toast("Le prénom/pseudo est requis.");
 const r=await supabaseClient.from("profiles").update({display_name:name,updated_at:new Date().toISOString()}).eq("id",user.id).select().single();
 if(r.error)return toast(r.error.message);
 profile=r.data;toast("Profil enregistré.");renderProfile();
}

