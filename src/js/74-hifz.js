var HF=qget('athar-hf',{}),HP=qget('athar-hfp',null);
MRI.hifz='<svg class="mri" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/><path d="m9.5 10 2 2 3-3.5"/></svg>';
/* الحفظ: تعليم الآيات المحفوظة (athar-hf: {رقم السورة: [[من،إلى],…]}) ووضع التسميع (إخفاء الآيات وكشفها بالضغط).
   النص لا يتغيّر: التسميع والتعليم في العرض فقط. وضع التسميع لا يُحفظ، فيرجع المصحف عاديًا عند فتح الموقع. */
function hfHas(n,v){var r=HF[n];if(!r)return false;for(var i=0;i<r.length;i++)if(v>=r[i][0]&&v<=r[i][1])return true;return false}
function hfAll(n,a,b){for(var v=a;v<=b;v++)if(!hfHas(n,v))return false;return true}
function hfCnt(n){var c=0;(HF[n]||[]).forEach(function(x){c+=x[1]-x[0]+1});return c}
function hfTotal(){var c=0;for(var n in HF)c+=hfCnt(n);return c}
function hfSet(n,a,b,on){var o=[];(HF[n]||[]).forEach(function(x){if(x[1]<a||x[0]>b){o.push(x);return}if(x[0]<a)o.push([x[0],a-1]);if(x[1]>b)o.push([b+1,x[1]])});if(on)o.push([a,b]);o.sort(function(x,y){return x[0]-y[0]});var m=[];o.forEach(function(x){var l=m[m.length-1];if(l&&x[0]<=l[1]+1)l[1]=Math.max(l[1],x[1]);else m.push(x)});if(m.length)HF[n]=m;else delete HF[n];qset('athar-hf',HF)}
function hfQ(){return '<a class="hzq" href="#/hifz"><b>حفظي</b><span>'+hfSub()+'</span></a>'}
function hfTog(){if(!QS)return;var e=QS.e>QS.v?QS.e:QS.v,on=!hfAll(QS.n,QS.v,e);hfSet(QS.n,QS.v,e,on);hfPaint();hfBtn();toast(on?'عُلِّمت محفوظة':'أُزيل التعليم')}
/* التسميع: 1 = إخفاء آيات الصفحة، 2 = إخفاء المحفوظ منها فقط */
function hzMode(){return document.documentElement.dataset.hz||''}
function hzPanel(){var m=hzMode();return '<div class="qhz" role="group" aria-label="التسميع"><span>التسميع</span><div><button class="btn'+(m==='1'?' on':'')+'" data-hzm="1" aria-pressed="'+(m==='1')+'">أخفِ الصفحة</button><button class="btn'+(m==='2'?' on':'')+'" data-hzm="2" aria-pressed="'+(m==='2')+'">أخفِ المحفوظ</button>'+(m?'<button class="btn" data-hzm="r">أظهر الكل</button>':'')+'</div></div>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-hzm]');if(!b)return;var m=b.dataset.hzm,r=document.documentElement,g=document.querySelector('.qpg');
 if(m==='r'){if(g){var on=!g.classList.contains('rva');g.classList.toggle('rva',on);b.textContent=on?'أخفِ الكل':'أظهر الكل'}return}
 if(r.dataset.hz===m){delete r.dataset.hz;m=''}else r.dataset.hz=m;
 document.querySelectorAll('.rv,.rva').forEach(function(x){x.classList.remove('rv','rva')});var hb=document.querySelector('.hzbar');if(hb)hb.remove();delete r.dataset.hzh;
 var pn=document.getElementById('qpanel'),bt=document.querySelector('.qg');if(pn){var h=pn.querySelector('.qhz');if(h)h.outerHTML=hzPanel();pn.hidden=true;if(bt)bt.setAttribute('aria-expanded','false')}
 live(m==='1'?'وضع التسميع: الآيات مخفية، اضغط على آية لتظهر':m==='2'?'وضع التسميع: المحفوظ مخفي، اضغط على آية لتظهر':'انتهى التسميع');if(m)toast(m==='1'?'اضغط على آية لتظهر':'اضغط على آية محفوظة لتظهر')});
/* خطة الحفظ: سورة وآية بداية وعدد؛ إذا حفظتها ينتقل إلى الحفظ التالي بالعدد نفسه، وتغيّر العدد متى شئت (athar-hfp: {n,a,b,c}) */
function hpSave(){qset('athar-hfp',HP)}
function hfFirst(n){for(var v=1;v<=QC[n-1];v++)if(!hfHas(n,v))return v;return 1}
function hpMk(n,a,c){var m=QC[n-1];c=Math.max(1,Math.min(50,c));a=Math.max(1,Math.min(m,a));return {n:n,a:a,c:c,b:Math.min(m,a+c-1)}}
function hfSub(){if(HP)return 'الآن: سورة '+QN[HP.n-1]+' · '+ar(HP.a)+'–'+ar(HP.b);var n=hfTotal();return n?ar(n)+' '+(n===1?'آية':n===2?'آيتان':n<=10?'آيات':'آية')+' محفوظة':'ابدأ خطة حفظ'}
function hzList(){var ns=Object.keys(HF).map(Number).sort(function(a,b){return a-b});if(!ns.length)return '';
 return '<h3 class="hzh">ما حفظته</h3><ul class="list hzl">'+ns.map(function(n){var r=HF[n],c=hfCnt(n),full=c===QC[n-1];return '<li><a href="#/quran/'+n+'/'+r[0][0]+'"><b>سورة '+QN[n-1]+'</b><span>'+(full?'السورة كاملة':'الآيات '+r.map(function(x){return x[0]===x[1]?ar(x[0]):ar(x[0])+'–'+ar(x[1])}).join('، '))+'</span><small>'+ar(c)+' من '+ar(QC[n-1])+'</small></a><button class="btn" data-hzgo="'+n+'_'+r[0][0]+'">سمّع</button></li>'}).join('')+'</ul>'}
function hpIn(n,v){return !!HP&&HP.n===n&&v>=HP.a&&v<=HP.b}
function hzCls(n,v){return (hfHas(n,v)?' hf':'')+(hpIn(n,v)?' hp':'')}
/* شريط الحفظ في المصحف (وضع 3): الآيات المطلوبة مميّزة، «أخفِ» يخفيها للتسميع، «حفظتها» ينقلك للحفظ التالي */
function hzBar(){if(hzMode()!=='3'||!HP)return '';var c=HP.b-HP.a+1,hd=!!document.documentElement.dataset.hzh;return '<div class="hzbar" role="toolbar" aria-label="الحفظ"><span>حفظك: '+QN[HP.n-1]+' '+ar(HP.a)+'–'+ar(HP.b)+'</span><button class="btn" data-hzc="-1" aria-label="أنقص آية">−</button><b>'+ar(c)+'</b><button class="btn" data-hzc="1" aria-label="زد آية">+</button><button class="btn" data-hzt aria-pressed="'+hd+'">'+(hd?'أظهر':'أخفِ')+'</button><button class="btn primary" data-hzd>حفظتها ✓</button><button class="btn" data-hzq aria-label="إنهاء الحفظ">×</button></div>'}
function hpGo(){var r=document.documentElement;if(!HP){delete r.dataset.hz;delete r.dataset.hzh}else r.dataset.hz='3';var p=HP?qpageOf(HP.n,HP.a):(QPS?QPS.p:1);if(HP&&QPS&&QPS.p>=p&&QPS.p<=qpageOf(HP.n,HP.b))p=QPS.p;try{mclr()}catch(x){}if(QPS)qgo(p);else location.hash='#/quran/page/'+p}
function vHifz(){HF=qget('athar-hf',{});HP=qget('athar-hfp',null);var h=head('حفظي','اختر ما تحفظه، ويفتح لك في المصحف','/about');
 if(HP)return h+'<section class="card hzf"><h3>حفظك الآن: سورة '+QN[HP.n-1]+' · الآيات '+ar(HP.a)+'–'+ar(HP.b)+'</h3><button class="btn primary" data-hzo>افتح في المصحف</button></section><button class="lnk kmend" data-hzx>غيّر السورة أو البداية</button>'+hzList();
 var n0=2,so='';for(var k=1;k<=114;k++)so+='<option value="'+k+'"'+(k===n0?' selected':'')+'>سورة '+QN[k-1]+'</option>';
 return h+'<section class="card hzf"><h3>ابدأ حفظًا جديدًا</h3><label for="hzsn">السورة</label><select id="hzsn">'+so+'</select><label for="hzsa">من الآية</label><input id="hzsa" type="number" inputmode="numeric" min="1" value="'+hfFirst(n0)+'"><label for="hzsc">عدد الآيات</label><input id="hzsc" type="number" inputmode="numeric" min="1" max="50" value="7"><button class="btn primary" data-hzs>ابدأ</button></section><p class="kmmut pt-note">يفتح المصحف والآيات مميّزة. اقرأها، ثم «أخفِ» وسمّع، واضغط على آية لتظهر. إذا أتممتها «حفظتها ✓» فيأتيك الحفظ التالي بنفس العدد.</p>'+hzList()}
document.addEventListener('change',function(e){if(e.target.id!=='hzsn')return;var i=document.getElementById('hzsa');if(i)i.value=hfFirst(+e.target.value)});
document.addEventListener('click',function(e){var b=e.target.closest('[data-hzt],[data-hzx],[data-hzs],[data-hzc],[data-hzd],[data-hzo],[data-hzq]');if(!b)return;var d=b.dataset,r=document.documentElement;
 if(d.hzx!==undefined){HP=null;hpSave();route();return}
 if(d.hzs!==undefined){var n=+document.getElementById('hzsn').value,a=parseInt(document.getElementById('hzsa').value,10),c=parseInt(document.getElementById('hzsc').value,10);if(!(a>=1&&a<=QC[n-1])){toast('رقم الآية من ١ إلى '+ar(QC[n-1]));return}if(!(c>=1&&c<=50))c=7;HP=hpMk(n,a,c);hpSave();delete r.dataset.hzh;hpGo();return}
 if(!HP)return;
 if(d.hzo!==undefined){delete r.dataset.hzh;hpGo();return}
 if(d.hzq!==undefined){delete r.dataset.hz;delete r.dataset.hzh;b.closest('.hzbar').remove();document.querySelectorAll('.rv').forEach(function(x){x.classList.remove('rv')});return}
 if(d.hzt!==undefined){var on=!r.dataset.hzh;if(on)r.dataset.hzh='1';else delete r.dataset.hzh;document.querySelectorAll('.rv').forEach(function(x){x.classList.remove('rv')});b.textContent=on?'أظهر':'أخفِ';b.setAttribute('aria-pressed',String(on));if(on)toast('اضغط على آية لتظهر');return}
 if(d.hzc!==undefined){HP=hpMk(HP.n,HP.a,HP.b-HP.a+1+ +d.hzc);hpSave();hpGo();return}
 if(d.hzd!==undefined){hfSet(HP.n,HP.a,HP.b,true);var c2=HP.b-HP.a+1,na=HP.b+1;delete r.dataset.hzh;if(na>QC[HP.n-1]){HP=null;toast('أتممت السورة، بارك الله فيك')}else{HP=hpMk(HP.n,na,c2);toast('هذا حفظك التالي')}hpSave();hpGo()}});
document.addEventListener('click',function(e){var b=e.target.closest('[data-hzgo]');if(!b)return;var k=b.dataset.hzgo.split('_');document.documentElement.dataset.hz='2';location.hash='#/quran/page/'+qpageOf(+k[0],+k[1])});
