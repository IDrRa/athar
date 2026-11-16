/* الانتقال إلى atharuk.com: على العنوان القديم يظهر تنبيه ينقل الزائر وبياناته، وعلى الجديد تُستقبل البيانات مرة واحدة */
(function(){var NEW='https://atharuk.com/',SKIP=/^(athar-dbg-date|athar-admin|athar-push|athar-off)$/;
function b64e(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
if(location.hostname==='iathar.pages.dev'){
 var bar=document.createElement('div');bar.className='mvbar';bar.setAttribute('role','region');bar.setAttribute('aria-label','انتقال أثر');
 bar.innerHTML='<b>أثر انتقل إلى عنوانه الجديد</b><span>atharuk.com — انتقل مع بياناتك (الختمة والحفظ والفواصل والدفتر والإعدادات)، ثم أضِف أثر إلى شاشتك من العنوان الجديد وفعّل التنبيهات.</span><button type="button" class="btn primary" id="mvgo">انتقل مع بياناتك</button>';
 document.body.insertBefore(bar,document.body.firstChild);
 document.getElementById('mvgo').addEventListener('click',function(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^athar-[a-z0-9-]+$/.test(k)&&!SKIP.test(k))o[k]=localStorage.getItem(k)}}catch(e){}
  location.href=NEW+(Object.keys(o).length?'#/move/'+b64e(JSON.stringify(o)):'')});
 return}
var m=/^#\/move\/([A-Za-z0-9_-]+)$/.exec(location.hash);if(!m)return;var d=null;try{d=JSON.parse(b64d(m[1]))}catch(e){}
history.replaceState(null,'',location.pathname+'#/');
if(!d||typeof d!=='object'){return}
var mvN=0;Object.keys(d).forEach(function(k){var v=d[k];if(/^athar-[a-z0-9-]+$/.test(k)&&!SKIP.test(k)&&typeof v==='string'&&v.length<1e6){try{localStorage.setItem(k,v);mvN++}catch(x){}}});
try{sessionStorage.setItem('athar-moved',String(mvN))}catch(e){}location.reload()})();
(function(){var mvC=null;try{mvC=sessionStorage.getItem('athar-moved');sessionStorage.removeItem('athar-moved')}catch(e){}if(mvC!==null&&typeof kmTo==='function')setTimeout(function(){kmTo(+mvC?'وصلت بياناتك إلى العنوان الجديد':'أهلًا بك في العنوان الجديد')},600)})();
