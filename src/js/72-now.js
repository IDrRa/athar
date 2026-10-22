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
/* each suggestion looks like a phone notification: app icon, title, «الآن» — nothing more.
   Once opened (from the card or any other way) it is gone until its next time, like a read notification. */
function nowYMD(d,add){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(add||0));return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate()}
function nowList(d){var s=nowState(d),T=nowTimes(d).t,early=d.getTime()<T.fajr,x=[];
 if(s.main)x.push({id:s.main.k+':'+nowYMD(d,s.main.k==='sleep'&&early?-1:0),h:NOWK[s.main.k][1],t:NOWK[s.main.k][0]});
 if(s.kahf)x.push({id:'kahf:'+nowYMD(d),h:'/quran/18',t:'سورة الكهف'});
 return x}
var NOW_SEEN='athar-now-seen';
function nowSeen(){var o=qget(NOW_SEEN,[]);return Array.isArray(o)?o:[]}
function nowCard(d){var seen=nowSeen();return nowList(d).filter(function(n){return seen.indexOf(n.id)<0}).map(function(n){
 return '<a class="nwn" href="#'+n.h+'"><img src="icons/icon-192-m4.png" alt="" width="32" height="32"><b>'+n.t+'</b><time>الآن</time></a>'}).join('')}
function nowRender(){var el=document.getElementById('nowc');if(!el)return;var c=nowCard(ocNow());el.hidden=!c;el.innerHTML=c}
/* opening the page a note points to marks it as read */
function nowMark(){try{var h=location.hash,seen=nowSeen(),ch=false;nowList(ocNow()).forEach(function(n){var u='#'+n.h;if((h===u||h.indexOf(u+'/')===0||h.indexOf(u+'?')===0)&&seen.indexOf(n.id)<0){seen.push(n.id);ch=true}});if(ch)qset(NOW_SEEN,seen.slice(-30))}catch(e){}}
window.addEventListener('hashchange',nowMark);nowMark();
document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}});
setInterval(function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}},60000);
