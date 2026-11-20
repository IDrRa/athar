/* ===== v16 «بطاقة»: image card drawn on a canvas ===== */
var CD=null,cdOpener=null;
var CDST=[['night','ليلي'],['paper','ورقي']];
function cdSt(){var v='night';try{v=localStorage.getItem('athar-cdst')||'night'}catch(e){}return CDST.some(function(x){return x[0]===v})?v:'night'}
/* لون الزخرفة في البطاقة = لون الموقع المختار (نفس درجة الواجهة)، لا ذهبي ثابت */
function cdAcc(v){try{var i=document.createElement('i');i.style.color='var('+v+')';i.style.display='none';document.body.appendChild(i);var c=getComputedStyle(i).color;i.remove();var m=/(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(c);return m?[+m[1],+m[2],+m[3]]:null}catch(e){return null}}
function cdMix(a,b,t){return 'rgb('+a.map(function(x,i){return Math.round(x*t+b[i]*(1-t))}).join(',')+')'}
function cdTok(st){st=st||cdSt();var ac=cdAcc('--acc')||[201,165,96],tx=cdAcc('--goldtx')||ac;
 if(st==='paper')return{st:st,bg:'#f4eee2',sf:'#f8f3e8',tx:'#1d1a14',mu:'#6f6655',gr:'#1d1a14',gd:cdMix(ac,[29,26,20],.75),ln:'#d8ccb3'};
 return{st:st,bg:'#0a0a09',sf:st==='arch'?'#0b0a08':'#111110',tx:'#f4efe4',mu:'#a49c8c',gr:'#f4efe4',gd:(.2126*tx[0]+.7152*tx[1]+.0722*tx[2]>120?'rgb('+tx.join(',')+')':cdMix(ac,[244,239,228],.62)),ln:'#2a2721'}} /* بطاقة داكنة والموقع فاتح: درجة أفتح تُقرأ على الأسود */
/* words are split on plain spaces only, so an ayah number joined to its ayah with a no-break space never starts a line.
   Lines are balanced: the same number of lines as filling greedily, with even lengths. */
function cdWrap(c,t,w){var out=[];String(t).replace(/\r\n?/g,'\n').split('\n').forEach(function(par){var ws=par.split(/[ \t]+/).filter(Boolean);if(!ws.length)return;
 var n=ws.length,sp=c.measureText(' ').width,ww=ws.map(function(x){return c.measureText(x).width}),k=1,cur=0;
 for(var i=0;i<n;i++){var add=(cur?sp:0)+ww[i];if(cur&&cur+add>w){k++;cur=ww[i]}else cur+=add}
 if(k===1||n>400){var l='';ws.forEach(function(x){var tr=l?l+' '+x:x;if(l&&c.measureText(tr).width>w){out.push(l);l=x}else l=tr});out.push(l);return}
 var len=function(a,b){var s=0;for(var j=a;j<b;j++)s+=ww[j];return s+sp*(b-a-1)},INF=1e18,D=[],B=[];
 for(var r=0;r<=k;r++){D.push(new Array(n+1).fill(INF));B.push(new Array(n+1).fill(0))}D[0][0]=0;
 for(r=1;r<=k;r++)for(var e=1;e<=n;e++)for(var s=e-1;s>=0;s--){var L=len(s,e);if(L>w&&e-s>1)break;if(D[r-1][s]>=INF)continue;var v=D[r-1][s]+(w-L)*(w-L);if(v<D[r][e]){D[r][e]=v;B[r][e]=s}}
 if(D[k][n]>=INF){out.push(ws.join(' '));return}var res=[],e2=n;for(r=k;r>0;r--){var s2=B[r][e2];res.unshift(ws.slice(s2,e2).join(' '));e2=s2}out.push.apply(out,res)});return out}
function cdRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
/* Safari (WebKit) draws each stretch of Arabic text between ayah numbers on its own, and the cursive joins of the Quran font can lift
   or drop that stretch. So a line is drawn piece by piece (text stretches and ayah numbers), each text stretch first drawn off-screen,
   its real baseline found as the densest row of ink, and moved back only when it is clearly off. Where nothing moves (Chrome) the line is unchanged. */
function cdInk(c,t,fs){try{var h=Math.ceil(fs*4),y0=Math.round(fs*2.6),w=Math.ceil(c.measureText(t).width)+40,k=document.createElement('canvas');k.width=w;k.height=h;var x=k.getContext('2d');
 x.font=c.font;x.direction='rtl';x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#000';x.fillText(t,w/2,y0);
 var d=x.getImageData(0,0,w,h).data,best=-1,row=y0;for(var r=0;r<h;r++){var s=0;for(var q=r*w*4+3,e=q+w*4;q<e;q+=4)s+=d[q];if(s>best){best=s;row=r}}return row-y0}catch(e){return null}}
/* hf: لكل كلمة في السطر هل هي مميزة بالذهبي (hlWords)، وgd لونها */
function cdLine(c,l,cx,y,fs,ratio,hf,gd){var ws=l.split(/([ \u00A0]+)/),P=[];for(var i=0;i<ws.length;i+=2){var w=ws[i],sep=ws[i+1]||'',num=/^[\u0660-\u0669]+$/.test(w),h=!!(hf&&hf[i/2]),last=P[P.length-1];
  if(last&&!num&&!last.num&&last.sep.indexOf('\u00A0')<0&&last.hl===h){last.t+=last.sep+w;last.sep=sep}else if(w)P.push({t:w,sep:sep,num:num,hl:h})}
 var tot=0;P.forEach(function(p,k){p.w=c.measureText(p.t).width;p.sw=k<P.length-1?c.measureText(p.sep).width:0;tot+=p.w+p.sw});
 var x=cx+tot/2,al=c.textAlign;c.textAlign='right';P.forEach(function(p){var adj=0;if(!p.num){var sh=cdInk(c,p.t,fs);if(sh!==null&&Math.abs(sh-ratio*fs)>fs*.06)adj=sh-ratio*fs}var fc=c.fillStyle;if(p.hl&&gd)c.fillStyle=gd;c.fillText(p.t,x,y-adj);c.fillStyle=fc;x-=p.w+p.sw});c.textAlign=al}
/* تصميم البطاقة: محراب رفيع يتلاشى للأسفل + توهّج خفيف، بلون الموقع المختار، وبلا سطر المصدر (طلب المالك).
   الخطوط نفس خطوط الموقع: «أثر» والنص بأميري، والعنوان والتسمية بـIBM Plex، والقرآن بخط حفص */
function cdDraw(o){var T=cdTok(),dark=T.st!=='paper',W=1080,IW=W-260,c0=document.createElement('canvas').getContext('2d'),
 FQ="'KFGQPC Hafs','Amiri Quran','Amiri',serif",FA="'Amiri','Traditional Arabic','Times New Roman',serif",FU="'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif",fam=o.quran?FQ:FA,
 rgba=function(a){return T.gd.replace('rgb(','rgba(').replace(')',','+a+')')};
 c0.direction='rtl';var fs=66,L,lh,top=360+(o.title?60:0),bot=190,H;
 for(;fs>=26;fs-=2){c0.font='400 '+fs+'px '+fam;L=cdWrap(c0,o.text,IW);lh=Math.round(fs*(o.quran?2.05:1.95));H=top+L.length*lh+60+bot;if(H<=1350)break}
 H=Math.max(1080,Math.min(3000,H)); /* short texts get a square card, no empty band */
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');c.direction='rtl';c.textAlign='center';c.textBaseline='middle';
 c.fillStyle=T.bg;c.fillRect(0,0,W,H);
 var g=c.createRadialGradient(W/2,120,20,W/2,120,W*.62);g.addColorStop(0,rgba(dark?.17:.12));g.addColorStop(1,rgba(0));c.fillStyle=g;c.fillRect(0,0,W,H);
 /* المحراب: قوسان رفيعان على حواف البطاقة (خارج عمود النص)، يتلاشيان نحو الأسفل */
 var k=document.createElement('canvas');k.width=W;k.height=H;var x=k.getContext('2d');x.strokeStyle=T.gd;
 [[58,2.4,1],[86,1.2,.6]].forEach(function(q){var x0=q[0],x1=W-q[0],t=30+q[0]*.5,sh=(x1-x0)*.42;x.beginPath();x.moveTo(x0,H);x.lineTo(x0,t+sh);x.bezierCurveTo(x0,t+sh*.45,W/2-(x1-x0)*.18,t+sh*.12,W/2,t);x.bezierCurveTo(W/2+(x1-x0)*.18,t+sh*.12,x1,t+sh*.45,x1,t+sh);x.lineTo(x1,H);x.lineWidth=q[1];x.globalAlpha=q[2];x.stroke()});
 x.globalAlpha=1;x.globalCompositeOperation='destination-in';var m=x.createLinearGradient(0,0,0,H);m.addColorStop(0,'#000');m.addColorStop(Math.min(.6,700/H),'rgba(0,0,0,.8)');m.addColorStop(Math.min(.97,1050/H),'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,W,H);
 c.globalAlpha=dark?.55:.65;c.drawImage(k,0,0);c.globalAlpha=1;
 var y=250;c.font='700 66px '+FA;c.fillStyle=T.gd;c.fillText('أثر',W/2,y);y+=84;
 c.font='500 26px '+FU;c.fillStyle=T.gd;c.globalAlpha=.85;c.fillText(o.label,W/2,y);c.globalAlpha=1;y+=50;
 if(o.title){c.font='600 40px '+FU;c.fillStyle=T.gr;c.fillText(cdWrap(c,o.title,IW)[0]||'',W/2,y);y+=64}
 var avail=H-bot-y,blk=L.length*lh;y+=Math.max(36,(avail-blk)/2);
 c.font='400 '+fs+'px '+fam;c.fillStyle=T.tx;c.textBaseline='alphabetic';var wi=0;L.forEach(function(l){var n=l.split(/[ \t]+/).filter(Boolean).length,hf=o.hlw?o.hlw.slice(wi,wi+n):null;wi+=n;cdLine(c,l,W/2,y+lh/2+fs*.32,fs,o.quran?-.07:-.09,hf,T.gd);y+=lh});c.textBaseline='middle';
 c.strokeStyle=T.gd;c.globalAlpha=.7;c.lineWidth=2;c.beginPath();c.moveTo(W/2-40,H-150);c.lineTo(W/2+40,H-150);c.stroke();c.globalAlpha=1;
 c.font='400 26px '+FU;c.fillStyle=T.mu;c.fillText('ما ينفعك ويبقى أثره',W/2,H-104);c.font='600 26px '+FU;c.fillStyle=T.gd;c.fillText('atharuk.com',W/2,H-62);
 return cv}
var CDO=null;
function cdRender(){var B=document.getElementById('cdB'),o=CDO;if(!B||!o)return;var st=cdSt(),cv=cdDraw(o),url=cv.toDataURL('image/png');CD={cv:cv,url:url,name:'athar-'+(o.name||'card')+'.png'};
 B.innerHTML='<img src="'+url+'" alt="بطاقة: '+esc(o.text.slice(0,80))+'…">';
 var ch=document.getElementById('cdSt');if(ch)ch.innerHTML=CDST.map(function(x){return '<button type="button" class="chip" data-cdst="'+x[0]+'" aria-pressed="'+(x[0]===st)+'">'+x[1]+'</button>'}).join('')}
document.addEventListener('click',function(e){var b=e.target.closest('[data-cdst]');if(!b)return;try{localStorage.setItem('athar-cdst',b.dataset.cdst)}catch(x){}cdRender()});
function cdOpen(o){var bk=document.getElementById('cardS');if(!bk)return;cdOpener=document.activeElement;bk.hidden=false;var B=document.getElementById('cdB');B.innerHTML='<p class="tfmsg" role="status">جارٍ تجهيز البطاقة…</p>';
 var fam=o.quran?'"KFGQPC Hafs"':'"Amiri"',ld=function(f){try{return document.fonts.load(f,o.text.slice(0,200)).catch(function(){})}catch(x){return Promise.resolve()}};
 Promise.all([ld('48px '+fam),ld('700 60px "Amiri"'),ld('30px "IBM Plex Sans Arabic"'),ld('600 40px "IBM Plex Sans Arabic"'),ld('500 26px "IBM Plex Sans Arabic"')]).then(function(){
  CDO=o;cdRender();setTimeout(function(){var c=bk.querySelector('[data-cdclose]');if(c)c.focus()},30)})
 .catch(function(){B.innerHTML='<p class="tfmsg" role="alert">تعذّر تجهيز البطاقة.</p>'})}
/* iPhone/iPad ignore <a download>: open the share sheet with the image, which has «حفظ الصورة» */
function cdIOS(){var u=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)}
function cdSave(){if(!CD)return;var nm=CD.name,cv=CD.cv,url=CD.url,fb=function(m){if(m){kmTo(m);return}
 if(cdIOS()&&navigator.canShare){cv.toBlob(function(bl){var f=null;try{f=new File([bl],nm,{type:'image/png'})}catch(x){}
  if(f&&navigator.canShare({files:[f]})){kmTo('اختر «حفظ الصورة»');navigator.share({files:[f]}).catch(function(){})}else kmTo('اضغط مطوّلًا على الصورة لحفظها')},'image/png');return}
 var a=document.createElement('a');a.href=url;a.download=nm;document.body.appendChild(a);a.click();a.remove()};
 var cl=window.claude;if(!cl||typeof cl.use!=='function'){fb();return}
 cl.use('downloads').then(function(dl){if(!dl){fb('الحفظ غير متاح هنا — اضغط مطوّلًا على الصورة لحفظها');return}
  cv.toBlob(function(bl){dl.save({filename:nm,data:bl}).then(function(r){if(r&&r.status==='saved')kmTo('حُفظت الصورة')}).catch(function(e){var c=e&&e.code;if(c==='declined')return;kmTo(c==='rate_limited'?'انتظر قليلًا ثم أعد المحاولة':'تعذّر الحفظ هنا — اضغط مطوّلًا على الصورة لحفظها')})},'image/png')})
 .catch(function(){fb('تعذّر الحفظ هنا — اضغط مطوّلًا على الصورة لحفظها')})}
function cdClose(){document.getElementById('cardS').hidden=true;CD=null;if(cdOpener&&cdOpener.focus)try{cdOpener.focus({preventScroll:true})}catch(x){}}
function cdNum(n){return ' '+ar(n)+' '}
function cdFromItem(o){var q=o.kind==='quran'||o.kind==='prophets',src=[];if(o.source&&o.source!==NS&&(o.reference||'').indexOf(o.source)!==0)src.push(o.source);if(o.reference&&o.reference!==NS)src.push(o.reference);
 var tx=o.verses?o.verses.map(function(v){return v.text+cdNum(v.a)}).join(' ').trim():rdtx(o).replace(/<[^>]*>/g,'');
 return{label:o.type==='dua'?(DT[o.kind||'general']||'دعاء'):'ذكر',title:o.title||'',text:tx,ref:src.join(' · '),quran:q,name:o.id,hlw:o.verses?null:hlWords(o,tx)}}
document.addEventListener('click',function(e){var t=e.target,b=t.closest('[data-cdid]');if(b){var o=ALL[b.dataset.cdid];if(o){var x=cdFromItem(o);if(b.dataset.cdt)x.title=b.dataset.cdt;if(typeof jmCtx==='function'&&jmCtx(b)){x.title='';x.label='دعاء'}cdOpen(x)}return}
 b=t.closest('[data-cdwq]');if(b){var w=wqById(b.dataset.cdwq);if(w){var q=w.textType==='quran';cdOpen({label:'وقفة أثر · '+WQT[w.textType],title:w.title,text:q?w.verses.map(function(v){return v.text+(w.verses.length>1?cdNum(v.a):'')}).join(' ').trim():w.text,ref:wqRef(w),quran:q,name:w.id})}return}
 var bk=document.getElementById('cardS');if(!bk||bk.hidden)return;if(t===bk||t.closest('[data-cdclose]')){cdClose();return}
 b=t.closest('[data-cd]');if(!b||!CD)return;
 if(b.dataset.cd==='save'){cdSave();return}
 var nm=CD.name;CD.cv.toBlob(function(bl){var f=null;try{f=new File([bl],nm,{type:'image/png'})}catch(x){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'أثر'}).catch(function(){})}
  else kmTo('المشاركة المباشرة غير متاحة هنا — احفظ الصورة أو اضغط عليها مطوّلًا')},'image/png')});
document.addEventListener('keydown',function(e){var bk=document.getElementById('cardS');if(!bk||bk.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();cdClose();return}
 if(e.key==='Tab'){var f=bk.querySelectorAll('button'),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true);
addEventListener('hashchange',function(){var bk=document.getElementById('cardS');if(bk&&!bk.hidden)cdClose()});

document.addEventListener('click',function(e){if(!e.target.closest('[data-wqnext]'))return;var w=wqNext();try{today()}catch(x){}if(location.hash==='#/waqfa')route();else location.hash='#/waqfa';live('وقفة: '+w.title)});
var OCC={"jumua-layla":{"t":"أكثِروا الصَّلاةَ عليَّ يومَ الجمُعةِ وليلةَ الجمُعةِ، فمَن صلَّى عليَّ صلاةً صلَّى اللهُ عليهِ عَشرًا","r":"صحيح الجامع، رقم 1209، حسّنه الألباني"},"jumua-sa3a":{"t":"فِيهِ سَاعَةٌ لاَ يُوَافِقُهَا عَبْدٌ مُسْلِمٌ، وَهْوَ قَائِمٌ يُصَلِّي، يَسْأَلُ اللَّهَ تَعَالَى شَيْئًا إِلاَّ أَعْطَاهُ إِيَّاهُ","r":"صحيح البخاري، رقم 935"},"jumua-salat":{"t":"إنَّ من أفضلِ أيَّامِكم يومَ الجمعةِ فيه خُلِق آدمُ، وفيه قُبِض، وفيه النَّفخةُ، وفيه الصَّعقةُ، فأكثِروا عليَّ من الصَّلاةِ فإنَّ صلاتَكم معروضةٌ عليَّ","r":"صحيح أبي داود، رقم 1047، صحّحه الألباني"},"ithnayn-khamis":{"t":"تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ","r":"سنن الترمذي، رقم 747، صحّحه الألباني"},"bid":{"t":"يَا أَبَا ذَرٍّ إِذَا صُمْتَ مِنَ الشَّهْرِ ثَلاَثَةَ أَيَّامٍ فَصُمْ ثَلاَثَ عَشْرَةَ وَأَرْبَعَ عَشْرَةَ وَخَمْسَ عَشْرَةَ","r":"سنن الترمذي، رقم 761، قال الألباني: حسن صحيح"},"ramadan":{"t":"مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ","r":"صحيح البخاري، رقم 38"},"qadr":{"t":"مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ","r":"صحيح البخاري، رقم 1901"},"qadr-witr":{"t":"تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ","r":"صحيح البخاري، رقم 2017"},"shawwal":{"t":"مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ","r":"صحيح مسلم، رقم 1164"},"ashr-hijja":{"t":"مَا الْعَمَلُ فِي أَيَّامِ الْعَشْرِ أَفْضَلَ مِنَ الْعَمَلِ فِي هَذِهِ","r":"صحيح البخاري، رقم 969"},"arafa":{"t":"صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ","r":"صحيح مسلم، رقم 1162"},"tashriq":{"t":"أَيَّامُ التَّشْرِيقِ أَيَّامُ أَكْلٍ وَشُرْبٍ","r":"صحيح مسلم، رقم 1141"},"muharram":{"t":"أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ","r":"صحيح مسلم، رقم 1163"},"ashura":{"t":"وَصِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ","r":"صحيح مسلم، رقم 1162"}};

function ocNow(){var d=null;try{var x=localStorage.getItem('athar-dbg-date');if(x)d=new Date(x)}catch(e){}return d&&!isNaN(d)?d:new Date()}
function ocHijri(d){try{var p=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric'}).formatToParts(d),o={};p.forEach(function(x){o[x.type]=+x.value});return o.month&&o.day?{m:o.month,d:o.day}:null}catch(e){return null}}
/* sunnah fasting: no reminder for a day on which fasting is not done (Ramadan is already fasted; Eid al-Fitr; the Day of Nahr and the days of Tashriq) */
function snFast(h){return !!h&&h.m!==9&&!(h.m===10&&h.d===1)&&!(h.m===12&&h.d>=10&&h.d<=13)}
/* the white days start on the 13th; not in Ramadan, and not in Dhu al-Hijjah where the 13th is a day of Tashriq */
function snBeed(h){return !!h&&h.d===13&&h.m!==9&&h.m!==12}
/* the evening before a sunnah fast (from Asr): «غدًا الاثنين» / «غدًا أول الأيام البيض» with the same hadiths */
function ocEve(d,PT){if(!(d.getTime()>=PT.asr))return null;var wd=d.getDay(),th=ocHijri(new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12)),f=(wd===0||wd===3)&&snFast(th),b=snBeed(th);if(!f&&!b)return null;
 return {k:'fast-eve',t:'غدًا '+(f?(wd===0?'الاثنين':'الخميس'):'')+(f&&b?'، و':'')+(b?'أول الأيام البيض':''),ids:(f?['ithnayn-khamis']:[]).concat(b?['bid']:[]),hj:b?1:0}}
function ocList(){var d=ocNow(),wd=d.getDay(),h=ocHijri(d),L=[];
 if(h){var m=h.m,dd=h.d;
  if(m===12&&dd===9)L.push({k:'arafa',t:'يوم عرفة',ids:['arafa','ashr-hijja'],hj:1});
  else if(m===12&&dd<=8)L.push({k:'ashr',t:'عشر ذي الحجة',ids:['ashr-hijja'],hj:1});
  if(m===12&&dd>=11&&dd<=13)L.push({k:'tashriq',t:'أيام التشريق',ids:['tashriq'],hj:1});
  if(m===1&&dd===10)L.push({k:'ashura',t:'يوم عاشوراء',ids:['ashura','muharram'],hj:1});
  else if(m===1&&dd===9)L.push({k:'ashura9',t:'غدًا يوم عاشوراء',ids:['ashura'],hj:1});
  else if(m===1)L.push({k:'muharram',t:'شهر الله المحرّم',ids:['muharram'],hj:1});
  if(m===9&&dd>=21)L.push({k:'qadr',t:'العشر الأواخر من رمضان',ids:['qadr-witr','qadr'],links:[['دعاء ليلة القدر','/dua/dua-gen-ibnmajah-3850']],hj:1});
  if(m===9)L.push({k:'ramadan',t:'شهر رمضان',ids:['ramadan'],links:[['دعاء الإفطار','/dua/dua-hisn-069-02']],hj:1});
  if(m===10&&dd>=2)L.push({k:'shawwal',t:'شهر شوّال',ids:['shawwal'],hj:1});
  if(dd>=13&&dd<=15&&m!==9&&!(m===12&&dd===13))L.push({k:'bid',t:'الأيام البيض',ids:['bid'],hj:1});
  if(dd<=2)L.push({k:'hilal',t:'أول الشهر الهجري',dua:'dua-hisn-068-01',hj:1})}
 /* weekday cards end at Maghrib: from Maghrib on Thursday until Fajr it is ليلة الجمعة */
 var eve=false,pre=false,E=null;try{var PT=nowTimes(d).t;eve=d.getTime()>=PT.maghrib;pre=d.getTime()<PT.fajr;E=ocEve(d,PT)}catch(e){}
 if((wd===4&&eve)||(wd===5&&pre))L.push({k:'jumua-layla',t:'ليلة الجمعة',ids:['jumua-salat'],links:[['صيغة الصلاة على النبي ﷺ','/salawat']]});
 if(wd===5&&!eve&&!pre)L.push({k:'jumua',t:'يوم الجمعة',ids:['jumua-salat','jumua-sa3a'],links:[['صيغة الصلاة على النبي ﷺ','/salawat'],['فواتح الدعاء وجوامعه','/dua/jumua/all']]});
 if((wd===1||wd===4)&&!eve&&(!h||snFast(h)||h.m===9))L.push({k:'ithnayn',t:wd===1?'يوم الاثنين':'يوم الخميس',ids:['ithnayn-khamis']});
 return E?L.slice(0,1).concat([E]):L.slice(0,2)}
function ocCard(o){var h='<article class="occ"><h3 class="och">'+o.t+'</h3>'+(o.hj?'<p class="ock">بحسب تقويم أم القرى</p>':'');
 (o.ids||[]).forEach(function(id){var x=OCC[id];if(!x)return;h+='<p class="ocl">من حديث النبي ﷺ</p><p class="oct" lang="ar">«'+esc(x.t)+'»</p><p class="ocr">'+esc(x.r)+'</p>'});
 if(o.dua&&ALL[o.dua]){var a=ALL[o.dua];h+='<p class="ocl">'+esc(a.title||'دعاء')+'</p><p class="oct" lang="ar">'+esc(a.text)+'</p><p class="ocr">'+esc([a.source,a.reference].filter(Boolean).join(' · '))+'</p>'}
 if(o.links)h+='<p class="ocln">'+o.links.map(function(l){return '<a class="chip" href="#'+l[1]+'">'+l[0]+'</a>'}).join('')+'</p>';
 return h+'</article>'}
function ocRender(){var el=document.getElementById('occs');if(!el)return;var L=[];try{L=ocList()}catch(e){}el.hidden=!L.length;el.innerHTML=L.length?'<h2>ما يناسب اليوم</h2>'+L.map(ocCard).join(''):''}

