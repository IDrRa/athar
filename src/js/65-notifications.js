/* ---- adhkar reminders (Web Push) ---- */
MRI.bell='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>';
var NT_P=[['f','fajr','الفجر'],['d','dhuhr','الظهر'],['a','asr','العصر'],['m','maghrib','المغرب'],['i','isha','العشاء']];
function ntSt(){var o=qget('athar-push',null);o=o&&typeof o==='object'?o:{m:'06:30',e:'16:30',mo:true,eo:true,on:false};if(typeof o.pr!=='string')o.pr='';if(!ntOkT(o.k))o.k='09:00';if(!ntOkT(o.f))o.f='21:00';if(!ntOkT(o.b))o.b='21:00';o.ko=!!o.ko;o.fo=!!o.fo;o.bo=!!o.bo;o.ao=!!o.ao;o.jo=!!o.jo;o.ro=!!o.ro;o.so=!!o.so;
 o.ap=ntOkM(o.ap,5,60)?o.ap:15;o.ri=ntOkM(o.ri,0,60)?o.ri:10;o.rs=ntOkM(o.rs,10,120)?o.rs:45;return o}
function ntOkM(x,a,b){return typeof x==='number'&&x%1===0&&x>=a&&x<=b}
/* قائمة دقائق: [[القيمة، النص]] */
function ntMins(L,sel,fmt){return L.map(function(v){return '<option value="'+v+'"'+(v===sel?' selected':'')+'>'+fmt(v)+'</option>'}).join('')}
function ntOkT(t){return typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t)}
function ntCan(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function ntIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function ntApp(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
function ntSub(){var o=ntSt();if(!o.on)return 'أوقات الصلاة وأذكار الصباح والمساء';var a=[];if(o.pr)a.push(o.pr.length===5?'الصلوات الخمس':NT_P.filter(function(x){return o.pr.indexOf(x[0])>-1}).map(function(x){return x[2]}).join('، '));if(o.mo)a.push('الصباح '+ntFmt(o.m));if(o.eo)a.push('المساء '+ntFmt(o.e));if(o.ko)a.push('الكهف');if(o.fo)a.push('صيام الاثنين والخميس');if(o.bo)a.push('الأيام البيض');if(o.ao)a.push('أذكار بعد الصلاة');if(o.jo)a.push('آخر ساعة من الجمعة');if(o.ro||o.so)a.push('رمضان');return a.join(' · ')}
function ntFmt(t){var h=+t.slice(0,2),m=t.slice(3),pm=h>=12,h12=h%12||12;return ar(h12+':'+m)+(pm?' م':' ص')}
function ntOpts(a,b,sel){var o='';for(var h=a;h<b;h++)for(var m=0;m<60;m+=15){var v=('0'+h).slice(-2)+':'+('0'+m).slice(-2);o+='<option value="'+v+'"'+(v===sel?' selected':'')+'>'+ntFmt(v)+'</option>'}return o}
function vNotify(){var o=ntSt(),L=ptLoc(),h=head('التنبيهات','تنبيه على جوالك عند دخول وقت الصلاة، وفي وقت أذكار الصباح والمساء، وتذكير بالسنن','/about');
 if(ntIOS()&&!ntApp())return h+'<section class="card pt-card in-need"><p><b>التنبيهات تعمل من تطبيق أثر، لا من المتصفح.</b></p><p class="kmmut">في الآيفون لا تصل تنبيهات الأذان والأذكار إلا إذا ثبّتّ أثر على شاشتك الرئيسية وفتحته من أيقونته. يستغرق ذلك أقل من دقيقة، ثم ترجع إلى هذه الصفحة من داخل التطبيق.</p><a class="btn primary nt-go" href="#/install">'+MRI.install+'طريقة التثبيت خطوة بخطوة</a></section>';
 if(!ntCan())return h+'<section class="card pt-card"><p>متصفحك لا يدعم التنبيهات. جرّب متصفحًا أحدث.</p></section>';
 if(Notification.permission==='denied')h+='<p class="card pt-card">التنبيهات محظورة لهذا الموقع في إعدادات جهازك. فعّلها من الإعدادات ثم ارجع هنا.</p>';
 return h+'<form class="card nt-f" id="ntf"><h3 class="nt-h">الأذان</h3>'+(L?'<div class="nt-p" role="group" aria-label="الصلوات">'+NT_P.map(function(x){return '<label><input type="checkbox" name="ntp" value="'+x[0]+'"'+(o.pr.indexOf(x[0])>-1?' checked':'')+'><span>'+x[2]+'</span></label>'}).join('')+'</div><p class="kmmut nt-loc">حسب '+(L.name||'موقعك الحالي')+' · <a href="#/prayer">تغيير</a></p>':'<p class="kmmut">لتنبيهات الأذان اختر موقعك أولًا من <a href="#/prayer">مواقيت الصلاة</a>.</p>')+(L?'<label class="nt-r"><input type="checkbox" id="ntao"'+(o.ao?' checked':'')+'><span><b>أذكار بعد الصلاة</b><small>بعد كل أذان من الصلوات الخمس</small></span><select id="ntap" aria-label="بعد الأذان بكم دقيقة">'+ntMins([10,15,20,25,30,40],o.ap,function(v){return 'بعد '+ar(v)+' د'})+'</select></label>':'')+'<h3 class="nt-h">الأذكار</h3><label class="nt-r"><input type="checkbox" id="ntmo"'+(o.mo?' checked':'')+'><span><b>أذكار الصباح</b></span><select id="ntm" aria-label="وقت أذكار الصباح">'+ntOpts(3,12,o.m)+'</select></label>'
 +'<label class="nt-r"><input type="checkbox" id="nteo"'+(o.eo?' checked':'')+'><span><b>أذكار المساء</b></span><select id="nte" aria-label="وقت أذكار المساء">'+ntOpts(12,24,o.e)+'</select></label>'
 +'<h3 class="nt-h">السنن</h3><label class="nt-r"><input type="checkbox" id="ntko"'+(o.ko?' checked':'')+'><span><b>سورة الكهف</b><small>يوم الجمعة</small></span><select id="ntk" aria-label="وقت تذكير سورة الكهف">'+ntOpts(5,17,o.k)+'</select></label>'
 +(L?'<label class="nt-r"><input type="checkbox" id="ntjo"'+(o.jo?' checked':'')+'><span><b>آخر ساعة من يوم الجمعة</b><small>تذكير بالدعاء، قبل المغرب بساعة</small></span></label>':'')
 +'<label class="nt-r"><input type="checkbox" id="ntfo"'+(o.fo?' checked':'')+'><span><b>صيام الاثنين والخميس</b><small>مساء اليوم الذي قبله</small></span><select id="ntfa" aria-label="وقت تذكير صيام الاثنين والخميس">'+ntOpts(16,24,o.f)+'</select></label>'
 +'<label class="nt-r"><input type="checkbox" id="ntbo"'+(o.bo?' checked':'')+'><span><b>الأيام البيض</b><small>مساء اليوم الذي قبلها</small></span><select id="ntba" aria-label="وقت تذكير الأيام البيض">'+ntOpts(16,24,o.b)+'</select></label>'
 +'<p class="kmmut nt-hj">الأيام البيض بحسب تقويم أم القرى. ولا تذكير بصيام في رمضان ولا في العيدين وأيام التشريق.</p>'+(L?'<h3 class="nt-h">رمضان</h3><label class="nt-r"><input type="checkbox" id="ntro"'+(o.ro?' checked':'')+'><span><b>قبل الإفطار</b><small>ويفتح دعاء الإفطار</small></span><select id="ntri" aria-label="قبل المغرب بكم دقيقة">'+ntMins([5,10,15,30],o.ri,function(v){return 'قبل '+ar(v)+' د'})+'</select></label>'+'<label class="nt-r"><input type="checkbox" id="ntso"'+(o.so?' checked':'')+'><span><b>السحور</b><small>قبل أذان الفجر</small></span><select id="ntrs" aria-label="قبل الفجر بكم دقيقة">'+ntMins([30,45,60,90],o.rs,function(v){return 'قبل '+ar(v)+' د'})+'</select></label><p class="kmmut nt-hj">يعملان في شهر رمضان فقط، بحسب تقويم أم القرى ومواقيت موقعك.</p>':'<p class="kmmut nt-hj">لأذكار بعد الصلاة وآخر ساعة من الجمعة وتنبيهات رمضان اختر موقعك من <a href="#/prayer">مواقيت الصلاة</a>.</p>')
 +'<button class="btn primary rp-b" type="submit" id="ntb">'+(o.on?'حفظ الأوقات':'تفعيل التنبيهات')+'</button></form>'
 +(o.on?'<div class="ms-a"><button class="btn" data-push="off">إيقاف التنبيهات</button></div>':'')
 +'<p class="kmmut pt-note">قد يتأخر التنبيه دقائق عن الوقت المختار.</p>'}
function ntKey(s){s=s.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);var r=atob(s),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
function ntPost(path,o){return fetch('/api/push/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})})}
function ntGetSub(create){return navigator.serviceWorker.ready.then(function(reg){return reg.pushManager.getSubscription().then(function(s){if(s||!create)return s;
 return fetch('/api/push/key').then(function(r){return r.json()}).then(function(j){if(!j.key)throw 'key';return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ntKey(j.key)})})})})}
function ntSched(){var o=ntSt();if(!o.on||!('caches' in window))return;var L=ptLoc(),ev=[],now=new Date();
 for(var i=0;i<8;i++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
  if(o.mo)ev.push([new Date(d.getFullYear(),d.getMonth(),d.getDate(),+o.m.slice(0,2),+o.m.slice(3)).getTime(),'m']);
  if(o.eo)ev.push([new Date(d.getFullYear(),d.getMonth(),d.getDate(),+o.e.slice(0,2),+o.e.slice(3)).getTime(),'e']);
  var wd=d.getDay(),th=ocHijri(new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12)),at=function(t){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),+t.slice(0,2),+t.slice(3)).getTime()},fe=o.fo&&(wd===0||wd===3)&&snFast(th),be=o.bo&&snBeed(th);
  if(o.ko&&wd===5)ev.push([at(o.k),'k']);
  if(fe&&be&&o.f===o.b)ev.push([at(o.f),wd===0?'N':'T']);else{if(fe)ev.push([at(o.f),wd===0?'n':'t']);if(be)ev.push([at(o.b),'b'])}
  if(L&&(o.pr||o.ao||o.jo||o.ro||o.so)){var rm=ptRamadan(d,ptTz(L)),P=ptDay(d.getFullYear(),d.getMonth()+1,d.getDate(),L.lat,L.lng,rm);NT_P.forEach(function(x){if(!P[x[1]])return;if(o.pr.indexOf(x[0])>-1)ev.push([P[x[1]].getTime(),x[1]]);if(o.ao)ev.push([P[x[1]].getTime()+o.ap*6e4,'A'])});
   if(o.jo&&wd===5&&P.maghrib)ev.push([P.maghrib.getTime()-36e5,'J']);if(rm&&o.ro&&P.maghrib)ev.push([P.maghrib.getTime()-o.ri*6e4,'R']);if(rm&&o.so&&P.fajr)ev.push([P.fajr.getTime()-o.rs*6e4,'S'])}}
 caches.open('athar_meta').then(function(c){return c.put('sched.json',new Response(JSON.stringify({at:Date.now(),ev:ev}),{headers:{'Content-Type':'application/json'}}))}).catch(function(){})}
try{setTimeout(ntSched,1500)}catch(e){}
function ntCk(id){var x=document.getElementById(id);return !!(x&&x.checked)}
function ntNum(id,d){var x=document.getElementById(id),v=x?parseInt(x.value,10):NaN;return isFinite(v)?v:d}
function ntTz(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return 'Asia/Riyadh'}}
document.addEventListener('submit',function(e){if(e.target.id!=='ntf')return;e.preventDefault();
 var o={m:document.getElementById('ntm').value,e:document.getElementById('nte').value,mo:document.getElementById('ntmo').checked,eo:document.getElementById('nteo').checked,on:true,k:document.getElementById('ntk').value,f:document.getElementById('ntfa').value,b:document.getElementById('ntba').value,ko:document.getElementById('ntko').checked,fo:document.getElementById('ntfo').checked,bo:document.getElementById('ntbo').checked,ao:ntCk('ntao'),jo:ntCk('ntjo'),ro:ntCk('ntro'),so:ntCk('ntso'),ap:ntNum('ntap',15),ri:ntNum('ntri',10),rs:ntNum('ntrs',45),pr:[].map.call(document.querySelectorAll('input[name=ntp]:checked'),function(x){return x.value}).join('')},b=document.getElementById('ntb'),L=ptLoc();
 if(!L){o.pr='';o.ao=o.jo=o.ro=o.so=false}if(!o.mo&&!o.eo&&!o.pr&&!o.ko&&!o.fo&&!o.bo&&!o.ao&&!o.jo&&!o.ro&&!o.so){kmTo('اختر تنبيهًا واحدًا على الأقل');return}
 if(!navigator.onLine){kmTo('لا يوجد اتصال، حاول لاحقًا');return}
 b.disabled=true;b.textContent='جارٍ التفعيل…';
 Notification.requestPermission().then(function(p){if(p!=='granted')throw 'perm';return ntGetSub(true)})
 .then(function(s){return ntPost('sub',{endpoint:s.endpoint,tz:ntTz(),m:o.mo?o.m:null,e:o.eo?o.e:null,pr:o.pr,kt:o.ko?o.k:null,ft:o.fo?o.f:null,bt:o.bo?o.b:null,ap:o.ao?o.ap:null,jt:o.jo,ri:o.ro?o.ri:null,rs:o.so?o.rs:null,lat:L?L.lat:null,lng:L?L.lng:null})})
 .then(function(j){if(!j.ok)throw 'srv';qset('athar-push',o);ntSched();kmTo('فُعّلت التنبيهات، بارك الله فيك');route()})
 .catch(function(x){b.disabled=false;b.textContent='تفعيل التنبيهات';kmTo(x==='perm'?'لم يُسمح بالتنبيهات':'تعذّر التفعيل، حاول مرة أخرى')})});
document.addEventListener('click',function(e){var b=e.target.closest('button[data-push]');if(!b)return;var a=b.dataset.push;if(a!=='off')return;b.disabled=true;
 ntGetSub(false).then(function(s){if(!s){if(a==='off'){var o=ntSt();o.on=false;qset('athar-push',o);route();return}throw 'nosub'}
  return ntPost('sub',{endpoint:s.endpoint,action:'del'}).then(function(){return s.unsubscribe()}).then(function(){var o=ntSt();o.on=false;qset('athar-push',o);kmTo('أُوقفت التنبيهات');route()})})
 .catch(function(){b.disabled=false;kmTo('تعذّر التنفيذ، حاول مرة أخرى')})});
