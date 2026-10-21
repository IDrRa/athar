/* ---- after each render ---- */
var PTI=null;
function atPost(a){clearInterval(PTI);PTI=null;if(a!=='qibla')qbStop();
 if(a==='prayer'&&ptLoc())PTI=setInterval(function(){var b=document.getElementById('ptbody');if(!b||document.hidden)return;b.innerHTML=ptBody(ptLoc())},30000)}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&location.hash.indexOf('#/prayer')===0){var b=document.getElementById('ptbody');if(b&&ptLoc())b.innerHTML=ptBody(ptLoc())}});

