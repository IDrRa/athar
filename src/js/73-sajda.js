/* ===== سجود التلاوة: the 15 sajda ayat of the Hafs mushaf (quran-meta, SajdaList, MIT — the same package the mushaf pages are built from).
   A page that holds one shows «۩ سجدة» by the page number; it opens Hisn al-Muslim's chapter «دعاء سجود التلاوة» (already in the adhkar data). ===== */
var SJ=[[7,206],[13,15],[16,50],[17,109],[19,58],[22,18],[22,77],[25,60],[27,26],[32,15],[38,24],[41,38],[53,62],[84,21],[96,19]],SJIDS=['dhikr-hisn-021-01','dhikr-hisn-021-02'],sjOpener=null;
function sjOn(p){return SJ.filter(function(x){return qpageOf(x[0],x[1])===p})}
function sjCap(p){if(!SJIDS.some(function(i){return ALL[i]}))return '';return sjOn(p).map(function(x){return '<button class="qsj" data-qsj="'+x[0]+'_'+x[1]+'" aria-label="سجدة تلاوة: سورة '+QN[x[0]-1]+'، الآية '+ar(x[1])+'. دعاء سجود التلاوة"><i aria-hidden="true">۩</i>سجدة</button>'}).join('')}
function sjShow(n,v){var bk=document.getElementById('sjS');if(!bk)return;sjOpener=document.activeElement;
 document.getElementById('sjR').textContent='موضع سجدة: سورة '+QN[n-1]+'، الآية '+ar(v);
 document.getElementById('sjB').innerHTML=SJIDS.filter(function(i){return ALL[i]}).map(function(i){var o=ALL[i];return '<article class="sjd"><p class="sjt" lang="ar">'+esc(o.text)+'</p>'+srcB(o)+'</article>'}).join('');
 bk.hidden=false;setTimeout(function(){var c=bk.querySelector('[data-sjclose]');if(c)c.focus()},30)}
function sjClose(){var bk=document.getElementById('sjS');if(!bk||bk.hidden)return;bk.hidden=true;if(sjOpener&&sjOpener.focus)try{sjOpener.focus({preventScroll:true})}catch(e){}}
document.addEventListener('click',function(e){var b=e.target.closest('[data-qsj]');if(b){var k=b.dataset.qsj.split('_');sjShow(+k[0],+k[1]);return}
 var bk=document.getElementById('sjS');if(bk&&!bk.hidden&&(e.target===bk||e.target.closest('[data-sjclose]')))sjClose()});
document.addEventListener('keydown',function(e){var bk=document.getElementById('sjS');if(!bk||bk.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();sjClose();return}
 if(e.key==='Tab'){e.preventDefault();var c=bk.querySelector('[data-sjclose]');if(c)c.focus()}},true);
addEventListener('hashchange',sjClose);
