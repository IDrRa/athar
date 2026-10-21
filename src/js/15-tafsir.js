/* ===== v14 «المعنى»: Tafsir al-Muyassar per ayah, loaded per surah on demand ===== */
var TF={},TFS=null,tfOpener=null;
function tfEl(i){return document.getElementById(i)}
function tfLoad(n){if(TF[n])return Promise.resolve(TF[n]);return fetch('tafsir/muyassar/'+n+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){if(!j||j.s!==n||!j.t)throw new Error('bad');TF[n]=j.t;return j.t})}
function tfGrp(t,v){var x=t[v-1],a=typeof x==='number'?x:v,b=a;while(b<t.length&&t[b]===a)b++;return{a:a,b:b,text:t[a-1]}}
function tfRef(n,a,b){return 'سورة '+QN[n-1]+'، '+(a===b?'الآية '+ar(a):(b-a===1?'الآيتان ':'الآيات ')+ar(a)+'–'+ar(b))}
function tfRender(){var n=TFS.n,a=TFS.a,b=TFS.b,V=QV(n),q='';for(var v=a;v<=b;v++)q+=esc(V[v-1])+' <span class="vn wqm" aria-hidden="true">'+ar(v)+'</span> ';
 tfEl('tfR').textContent=tfRef(n,a,b);tfEl('tfB').innerHTML='<p class="tfq" lang="ar">'+q+'</p><p class="tft">'+esc(TFS.text)+'</p>';tfEl('tfB').scrollTop=0;
 document.querySelector('[data-tf=prev]').disabled=n===1&&a===1;document.querySelector('[data-tf=next]').disabled=n===114&&b===QC[113];document.querySelector('[data-tf=copy]').disabled=false;live(tfRef(n,a,b))}
function tfShow(n,v){var bk=tfEl('tafs');if(bk.hidden){tfOpener=document.activeElement;bk.hidden=false}TFS={n:n,a:v,b:v,text:''};
 tfEl('tfR').textContent=tfRef(n,v,v);tfEl('tfB').innerHTML='<p class="tfmsg" role="status">جارٍ تحميل المعنى…</p>';document.querySelector('[data-tf=copy]').disabled=true;
 tfLoad(n).then(function(t){if(!TFS||TFS.n!==n)return;var g=tfGrp(t,v);TFS={n:n,a:g.a,b:g.b,text:g.text};tfRender()})
 .catch(function(){if(!TFS||TFS.n!==n)return;tfEl('tfB').innerHTML='<div class="tfmsg" role="alert"><p>تعذّر تحميل المعنى الآن. تحقّق من الاتصال ثم أعد المحاولة.</p><button class="btn" data-tf="retry">إعادة المحاولة</button></div>'});
 setTimeout(function(){var c=document.querySelector('[data-tfclose]');if(c)c.focus()},30)}
function tfClose(){tfEl('tafs').hidden=true;TFS=null;if(tfOpener&&tfOpener.focus)try{tfOpener.focus({preventScroll:true})}catch(e){}}
function tfStep(d){if(!TFS)return;var n=TFS.n;if(d>0){if(TFS.b<QC[n-1])tfShow(n,TFS.b+1);else if(n<114)tfShow(n+1,1)}else{if(TFS.a>1)tfShow(n,TFS.a-1);else if(n>1)tfShow(n-1,QC[n-2])}}
document.addEventListener('click',function(e){var bk=tfEl('tafs');if(!bk||bk.hidden)return;var t=e.target;
 if(t===bk||t.closest('[data-tfclose]')){tfClose();return}var b=t.closest('[data-tf]');if(!b||b.disabled)return;var a=b.dataset.tf;
 if(a==='next')tfStep(1);else if(a==='prev')tfStep(-1);else if(a==='retry'&&TFS)tfShow(TFS.n,TFS.a);
 else if(a==='copy'&&TFS&&TFS.text)copyT('معنى '+tfRef(TFS.n,TFS.a,TFS.b)+':\n'+TFS.text+'\n\nالمصدر: التفسير الميسر — مجمع الملك فهد لطباعة المصحف الشريف\n— أثر','نُسخ المعنى')});
document.addEventListener('keydown',function(e){var bk=tfEl('tafs');if(!bk||bk.hidden)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();tfClose();return}
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();tfStep(e.key==='ArrowLeft'?1:-1);return}
 if(e.key==='Tab'){var f=[].filter.call(bk.querySelectorAll('button'),function(x){return!x.disabled}),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true);
addEventListener('hashchange',function(){var bk=tfEl('tafs');if(bk&&!bk.hidden&&!/^#\/quran/.test(location.hash))tfClose()});

