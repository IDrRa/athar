/* ===== v30 prayer times (Umm al-Qura), qibla, reading stats ===== */
var PT_CITIES=[['الرياض',24.7136,46.6753,'Asia/Riyadh'],['مكة المكرمة',21.3891,39.8579,'Asia/Riyadh'],['المدينة المنورة',24.4672,39.6111,'Asia/Riyadh'],['جدة',21.4858,39.1925,'Asia/Riyadh'],['الدمام',26.4207,50.0888,'Asia/Riyadh'],['الطائف',21.2703,40.4158,'Asia/Riyadh'],['بريدة',26.326,43.975,'Asia/Riyadh'],['حائل',27.5114,41.7208,'Asia/Riyadh'],['تبوك',28.3835,36.5662,'Asia/Riyadh'],['أبها',18.2164,42.5053,'Asia/Riyadh'],['جازان',16.8892,42.5511,'Asia/Riyadh'],['نجران',17.4924,44.1277,'Asia/Riyadh'],['الكويت',29.3759,47.9774,'Asia/Kuwait'],['الدوحة',25.2854,51.531,'Asia/Qatar'],['المنامة',26.2285,50.586,'Asia/Bahrain'],['أبوظبي',24.4539,54.3773,'Asia/Dubai'],['دبي',25.2048,55.2708,'Asia/Dubai'],['مسقط',23.588,58.3829,'Asia/Muscat'],['عمّان',31.9454,35.9284,'Asia/Amman'],['القاهرة',30.0444,31.2357,'Africa/Cairo']];
var PT_NAMES=[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
var KAABA=[21.422487,39.826206];
function ptLoc(){var l=qget('athar-loc',null);return l&&isFinite(l.lat)&&isFinite(l.lng)?l:null}
function ptTz(l){if(l&&l.tz)return l.tz;try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return undefined}}
function ptYMD(d,tz){try{var f=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(d).split('-');return [+f[0],+f[1],+f[2]]}catch(e){return [d.getFullYear(),d.getMonth()+1,d.getDate()]}}
function ptRamadan(d,tz){try{var m=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{timeZone:tz,month:'numeric'}).format(d);return parseInt(m,10)===9}catch(e){return false}}
/* Sun position (NOAA / praytimes.org approximation) */
function ptSun(jd){var D=jd-2451545,r=Math.PI/180,g=(357.529+0.98560028*D)*r,q=280.459+0.98564736*D,L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*r,e=(23.439-0.00000036*D)*r,
 RA=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L))/r/15,dec=Math.asin(Math.sin(e)*Math.sin(L)),eqt=q/15-((RA%24)+24)%24;eqt=((eqt+12)%24+24)%24-12;return {dec:dec,eqt:eqt}}
/* hours (UTC) at which the sun is `ang` degrees below the horizon (positive = below); dir -1 before noon, +1 after */
function ptAt(jd0,lat,lng,ang,dir,approx){var r=Math.PI/180,s=ptSun(jd0+approx/24),noon=12-lng/15-s.eqt,
 c=(-Math.sin(ang*r)-Math.sin(lat*r)*Math.sin(s.dec))/(Math.cos(lat*r)*Math.cos(s.dec));if(c<-1||c>1)return NaN;return noon+dir*Math.acos(c)/r/15}
function ptAsrAng(jd0,lat,approx){var r=Math.PI/180,s=ptSun(jd0+approx/24);return -Math.atan(1/(1+Math.tan(Math.abs(lat*r-s.dec))))/r}
function ptDay(y,m,d,lat,lng,ramadan){var jd0=Date.UTC(y,m-1,d)/864e5+2440587.5,t={},i,
 calc=function(){var s=ptSun(jd0+(t.dhuhr||12)/24);t.dhuhr=12-lng/15-s.eqt;
  t.fajr=ptAt(jd0,lat,lng,18.5,-1,t.fajr||5);t.sunrise=ptAt(jd0,lat,lng,0.833,-1,t.sunrise||6);
  t.asr=ptAt(jd0,lat,lng,ptAsrAng(jd0,lat,t.asr||15),1,t.asr||15);t.maghrib=ptAt(jd0,lat,lng,0.833,1,t.maghrib||18)};
 for(i=0;i<3;i++)calc();
 t.isha=t.maghrib+(ramadan?2:1.5);var base=Date.UTC(y,m-1,d),o={};
 PT_NAMES.forEach(function(n){var h=t[n[0]];o[n[0]]=isFinite(h)?new Date(Math.round((base+h*36e5)/6e4)*6e4):null});return o}
function ptToday(l,now){now=now||new Date();var tz=ptTz(l),a=ptYMD(now,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(now,tz)),nx=null,k;
 for(var i=0;i<PT_NAMES.length;i++){k=PT_NAMES[i][0];if(k!=='sunrise'&&o[k]&&o[k]>now){nx=[k,o[k]];break}}
 if(!nx){var tm=new Date(now.getTime()+864e5),b=ptYMD(tm,tz),o2=ptDay(b[0],b[1],b[2],l.lat,l.lng,ptRamadan(tm,tz));nx=['fajr',o2.fajr]}
 return {t:o,next:nx,tz:tz}}
function ptFmt(d,tz){if(!d)return '—';try{return d.toLocaleTimeString('ar-u-nu-arab',{timeZone:tz,hour:'numeric',minute:'2-digit'})}catch(e){return ar(d.getHours()+':'+('0'+d.getMinutes()).slice(-2))}}
function ptName(k){for(var i=0;i<PT_NAMES.length;i++)if(PT_NAMES[i][0]===k)return PT_NAMES[i][1];return ''}
function ptLeft(ms){var m=Math.max(0,Math.ceil(ms/6e4)),h=Math.floor(m/60);m=m%60;return (h?ar(h)+' س ':'')+ar(m)+' د'}
function ptDateLine(tz){var d=new Date(),g='',hj='';try{g=d.toLocaleDateString('ar-u-nu-arab',{timeZone:tz,weekday:'long',day:'numeric',month:'long'})}catch(e){}
 try{hj=d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-arab',{timeZone:tz,day:'numeric',month:'long',year:'numeric'})}catch(e){}return g+(hj?' · '+hj:'')}
function ptSub(){var l=ptLoc();if(!l)return 'حسب موقعك، بطريقة أم القرى';try{var p=ptToday(l);return ptName(p.next[0])+' '+ptFmt(p.next[1],p.tz)+' · بعد '+ptLeft(p.next[1]-new Date())}catch(e){return 'حسب موقعك'}}
function ptPicker(){return '<div class="pt-pick"><button class="btn primary" data-pt="geo">'+MRI.pin+'استخدم موقعي</button><label class="pt-sel"><span>أو اختر مدينة</span><select id="ptcity"><option value="">— اختر —</option>'+PT_CITIES.map(function(c,i){return '<option value="'+i+'">'+c[0]+'</option>'}).join('')+'</select></label></div>'}
function vPrayer(){var l=ptLoc(),h=head('مواقيت الصلاة','','/about');
 if(!l)return h+'<section class="card pt-card"><p>نحتاج موقعك لحساب مواقيت الصلاة بدقة.</p>'+ptPicker()+'</section>';
 h+='<div class="pt-loc"><span>'+MRI.pin+(l.name||'موقعك الحالي')+'</span><button class="lnk" data-pt="change">تغيير</button></div><div id="ptbody">'+ptBody(l)+'</div>'
 +'<a class="btn nt-go" href="#/notify">'+MRI.bell+'تنبيه عند دخول وقت الصلاة</a><div id="ptchg" hidden>'+ptPicker()+'</div><p class="kmmut pt-note">طريقة الحساب: أم القرى (الفجر ١٨٫٥ درجة، والعشاء بعد المغرب بساعة ونصف، وفي رمضان بساعتين). قد يختلف الوقت دقيقة أو دقيقتين عن تقويم مسجدك.</p>';return h}
function ptBody(l){var p=ptToday(l),now=new Date();return '<p class="pt-date">'+ptDateLine(p.tz)+'</p><div class="pt-next"><small>الصلاة القادمة</small><b>'+ptName(p.next[0])+'</b><span>بعد '+ptLeft(p.next[1]-now)+' · '+ptFmt(p.next[1],p.tz)+'</span></div><ul class="list pt-l">'
 +PT_NAMES.map(function(n){var on=n[0]===p.next[0]&&p.t[n[0]]&&p.t[n[0]].getTime()===p.next[1].getTime(),past=p.t[n[0]]&&p.t[n[0]]<=now;return '<li class="'+(on?'on':past?'past':'')+'"><span>'+n[1]+'</span><b>'+ptFmt(p.t[n[0]],p.tz)+'</b></li>'}).join('')+'</ul>'}
function ptSet(l){qset('athar-loc',l);route()}
function ptGeo(){if(!navigator.geolocation){kmTo('جهازك لا يدعم تحديد الموقع، اختر مدينة');return}kmTo('جارٍ تحديد موقعك…');
 navigator.geolocation.getCurrentPosition(function(p){ptSet({lat:Math.round(p.coords.latitude*1e3)/1e3,lng:Math.round(p.coords.longitude*1e3)/1e3,name:'موقعك الحالي'})},
 function(e){kmTo(e&&e.code===1?'لم يُسمح بالوصول للموقع، اختر مدينة من القائمة':'تعذّر تحديد الموقع، اختر مدينة من القائمة')},{enableHighAccuracy:false,timeout:15000,maximumAge:6e5})}
document.addEventListener('click',function(e){var b=e.target.closest('[data-pt]');if(!b)return;var a=b.dataset.pt;
 if(a==='geo')ptGeo();else if(a==='change'){var c=document.getElementById('ptchg');if(c)c.hidden=!c.hidden}
 else if(a==='compass')qbStart()});
document.addEventListener('change',function(e){if(e.target.id!=='ptcity'||e.target.value==='')return;var c=PT_CITIES[+e.target.value];if(c)ptSet({lat:c[1],lng:c[2],name:c[0],tz:c[3]})});
