/* أثر — service worker. Caches the app shell as-is (content is embedded in index.html, so offline = the exact bytes last fetched online).
   Navigations to the app (/ or index.html): network first; other pages (surah/ adhkar/ dua/ for search engines) come from the network and are never stored as the app.
   Navigations: network first (fresh content when online), cached copy when offline. Static files: cache first. Cache name changes whenever any file changes. */
const VERSION='d2fd077faaad',CACHE='athar-'+VERSION,SHELL=["./", "manifest.webmanifest", "pwa.js", "fonts.css", "fonts/hafs.18.woff2", "fonts/amiri-quran-arabic-400-normal.woff2", "fonts/amiri-quran-latin-400-normal.woff2", "fonts/amiri-arabic-400-normal.woff2", "fonts/amiri-arabic-700-normal.woff2", "fonts/amiri-latin-400-normal.woff2", "fonts/amiri-latin-700-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2", "fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-400-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-500-normal.woff2", "fonts/ibm-plex-sans-arabic-latin-600-normal.woff2", "icons/favicon-m4.svg", "icons/icon-192-m4.png", "icons/icon-512-m4.png", "icons/maskable-512-m4.png", "icons/apple-touch-icon-m4.png"];
/* The app page is cached under the site root (./), never under index.html: Cloudflare answers /index.html with a redirect to /,
   and Safari refuses to open a page from a cached redirected response ("Response served by service worker has redirections") — the app then failed offline. */
const APP=new URL('./',self.registration.scope).href;
const appShell=()=>caches.match(APP).then(m=>!m?Response.error():!m.redirected?m:m.blob().then(b=>new Response(b,{status:m.status,statusText:m.statusText,headers:m.headers})));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
/* mushaf pages, page fonts and tafsir: kept across site updates (also filled by «المصحف بدون إنترنت»); change the name only when those files change */
const MCACHE='athar-mushaf-2';
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('athar-')&&k!==CACHE&&k!==MCACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.indexOf('/api/')>-1)return;
 if(r.mode==='navigate'&&!/^\/(|index\.html)$/.test(u.pathname.slice(self.registration.scope.length-location.origin.length-1))){e.respondWith(fetch(r).catch(appShell));return}
 if(r.mode==='navigate'){e.respondWith(new Promise(res=>{let done=false;const fb=appShell;
  const t=setTimeout(()=>{if(!done){done=true;fb().then(res)}},4000);
  fetch(r).then(n=>{if(done)return;done=true;clearTimeout(t);if(n&&n.ok){const c=n.clone();caches.open(CACHE).then(ch=>ch.put(APP,c))}res(n)}).catch(()=>{if(done)return;done=true;clearTimeout(t);fb().then(res)})}));return}
 if(u.pathname.indexOf('/mushaf/')>-1||u.pathname.indexOf('/tafsir/')>-1){e.respondWith(caches.open(MCACHE).then(ch=>ch.match(r,{ignoreVary:true}).then(m=>m||fetch(r).then(n=>{if(n&&n.ok)ch.put(r,n.clone());return n}))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{if(n&&n.ok){const c=n.clone();caches.open(CACHE).then(ch=>ch.put(r,c))}return n})))});

/* Reminders: pushes carry no payload. The page stores the coming week's schedule (adhkar and prayer times)
   in the "athar_meta" cache; the reminder nearest to now decides the text. Without it, the hour decides. */
/* تنبيه الأذان يفتح «أذكار الأذان» (ما يقال عند سماعه والدعاء بعده) */
const PNAME={fajr:'الفجر',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
/* A أذكار بعد الصلاة · J آخر ساعة من الجمعة · R قبل الإفطار · S السحور (رمضان) */
/* sunnah reminders: k الكهف يوم الجمعة · n/t مساء ما قبل الاثنين/الخميس · b مساء ما قبل الأيام البيض · N/T both on the same evening */
const SNAME={k:['سورة الكهف','تذكير بقراءة سورة الكهف يوم الجمعة','./#/quran/18'],n:['صيام الاثنين','تذكير: غدًا يوم الاثنين','./'],t:['صيام الخميس','تذكير: غدًا يوم الخميس','./'],
 b:['الأيام البيض','تذكير: تبدأ غدًا الأيام البيض (١٣ و١٤ و١٥)','./'],
 A:['أذكار بعد الصلاة','حان وقت أذكار ما بعد الصلاة','./#/adhkar/prayer/dhikr-hisn-025-01'],J:['آخر ساعة من يوم الجمعة','تذكير بالدعاء في آخر ساعة من يوم الجمعة','./#/dua'],R:['الإفطار','اقترب وقت الإفطار','./#/dua/dua-hisn-069-01'],S:['السحور','اقترب وقت السحور','./'],N:['صيام الاثنين والأيام البيض','تذكير: غدًا الاثنين، وأول الأيام البيض','./'],T:['صيام الخميس والأيام البيض','تذكير: غدًا الخميس، وأول الأيام البيض','./']};
function pick(){return caches.open('athar_meta').then(c=>Promise.all([c.match('sched.json').then(r=>r?r.json():null).catch(()=>null),c.match('shown.json').then(r=>r?r.json():[]).catch(()=>[])]).then(([j,shown])=>{
 const now=Date.now();let best=null;
 if(j&&Array.isArray(j.ev))for(const [ts,k] of j.ev){const id=ts+k,d=now-ts;if(shown.indexOf(id)>-1||d<-120000||d>3000000)continue;const pr=k.length>1;
  if(!best||(pr&&!best.pr&&Math.abs(d)<=Math.abs(best.d)+60000)||(pr===best.pr&&Math.abs(d)<Math.abs(best.d)))best={d,k,id,pr}}
 if(best){shown.push(best.id);c.put('shown.json',new Response(JSON.stringify(shown.slice(-30)))).catch(()=>{})}
 if(best&&PNAME[best.k])return {t:'صلاة '+PNAME[best.k],b:'حان الآن وقت صلاة '+PNAME[best.k],u:'./#/adhkar/prayer/dhikr-hisn-015-01',tag:'athar-prayer'};
 if(best&&SNAME[best.k]){const s=SNAME[best.k];return {t:s[0],b:s[1],u:s[2],tag:'athar-sunan'}}
 const m=best?best.k==='m':new Date().getHours()<12;return {t:m?'أذكار الصباح':'أذكار المساء',b:m?'حان وقت أذكار الصباح، افتحها الآن':'حان وقت أذكار المساء، افتحها الآن',u:'./#/adhkar/'+(m?'morning':'evening'),tag:'athar-adhkar'}})).catch(()=>({t:'أثر',b:'حان وقت الذكر',u:'./',tag:'athar'}))}
self.addEventListener('push',e=>{e.waitUntil(pick().then(n=>self.registration.showNotification(n.t,{body:n.b,icon:'icons/icon-192-m4.png',tag:n.tag,renotify:true,lang:'ar',dir:'rtl',data:{url:n.u}})))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){if('navigate' in c)c.navigate(u).catch(()=>{});return c.focus()}}return clients.openWindow(u)}))});
