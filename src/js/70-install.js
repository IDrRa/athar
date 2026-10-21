/* ---- install guide (#/install) + one-time home hint ---- */
MRI.install='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7v7m-3-3 3 3 3-3M10 18.5h4"/></svg>';
var INSP=null;addEventListener('beforeinstallprompt',function(e){e.preventDefault();INSP=e;try{insHomeRender()}catch(x){}});
addEventListener('appinstalled',function(){INSP=null;try{insHomeRender()}catch(x){}});
function insInApp(){return /FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|Twitter|WhatsApp/i.test(navigator.userAgent)}
function insStep(n,t,d){return '<li><b class="in-n">'+ar(n)+'</b><div><b>'+t+'</b>'+(d?'<span>'+d+'</span>':'')+'</div></li>'}
function vInstall(){var ios=ntIOS(),h=head('ثبّت أثر على جوالك','يفتح كتطبيق من شاشتك الرئيسية','/about');
 if(ntApp())return h+'<section class="card pt-card"><p><b>أثر مثبّت على جهازك وتستخدمه الآن كتطبيق.</b></p><p class="kmmut">إن كانت لك ختمة أو دفتر أو فواصل في المتصفح، فانقلها: من المتصفح «حفظ نسخة احتياطية»، ثم من هنا «استعادة من نسخة احتياطية».</p><a class="btn primary nt-go" href="#/notify">'+MRI.bell+'فعّل التنبيهات</a></section>';
 h+='<section class="card in-why"><h3>لماذا التثبيت؟</h3><ul><li><b>التنبيهات</b><span>'+(ios?'في الآيفون لا تصل تنبيهات الأذان والأذكار إلا إذا فتحت أثر من أيقونته على الشاشة الرئيسية.':'تصلك تنبيهات الأذان والأذكار بانتظام.')+'</span></li><li><b>بياناتك تبقى</b><span>ختمتك ودفترك وفواصلك وإحصاءاتك لا تُمسح'+(ios?'، بينما قد يمسحها سفاري إذا لم تفتح الموقع أيامًا.':'.')+'</span></li><li><b>يفتح كتطبيق</b><span>بشاشة كاملة دون شريط المتصفح، ويعمل بلا إنترنت.</span></li></ul></section>';
 if(insInApp())h+='<p class="card pt-card"><b>افتح الرابط في '+(ios?'سفاري':'متصفح Chrome')+' أولًا.</b><br><span class="kmmut">أنت الآن داخل تطبيق آخر لا يسمح بالتثبيت. اضغط قائمة التطبيق (⋯) ثم «فتح في المتصفح».</span></p>';
 if(ios)h+='<section class="card"><h3 class="in-h">في الآيفون (سفاري)</h3><ol class="in-s">'+insStep(1,'اضغط زر المشاركة','المربع الذي يخرج منه سهم أسفل الشاشة. وإن لم تجده فاضغط زر القائمة (⋯) ثم «مشاركة».')+insStep(2,'اختر «إضافة إلى الصفحة الرئيسية»','انزل في القائمة قليلًا إن لم تظهر.')+insStep(3,'اضغط «إضافة»','تأكد أن «فتح كتطبيق ويب» مفعّل.')+insStep(4,'افتح أثر من أيقونته','الأيقونة السوداء بشعار المحراب الذهبي، ومنها فعّل التنبيهات.')+'</ol></section>';
 else h+=(INSP?'<button class="btn primary nt-go" data-ins="go">'+MRI.install+'تثبيت أثر الآن</button>':'')+'<section class="card"><h3 class="in-h">في أندرويد (Chrome)</h3><ol class="in-s">'+insStep(1,'اضغط زر القائمة (⋮)','أعلى يمين المتصفح.')+insStep(2,'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»','')+insStep(3,'افتح أثر من أيقونته','ومنها فعّل التنبيهات.')+'</ol></section>';
 return h}
function insShow(){if(ntApp())return false;try{if(localStorage.getItem('athar-ih'))return false;var v=+(localStorage.getItem('athar-iv')||0)+1;localStorage.setItem('athar-iv',String(v));return v>=2}catch(e){return false}}
var INSV=null;function insHomeRender(){var el=document.getElementById('insh');if(!el)return;if(INSV===null)INSV=insShow();if(!INSV||ntApp()){el.innerHTML='';el.hidden=true;return}el.hidden=false;
 el.innerHTML='<div class="in-b">'+MRI.install+'<div><b>ثبّت أثر على شاشتك الرئيسية</b><span>لتصلك تنبيهات الأذان والأذكار، وتبقى بياناتك محفوظة.</span></div><div class="in-a">'+(INSP?'<button class="btn primary" data-ins="go">تثبيت</button>':'<a class="btn primary" href="#/install">كيف؟</a>')+'<button class="in-x" data-ins="x" aria-label="إخفاء">✕</button></div></div>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-ins]');if(!b)return;
 if(b.dataset.ins==='x'){try{localStorage.setItem('athar-ih','1')}catch(x){}INSV=false;insHomeRender();return}
 if(b.dataset.ins==='go'&&INSP){INSP.prompt();INSP.userChoice.then(function(){INSP=null;insHomeRender()}).catch(function(){})}});
function mrRow(href,ic,t,sub){return '<li><a class="row" href="'+href+'">'+MRI[ic]+'<div><b>'+t+'</b><span>'+sub+'</span></div><svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a></li>'}
function mrFs(){var v=document.documentElement.getAttribute('data-fs');return v||'m'}
function mrSetFs(v){if(v==='m'){document.documentElement.removeAttribute('data-fs');try{localStorage.removeItem('athar-fs')}catch(e){}}else{document.documentElement.setAttribute('data-fs',v);try{localStorage.setItem('athar-fs',v)}catch(e){}}
 document.querySelectorAll('.mrseg [data-fs]').forEach(function(b){b.setAttribute('aria-checked',String(b.dataset.fs===v))})}
function mrSave(name,text){var fb=function(m){if(m){kmTo(m);return}var a=document.createElement('a');a.href='data:application/json;charset=utf-8,'+encodeURIComponent(text);a.download=name;document.body.appendChild(a);a.click();a.remove();kmTo('حُفظت النسخة الاحتياطية')};
 var cl=window.claude;if(!cl||typeof cl.use!=='function'){fb();return}
 cl.use('downloads').then(function(dl){if(!dl){fb('الحفظ غير متاح في هذه الصفحة');return}dl.save({filename:name,data:text}).then(function(r){if(r&&r.status==='saved')kmTo('حُفظت النسخة الاحتياطية')}).catch(function(e){if(e&&e.code==='declined')return;kmTo('تعذّر الحفظ هنا')})}).catch(function(){fb('تعذّر الحفظ هنا')})}
function mrExport(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^athar-/.test(k)&&k!=='athar-dbg-date'&&k!=='athar-admin')o[k]=localStorage.getItem(k)}}catch(e){}
 var n=Object.keys(o).length;if(!n){kmTo('لا توجد بيانات محفوظة بعد');return}var d=new Date(),ds=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
 mrSave('athar-backup-'+ds+'.json',JSON.stringify({app:'athar',v:1,savedAt:d.toISOString(),data:o},null,1))}
document.addEventListener('click',function(e){var b=e.target.closest('.mrseg [data-fs]');if(b){mrSetFs(b.dataset.fs);return}
 b=e.target.closest('[data-mr]');if(!b)return;if(b.dataset.mr==='export'){mrExport();return}
 if(b.dataset.mr==='share'){var u=/^https:\/\/(iathar\.pages\.dev|idrra\.github\.io)\//.test(location.href)?location.href.split('#')[0]:'https://iathar.pages.dev/';if(navigator.share)navigator.share({title:'أثر',text:'أثر — ما ينفعك ويبقى أثره',url:u}).catch(function(){});else copyT(u,'نُسخ رابط أثر')}});
document.addEventListener('change',function(e){var f=e.target;if(f.id!=='mrimp'||!f.files||!f.files[0])return;var file=f.files[0];if(file.size>2e6){kmTo('الملف كبير، ليس نسخة من أثر');f.value='';return}
 var rd=new FileReader();rd.onload=function(){var j=null;try{j=JSON.parse(rd.result)}catch(x){}
  if(!j||j.app!=='athar'||!j.data||typeof j.data!=='object'){kmTo('هذا الملف ليس نسخة احتياطية من أثر');f.value='';return}
  var n=0;Object.keys(j.data).forEach(function(k){var v=j.data[k];if(/^athar-[a-z0-9-]+$/.test(k)&&k!=='athar-dbg-date'&&typeof v==='string'&&v.length<1e6){try{localStorage.setItem(k,v);n++}catch(x){}}});
  kmTo(n?'استُعيدت بياناتك':'لم يُستعد شيء');if(n)setTimeout(function(){location.reload()},900)};rd.readAsText(file)});

