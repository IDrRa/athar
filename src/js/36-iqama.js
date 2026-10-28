/* الإقامة: دقائق بعد الأذان لكل صلاة، يضبطها الزائر حسب مسجده. الافتراضي هو الشائع في مساجد المملكة،
   وقد يتغير بتعاميم موسمية، فيُعرض على أنه قابل للتعديل لا على أنه رسمي. ظهر الجمعة بلا إقامة (الخطبة). */
var IQ_K=[['fajr','الفجر',25],['dhuhr','الظهر',20],['asr','العصر',20],['maghrib','المغرب',10],['isha','العشاء',20]];
function iqGet(){var o=qget('athar-iq',null);o=o&&typeof o==='object'?o:{};var r={on:o.on!==false};IQ_K.forEach(function(k){var v=o[k[0]];r[k[0]]=typeof v==='number'&&v%1===0&&v>=1&&v<=60?v:k[2]});return r}
function iqAt(k,t){var q=iqGet();if(!q.on||!t||!q[k]||(k==='dhuhr'&&t.getDay()===5))return null;return new Date(t.getTime()+q[k]*6e4)}
/* الصلاة التي أُذّن لها ولم تُقم بعد: [الاسم، وقت الإقامة] */
function iqNow(T,d){var m=d.getTime(),r=null;IQ_K.forEach(function(k){var t=T[k[0]],q=t&&iqAt(k[0],t);if(q&&t.getTime()<=m&&m<q.getTime())r=[k[0],q]});return r}
function iqForm(){var q=iqGet();return '<details class="card iq"><summary>أوقات الإقامة في مسجدك</summary><p class="kmmut">بعد الأذان بكم دقيقة تقام الصلاة؟ الأوقات المكتوبة هي الشائعة في مساجد المملكة، وعدّلها إن اختلف مسجدك.</p>'
 +'<label class="iq-r"><input type="checkbox" data-iq="on"'+(q.on?' checked':'')+'><span><b>إظهار وقت الإقامة</b></span></label>'
 +IQ_K.map(function(k){var o='';for(var v=5;v<=45;v+=5)o+='<option value="'+v+'"'+(v===q[k[0]]?' selected':'')+'>'+ar(v)+' دقيقة</option>';if(q[k[0]]%5)o='<option value="'+q[k[0]]+'" selected>'+ar(q[k[0]])+' دقيقة</option>'+o;return '<label class="iq-r"><span><b>'+k[1]+'</b>'+(k[0]==='dhuhr'?'<small>إلا يوم الجمعة</small>':'')+'</span><select data-iq="'+k[0]+'" aria-label="الإقامة بعد أذان '+k[1]+'">'+o+'</select></label>'}).join('')+'</details>'}
document.addEventListener('change',function(e){var x=e.target.closest('[data-iq]');if(!x)return;var o=qget('athar-iq',null);o=o&&typeof o==='object'?o:{};
 if(x.dataset.iq==='on')o.on=x.checked;else o[x.dataset.iq]=parseInt(x.value,10);qset('athar-iq',o);var l=ptLoc(),b=document.getElementById('ptbody');if(l&&b)b.innerHTML=ptBody(l)});
