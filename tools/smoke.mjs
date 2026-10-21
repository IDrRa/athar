// أثر — يفتح صفحات الموقع في متصفح حقيقي (Chromium) بمقاس جوال، ويفشل إذا ظهر أي خطأ في الصفحة.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}/index.html`;

const ROUTES = ['', 'quran', 'quran/1', 'quran/2/255', 'quran/page/604', 'adhkar', 'adhkar/morning', 'adhkar/evening', 'dua', 'dua/type/quran', 'dua/type/general',
  'dua/now', 'waqfa', 'waqfa/archive', 'waqfa/wq-030', 'khatma', 'notes', 'search?q=الصبر', 'about', 'mission', 'prayer', 'qibla', 'stats', 'notify', 'install', 'report'];
const browser = await chromium.launch();
let failed = 0;
for (const scheme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|favicon/.test(m.text())) errs.push(m.text()); });
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem('athar-loc', JSON.stringify({ lat: 24.7136, lng: 46.6753, name: 'الرياض', tz: 'Asia/Riyadh' })));
  for (const r of ROUTES) {
    errs.length = 0;
    await page.goto(base + '#/' + r); await page.waitForTimeout(250);
    const text = await page.innerText('body');
    const notFound = text.includes('الصفحة غير موجودة');
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (errs.length || notFound || wide) { failed++; console.error(`✗ [${scheme}] #/${r}: ${errs.join(' | ') || (notFound ? 'غير موجودة' : 'عرض الصفحة أكبر من الشاشة')}`); }
  }
  await ctx.close();
}
await browser.close(); server.close();
if (failed) { console.error(`\nفشلت ${failed} صفحة.`); process.exit(1); }
console.log(`✓ فُتحت ${ROUTES.length} صفحة في الوضعين الداكن والفاتح بلا أخطاء`);
