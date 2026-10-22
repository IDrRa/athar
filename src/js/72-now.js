/* ===== v36 «الآن»: the home page shows what suits this moment, from the visitor's prayer times ===== */
/* windows: الصباح من الفجر إلى الظهر · المساء من العصر إلى العشاء · النوم من العشاء إلى الفجر ·
   أذكار بعد الصلاة من ١٠ دقائق إلى ٤٥ دقيقة بعد كل أذان · سورة الكهف من مغرب الخميس إلى مغرب الجمعة */
var NOW_TRY='athar-try-now';
function nowOn(){try{return localStorage.getItem(NOW_TRY)==='1'}catch(e){return false}}
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
function nowRender(){var el=document.getElementById('nowc');if(!el)return;var c=nowOn()?nowCard(nowState(ocNow())):'';el.hidden=!c;el.innerHTML=c?'<h2>الآن</h2>'+c:''}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}});
setInterval(function(){if(!document.hidden&&document.body.classList.contains('home'))try{nowRender()}catch(e){}},60000);
/* preview page for the owner: #/try-now turns the card on for this device and shows it at different moments */
function vTryNow(){try{localStorage.setItem(NOW_TRY,'1')}catch(e){}
 var b=new Date(),at=function(dd,h,m){var x=new Date(b.getFullYear(),b.getMonth(),b.getDate()+dd,h,m);return x},fri=(5-b.getDay()+7)%7,
 L=[['بعد الفجر بنصف ساعة',at(0,5,10)],['الضحى',at(0,9,30)],['بين الظهر والعصر',at(0,13,45)],['بعد صلاة العصر',at(0,15,20)],['بعد المغرب',at(0,18,10)],['في الليل',at(0,22,30)],['صباح الجمعة',at(fri||7,9,30)]],WD=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
 var T=nowTimes(b);
 return head('تجربة «الآن»','هكذا تظهر بطاقة «الآن» في الرئيسية على جهازك، في أوقات مختلفة من اليوم. فُعّلت على جهازك فقط.','/')
 +(T.exact?'':'<p class="card pt-card">لم تحدّد موقعك في مواقيت الصلاة، فتُقدَّر الأوقات تقديرًا ولا تُعرض الساعة. <a href="#/prayer">حدّد موقعك</a></p>')
 +L.map(function(z){var c=nowCard(nowState(z[1]));return '<h3 class="nw-t">'+WD[z[1].getDay()]+' · '+z[0]+'</h3>'+(c||'<p class="kmmut nw-e">لا تظهر البطاقة في هذا الوقت.</p>')}).join('')
 +'<div class="ms-a"><a class="btn primary" href="#/">انظر الرئيسية الآن</a><button class="btn" data-now="off">إيقاف التجربة</button></div>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-now]');if(!b)return;try{localStorage.removeItem(NOW_TRY)}catch(x){}location.hash='#/'});
