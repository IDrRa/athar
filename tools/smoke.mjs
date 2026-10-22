// أثر — يفتح صفحات الموقع في متصفح حقيقي بمقاس جوال، ويفشل إذا ظهر خطأ في الصفحة أو خرج عنصر عن حدود الشاشة.
// المتصفحات: Chromium دائمًا، وSafari (WebKit) إن كان مثبّتًا (في الفحص التلقائي على GitHub يكون مثبّتًا).
//   SMOKE_BROWSERS=chromium,webkit  لتحديدها صراحةً.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}/index.html`;

const ROUTES = ['', 'quran', 'quran/1', 'quran/2/255', 'quran/page/604', 'adhkar', 'adhkar/morning', 'adhkar/evening', 'adhkar/tasbih', 'dua', 'dua/type/quran', 'dua/type/general',
  'dua/now', 'waqfa', 'waqfa/archive', 'waqfa/wq-030', 'khatma', 'notes', 'search?q=الصبر', 'about', 'mission', 'prayer', 'qibla', 'stats', 'notify', 'install', 'report', 'salawat'];

// an element that sticks out of the screen sideways (the notebook box in Safari did this); scrolling rows and the mushaf track are allowed
const OUT = () => {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
  const W = window.innerWidth, bad = [];
  const scrolls = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o !== 'visible' && o !== 'clip') return true; } return false; };
  document.querySelectorAll('#app textarea, #app input:not([type=checkbox]):not([type=radio]), #app .btn, #app article, #app .card, #app .occ, #app .row, #app section').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || getComputedStyle(el).visibility === 'hidden') return;
    // also: a field or button wider than the card it sits in
    const box = el.matches('textarea, input, .btn') && el.parentElement && el.parentElement.closest('article, .card, .occ, .wqs, details, form');
    const pr = box && box.getBoundingClientRect();
    const outBox = pr && (r.left < pr.left - 1 || r.right > pr.right + 1);
    if ((r.left < -1 || r.right > W + 1 || outBox) && !scrolls(el)) bad.push((el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')) + ` (${Math.round(r.left)}→${Math.round(r.right)})`);
  });
  return bad.slice(0, 3);
};

const want = (process.env.SMOKE_BROWSERS || '').split(',').filter(Boolean);
const names = want.length ? want : ['chromium', 'webkit'];
let failed = 0, ran = [];
for (const name of names) {
  let browser;
  try { browser = await pw[name].launch(); } catch (e) {
    if (want.length) { console.error(`✗ تعذّر تشغيل ${name}: ${e.message.split('\n')[0]}`); failed++; }
    continue;
  }
  ran.push(name === 'webkit' ? 'سفاري' : 'كروم');
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
      const out = await page.evaluate(OUT);
      if (errs.length || notFound || wide || out.length) {
        failed++;
        console.error(`✗ [${name} ${scheme}] #/${r}: ${errs.join(' | ') || (notFound ? 'غير موجودة' : wide ? 'عرض الصفحة أكبر من الشاشة' : 'عنصر يخرج عن حدوده: ' + out.join('، '))}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
}
server.close();
if (!ran.length) { console.error('✗ لم يعمل أي متصفح'); process.exit(1); }
if (failed) { console.error(`\nفشلت ${failed} صفحة.`); process.exit(1); }
console.log(`✓ فُتحت ${ROUTES.length} صفحة في ${ran.join(' و')}، في الوضعين الداكن والفاتح، بلا أخطاء ولا عناصر خارجة عن حدودها`);
