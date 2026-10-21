/* ---- reading stats ---- */
function rdKey(d){d=d||new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function rdAll(){var o=qget('athar-rd',{});return o&&typeof o==='object'?o:{}}
var RDT=null;
function rdSeen(p){clearTimeout(RDT);RDT=setTimeout(function(){if(!QPS||QPS.p!==p)return;var o=rdAll(),k=rdKey(),a=o[k]||[];if(a.indexOf(p)<0){a.push(p);o[k]=a;
 var ks=Object.keys(o).sort();if(ks.length>400)ks.slice(0,ks.length-400).forEach(function(x){delete o[x]});qset('athar-rd',o)}},8000)}
function rdN(o,d){var a=o[rdKey(d)];return a?a.length:0}
function rdStats(){var o=rdAll(),now=new Date(),day=function(i){return new Date(now.getFullYear(),now.getMonth(),now.getDate()-i)},w=[],i,wk=0,mo=0,tot=0,best=0,st=0;
 for(i=6;i>=0;i--){var n=rdN(o,day(i));w.push([day(i),n]);wk+=n}
 Object.keys(o).forEach(function(k){var n=o[k].length;tot+=n;if(n>best)best=n;var p=k.split('-');if(+p[0]===now.getFullYear()&&+p[1]===now.getMonth()+1)mo+=n});
 i=rdN(o,now)?0:1;while(rdN(o,day(i))){st++;i++}
 return {today:rdN(o,now),week:w,wk:wk,mo:mo,tot:tot,best:best,streak:st,days:Object.keys(o).length}}
function rdSub(){var s=rdStats();return s.today?'اليوم '+ar(s.today)+' '+rdPg(s.today):s.streak?'أيام متتالية: '+ar(s.streak):'صفحاتك وأيامك في المصحف'}
function rdPg(n){return n===1?'صفحة':n===2?'صفحتان':n<=10?'صفحات':'صفحة'}
function rdDay(n){return n===1?'يوم':n===2?'يومان':n<=10?'أيام':'يومًا'}
function vStats(){var s=rdStats(),h=head('إحصاءات قراءتك','صفحات المصحف التي قرأتها','/about');
 if(!s.tot)return h+'<section class="card pt-card"><p>لم تُسجَّل قراءة بعد.</p><p class="kmmut">افتح المصحف واقرأ، وتُحسب الصفحة إذا بقيت عليها ثماني ثوانٍ أو أكثر.</p><a class="btn primary" href="#/quran">افتح المصحف</a></section>';
 var mx=Math.max(1,Math.max.apply(null,s.week.map(function(x){return x[1]})));
 h+='<div class="st-g"><div><b>'+ar(s.today)+'</b><span>اليوم</span></div><div><b>'+ar(s.streak)+'</b><span>أيام متتالية</span></div><div><b>'+ar(s.wk)+'</b><span>آخر ٧ أيام</span></div><div><b>'+ar(s.mo)+'</b><span>هذا الشهر</span></div></div>'
 +'<section class="card st-w"><h3>آخر سبعة أيام</h3><div class="st-bars">'+s.week.map(function(x,i){var lb='';try{lb=x[0].toLocaleDateString('ar',{weekday:'short'})}catch(e){}return '<div class="st-b'+(i===6?' on':'')+'"><i style="height:'+Math.max(3,Math.round(x[1]/mx*96))+'px" aria-hidden="true"></i><b>'+ar(x[1])+'</b><span>'+(i===6?'اليوم':lb)+'</span></div>'}).join('')+'</div></section>'
 +'<ul class="list pt-l"><li><span>مجموع الصفحات</span><b>'+ar(s.tot)+'</b></li><li><span>أيام القراءة</span><b>'+ar(s.days)+'</b></li><li><span>أكثر يوم قرأت فيه</span><b>'+ar(s.best)+' '+rdPg(s.best)+'</b></li></ul>'
 +'<p class="kmmut pt-note">تُحسب الصفحة مرة واحدة في اليوم إذا بقيت عليها ثماني ثوانٍ أو أكثر.</p><button class="lnk kmend" data-rd="clear">مسح الإحصاءات</button>';return h}
document.addEventListener('click',function(e){var b=e.target.closest('[data-rd]');if(!b)return;if(b.dataset.rd==='clear'&&confirm('مسح كل إحصاءات القراءة من هذا الجهاز؟')){try{localStorage.removeItem('athar-rd')}catch(x){}route()}});
