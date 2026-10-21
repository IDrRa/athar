
/* Phase 2 — DATA layer: all content below is PLACEHOLDER (not real Quran/Hadith/Adhkar). Replace with a verified source later. */
(function(){
var $=function(s){return document.querySelector(s)},V=$('#view'),HS=document.querySelectorAll('#app > section'),ALL={};
var PH='نص تجريبي — ليس محتوى حقيقيًا',NS='يُضاف بعد ربط مصدر موثّق',NA='غير متوفر (تجريبي)';
function mk(type,id,title,text,cat,x){var o={id:id,type:type,title:title,text:text||PH,source:NS,reference:NS,category:cat||'',status:'draft',createdAt:'2026-10-13',updatedAt:'2026-10-13'};for(var k in x)o[k]=x[k];ALL[id]=o;return o}

var CA=[['morning','أذكار الصباح'],['evening','أذكار المساء'],['sleep','أذكار النوم'],['wakeup','أذكار الاستيقاظ'],['prayer','أذكار الصلاة']];
var DC=[['guidance','الهداية'],['mercy','الرحمة'],['forgiveness','المغفرة'],['provision','الرزق'],['distress','الكرب'],['tranquility','الطمأنينة'],['repentance','التوبة'],['parents','الوالدين'],['dunya-akhira','الدنيا والآخرة'],['sick','المريض'],['rain','المطر والرعد'],['istikhara','الاستخارة'],['other','أدعية أخرى']];
var DT={quran:'دعاء قرآني',prophets:'من دعاء الأنبياء في القرآن',sunnah:'من دعاء النبي ﷺ',general:'دعاء في المواقف والأحوال'};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cat(href,t,d,n){return '<li><a class="row" href="#'+href+'">'+(n!=null?'<span class="num">'+n+'</span>':'')+'<div><b>'+t+'</b><span>'+d+'</span></div><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a></li>'}
function head(t,d,back){return (back?'<a class="back" href="#'+back+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>رجوع</a>':'')+'<header class="sechead" style="display:block;padding:0"><h2>'+t+'</h2>'+(d?'<p>'+d+'</p>':'')+'</header>'}

