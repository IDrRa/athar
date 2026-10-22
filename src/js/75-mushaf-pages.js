/* ===== v26 «صفحات المصحف»: Madinah mushaf pages — KFGQPC QCF4 fonts (Madinah 1441 edition), layout from quran-qcf4 (built by tools/mushaf_qcf4.py) ===== */
var QMM=true,MOFF=false,MBAD={},MD={},MP={},MFL={},MFC={};
/* first page of each of the 47 page fonts */
var MFS=[1,16,29,42,55,68,82,95,108,121,134,147,160,174,187,202,215,228,241,253,266,279,292,304,316,329,343,355,368,380,393,407,420,433,446,458,471,484,497,509,522,535,548,561,573,585,591];
function mfi(p){var i=0;while(i<46&&MFS[i+1]<=p)i++;return i+1}
function mff(i){if(!MFL[i])MFL[i]=mfont('QF'+i,'mushaf/q4/QCF4_Hafs_'+('0'+i).slice(-2)+'_W.woff2').catch(function(e){delete MFL[i];throw e});return MFL[i]}try{if(localStorage.getItem('athar-qm')==='t')QMM=false}catch(e){}
function mpad(p){return ('00'+p).slice(-3)}
function mfont(fam,url){if(!window.FontFace||!document.fonts)return Promise.reject('nf');var f=new FontFace(fam,'url('+url+')',{display:'block'});return f.load().then(function(x){document.fonts.add(x)})}
function mload(p){if(MD[p])return Promise.resolve(MD[p]);if(MP[p])return MP[p];
 MP[p]=Promise.all([fetch('mushaf/q4/l/'+mpad(p)+'.json').then(function(r){if(!r.ok)throw 'nf';return r.json()}),mff(mfi(p))])
 .then(function(a){var d=a[0];if(!d||d.p!==p||!d.r||!d.f)throw 'bad';var x=[];d.r.forEach(function(r){if(r[0]==='b'&&r[2]!==d.f)x.push(mff(r[2]))});return Promise.all(x).then(function(){MD[p]=d;delete MP[p];return d})})
 .catch(function(e){delete MP[p];throw e});return MP[p]}
function mwait(p){mload(p).then(function(){if(QPS&&QPS.p===p&&document.querySelector('.qpg.mus .mwait')){V.innerHTML=qpage(p);qfit();var m=location.hash.match(/^#\/quran\/(\d+)\/(\d+)$/);if(m)qsel(+m[1],+m[2],true)}},
 function(e){if(e==='nf')MOFF=true;else MBAD[p]=1;if(QPS&&QPS.p===p&&document.querySelector('.qpg.mus .mwait')){V.innerHTML=qpage(p);qfit();if(MBAD[p])toast('تعذّر تحميل صفحة المصحف، فعُرض النص')}});
 return '<div class="mwait" role="status"><i aria-hidden="true"></i>جارٍ تحميل الصفحة…</div>'}
function mbody(p,sg){var d=MD[p],sr=sg.map(function(g){var V=QV(g[0]),t=[];for(var v=g[1];v<=g[2];v++)t.push(V[v-1]+' ('+ar(v)+')');return t.join(' ')}).join(' ');
 var h='<p class="sr" lang="ar">'+esc(sr)+'</p><div class="mbody'+(p<3?' m12':'')+'" style="font-family:\'QF'+d.f+'\'" lang="ar" dir="rtl" translate="no">';
 d.r.forEach(function(r){if(r[0]==='h'){var n=r[1];h+='<div class="ml mh"><div class="msh"><h2 class="msn">سورة '+QN[n-1]+'<span class="sr"> — '+QC[n-1]+' آية</span></h2></div></div>';return}
  if(r[0]==='b'){h+='<div class="ml mb" aria-hidden="true" style="font-family:\'QF'+(r[2]||d.f)+'\'">'+esc(r[1]||'')+'</div>';return}
  h+='<div class="ml">'+r.map(function(t){var q=t[1]+'_'+t[2];if(t[3]===2)return '<span class="mw mq" aria-hidden="true">'+esc(t[0])+'</span>';return t[3]?'<button class="mw mvn" id="v'+q+'" data-q="'+q+'" aria-pressed="false" aria-label="خيارات الآية '+ar(t[2])+'">'+esc(t[0])+'</button>':'<span class="mw" data-q="'+q+'" aria-hidden="true">'+esc(t[0])+'</span>'}).join('')+'</div>'});
 return h+'</div>'}
function mfit1(g){var b=g.querySelector('.mbody');if(!b)return;var W=b.clientWidth;if(!W)return;var p=+g.dataset.p,ls=[].slice.call(b.querySelectorAll('.ml:not(.mh):not(.mb)')),key=p+'|'+W+'|'+qvh(),c=MFC[key];
 if(!c){b.style.setProperty('--mfs','20px');b.style.setProperty('--mrh','40px');ls.forEach(function(l){l.classList.remove('c')});
  var ws=ls.map(function(l){var s=0;[].forEach.call(l.children,function(x){s+=x.getBoundingClientRect().width});return s}),mx=Math.max.apply(null,ws.concat([1])),
  ft=g.querySelector('.qft'),fh=ft?ft.getBoundingClientRect().height:60,rows=b.children.length,avail=qvh()-Math.max(0,b.getBoundingClientRect().top)-fh-16,
  fs=Math.max(12,p<3?Math.min(20*W/(mx*1.2),avail/15/1.55*1.08):Math.min(20*W/mx*.985,avail/rows/1.55,46)),rh=p<3?fs*2.2:Math.max(fs*1.55,Math.min(avail/rows,fs*2.4));
  c=MFC[key]={fs:fs,rh:rh,cs:ws.map(function(w){return p<3||w<mx*.8})}}
 b.style.setProperty('--mfs',c.fs.toFixed(2)+'px');b.style.setProperty('--mrh',c.rh.toFixed(2)+'px');ls.forEach(function(l,i){l.classList.toggle('c',!!c.cs[i])})}

/* v29: ready-made neighbour pages for smooth swiping */
var MGH={};
function mclr(){for(var k in MGH){var o=MGH[k];if(o&&o.parentNode&&o.parentNode.classList.contains('mprep'))o.parentNode.remove()}MGH={}}
addEventListener('hashchange',function(){if(!/^#\/quran\/(page\/)?\d/.test(location.hash))mclr()});
function mwrap(g){if(g.parentNode.classList&&g.parentNode.classList.contains('qtrack'))return;var tr=document.createElement('div');tr.className='qtrack';var cl=document.createElement('div');cl.className='qclip';g.parentNode.insertBefore(cl,g);cl.appendChild(tr);tr.appendChild(g)}
function mprep(q){if(!QPS||!QMM||MOFF||q<1||q>604||Math.abs(q-QPS.p)!==1)return;var old=MGH[q];if(old&&old.isConnected)return;
 for(var k in MGH){if(Math.abs(k-QPS.p)!==1){var o=MGH[k];if(o&&o.parentNode)o.parentNode.remove();delete MGH[k]}}
 var g=document.querySelector('#view .qpg.mus');if(!g)return;mwrap(g);var r=g.getBoundingClientRect(),host=document.createElement('div');host.className='mprep';host.setAttribute('aria-hidden','true');host.setAttribute('inert','');
 host.style.cssText='position:fixed;left:-10000px;top:0;width:'+r.width+'px;pointer-events:none;contain:layout paint';host.innerHTML=qghost(q);document.body.appendChild(host);var ng=host.querySelector('.qpg');if(ng){mfit1(ng);MGH[q]=ng}else host.remove()}

addEventListener('online',function(){MBAD={}});
document.addEventListener('click',function(e){var a=e.target.closest('a.skip');if(!a)return;e.preventDefault();var v=document.getElementById('view'),t=v&&!v.hidden?v:document.getElementById('app')||v;if(t){t.setAttribute('tabindex','-1');try{t.focus()}catch(x){}}});

/* v31 direct jumps in search */
var SNM=[['آية الكرسي',2,255],['خواتيم سورة البقرة',2,285],['آخر سورة البقرة',2,285],['آية الدين',2,282],['المعوذتين',113,1],['المعوذات',112,1],['آية النور',24,35]];
function ssc(q){var n=nz(q.trim().replace(/^سورة\s+/,'')).s,o=[];if(n.length<2)return '';
 SNM.forEach(function(x){var k=nz(x[0]).s;if(k===n||(n.length>=4&&k.indexOf(n)===0)||k.replace(/^(ايه|اخر|خواتيم) /,'')===n)o.push(cat('/quran/'+x[1]+'/'+x[2],x[0],'سورة '+QN[x[1]-1]+' · الآية '+ar(x[2])))});
 for(var i=0;i<114&&o.length<4;i++){var m=nz(QN[i]).s;if(m===n||(n.length>=3&&m.indexOf(n)===0))o.push(cat('/quran/'+(i+1)+'/1','سورة '+QN[i],ar(QC[i])+' آية · صفحة '+ar(qpageOf(i+1,1))))}
 return o.length?'<p class="hint">انتقال مباشر</p><ul class="list">'+o.slice(0,4).join('')+'</ul>':''}
addEventListener('hashchange',route);route();
})();

