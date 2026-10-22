/* ===== v16 «بطاقة»: image card drawn on a canvas ===== */
var CD=null,cdOpener=null;
function cdTok(){var cs=getComputedStyle(document.documentElement),g=function(n){return cs.getPropertyValue(n).trim()};return{bg:g('--bg'),sf:g('--surface'),tx:g('--text'),mu:g('--muted'),gr:g('--green'),gd:g('--gold'),ln:g('--line'),ti:g('--tint')}}
function cdWrap(c,t,w){var out=[];String(t).replace(/\r\n?/g,'\n').split('\n').forEach(function(par){var ws=par.split(/\s+/).filter(Boolean),l='';ws.forEach(function(x){var tr=l?l+' '+x:x;if(l&&c.measureText(tr).width>w){out.push(l);l=x}else l=tr});if(l)out.push(l)});return out}
function cdRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function cdStar(c,x,y,s,col){var k=s*1.3/64;c.save();c.translate(x,y);c.scale(k,k);c.translate(-32,-31.5);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=2.6;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(14,58);c.lineTo(14,30);c.quadraticCurveTo(14,14,32,5);c.quadraticCurveTo(50,14,50,30);c.lineTo(50,58);c.closePath();c.stroke();c.beginPath();c.moveTo(22,58);c.lineTo(22,33);c.quadraticCurveTo(22,22,32,15);c.quadraticCurveTo(42,22,42,33);c.lineTo(42,58);c.stroke();c.beginPath();c.moveTo(8,58);c.lineTo(56,58);c.stroke();c.restore()}
function cdDraw(o){var T=cdTok(),W=1080,P=72,IW=W-2*P-120,c0=document.createElement('canvas').getContext('2d'),
 FQ="'KFGQPC Hafs','Amiri Quran','Amiri',serif",FA="'Amiri','Traditional Arabic','Times New Roman',serif",FU="'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif",fam=o.quran?FQ:FA;
 c0.direction='rtl';var fs=66,L,lh,top=P+150+(o.title?70:0),bot=0,H;
 c0.font='400 30px '+FU;var RL=cdWrap(c0,o.ref||'',IW).slice(0,4);bot=(RL.length*44)+235;
 for(;fs>=26;fs-=2){c0.font='400 '+fs+'px '+fam;L=cdWrap(c0,o.text,IW);lh=Math.round(fs*(o.quran?2.05:1.95));H=top+L.length*lh+60+bot+P;if(H<=1350)break}
 H=Math.max(1080,Math.min(3000,H)); /* short texts get a square card, no empty band */
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');c.direction='rtl';c.textAlign='center';c.textBaseline='middle';
 c.fillStyle=T.bg;c.fillRect(0,0,W,H);
 cdRR(c,P/2,P/2,W-P,H-P,40);c.fillStyle=T.sf;c.fill();c.lineWidth=3;c.strokeStyle=T.ln;c.stroke();
 cdRR(c,P/2+18,P/2+18,W-P-36,H-P-36,28);c.lineWidth=2;c.strokeStyle=T.gd;c.globalAlpha=.55;c.stroke();c.globalAlpha=1;
 var y=P+60;cdStar(c,W/2,y,38,T.gd);y+=62;
 c.font='500 30px '+FU;var lw=c.measureText(o.label).width+56;cdRR(c,W/2-lw/2,y-26,lw,52,26);c.lineWidth=2;c.strokeStyle=T.ln;c.stroke();c.fillStyle=T.mu;c.fillText(o.label,W/2,y+1);y+=60;
 if(o.title){c.font='700 38px '+FU;c.fillStyle=T.gr;var tl=cdWrap(c,o.title,IW)[0]||'';c.fillText(tl,W/2,y+8);y+=70}
 var avail=H-P-bot-y,blk=L.length*lh;y+=Math.max(30,(avail-blk)/2);
 c.font='400 '+fs+'px '+fam;c.fillStyle=T.tx;L.forEach(function(l){c.fillText(l,W/2,y+lh/2);y+=lh});
 var yb=H-P-bot+40;c.setLineDash([10,10]);c.strokeStyle=T.ln;c.lineWidth=2;c.beginPath();c.moveTo(P+90,yb);c.lineTo(W-P-90,yb);c.stroke();c.setLineDash([]);
 c.font='400 30px '+FU;c.fillStyle=T.mu;var yr=yb+46;RL.forEach(function(l){c.fillText(l,W/2,yr);yr+=44});
 c.font='700 60px '+FA;c.fillStyle=T.gr;c.fillText('أثر',W/2,H-P-84);c.font='400 26px '+FU;c.fillStyle=T.mu;c.fillText('ما ينفعك ويبقى أثره',W/2,H-P-32);
 return cv}
function cdOpen(o){var bk=document.getElementById('cardS');if(!bk)return;cdOpener=document.activeElement;bk.hidden=false;var B=document.getElementById('cdB');B.innerHTML='<p class="tfmsg" role="status">جارٍ تجهيز البطاقة…</p>';
 var fam=o.quran?'"KFGQPC Hafs"':'"Amiri"',ld=function(f){try{return document.fonts.load(f,o.text.slice(0,200)).catch(function(){})}catch(x){return Promise.resolve()}};
 Promise.all([ld('48px '+fam),ld('700 60px "Amiri"'),ld('30px "IBM Plex Sans Arabic"'),ld('700 38px "IBM Plex Sans Arabic"')]).then(function(){
  var cv=cdDraw(o),url=cv.toDataURL('image/png');CD={cv:cv,url:url,name:'athar-'+(o.name||'card')+'.png'};
  B.innerHTML='<img src="'+url+'" alt="بطاقة: '+esc(o.text.slice(0,80))+'…">';setTimeout(function(){var c=bk.querySelector('[data-cdclose]');if(c)c.focus()},30)})
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
 return{label:o.type==='dua'?(DT[o.kind||'general']||'دعاء'):'ذكر',title:o.title||'',text:tx,ref:src.join(' · '),quran:q,name:o.id}}
document.addEventListener('click',function(e){var t=e.target,b=t.closest('[data-cdid]');if(b){var o=ALL[b.dataset.cdid];if(o)cdOpen(cdFromItem(o));return}
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
 var eve=false,pre=false;try{var PT=nowTimes(d).t;eve=d.getTime()>=PT.maghrib;pre=d.getTime()<PT.fajr}catch(e){}
 if((wd===4&&eve)||(wd===5&&pre))L.push({k:'jumua-layla',t:'ليلة الجمعة',ids:['jumua-layla','jumua-salat'],sal:1});
 if(wd===5&&!eve&&!pre)L.push({k:'jumua',t:'يوم الجمعة',ids:['jumua-salat','jumua-sa3a'],sal:1});
 if((wd===1||wd===4)&&!eve)L.push({k:'ithnayn',t:wd===1?'يوم الاثنين':'يوم الخميس',ids:['ithnayn-khamis']});
 return L.slice(0,2)}
function ocCard(o){var h='<article class="occ"><h3 class="och">'+o.t+'</h3>'+(o.hj?'<p class="ock">بحسب تقويم أم القرى</p>':'');
 (o.ids||[]).forEach(function(id){var x=OCC[id];if(!x)return;h+='<p class="ocl">من حديث النبي ﷺ</p><p class="oct" lang="ar">«'+esc(x.t)+'»</p><p class="ocr">'+esc(x.r)+'</p>'});
 if(o.sal&&tryX()&&ALL['dhikr-hisn-023-01']){var sw=ALL['dhikr-hisn-023-01'];h+='<p class="ocl">صيغة الصلاة على النبي ﷺ</p><p class="oct" lang="ar">'+esc(sw.text)+'</p><p class="ocr">'+esc([sw.source,sw.reference].filter(Boolean).join(' · '))+'</p>'}
 if(o.dua&&ALL[o.dua]){var a=ALL[o.dua];h+='<p class="ocl">'+esc(a.title||'دعاء')+'</p><p class="oct" lang="ar">'+esc(a.text)+'</p><p class="ocr">'+esc([a.source,a.reference].filter(Boolean).join(' · '))+'</p>'}
 if(o.links)h+='<p class="ocln">'+o.links.map(function(l){return '<a class="chip" href="#'+l[1]+'">'+l[0]+'</a>'}).join('')+'</p>';
 return h+'</article>'}
function ocRender(){var el=document.getElementById('occs');if(!el)return;var L=[];try{L=ocList()}catch(e){}el.hidden=!L.length;el.innerHTML=L.length?'<h2>ما يناسب اليوم</h2>'+L.map(ocCard).join(''):''}

