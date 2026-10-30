/* ===== v36 «الآن»: the home page shows what suits this moment, from the visitor's prayer times ===== */
/* windows: أذكار بعد الصلاة من الأذان إلى ما بعد الإقامة بعشرين دقيقة في كل صلاة، ثم: الصباح إلى الظهر · المساء إلى العشاء · النوم من بعد العشاء بساعتين إلى الفجر ·
   سورة الكهف من فجر الجمعة إلى مغربها */
function nowTimes(d){var l=ptLoc();if(l){try{var tz=ptTz(l),a=ptYMD(d,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(d,tz));if(o.fajr&&o.dhuhr&&o.asr&&o.maghrib&&o.isha)return {t:o}}catch(e){}}
 /* no location: rough local-clock times, used only to choose the card */
 var b=function(h,m){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m)};return {t:{fajr:b(4,45),dhuhr:b(12,0),asr:b(15,15),maghrib:b(17,45),isha:b(19,15)}}}
function nowState(d){var T=nowTimes(d),t=T.t,s={main:null,kahf:false},m=d.getTime();
 IQ_K.forEach(function(k){var a=t[k[0]];if(!a||s.main)return;var q=iqAt(k[0],a)||new Date(a.getTime()+(k[0]==='dhuhr'&&a.getDay()===5?45:k[2])*6e4);if(m>=a.getTime()&&m<q.getTime()+20*6e4)s.main={k:'prayer',p:k[0],n:k[1]}});
 if(s.main);
 else if(m>=t.fajr&&m<t.dhuhr)s.main={k:'morning'};
 else if(m>=t.asr&&m<t.isha)s.main={k:'evening'};
 else if(m>=t.isha.getTime()+2*36e5||m<t.fajr)s.main={k:'sleep'};
 var wd=d.getDay();s.kahf=wd===5&&m>=t.fajr&&m<t.maghrib;return s}
var NOWK={prayer:['أذكار بعد الصلاة','/adhkar/prayer'],morning:['أذكار الصباح','/adhkar/morning'],evening:['أذكار المساء','/adhkar/evening'],sleep:['أذكار النوم','/adhkar/sleep']};
/* «الآن» is an in-app notification: it slides down from the top when the app opens, once per time window,
   hides by itself after a few seconds or with a swipe up, and opens its page when tapped.
   Once its page is opened (from the banner or any other way) it does not come back until its next time. */
function nowYMD(d,add){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(add||0));return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate()}
function nowList(d){var s=nowState(d),T=nowTimes(d).t,early=d.getTime()<T.fajr,x=[];
 if(s.main)x.push({id:s.main.k+(s.main.p?'-'+s.main.p:'')+':'+nowYMD(d,s.main.k==='sleep'&&early?-1:0),h:NOWK[s.main.k][1],t:NOWK[s.main.k][0]});
 if(s.kahf)x.push({id:'kahf:'+nowYMD(d),h:'/quran/18',t:'سورة الكهف'});
 return x}
var NOW_SEEN='athar-now-seen';
function nowSeen(){var o=qget(NOW_SEEN,[]);return Array.isArray(o)?o:[]}
var NOW_SHOWN='athar-now-shown',nowTm=null;
function nowPop(){var seen=nowSeen(),shown=qget(NOW_SHOWN,[]);if(!Array.isArray(shown))shown=[];
 var L=nowList(ocNow()).filter(function(n){return seen.indexOf(n.id)<0&&shown.indexOf(n.id)<0});if(!L.length)return;
 var el=document.getElementById('nwb');if(!el){el=document.createElement('div');el.id='nwb';el.setAttribute('role','status');document.body.appendChild(el)}
 el.innerHTML=L.map(function(n){return '<a class="nwn" href="#'+n.h+'"><img src="icons/icon-192-m4.png" alt="" width="32" height="32"><b>'+n.t+'</b><time>الآن</time></a>'}).join('');
 L.forEach(function(n){shown.push(n.id)});qset(NOW_SHOWN,shown.slice(-30));
 requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('on')})});
 clearTimeout(nowTm);nowTm=setTimeout(nowHide,6000)}
function nowHide(){var el=document.getElementById('nwb');if(el)el.classList.remove('on');clearTimeout(nowTm)}
(function(){var y0=null;document.addEventListener('touchstart',function(e){if(e.target.closest('#nwb'))y0=e.touches[0].clientY},{passive:true});
 document.addEventListener('touchmove',function(e){if(y0!==null&&e.touches[0].clientY-y0<-20){y0=null;nowHide()}},{passive:true});
 document.addEventListener('touchend',function(){y0=null},{passive:true});
 document.addEventListener('click',function(e){if(e.target.closest('#nwb .nwn'))nowHide()})})();
function nowRender(){try{setTimeout(nowPop,600)}catch(e){}}
/* opening the page a note points to marks it as read */
function nowMark(){try{var h=location.hash,seen=nowSeen(),ch=false;nowList(ocNow()).forEach(function(n){var u='#'+n.h;if((h===u||h.indexOf(u+'/')===0||h.indexOf(u+'?')===0)&&seen.indexOf(n.id)<0){seen.push(n.id);ch=true}});if(ch)qset(NOW_SEEN,seen.slice(-30))}catch(e){}}
window.addEventListener('hashchange',function(){nowMark();nowHide()});nowMark();
document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('home'))nowRender()});

/* ===== «الآن» on the home page: the next prayer, what suits this moment, and «تابع القراءة» (last mushaf page, when no khatma is running) ===== */
function arN(n,one,two,few,many){return n===1?one:n===2?two:(n>=3&&n<=10?ar(n)+' '+few:ar(n)+' '+many)}
/* تأتي بعد «بعد»، فالمثنى مجرور: بعد ساعتين، بعد دقيقتين */
function arDur(min){var h=Math.floor(min/60),m=min%60,x=[];if(h)x.push(arN(h,'ساعة','ساعتين','ساعات','ساعة'));if(m||!h)x.push(arN(m,'دقيقة','دقيقتين','دقائق','دقيقة'));return x.join(' و')}
var HBN={fajr:'الفجر',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
function hbNext(d){var l=ptLoc(),T=nowTimes(d).t,m=d.getTime(),o=null,iq=l&&iqNow(T,d);
 if(iq)return {l:true,small:'حان وقت '+HBN[iq[0]],name:'الإقامة',at:ptFmt(iq[1],ptTz(l)),left:arDur(Math.max(1,Math.ceil((iq[1].getTime()-m)/6e4)))};['fajr','dhuhr','asr','maghrib','isha'].forEach(function(k){if(!o&&T[k]&&T[k].getTime()>m)o=[k,T[k]]});
 if(!o)o=['fajr',nowTimes(new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12)).t.fajr];var nm=HBN[o[0]];if(d.getDay()===5&&o[0]==='dhuhr')nm='الجمعة';
 return {l:!!l,name:nm,at:l?ptFmt(o[1],ptTz(l)):'',left:arDur(Math.max(1,Math.ceil((o[1].getTime()-m)/6e4)))}}
/* رمضان (تقويم أم القرى، بمواقيت موقع الزائر): قبل الفجر «السحور»، ومن الفجر إلى المغرب «الإفطار»،
   وبعد المغرب ٤٥ دقيقة «دعاء الإفطار»، وبعد العشاء «السحور» إن كان الغد من رمضان */
function hbRam(d){var l=ptLoc();if(!l)return null;var T=nowTimes(d).t,m=d.getTime(),h=ocHijri(d);
 if(h&&h.m===9){if(m<T.fajr)return {k:'s',t:T.fajr,day:h.d};if(m<T.maghrib)return {k:'i',t:T.maghrib,day:h.d};if(m<T.maghrib.getTime()+45*6e4)return {k:'d',day:h.d}}
 var tm=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12),h2=ocHijri(tm);if(h2&&h2.m===9&&m>=T.isha)return {k:'s',t:nowTimes(tm).t.fajr,day:h2.d};return null}
function hbNow(){var d=ocNow(),n=hbNext(d),s=nowState(d),r=hbRam(d),a;
 if(r&&r.k==='d')a=['دعاء الإفطار','#/dua/dua-hisn-069-01','عند الإفطار'];
 else if(s.main)a=[NOWK[s.main.k][0],'#'+NOWK[s.main.k][1],s.main.k==='sleep'?'قبل أن تنام':s.main.k==='prayer'?'بعد صلاة '+s.main.n:'وقتها الآن'];else if(s.kahf)a=['سورة الكهف','#/quran/18','يوم الجمعة'];else a=['التسبيح والاستغفار','#/adhkar/tasbih','ذكرٌ في كل وقت'];
 if(r&&r.k!=='d'){var l=ptLoc();return '<div class="hbnow"><a class="hbc hbr" href="#/prayer"><small>رمضان · اليوم '+ar(r.day)+'</small><b>'+(r.k==='i'?'الإفطار':'السحور')+' <i>'+ptFmt(r.t,ptTz(l))+'</i></b><span>بعد '+arDur(Math.max(1,Math.ceil((r.t.getTime()-d.getTime())/6e4)))+'</span></a>'
  +'<a class="hbc hba" href="'+a[1]+'"><small>الآن</small><b>'+a[0]+'</b><span>'+a[2]+'</span></a></div>'}
 return '<div class="hbnow">'+(n.l?'<a class="hbc" href="#/prayer"><small>'+(n.small||'الصلاة القادمة')+'</small><b>'+n.name+' <i>'+n.at+'</i></b><span>بعد '+n.left+'</span></a>':'<a class="hbc" href="#/prayer"><small>مواقيت الصلاة</small><b>اختر موقعك</b><span>لتظهر الصلاة القادمة</span></a>')
  +'<a class="hbc hba" href="'+a[1]+'"><small>الآن</small><b>'+a[0]+'</b><span>'+a[2]+'</span></a></div>'}
function hbCont(){var o=qget('athar-qlp',null),k=null;try{k=kmGet()}catch(e){}if((k&&!k.done)||!o||!(o.p>=1&&o.p<=604))return '';
 return '<a class="hbcont" href="#/quran/page/'+o.p+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16l-5-4-5 4z"/></svg><span><small>تابع القراءة</small><b>سورة '+QN[QPG[o.p-1][0]-1]+' · صفحة '+ar(o.p)+'</b></span><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></a>'}
function hbRender(){var el=document.getElementById('hbn');if(!el)return;var on=document.body.classList.contains('home');el.hidden=!on;if(on)el.innerHTML=hbNow()+hbCont()}
setInterval(function(){if(!document.hidden)try{hbRender()}catch(e){}},30000);
