/* ---- adhkar reminders (Web Push) ---- */
MRI.bell='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>';
var NT_P=[['f','fajr','الفجر'],['d','dhuhr','الظهر'],['a','asr','العصر'],['m','maghrib','المغرب'],['i','isha','العشاء']];
function ntSt(){var o=qget('athar-push',null);o=o&&typeof o==='object'?o:{m:'06:30',e:'16:30',mo:true,eo:true,on:false};if(typeof o.pr!=='string')o.pr='';return o}
function ntCan(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function ntIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function ntApp(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
function ntSub(){var o=ntSt();if(!o.on)return 'أوقات الصلاة وأذكار الصباح والمساء';var a=[];if(o.pr)a.push(o.pr.length===5?'الصلوات الخمس':NT_P.filter(function(x){return o.pr.indexOf(x[0])>-1}).map(function(x){return x[2]}).join('، '));if(o.mo)a.push('الصباح '+ntFmt(o.m));if(o.eo)a.push('المساء '+ntFmt(o.e));return a.join(' · ')}
function ntFmt(t){var h=+t.slice(0,2),m=t.slice(3),pm=h>=12,h12=h%12||12;return ar(h12+':'+m)+(pm?' م':' ص')}
function ntOpts(a,b,sel){var o='';for(var h=a;h<b;h++)for(var m=0;m<60;m+=15){var v=('0'+h).slice(-2)+':'+('0'+m).slice(-2);o+='<option value="'+v+'"'+(v===sel?' selected':'')+'>'+ntFmt(v)+'</option>'}return o}
function vNotify(){var o=ntSt(),L=ptLoc(),h=head('التنبيهات','تنبيه على جوالك عند دخول وقت الصلاة وفي وقت أذكار الصباح والمساء','/about');
 if(ntIOS()&&!ntApp())return h+'<section class="card pt-card in-need"><p><b>التنبيهات تعمل من تطبيق أثر، لا من المتصفح.</b></p><p class="kmmut">في الآيفون لا تصل تنبيهات الأذان والأذكار إلا إذا ثبّتّ أثر على شاشتك الرئيسية وفتحته من أيقونته. يستغرق ذلك أقل من دقيقة، ثم ترجع إلى هذه الصفحة من داخل التطبيق.</p><a class="btn primary nt-go" href="#/install">'+MRI.install+'طريقة التثبيت خطوة بخطوة</a></section>';
 if(!ntCan())return h+'<section class="card pt-card"><p>متصفحك لا يدعم التنبيهات. جرّب متصفحًا أحدث.</p></section>';
 if(Notification.permission==='denied')h+='<p class="card pt-card">التنبيهات محظورة لهذا الموقع في إعدادات جهازك. فعّلها من الإعدادات ثم ارجع هنا.</p>';
 return h+'<form class="card nt-f" id="ntf"><h3 class="nt-h">الأذان</h3>'+(L?'<div class="nt-p" role="group" aria-label="الصلوات">'+NT_P.map(function(x){return '<label><input type="checkbox" name="ntp" value="'+x[0]+'"'+(o.pr.indexOf(x[0])>-1?' checked':'')+'><span>'+x[2]+'</span></label>'}).join('')+'</div><p class="kmmut nt-loc">حسب '+(L.name||'موقعك الحالي')+' · <a href="#/prayer">تغيير</a></p>':'<p class="kmmut">لتنبيهات الأذان اختر موقعك أولًا من <a href="#/prayer">مواقيت الصلاة</a>.</p>')+'<h3 class="nt-h">الأذكار</h3><label class="nt-r"><input type="checkbox" id="ntmo"'+(o.mo?' checked':'')+'><span><b>أذكار الصباح</b></span><select id="ntm" aria-label="وقت أذكار الصباح">'+ntOpts(3,12,o.m)+'</select></label>'
 +'<label class="nt-r"><input type="checkbox" id="nteo"'+(o.eo?' checked':'')+'><span><b>أذكار المساء</b></span><select id="nte" aria-label="وقت أذكار المساء">'+ntOpts(12,24,o.e)+'</select></label>'
 +'<button class="btn primary rp-b" type="submit" id="ntb">'+(o.on?'حفظ الأوقات':'تفعيل التنبيهات')+'</button></form>'
 +(o.on?'<div class="ms-a"><button class="btn" data-push="test">إرسال تنبيه تجريبي</button><button class="btn" data-push="off">إيقاف التنبيهات</button></div>':'')
 +'<p class="kmmut pt-note">قد يتأخر التنبيه دقائق عن الوقت المختار.</p>'}
function ntKey(s){s=s.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);var r=atob(s),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
function ntPost(path,o){return fetch('/api/push/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})})}
function ntGetSub(create){return navigator.serviceWorker.ready.then(function(reg){return reg.pushManager.getSubscription().then(function(s){if(s||!create)return s;
 return fetch('/api/push/key').then(function(r){return r.json()}).then(function(j){if(!j.key)throw 'key';return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ntKey(j.key)})})})})}
function ntSched(){var o=ntSt();if(!o.on||!('caches' in window))return;var L=ptLoc(),ev=[],now=new Date();
 for(var i=0;i<8;i++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
  if(o.mo)ev.push([new Date(d.getFullYear(),d.getMonth(),d.getDate(),+o.m.slice(0,2),+o.m.slice(3)).getTime(),'m']);
  if(o.eo)ev.push([new Date(d.getFullYear(),d.getMonth(),d.getDate(),+o.e.slice(0,2),+o.e.slice(3)).getTime(),'e']);
  if(L&&o.pr){var P=ptDay(d.getFullYear(),d.getMonth()+1,d.getDate(),L.lat,L.lng,ptRamadan(d,ptTz(L)));NT_P.forEach(function(x){if(o.pr.indexOf(x[0])>-1&&P[x[1]])ev.push([P[x[1]].getTime(),x[1]])})}}
 caches.open('athar_meta').then(function(c){return c.put('sched.json',new Response(JSON.stringify({at:Date.now(),ev:ev}),{headers:{'Content-Type':'application/json'}}))}).catch(function(){})}
try{setTimeout(ntSched,1500)}catch(e){}
function ntTz(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return 'Asia/Riyadh'}}
document.addEventListener('submit',function(e){if(e.target.id!=='ntf')return;e.preventDefault();
 var o={m:document.getElementById('ntm').value,e:document.getElementById('nte').value,mo:document.getElementById('ntmo').checked,eo:document.getElementById('nteo').checked,on:true,pr:[].map.call(document.querySelectorAll('input[name=ntp]:checked'),function(x){return x.value}).join('')},b=document.getElementById('ntb'),L=ptLoc();
 if(!L)o.pr='';if(!o.mo&&!o.eo&&!o.pr){kmTo('اختر صلاة أو ذكرًا واحدًا على الأقل');return}
 if(!navigator.onLine){kmTo('لا يوجد اتصال، حاول لاحقًا');return}
 b.disabled=true;b.textContent='جارٍ التفعيل…';
 Notification.requestPermission().then(function(p){if(p!=='granted')throw 'perm';return ntGetSub(true)})
 .then(function(s){return ntPost('sub',{endpoint:s.endpoint,tz:ntTz(),m:o.mo?o.m:null,e:o.eo?o.e:null,pr:o.pr,lat:L?L.lat:null,lng:L?L.lng:null})})
 .then(function(j){if(!j.ok)throw 'srv';qset('athar-push',o);ntSched();kmTo('فُعّلت التنبيهات، بارك الله فيك');route()})
 .catch(function(x){b.disabled=false;b.textContent='تفعيل التنبيهات';kmTo(x==='perm'?'لم يُسمح بالتنبيهات':'تعذّر التفعيل، حاول مرة أخرى')})});
document.addEventListener('click',function(e){var b=e.target.closest('button[data-push]');if(!b)return;var a=b.dataset.push;if(a!=='test'&&a!=='off')return;b.disabled=true;
 ntGetSub(false).then(function(s){if(!s){if(a==='off'){var o=ntSt();o.on=false;qset('athar-push',o);route();return}throw 'nosub'}
  if(a==='test')return ntPost('test',{endpoint:s.endpoint}).then(function(j){b.disabled=false;kmTo(j.ok?'أُرسل تنبيه تجريبي، سيصلك خلال لحظات':j.status===429?'جرّبت كثيرًا، حاول بعد قليل':'تعذّر الإرسال')});
  return ntPost('sub',{endpoint:s.endpoint,action:'del'}).then(function(){return s.unsubscribe()}).then(function(){var o=ntSt();o.on=false;qset('athar-push',o);kmTo('أُوقفت التنبيهات');route()})})
 .catch(function(){b.disabled=false;kmTo('تعذّر التنفيذ، حاول مرة أخرى')})});
