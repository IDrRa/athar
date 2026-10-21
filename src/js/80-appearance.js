/* ===== v11 appearance: mode (auto/light/dark) + colour theme; per-device preference only ===== */
(function(){var root=document.documentElement,bk=document.getElementById('appear'),opener=null;
function mode(){return root.getAttribute('data-theme')||'auto'}
function acc(){return root.getAttribute('data-accent')||'green'}
function meta(){var bg=getComputedStyle(root).getPropertyValue('--bg').trim();if(bg)document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute('content',bg)})}
function sync(){bk.querySelectorAll('[data-mode]').forEach(function(b){b.setAttribute('aria-checked',String(b.dataset.mode===mode()))});bk.querySelectorAll('[data-accent]').forEach(function(b){b.setAttribute('aria-checked',String(b.dataset.accent===acc()))});meta()}
function setMode(m){if(m==='auto'){root.removeAttribute('data-theme');try{localStorage.removeItem('athar-theme')}catch(e){}}else{root.setAttribute('data-theme',m);try{localStorage.setItem('athar-theme',m)}catch(e){}}sync()}
function setAcc(a){if(a==='green')root.removeAttribute('data-accent');else root.setAttribute('data-accent',a);try{if(a==='mono')localStorage.removeItem('athar-accent');else localStorage.setItem('athar-accent',a)}catch(e){}sync()}
function open(){opener=document.activeElement;sync();bk.hidden=false;var c=bk.querySelector('[data-accent][aria-checked="true"]')||bk.querySelector('[data-accent]');c.focus()}
function close(){bk.hidden=true;if(opener&&opener.focus)opener.focus()}
window.openAppear=open;
document.addEventListener('click',function(e){var t=e.target;if(t.closest('#appearBtn')||t.closest('[data-apopen]')){open();return}if(bk.hidden)return;
 var m=t.closest('[data-mode]'),a=t.closest('.apsw [data-accent]');if(m){setMode(m.dataset.mode);return}if(a){setAcc(a.dataset.accent);return}
 if(t.closest('[data-apclose]')||t===bk)close()});
document.addEventListener('keydown',function(e){if(!bk.hidden&&e.key==='Escape'){e.preventDefault();close()}
 if(!bk.hidden&&e.key==='Tab'){var f=bk.querySelectorAll('button'),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true);
try{new MutationObserver(meta).observe(root,{attributes:true,attributeFilter:['data-theme','data-accent']})}catch(e){}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',meta)}catch(e){}
meta()})();
