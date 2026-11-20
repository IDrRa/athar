/* رابط مشاركة مثل /quran/18 فُتح مباشرة (مثلًا دون إنترنت): انقله إلى رابطه داخل التطبيق */
try{if(!location.hash&&/^\/((quran|adhkar|dua)\/[^/]|salawat\/?$)/.test(location.pathname))history.replaceState(null,'','/#'+location.pathname.replace(/\/$/,''))}catch(e){}

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
/* أيقونات الأقسام (خط رفيع، داخل مربع ملوّن خافت) */
var CIC={morning:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 6v3M5.6 9.6l2.1 2.1M18.4 9.6l-2.1 2.1"/>',evening:'<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',sleep:'<path d="M3 19V9M3 15h18v4M21 15v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="12" r="1.6"/>',wakeup:'<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',prayer:'<path d="M6 20.5V11a6 6 0 0 1 12 0v9.5M4 20.5h16M10 20.5v-5a2 2 0 0 1 4 0v5"/>',tasbih:'<circle cx="12" cy="9.5" r="5.5"/><path d="M12 15v5M10 20.5h4"/><circle cx="12" cy="4" r="1"/><circle cx="17.5" cy="9.5" r="1"/><circle cx="6.5" cy="9.5" r="1"/>',istighfar:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',quran:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 10.5h5"/>',prophets:'<path d="M7 4h10.5a2 2 0 0 1 0 4H7m0-4a2 2 0 0 0 0 4v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M11 12h6M11 15.5h4"/>',sunnah:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5v5l3 2"/>',general:'<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>',now:'<circle cx="12" cy="12" r="8.5"/><path d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7z"/>',jumua:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4M9.5 14.5h5"/>'};
function cicon(k){return CIC[k]?'<span class="cic" aria-hidden="true"><svg viewBox="0 0 24 24">'+CIC[k]+'</svg></span>':''}
function cat(href,t,d,n,ic){return '<li><a class="row" href="#'+href+'">'+(n!=null?'<span class="num">'+n+'</span>':'')+cicon(ic)+'<div><b>'+t+'</b><span>'+d+'</span></div><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a></li>'}
function head(t,d,back){return (back?'<a class="back" href="#'+back+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>رجوع</a>':'')+'<header class="sechead" style="display:block;padding:0"><h2>'+t+'</h2>'+(d?'<p>'+d+'</p>':'')+'</header>'}


/* من أين جاء الزائر: زر «رجوع» في حفظي والختمة يعيده للصفحة التي فتحها منها (القرآن أو المزيد) */
var RPREV='';addEventListener('hashchange',function(e){try{RPREV=new URL(e.oldURL).hash.slice(1).split('?')[0]}catch(x){}});
function fromBack(d){return /^\/(quran|about)$/.test(RPREV)?RPREV:d}

/* ارتفاع الشريط السفلي الفعلي → --navh (تستعمله مسافة أسفل الصفحة) */
(function(){function f(){var n=document.querySelector('body>nav');if(n&&n.offsetHeight)document.documentElement.style.setProperty('--navh',n.offsetHeight+'px')}try{f();addEventListener('resize',f);addEventListener('orientationchange',f);if(window.ResizeObserver){var n=document.querySelector('body>nav');if(n)new ResizeObserver(f).observe(n)}else addEventListener('load',f)}catch(e){}})();
