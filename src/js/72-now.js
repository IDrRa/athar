/* ===== v36 «الآن»: the home page shows what suits this moment, from the visitor's prayer times ===== */
/* windows: الصباح من الفجر إلى الظهر · المساء من العصر إلى العشاء · النوم من العشاء إلى الفجر ·
   أذكار بعد الصلاة من ١٠ دقائق إلى ٤٥ دقيقة بعد كل أذان · سورة الكهف من مغرب الخميس إلى مغرب الجمعة */
function nowTimes(d){var l=ptLoc();if(l){try{var tz=ptTz(l),a=ptYMD(d,tz),o=ptDay(a[0],a[1],a[2],l.lat,l.lng,ptRamadan(d,tz));if(o.fajr&&o.dhuhr&&o.asr&&o.maghrib&&o.isha)return {t:o,tz:tz,exact:true}}catch(e){}}
 /* no location: rough local-clock times, used only to choose the card, never shown */
 var b=function(h,m){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m)};return {t:{fajr:b(4,45),dhuhr:b(12,0),asr:b(15,15),maghrib:b(17,45),isha:b(19,15)},tz:undefined,exact:false}}
function nowState(d){var T=nowTimes(d),t=T.t,s={main:null,after:null,kahf:false,tz:T.tz,exact:T.exact},m=d.getTime();
 if(m>=t.fajr&&m<t.dhuhr)s.main={k:'morning',until:t.dhuhr,u:'الظهر'};
 else if(m>=t.asr&&m<t.isha)s.main={k:'evening',until:t.isha,u:'العشاء'};
 else if(m>=t.isha||m<t.fajr)s.main={k:'sleep'};
 [['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']].forEach(function(p){var g=m-t[p[0]];if(g>=6e5&&g<27e5)s.after=p[1]});
 var wd=d.getDay();s.kahf=(wd===5&&m<t.maghrib)||(wd===4&&m>=t.maghrib);return s}
var NOWK={morning:['أذكار الصباح','/adhkar/morning'],evening:['أذكار المساء','/adhkar/evening'],sleep:['أذكار النوم','/adhkar/sleep']};
function nowCount(k){try{return CONTENT.filter(function(o){return o.type==='dhikr'&&o.category===k&&o.status==='published'}).length}catch(e){return 0}}
function nowCard(s){var h='',x=[];
 if(s.main){var k=NOWK[s.main.k],n=nowCount(s.main.k),sub=s.main.k==='sleep'?'قبل أن تنام':(s.exact&&s.main.until?'وقتها الآن، حتى '+s.main.u+' '+ptFmt(s.main.until,s.tz):'وقتها الآن');
  h+='<a class="nw-m" href="#'+k[1]+'"><span><b>'+k[0]+'</b><small>'+sub+(n?' · '+ar(n)+(n<=10?' أذكار':' ذكرًا'):'')+'</small></span><i aria-hidden="true">'+CHL+'</i></a>'}
 if(s.after)x.push('<a class="chip" href="#/dhikr/dhikr-hisn-025-01">أذكار بعد صلاة '+s.after+'</a>');
 if(s.kahf)x.push('<a class="chip" href="#/quran/18">سورة الكهف</a>');
 if(!h&&!x.length)return '';
 return '<article class="occ nw">'+h+(x.length?'<p class="ocln">'+x.join('')+'</p>':'')+'</article>'}
function nowRender(){var el=document.getElementById('nowc');if(!el)return;var c=nowCard(nowState(ocNow()));el.hidden=!c;el.innerHTML=c?'<h2>الآن</h2>'+c:''}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}});
setInterval(function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}},60000);
