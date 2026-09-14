const CACHE="blind-wine-v360-brand-assets";
const SHELL=["./","./index.html","./config.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./favicon-32.png","./og-preview.jpg"];
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
  if(["style","script","image","font","manifest"].includes(req.destination)){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res;
    })));
  }
});
