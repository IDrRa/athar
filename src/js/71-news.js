/* «ما الجديد»: ما أُضيف في كل تحديث (src/data/news.json، الأحدث أولًا). يُضاف سطر لكل تحديث يلمسه الزائر.
   بعد تحديث جديد يظهر إشعار «الجديد في أثر» مرة واحدة؛ ولا يظهر لمن يفتح أثر أول مرة. */
var NEWS=/*@data:news*/;
MRI.news='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"/><path d="M12 8v4l2.5 2.5"/></svg>';
function nwDate(s){var d=/^(\d{4})-(\d\d)-(\d\d)$/.exec(s);return d?ar(+d[3])+' '+['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][+d[2]-1]+' '+ar(+d[1]):s}
function nwLast(){return NEWS.length?NEWS[0].date:''}
function nwUnseen(){var s=qget('athar-news0',null);return !!s&&s<nwLast()}
function vNews(){qset('athar-news0',nwLast());return head('ما الجديد','ما أُضيف إلى أثر في كل تحديث','/about')+NEWS.map(function(n){return '<h2 class="mrs">'+nwDate(n.date)+'</h2><ul class="list nwl">'+n.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'}).join('')}
/* أول مرة: من فتح أثر قبل هذه الصفحة (له بيانات محفوظة) يرى إشعار آخر تحديث؛ والزائر الجديد لا يراه */
try{if(!qget('athar-news0',null)){var nwOld=Object.keys(localStorage).some(function(k){return /^athar-(loc|qlp|qbm|push|fs|accent|theme|easy|km|notes|qz|rs)/.test(k)});qset('athar-news0',nwOld&&NEWS[1]?NEWS[1].date:nwLast())}}catch(e){}
