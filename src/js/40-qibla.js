/* ---- qibla ---- */
function qbBearing(l){var r=Math.PI/180,f1=l.lat*r,f2=KAABA[0]*r,dl=(KAABA[1]-l.lng)*r,y=Math.sin(dl)*Math.cos(f2),x=Math.cos(f1)*Math.sin(f2)-Math.sin(f1)*Math.cos(f2)*Math.cos(dl);return (Math.atan2(y,x)/r+360)%360}
function qbDist(l){var r=Math.PI/180,a=Math.sin((KAABA[0]-l.lat)*r/2),b=Math.sin((KAABA[1]-l.lng)*r/2),h=a*a+Math.cos(l.lat*r)*Math.cos(KAABA[0]*r)*b*b;return 2*6371*Math.asin(Math.sqrt(h))}
function qbDir(d){var n=['الشمال','الشمال الشرقي','الشرق','الجنوب الشرقي','الجنوب','الجنوب الغربي','الغرب','الشمال الغربي'];return n[Math.round(d/45)%8]}
function vQibla(){var l=ptLoc(),h=head('اتجاه القبلة','','/about');
 if(!l)return h+'<section class="card pt-card"><p>نحتاج موقعك لتحديد اتجاه القبلة.</p>'+ptPicker()+'</section>';
 var bg=qbBearing(l),km=qbDist(l);
 return h+'<div class="pt-loc"><span>'+MRI.pin+(l.name||'موقعك الحالي')+'</span><a class="lnk" href="#/prayer">تغيير</a></div>'
 +'<div class="kb-wrap"><div class="kb-dial" id="kb-dial" style="--qb:'+bg.toFixed(1)+'deg"><span class="kb-n">ش</span><span class="kb-e">شر</span><span class="kb-s">ج</span><span class="kb-w">غ</span><div class="kb-arrow" aria-hidden="true"><svg viewBox="0 0 24 60"><path d="M12 2 20 18h-5v40H9V18H4z"/></svg></div></div><div class="kb-top" aria-hidden="true"></div></div>'
 +'<p class="kb-st" id="kb-st" role="status">القبلة على '+ar(Math.round(bg))+'° من الشمال، نحو '+qbDir(bg)+'</p>'
 +'<p class="kmmut kb-info">المسافة إلى الكعبة نحو '+ar(Math.round(km).toLocaleString('en').replace(/,/g,'٬'))+' كم</p>'
 +'<div class="kb-btn"><button class="btn primary" data-pt="compass" id="qbgo">'+MRI.qibla+'تشغيل البوصلة</button></div>'
 +'<p class="kmmut pt-note">ضع الجوال مسطّحًا وأبعده عن المعادن والمغناطيس. إن بدت البوصلة غير دقيقة فحرّك الجوال على شكل الرقم ٨ لمعايرتها. ومن غير البوصلة: اتجاه القبلة بالدرجات أعلاه، يُقاس من الشمال باتجاه عقارب الساعة.</p>'}
var QBL={on:false,h:null,hit:false};
function qbHead(e){var h=null;if(typeof e.webkitCompassHeading==='number'&&!isNaN(e.webkitCompassHeading))h=e.webkitCompassHeading;else if(e.absolute&&typeof e.alpha==='number')h=(360-e.alpha)%360;if(h===null)return;
 var so=(screen.orientation&&screen.orientation.angle)||window.orientation||0;h=(h+so+360)%360;QBL.h=h;qbDraw()}
function qbDraw(){var d=document.getElementById('kb-dial'),st=document.getElementById('kb-st'),l=ptLoc();if(!d||!l||QBL.h===null)return;var bg=qbBearing(l),diff=((bg-QBL.h+540)%360)-180;
 d.style.transform='rotate('+(-QBL.h).toFixed(1)+'deg)';var ok=Math.abs(diff)<=4;d.parentNode.classList.toggle('ok',ok);
 if(st)st.textContent=ok?'أنت باتجاه القبلة':(diff>0?'استدر يمينًا ':'استدر يسارًا ')+ar(Math.round(Math.abs(diff)))+'°';
 if(ok&&!QBL.hit){QBL.hit=true;try{navigator.vibrate&&navigator.vibrate(40)}catch(x){}}else if(!ok&&Math.abs(diff)>10)QBL.hit=false}
function qbStart(){var go=function(){if(QBL.on)return;QBL.on=true;var ev='ondeviceorientationabsolute' in window?'deviceorientationabsolute':'deviceorientation';window.addEventListener(ev,qbHead);QBL.ev=ev;
  var b=document.getElementById('qbgo');if(b)b.hidden=true;setTimeout(function(){if(QBL.on&&QBL.h===null){var st=document.getElementById('kb-st');if(st)st.textContent='لم نجد بوصلة في هذا الجهاز. استخدم الدرجة: القبلة على '+ar(Math.round(qbBearing(ptLoc())))+'° من الشمال.'}},3000)};
 if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function')DeviceOrientationEvent.requestPermission().then(function(r){if(r==='granted')go();else kmTo('لم يُسمح باستخدام البوصلة')}).catch(function(){kmTo('تعذّر تشغيل البوصلة')});
 else if(window.DeviceOrientationEvent)go();else kmTo('جهازك لا يدعم البوصلة')}
function qbStop(){if(QBL.on){window.removeEventListener(QBL.ev,qbHead);QBL.on=false;QBL.h=null;QBL.hit=false}}
