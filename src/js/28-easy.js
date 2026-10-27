/* الوضع الميسّر لكبار السن: خط أكبر في الموقع كله، وألوان أوضح، وأزرار أكبر، وشريط «السابقة/التالية» تحت المصحف.
   يُحفظ في athar-easy ويُطبَّق قبل رسم الصفحة (سكربت رأس page.html) بالسمة data-easy على <html>. */
function ezOn(){return document.documentElement.getAttribute('data-easy')==='1'}
function ezSet(v){if(v)document.documentElement.setAttribute('data-easy','1');else document.documentElement.removeAttribute('data-easy');
 try{if(v)localStorage.setItem('athar-easy','1');else localStorage.removeItem('athar-easy')}catch(e){}ezSync();route()}
function ezSync(){document.querySelectorAll('.apez [data-easy]').forEach(function(b){b.setAttribute('aria-checked',String((b.dataset.easy==='1')===ezOn()))})}
/* شريط تقليب الصفحات: يظهر في الوضع الميسّر على صفحات المصحف فقط */
function ezBar(){var b=document.getElementById('qez');if(!b)return;var on=ezOn()&&!!QPS;if(b.hidden===!on)return;b.hidden=!on;document.body.classList.toggle('ezq',on);if(QPS)try{qfit()}catch(e){}}
(function(){var r1=route;route=function(){r1();ezBar()}})();
document.addEventListener('click',function(e){var b=e.target.closest('.apez [data-easy]');if(b){ezSet(b.dataset.easy==='1');return}
 var t=e.target.closest('[data-ezt]');if(t){ezSet(!ezOn());try{kmTo(ezOn()?'فُعّل الوضع الميسّر':'عاد الموقع إلى الوضع العادي')}catch(x){}}});
ezSync();
