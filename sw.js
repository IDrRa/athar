/* أثر — service worker. Caches the app shell as-is (content is embedded in index.html, so offline = the exact bytes last fetched online).
   Navigations: network first (fresh content when online), cached copy when offline. Static files: cache first. Cache name changes whenever any file changes. */
const VERSION='ff907b915eca',CACHE='athar-'+VERSION,SHELL=["./", "index.html", "manifest.webmanifest", "pwa.js", "fonts.css", "fonts/hafs.18.woff2", "fonts/amiri-quran-arabic-400-normal.woff2", "fonts/amiri-quran-latin-400-normal.woff2", "fonts/amiri-arabic-400-normal.woff2", "fonts/amiri-arabic-700-normal.woff2", "fonts/amiri-latin-400-normal.woff2", "fonts/amiri-latin-700-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-400-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-500-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-600-normal.woff2", "icons/favicon-m4.svg", "icons/icon-192-m4.png", "icons/icon-512-m4.png", "icons/maskable-512-m4.png", "icons/apple-touch-icon-m4.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
const MCACHE='athar-mushaf-1';
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('athar-')&&k!==CACHE&&k!==MCACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.indexOf('/api/')>-1)return;
 if(r.mode==='navigate'){e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match('index.html').then(m=>m||Response.error());
  const t=setTimeout(()=>{if(!done){done=true;fb().then(res)}},4000);
  fetch(r).then(n=>{if(done)return;done=true;clearTimeout(t);if(n&&n.ok){const c=n.clone();caches.open(CACHE).then(ch=>ch.put('index.html',c))}res(n)}).catch(()=>{if(done)return;done=true;clearTimeout(t);fb().then(res)})}));return}
 if(u.pathname.indexOf('/mushaf/')>-1){e.respondWith(caches.open(MCACHE).then(ch=>ch.match(r).then(m=>m||fetch(r).then(n=>{if(n&&n.ok)ch.put(r,n.clone());return n}))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{if(n&&n.ok){const c=n.clone();caches.open(CACHE).then(ch=>ch.put(r,c))}return n})))});

/* Adhkar reminders: pushes carry no payload; the text is chosen here from the device's local time. */
self.addEventListener('push',e=>{const m=new Date().getHours()<12;
 e.waitUntil(self.registration.showNotification(m?'أذكار الصباح':'أذكار المساء',{body:m?'حان وقت أذكار الصباح، افتحها الآن':'حان وقت أذكار المساء، افتحها الآن',icon:'icons/icon-192-m4.png',tag:'athar-adhkar',renotify:true,lang:'ar',dir:'rtl',data:{url:'./#/adhkar/'+(m?'morning':'evening')}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){if('navigate' in c)c.navigate(u).catch(()=>{});return c.focus()}}return clients.openWindow(u)}))});
