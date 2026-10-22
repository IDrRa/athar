/* ===== v36 «الآن»: the home page shows what suits this moment, from the visitor's prayer times ===== */
/* windows: الصباح من الفجر إلى الظهر · المساء من العصر إلى العشاء · النوم من العشاء إلى الفجر ·
   سورة الكهف من فجر الجمعة إلى مغربها */
function nowTimes(d){var l=ptLoc();if(l){try{var tz=ptTz(l),a=ptYMD(d,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(d,tz));if(o.fajr&&o.dhuhr&&o.asr&&o.maghrib&&o.isha)return {t:o}}catch(e){}}
 /* no location: rough local-clock times, used only to choose the card */
 var b=function(h,m){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m)};return {t:{fajr:b(4,45),dhuhr:b(12,0),asr:b(15,15),maghrib:b(17,45),isha:b(19,15)}}}
function nowState(d){var T=nowTimes(d),t=T.t,s={main:null,kahf:false},m=d.getTime();
 if(m>=t.fajr&&m<t.dhuhr)s.main={k:'morning'};
 else if(m>=t.asr&&m<t.isha)s.main={k:'evening'};
 else if(m>=t.isha||m<t.fajr)s.main={k:'sleep'};
 var wd=d.getDay();s.kahf=wd===5&&m>=t.fajr&&m<t.maghrib;return s}
var NOWK={morning:['أذكار الصباح','/adhkar/morning'],evening:['أذكار المساء','/adhkar/evening'],sleep:['أذكار النوم','/adhkar/sleep']};
/* «الآن» is an in-app notification: it slides down from the top when the app opens, once per time window,
   hides by itself after a few seconds or with a swipe up, and opens its page when tapped.
   Once its page is opened (from the banner or any other way) it does not come back until its next time. */
function nowYMD(d,add){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(add||0));return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate()}
function nowList(d){var s=nowState(d),T=nowTimes(d).t,early=d.getTime()<T.fajr,x=[];
 if(s.main)x.push({id:s.main.k+':'+nowYMD(d,s.main.k==='sleep'&&early?-1:0),h:NOWK[s.main.k][1],t:NOWK[s.main.k][0]});
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

/* ===== a quiet prayer-time line under the search on the home page ===== */
function arN(n,one,two,few,many){return n===1?one:n===2?two:(n>=3&&n<=10?ar(n)+' '+few:ar(n)+' '+many)}
function arDur(min){var h=Math.floor(min/60),m=min%60,x=[];if(h)x.push(arN(h,'ساعة','ساعتان','ساعات','ساعة'));if(m||!h)x.push(arN(m,'دقيقة','دقيقتان','دقائق','دقيقة'));return x.join(' و')}
function ptLineText(d){var l=ptLoc();if(!l)return '';try{var tz=ptTz(l),a=ptYMD(d,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(d,tz)),
 b=ptYMD(new Date(d.getTime()+864e5),tz),o2=ptDay(b[0],b[1],b[2],l.lat,l.lng,ptRamadan(d,tz)),
 P=[['fajr','الفجر',o],['dhuhr','الظهر',o],['asr','العصر',o],['maghrib','المغرب',o],['isha','العشاء',o],['fajr','الفجر',o2]].filter(function(p){return p[2][p[0]]}),m=d.getTime(),last=null,next=null;
 P.forEach(function(p){var t=p[2][p[0]].getTime();if(t<=m)last=[p[1],t];else if(!next)next=[p[1],t]});
 if(d.getDay()===5&&next&&next[0]==='الظهر')next[0]='الجمعة';if(d.getDay()===5&&last&&last[0]==='الظهر')last[0]='الجمعة';
 if(last&&m-last[1]<30*6e4)return 'مضى على أذان '+last[0]+' '+arDur(Math.max(1,Math.floor((m-last[1])/6e4)));
 if(next)return 'بقي على أذان '+next[0]+' '+arDur(Math.max(1,Math.ceil((next[1]-m)/6e4)));return ''}catch(e){return ''}}
function ptLineRender(){var el=document.getElementById('ptl');if(!el)return;var t=document.body.classList.contains('home')?ptLineText(ocNow()):'';el.hidden=!t;el.innerHTML=t?'<a href="#/prayer">'+t+'</a>':''}
setInterval(function(){if(!document.hidden)try{ptLineRender()}catch(e){}},30000);
