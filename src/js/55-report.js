/* ---- report a mistake: stored privately (Cloudflare Pages Function + KV), read only on #/admin ---- */
MRI.flag='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
var RP_T=[['quran','القرآن الكريم'],['adhkar','الأذكار'],['dua','الأدعية'],['other','أخرى']];
function vReport(q){var c=(q.get('c')||'').slice(0,160),ty=q.get('t')||'';return head('أبلغ عن خطأ','لاحظت خطأ في نص أو مصدر أو في عمل الموقع؟ أخبرنا وسنراجعه.','/about')
 +'<form class="card rp-f" id="rpf" novalidate><label class="rp-l" for="rpt">القسم</label><select id="rpt" class="rp-i">'+RP_T.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===ty?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'
 +'<label class="rp-l" for="rpw">أين الخطأ؟</label><input id="rpw" class="rp-i" maxlength="160" placeholder="مثال: سورة البقرة آية ٢٥٥، أو أذكار الصباح رقم ٣" value="'+rpEsc(c)+'">'
 +'<label class="rp-l" for="rpm">ما الخطأ؟</label><textarea id="rpm" maxlength="1500" placeholder="اكتب ما لاحظته، والصواب إن كنت تعرفه"></textarea>'
 +'<input type="checkbox" id="rph" class="sr" tabindex="-1" autocomplete="off" aria-hidden="true">'
 +'<button class="btn primary rp-b" type="submit" id="rpb">إرسال البلاغ</button></form>'}
function rpEsc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
document.addEventListener('submit',function(e){if(e.target.id!=='rpf')return;e.preventDefault();var m=document.getElementById('rpm').value.trim(),w=document.getElementById('rpw').value.trim(),t=document.getElementById('rpt'),b=document.getElementById('rpb');
 if(document.getElementById('rph').checked)return;if(m.length<3){kmTo('اكتب ما الخطأ أولًا');document.getElementById('rpm').focus();return}
 if(!navigator.onLine){kmTo('لا يوجد اتصال، حاول لاحقًا');return}
 b.disabled=true;b.textContent='جارٍ الإرسال…';
 fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({section:t.value,where:w,text:m,page:RP_FROM||''})})
 .then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})}).then(function(j){if(j.status===429){kmTo('أرسلت بلاغات كثيرة، حاول بعد قليل');throw 1}if(j.status===503||j.status===404||j.status===405){kmTo('الإبلاغ غير متاح حاليًا');throw 1}if(!j||!j.ok)throw 0;document.getElementById('rpf').innerHTML='<p class="rp-ok"><b>وصل بلاغك، جزاك الله خيرًا.</b><br>سنراجعه ونصحّح ما يلزم.</p><a class="btn" href="#/about">رجوع إلى المزيد</a>'})
 .catch(function(x){b.disabled=false;b.textContent='إرسال البلاغ';if(x!==1)kmTo('تعذّر الإرسال، حاول مرة أخرى')})});
var RP_FROM='';addEventListener('hashchange',function(e){var o=(e.oldURL||'').split('#')[1]||'';if(o.indexOf('/report')!==0&&o.indexOf('/admin')!==0)RP_FROM='#'+o});
