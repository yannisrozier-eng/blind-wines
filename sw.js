const CACHE="blind-wine-v364-discovery-learning-goals";
const SHELL=["./","./index.html","./config.js","./manifest.webmanifest","./styles.css","./favicon-32.png","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./og-preview.jpg","./js/core.js","./js/auth.js","./js/game.js","./js/discovery.js","./js/challenge.js","./js/player.js","./js/reveal.js","./js/host.js","./js/history.js","./js/main.js"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;if(req.method!=="GET")return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).catch(()=>caches.match("./index.html")));
    return;
  }
  // config.js doit pouvoir être mis à jour sans rester bloqué par un ancien cache.
  if(url.pathname.endsWith("/config.js")){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  if(["style","script","image","font","manifest"].includes(req.destination)){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res;
    })));
  }
});
