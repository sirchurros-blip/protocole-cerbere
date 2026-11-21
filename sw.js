// Protocole Cerbère : fonctionnement hors ligne
const CACHE='cerbere-v96';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('cerbere-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // polices Google : mises en cache au premier lancement en ligne
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;}));return;}
  if(u.origin!==location.origin)return;
  // le jeu : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
});
