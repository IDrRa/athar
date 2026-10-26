/* ===== «المصحف بدون إنترنت»: saves every mushaf page (its layout file and page fonts) and the Muyassar tafsir («المعنى»)
   into the mushaf cache. The service worker answers /mushaf/ and /tafsir/ from that cache, and keeps it across site updates.
   The download runs from this page; leaving it pauses, and «متابعة التحميل» fetches only what is still missing. ===== */
var OFF_C='athar-mushaf-2',OFF={have:null,run:false,stop:false,err:false,del:0};
MRI.offline='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10.5m-4-4 4 4 4-4M5 15.5v3A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-3"/></svg>';
function offU(p){return new URL(p,location.href).href}
/* page p needs its layout file and its page font; the fonts go with the first page that uses them, so pages count as they become readable */
function offPages(){var L=[],seen={};for(var p=1;p<=604;p++){var i=mfi(p),f=[offU('mushaf/q4/l/'+mpad(p)+'.json')];if(!seen[i]){seen[i]=1;f.push(offFont(i))}L.push(f)}return L}
function offTaf(){var L=[];for(var n=1;n<=114;n++)L.push(offU('tafsir/muyassar/'+n+'.json'));return L}
function offCan(){return 'caches' in window&&'fetch' in window}
function offFont(i){return offU('mushaf/q4/QCF4_Hafs_'+('0'+i).slice(-2)+'_W.woff2')}
/* a page counts once its layout file and its page font are both saved */
function offCount(){var h=OFF.have||{},pg=0,tf=0;for(var p=1;p<=604;p++)if(h[offU('mushaf/q4/l/'+mpad(p)+'.json')]&&h[offFont(mfi(p))])pg++;
 offTaf().forEach(function(u){if(h[u])tf++});var all=pg===604&&tf===114;for(var i=1;all&&i<=47;i++)all=!!h[offFont(i)];return {pg:pg,tf:tf,done:all}}
function offScan(){if(!offCan())return Promise.resolve();return caches.open(OFF_C).then(function(c){return c.keys()}).then(function(ks){var h={};ks.forEach(function(r){h[r.url]=1});OFF.have=h;var n=offCount();qset('athar-off',n.done?'done':n.pg?'part':'')}).catch(function(){OFF.have={}})}
function offSub(){var s=qget('athar-off','');return s==='done'?'محفوظ على جهازك':s==='part'?'حُفظ جزء منه، تابع التحميل':'احفظه ليفتح دون اتصال'}
function vOffline(){var h=head('المصحف بدون إنترنت','احفظ المصحف كاملًا على جهازك، فيفتح دون اتصال','/about');
 if(!offCan())return h+'<section class="card pt-card"><p>متصفحك لا يدعم حفظ المصحف على الجهاز. جرّب متصفحًا أحدث.</p></section>';
 setTimeout(function(){if(OFF.have&&!OFF.run)offDraw();offScan().then(offDraw)},0);
 return h+'<section class="card pt-card off-c" id="offc" aria-live="polite"><p class="kmmut">جارٍ التحقق مما حُفظ على جهازك…</p></section>'
  +(typeof ntIOS==='function'&&ntIOS()&&!ntApp()?'<p class="kmmut pt-note">في الآيفون يبقى المصحف محفوظًا بثبات إذا فتحت أثر من أيقونته على الشاشة الرئيسية. <a href="#/install">طريقة التثبيت</a></p>':'')}
function offDraw(){var el=document.getElementById('offc');if(!el||!OFF.have)return;var n=offCount(),lines='<p class="off-n"><span>صفحات المصحف</span><b>'+ar(n.pg)+' من ٦٠٤</b></p><p class="off-n"><span>«المعنى» من التفسير الميسر</span><b>'+ar(n.tf)+' من ١١٤ سورة</b></p>';
 if(OFF.run){el.innerHTML='<p><b>جارٍ الحفظ…</b></p>'+lines+'<p class="kmmut">أبقِ هذه الصفحة مفتوحة حتى ينتهي الحفظ.</p><button class="btn" data-off="stop">إيقاف</button>';return}
 if(n.done){el.innerHTML='<p><b>المصحف محفوظ كاملًا على جهازك.</b></p><p class="kmmut">يفتح المصحف و«المعنى» دون اتصال بالإنترنت.</p>'+lines+'<button class="btn" data-off="del">'+(OFF.del>Date.now()?'اضغط مرة أخرى لتأكيد الحذف':'حذف النسخة المحفوظة')+'</button>';return}
 el.innerHTML=(n.pg||n.tf?'<p><b>حُفظ جزء من المصحف.</b></p>':'<p><b>لم يُحفظ المصحف على جهازك بعد.</b></p>')+'<p class="kmmut">يُحفظ المصحف بصفحاته كلها، ومعه «المعنى» من التفسير الميسر. الحجم نحو ٤٠ ميغابايت، فالأفضل تحميله على واي فاي.</p>'+lines
  +(OFF.err?'<p class="kmmut">توقف الحفظ لانقطاع الاتصال. تابِع حين يعود الإنترنت.</p>':'')+'<button class="btn primary" data-off="go">'+(n.pg||n.tf?'متابعة التحميل':'تحميل المصحف')+'</button>'}
function offRun(){if(OFF.run||!OFF.have)return;if(!navigator.onLine){kmTo('لا يوجد اتصال، حاول لاحقًا');return}
 var q=[];offPages().forEach(function(f){f.forEach(function(u){if(!OFF.have[u])q.push(u)})});offTaf().forEach(function(u){if(!OFF.have[u])q.push(u)});if(!q.length){offScan().then(offDraw);return}
 OFF.run=true;OFF.stop=false;OFF.err=false;offDraw();try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(function(){})}catch(e){}
 var t=0,drawn=0;function tick(){var now=Date.now();if(now-drawn>400){drawn=now;offDraw()}}
 caches.open(OFF_C).then(function(c){
  function one(u,tries){return fetch(u).then(function(r){if(!r.ok)throw r.status;return c.put(new Request(u),r)}).then(function(){OFF.have[u]=1;tick()},function(e){if(tries<2&&!OFF.stop)return new Promise(function(ok){setTimeout(ok,800)}).then(function(){return one(u,tries+1)});throw e})}
  function worker(){if(OFF.stop||OFF.err||t>=q.length)return Promise.resolve();var u=q[t++];return one(u,0).then(worker)}
  return Promise.all([worker(),worker(),worker(),worker()])})
 .catch(function(e){OFF.err=true;if(e&&e.name==='QuotaExceededError')kmTo('لا توجد مساحة كافية على الجهاز')})
 .then(function(){var stopped=OFF.stop;OFF.run=false;return offScan().then(function(){offDraw();var n=offCount();if(n.done)kmTo('حُفظ المصحف كاملًا على جهازك');else if(!stopped&&OFF.err&&navigator.onLine)kmTo('تعذّر حفظ بعض الصفحات، تابع التحميل')})})}
document.addEventListener('click',function(e){var b=e.target.closest('button[data-off]');if(!b)return;var a=b.dataset.off;
 if(a==='go')offRun();
 else if(a==='stop'){OFF.stop=true;b.disabled=true}
 else if(a==='del'){if(OFF.del<Date.now()){OFF.del=Date.now()+4000;offDraw();setTimeout(offDraw,4100);return}OFF.del=0;b.disabled=true;
  caches.delete(OFF_C).catch(function(){}).then(function(){OFF.have={};qset('athar-off','');offDraw();kmTo('حُذفت النسخة المحفوظة')})}});
/* leaving the page while saving pauses the download; what was saved stays */
window.addEventListener('hashchange',function(){if(OFF.run&&location.hash!=='#/offline')OFF.stop=true});
