/* Blind Wine — Application bootstrap, DOM observers, connectivity and PWA registration. */
'use strict';

const pickerObserver=new MutationObserver(()=>bindSearchablePickers(document));
pickerObserver.observe(document.getElementById("app"),{childList:true,subtree:true});

function updateNetworkBanner(){
 const b=document.getElementById("netBanner");
 if(b)b.classList.toggle("show",!navigator.onLine);
}
window.addEventListener("online",updateNetworkBanner);
window.addEventListener("offline",updateNetworkBanner);
setTimeout(updateNetworkBanner,0);

if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

boot();
