const VERSION = 'form-dev';
const SCOPE=new URL(self.registration.scope),PREFIX='form-workouts:'+SCOPE.pathname+':',CACHE=PREFIX+VERSION;
const FILES=['./','./index.html','./manifest.webmanifest','./workout/styles.css','./workout/config.js','./workout/core.mjs','./workout/store.mjs','./workout/cloud.mjs','./workout/app.mjs','./workout/icon.svg','./workout/icon-192.png','./workout/icon-512.png'];
const ASSETS=new Set(FILES.map(f=>new URL(f,SCOPE).href));
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES.map(file=>new Request(new URL(file,SCOPE),{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>(key.startsWith(PREFIX)||key.startsWith('bazi-planner:'+SCOPE.pathname+':'))&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),shell=url.origin===SCOPE.origin&&ASSETS.has(url.origin+url.pathname),sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/12.19.0/')&&url.pathname.endsWith('.js');
 if(!shell&&!sdk)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=shell?url.origin+url.pathname:event.request,networkFirst=event.request.mode==='navigate'||url.pathname.endsWith('/config.js');if(!networkFirst){const cached=await cache.match(key);if(cached)return cached;}try{const response=await fetch(event.request);if(response.ok&&response.type!=='opaque')await cache.put(key,response.clone());return response;}catch(error){const cached=await cache.match(key);if(cached)return cached;throw error;}})());
});
