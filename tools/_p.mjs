import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import {chromium} from 'playwright';
const ROOT='/home/claude/athar',T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const BR={};const s=http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);if(/html|js|css|json|svg/.test(ext)){const b=BR[f]||(BR[f]=zlib.brotliCompressSync(fs.readFileSync(f)));r.writeHead(200,{'content-type':T[ext],'content-encoding':'br'});r.end(b)}else{r.writeHead(200,{'content-type':T[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}}).listen(8823);
const b=await chromium.launch();
for(const [name,down,lat,cpu] of [['none',0,0,1],['4G cpu1',1.5e6,150,1],['4G cpu4',1.5e6,150,4],['slow3G cpu4',50e3,400,4]]){
 const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const pg=await c.newPage();const cdp=await c.newCDPSession(pg);
 if(down){await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:lat,downloadThroughput:down,uploadThroughput:down/2})}
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 await pg.goto('http://localhost:8823/index.html',{waitUntil:'load',timeout:120000});
 const m=await pg.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0],p=performance.getEntriesByType('paint');return {resp:Math.round(n.responseEnd),dcl:Math.round(n.domContentLoadedEventEnd),fcp:Math.round((p.find(x=>x.name==='first-contentful-paint')||{}).startTime||0),html:n.transferSize}});
 console.log(name,JSON.stringify(m));await c.close()}
await b.close();s.close();
