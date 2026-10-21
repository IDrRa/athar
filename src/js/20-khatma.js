/* ===== v15 «ختمة أثر» ===== */
var KM_KEY='athar-khatma';
function kmGet(){var k=qget(KM_KEY,null);return k&&k.ends&&k.ends.length?k:null}
function kmPut(k){qset(KM_KEY,k)}
function kmSplit(from,days){/* daily ends between from..604, snapped to the page before a hizb-quarter start */
 var B=[],E=[],last=from-1,tot=604-from+1,d,j;for(var p=from;p<604;p++)if(QPG[p][3])B.push(p);B.push(604);
 if(days>=tot){for(d=1;d<=tot;d++)E.push(from+d-1);return E}
 if(days>B.length){for(d=1;d<=days;d++){var r=d===days?604:Math.max(last+1,Math.min(604-(days-d),Math.round(from-1+tot*d/days)));E.push(r);last=r}return E}
 for(d=1;d<days;d++){var tg=from-1+tot*d/days,best=-1;for(j=0;j<B.length;j++){if(B[j]<=last)continue;if(B.length-1-j<days-d)break;if(best<0||Math.abs(B[j]-tg)<Math.abs(B[best]-tg))best=j}E.push(B[best]);last=B[best]}
 E.push(604);return E}
function kmIdx(k){return Math.max(0,Math.min(k.ends.length-1,wqDay()-k.start))}
function kmFrom(k,i){return i?k.ends[i-1]+1:k.from}
function kmPg(p){var q=QPG[p-1];return 'صفحة '+ar(p)+' · سورة '+QN[q[0]-1]}
function kmNew(days,from){from=from||1;var k={v:1,start:wqDay(),from:from,ends:kmSplit(from,days),through:from-1,created:Date.now(),done:null};kmPut(k);return k}
function kmSeen(p){var k=kmGet();if(!k||k.done)return;if(p===k.through+1){var i=kmIdx(k),was=k.through<k.ends[i];k.through=p;if(p===604)k.done=Date.now();kmPut(k);
 if(k.done)kmTo('تمّت الختمة — تقبّل الله منك');else if(was&&k.through>=k.ends[i])kmTo('أتممت ورد اليوم — بارك الله فيك')}}
function kmTo(m){var e=document.getElementById('toast');if(!e)return;e.textContent=m;e.classList.add('on');clearTimeout(kmTo.t);kmTo.t=setTimeout(function(){e.classList.remove('on')},2600)}
function kmBar(k){var r=Math.round((k.through-k.from+1)/(604-k.from+1)*100);r=Math.max(0,Math.min(100,r));return '<div class="kmbar" role="progressbar" aria-label="التقدم في الختمة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+r+'"><i style="width:'+r+'%"></i></div><p class="kmpc">'+ar(r)+'٪ · قرأت '+ar(Math.max(0,k.through-k.from+1))+' من '+ar(604-k.from+1)+' صفحة</p>'}
function kmToday(k){var i=kmIdx(k),a=kmFrom(k,i),b=k.ends[i],n=k.ends.length,over=wqDay()-k.start>=n,prev=i?k.ends[i-1]:k.from-1,st,next=Math.min(604,k.through+1);
 if(k.done)return '<div class="kmday done"><b>تمّت الختمة</b><p>تقبّل الله منك، وجعل القرآن ربيع قلبك.</p></div>';
 if(k.through>=b)st='<p class="kmok">أتممت ورد اليوم — بارك الله فيك.</p>'+(i<n-1?'<p class="kmmut">ورد الغد: من '+kmPg(k.ends[i]+1)+' إلى صفحة '+ar(k.ends[i+1])+'.</p>':'');
 else if(k.through<prev)st='<p class="kmlate">تبقّى عليك '+ar(prev-k.through)+' صفحة من الأيام السابقة، ثم ورد اليوم.</p>';
 else st='<p class="kmmut">تبقّى من ورد اليوم '+ar(b-k.through)+' صفحة.</p>';
 if(over&&k.through<604)st='<p class="kmlate">انتهت مدة الخطة وبقي '+ar(604-k.through)+' صفحة. يمكنك توزيعها على أيام جديدة من الأسفل.</p>';
 return '<div class="kmday"><p class="kmk">اليوم '+ar(Math.min(n,wqDay()-k.start+1))+' من '+ar(n)+'</p><h3>ورد اليوم</h3><p class="kmr">من '+kmPg(a)+'<br>إلى صفحة '+ar(b)+'</p>'+st
 +'<div class="actions"><a class="btn primary" href="#/quran/page/'+next+'">'+(k.through>=b?'تابع القراءة':'اقرأ الآن')+' — صفحة '+ar(next)+'</a></div></div>'}
function kmPlan(k){var n=k.ends.length,t=kmIdx(k),rows='';for(var i=0;i<n;i++){var a=kmFrom(k,i),b=k.ends[i],ok=k.through>=b;rows+='<li class="'+(i===t?'on':'')+(ok?' ok':'')+'"><span>'+wqFmt(k.start+i)+'</span><b>'+ar(a)+'–'+ar(b)+'</b><i>'+(ok?'✓<span class="sr">مقروء</span>':'')+'</i></li>'}
 return '<details class="kmpl"><summary>جدول الختمة ('+ar(n)+' يومًا)</summary><ul tabindex="0" aria-label="أيام الختمة">'+rows+'</ul></details>'}
var KMD=[[7,'أسبوع'],[10,'١٠ أيام'],[15,'١٥ يومًا'],[30,'شهر'],[60,'شهران'],[90,'٣ أشهر']];
function kmChoose(lbl,act){return '<div class="kmch" role="group" aria-label="'+lbl+'">'+KMD.map(function(d){return '<button class="chip" data-km="'+act+'" data-d="'+d[0]+'">'+d[1]+'</button>'}).join('')+'</div><div class="kmcu"><label>أو عدد الأيام: <input type="number" inputmode="numeric" min="1" max="365" id="kmd-'+act+'" placeholder="مثلًا ٢٠"></label><button class="btn" data-km="'+act+'" data-d="custom">ابدأ</button></div>'}
function vKhatma(){var k=kmGet(),h=head('ختمة أثر','خطة شخصية لختم القرآن','/quran');
 if(!k||k.done){var lp=qget('athar-qlp',null);
  h+=(k&&k.done?'<div class="kmday done"><b>آخر ختمة تمّت '+wqFmt(Math.floor((k.done-new Date(k.done).getTimezoneOffset()*6e4)/864e5))+'</b><p>تقبّل الله منك.</p></div>':'')
  +'<section class="kms"><h3>اختر مدة الختمة</h3><p class="kmmut">نقسّم صفحات المصحف الـ٦٠٤ على الأيام، وينتهي ورد كل يوم عند بداية ربع حزب. يتقدّم موضعك تلقائيًا كلما قرأت الصفحات بالترتيب في المصحف.</p>'
  +kmChoose('مدة الختمة','new')+(lp&&lp.p>1?'<label class="kmfrom"><input type="checkbox" id="kmfrom" value="'+lp.p+'"> ابدأ من آخر صفحة قرأتها (صفحة '+ar(lp.p)+')</label>':'')+'</section>';return h}
 h+=kmBar(k)+kmToday(k)+kmPlan(k)
 +'<section class="kms"><h3>موضعي في المصحف</h3><div class="kmcu"><label>وصلت إلى صفحة: <input type="number" inputmode="numeric" min="'+(k.from-1)+'" max="604" id="kmthr" value="'+k.through+'"></label><button class="btn" data-km="set">حفظ</button></div></section>'
 +'<section class="kms"><h3>إعادة توزيع الباقي</h3><p class="kmmut">يوزَّع ما بقي (من صفحة '+ar(Math.min(604,k.through+1))+') على أيام جديدة تبدأ من اليوم.</p>'+kmChoose('مدة التوزيع','re')+'</section>'
 +'<button class="lnk kmend" data-km="end">إنهاء هذه الختمة</button>';return h}
function kmHomeRender(){var el=document.getElementById('kmh');if(!el)return;var k=kmGet();if(!k||k.done){el.innerHTML='';return}
 var i=kmIdx(k),b=k.ends[i],next=Math.min(604,k.through+1);
 el.innerHTML='<a class="kmhc" href="#/khatma"><small>ختمة أثر · اليوم '+ar(Math.min(k.ends.length,wqDay()-k.start+1))+' من '+ar(k.ends.length)+'</small><b>'+(k.through>=b?'أتممت ورد اليوم ✓':'ورد اليوم: من صفحة '+ar(Math.max(kmFrom(k,i),next))+' إلى '+ar(b))+'</b>'+kmBar(k)+'</a>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-km]');if(!b)return;var a=b.dataset.km,k=kmGet();
 if(a==='new'||a==='re'){var d=b.dataset.d==='custom'?parseInt((document.getElementById('kmd-'+a)||{}).value,10):+b.dataset.d;if(!(d>=1&&d<=365)){kmTo('اكتب عدد أيام بين ١ و٣٦٥');return}
  if(a==='new'){var f=document.getElementById('kmfrom');kmNew(d,f&&f.checked?+f.value:1);kmTo('بدأت الختمة — وفّقك الله')}
  else if(k){var fr=Math.min(604,k.through+1);k.start=wqDay();k.from=fr;k.ends=kmSplit(fr,d);k.through=fr-1;kmPut(k);kmTo('أُعيد توزيع الباقي على '+ar(d)+' يومًا')}
  route();return}
 if(a==='set'&&k){var v=parseInt(document.getElementById('kmthr').value,10);if(!(v>=k.from-1&&v<=604)){kmTo('اكتب رقم صفحة صحيحًا');return}k.through=v;k.done=v===604?Date.now():null;kmPut(k);kmTo('حُفظ موضعك');route();return}
 if(a==='end'){if(b.dataset.sure){try{localStorage.removeItem(KM_KEY)}catch(x){}kmTo('أُنهيت الختمة');route()}else{b.dataset.sure='1';b.textContent='اضغط مرة أخرى لتأكيد الإنهاء'}}});

