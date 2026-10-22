/* ===== v36 «الآن»: the home page shows what suits this moment, from the visitor's prayer times ===== */
/* windows: الصباح من الفجر إلى الظهر · المساء من العصر إلى العشاء · النوم من العشاء إلى الفجر ·
   سورة الكهف من فجر الجمعة إلى مغربها · الصلاة على النبي ﷺ من مغرب الخميس (ليلة الجمعة) إلى مغرب الجمعة */
function nowTimes(d){var l=ptLoc();if(l){try{var tz=ptTz(l),a=ptYMD(d,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(d,tz));if(o.fajr&&o.dhuhr&&o.asr&&o.maghrib&&o.isha)return {t:o}}catch(e){}}
 /* no location: rough local-clock times, used only to choose the card */
 var b=function(h,m){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m)};return {t:{fajr:b(4,45),dhuhr:b(12,0),asr:b(15,15),maghrib:b(17,45),isha:b(19,15)}}}
function nowState(d){var T=nowTimes(d),t=T.t,s={main:null,kahf:false,salat:false},m=d.getTime();
 if(m>=t.fajr&&m<t.dhuhr)s.main={k:'morning'};
 else if(m>=t.asr&&m<t.isha)s.main={k:'evening'};
 else if(m>=t.isha||m<t.fajr)s.main={k:'sleep'};
 var wd=d.getDay();s.kahf=wd===5&&m>=t.fajr&&m<t.maghrib;s.salat=(wd===4&&m>=t.maghrib)||(wd===5&&m<t.maghrib);return s}
var NOWK={morning:['أذكار الصباح','/adhkar/morning'],evening:['أذكار المساء','/adhkar/evening'],sleep:['أذكار النوم','/adhkar/sleep']};
/* each suggestion looks like a phone notification: app icon, title, «الآن» — nothing more */
function nowNote(href,t){return '<a class="nwn" href="#'+href+'"><img src="icons/icon-192-m4.png" alt="" width="32" height="32"><b>'+t+'</b><time>الآن</time></a>'}
function nowCard(s){var x=[];
 if(s.main)x.push(nowNote(NOWK[s.main.k][1],NOWK[s.main.k][0]));
 if(s.kahf)x.push(nowNote('/quran/18','سورة الكهف'));
 if(s.salat)x.push(nowNote('/dhikr/dhikr-hisn-028-22','الصلاة على النبي ﷺ'));
 return x.join('')}
function nowRender(){var el=document.getElementById('nowc');if(!el)return;var c=nowCard(nowState(ocNow()));el.hidden=!c;el.innerHTML=c}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}});
setInterval(function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}},60000);
