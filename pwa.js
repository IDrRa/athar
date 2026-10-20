/* Registers the offline cache only on a real secure origin; failure never affects the site. */
(function(){if(!('serviceWorker' in navigator))return;var ok=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';if(!ok)return;
addEventListener('load',function(){navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(function(){})})})();
