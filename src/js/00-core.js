/* روابط حقيقية (طلب المالك 2026-11-27): الصفحة في المسار نفسه (/quran/2) بدل #/quran/2، فيظهر كل تنقّل في تحليلات Cloudflare.
   HR() تعيد الصفحة الحالية بصيغتها الداخلية '#/…' (فبقية الكود كما هو)، وnav() تنتقل إليها، والروابط القديمة #/… تتحوّل عند الفتح.
   pushState/replaceState يقبلان '#/…' ويكتبانها مسارًا، والضغط على أي رابط داخلي ينتقل بلا إعادة تحميل. */
function HU(u){u=String(u==null?'':u);if(u.charAt(0)==='#')u=u.slice(1);return !u||u==='/'?'/':(u.charAt(0)==='/'?u:'/'+u)}
function HR(){var p=location.pathname.replace(/\/index\.html$/,'/').replace(/\/+$/,'');return p?'#'+p+location.search:''}
var HCUR='';
function hfire(o){HCUR=HR();var ou=location.origin+'/'+(o||''),ev;try{ev=new HashChangeEvent('hashchange',{oldURL:ou,newURL:location.href})}catch(e){ev=document.createEvent('Event');ev.initEvent('hashchange',false,false);try{ev.oldURL=ou}catch(x){}}dispatchEvent(ev)}
function nav(u){var t=HU(u);if(t===location.pathname+location.search)return;var o=HR();history.pushState(null,'',t);hfire(o)}
(function(){var H=history,P=H.pushState,R=H.replaceState,fx=function(u){return typeof u==='string'&&/^#(\/|$)/.test(u)?HU(u):u};
 try{H.pushState=function(s,t,u){return P.call(H,s,t,fx(u))};H.replaceState=function(s,t,u){return R.call(H,s,t,fx(u))}}catch(e){}
 try{if(/^#\//.test(location.hash))R.call(H,null,'',HU(location.hash));else if(/^\/index\.html$/.test(location.pathname))R.call(H,null,'','/'+location.search)}catch(e){}
 HCUR=HR();
 addEventListener('popstate',function(){var o=HCUR;if(HR()!==o)hfire(o)});
 /* رابط قديم #/… فُتح والصفحة مفتوحة: يتحوّل مسارًا قبل أن يقرأه أي جزء آخر */
 addEventListener('hashchange',function(){if(/^#\//.test(location.hash)){R.call(H,null,'',HU(location.hash))}HCUR=HR()});
 addEventListener('click',function(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target||a.hasAttribute('download'))return;
  var h=a.getAttribute('href');
  if(/^#(\/|$)/.test(h)){e.preventDefault();nav(h);return}
  if(/^#[\w-]+$/.test(h)){var el=document.getElementById(h.slice(1));if(el){e.preventDefault();if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');el.focus();el.scrollIntoView()}return}
  if(/^\/(?!\/|api\/|og\/|icons\/|fonts\/|mushaf\/|tafsir\/)[^.]*$/.test(h)){e.preventDefault();nav(h)}});
 /* الروابط المعروضة نفسها تصير حقيقية (/quran/2) — تُنسخ وتُشارك نظيفة */
 var fixA=function(r){var l=r.querySelectorAll?r.querySelectorAll('a[href^="#/"],a[href="#"]'):[];for(var i=0;i<l.length;i++)l[i].setAttribute('href',HU(l[i].getAttribute('href')));if(r.matches&&r.matches('a[href^="#/"]'))r.setAttribute('href',HU(r.getAttribute('href')))};
 try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='attributes')fixA(m.target);else for(var j=0;j<m.addedNodes.length;j++)if(m.addedNodes[j].nodeType===1)fixA(m.addedNodes[j])}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});document.addEventListener('DOMContentLoaded',function(){fixA(document)})}catch(e){}
})();

/* Phase 2 — DATA layer: all content below is PLACEHOLDER (not real Quran/Hadith/Adhkar). Replace with a verified source later. */
(function(){
/* العنوان الرسمي لأثر، تُبنى عليه روابط المشاركة */
var SITE='https://atharuk.com/';
var $=function(s){return document.querySelector(s)},V=$('#view'),HS=document.querySelectorAll('#app > section'),ALL={};
var PH='نص تجريبي — ليس محتوى حقيقيًا',NS='يُضاف بعد ربط مصدر موثّق',NA='غير متوفر (تجريبي)';
function mk(type,id,title,text,cat,x){var o={id:id,type:type,title:title,text:text||PH,source:NS,reference:NS,category:cat||'',status:'draft',createdAt:'2026-10-13',updatedAt:'2026-10-13'};for(var k in x)o[k]=x[k];ALL[id]=o;return o}

var CA=[['morning','أذكار الصباح'],['evening','أذكار المساء'],['sleep','أذكار النوم'],['wakeup','أذكار الاستيقاظ'],['prayer','أذكار الصلاة'],['tasbih','التسابيح'],['istighfar','الاستغفار والتوبة']];
var DC=[['guidance','الهداية'],['mercy','الرحمة'],['forgiveness','المغفرة'],['provision','الرزق'],['distress','الكرب'],['tranquility','الطمأنينة'],['repentance','التوبة'],['parents','الوالدين'],['dunya-akhira','الدنيا والآخرة'],['sick','المريض'],['rain','المطر والرعد'],['istikhara','الاستخارة'],['other','أدعية أخرى']];
var DT={quran:'دعاء قرآني',prophets:'من دعاء الأنبياء في القرآن',sunnah:'من دعاء النبي ﷺ',general:'دعاء في المواقف والأحوال'};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cat(href,t,d,n){return '<li><a class="row" href="#'+href+'">'+(n!=null?'<span class="num">'+n+'</span>':'')+'<div><b>'+t+'</b><span>'+d+'</span></div><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a></li>'}
function head(t,d,back){return (back?'<a class="back" href="#'+back+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>رجوع</a>':'')+'<header class="sechead" style="display:block;padding:0"><h2>'+t+'</h2>'+(d?'<p>'+d+'</p>':'')+'</header>'}


/* من أين جاء الزائر: زر «رجوع» في حفظي والختمة يعيده للصفحة التي فتحها منها (القرآن أو المزيد) */
var RPREV='';addEventListener('hashchange',function(e){try{RPREV=new URL(e.oldURL).hash.slice(1).split('?')[0]}catch(x){}});
function fromBack(d){return /^\/(quran|about)$/.test(RPREV)?RPREV:d}

/* ارتفاع الشريط السفلي الفعلي → --navh (تستعمله مسافة أسفل الصفحة) */
(function(){function f(){var n=document.querySelector('body>nav');if(!n)return;var h=Math.round(n.getBoundingClientRect().height);if(h)document.documentElement.style.setProperty('--navh',h+'px')}
 /* حافة الآيفون السفلية (safe-area) قد تُطبَّق بعد التحميل، وهي «حشوة» لا يراها مراقب الحجم الافتراضي: نراقب الصندوق كاملًا ونعيد القياس عند كل فرصة */
 try{f();['resize','orientationchange','load','pageshow','hashchange'].forEach(function(e){addEventListener(e,f)});document.addEventListener('visibilitychange',f);setTimeout(f,300);setTimeout(f,1500);if(window.ResizeObserver){var n=document.querySelector('body>nav');if(n)new ResizeObserver(f).observe(n,{box:'border-box'})}}catch(e){}})();
