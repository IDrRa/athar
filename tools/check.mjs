// أثر — فحوص تلقائية قبل النشر. يشغّلها GitHub Actions مع كل تعديل، ولا يُنشر التعديل إلا إذا نجحت كلها.
// تشغيل محلي:  node tools/check.mjs            (الفحوص)
//              node tools/check.mjs --lock     (تحديث بصمات المحتوى بعد تعديل مقصود في نص ديني)
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const LOCK = path.join(ROOT, 'tools', 'content.lock.json');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
let failed = 0;
const ok = (m) => console.log('✓ ' + m);
const bad = (m) => { failed++; console.error('✗ ' + m); };

// ---------- 1. بصمات المحتوى الديني: أي تغيير في حرف من نص القرآن أو التفسير أو الأذكار يوقف النشر ----------
function contentPrints() {
  const p = {};
  for (let n = 1; n <= 114; n++) {
    const m = html.match(new RegExp(`<script type="application/json" id="qs${n}">([\\s\\S]*?)</script>`));
    if (!m) { bad(`نص سورة ${n} غير موجود`); continue; }
    const V = JSON.parse(m[1]);
    p['quran/' + n] = sha(JSON.stringify(V)) + ':' + V.length;
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'tafsir', 'muyassar')).sort()) p['tafsir/' + f] = sha(fs.readFileSync(path.join(ROOT, 'tafsir', 'muyassar', f)));
  // adhkar & duas: text + reference of every item
  const dec = (i) => { let depth = 0, j = i, str = false; for (; j < html.length; j++) { const c = html[j]; if (str) { if (c === '\\') j++; else if (c === '"') str = false; } else if (c === '"') str = true; else if (c === '{') depth++; else if (c === '}') { depth--; if (!depth) break; } } return JSON.parse(html.slice(i, j + 1)); };
  const items = {};
  for (const m of html.matchAll(/\{"id":"((?:dua|dhikr)-[a-z]+-\d{3}-\d{2})"/g)) { try { const o = dec(m.index); items[o.id] = o.text + '|' + (o.reference || ''); } catch { /* not a data object */ } }
  p['adhkar+duas'] = sha(JSON.stringify(Object.keys(items).sort().map(k => [k, items[k]]))) + ':' + Object.keys(items).length;
  // waqfat: the sourced parts only (text, verses, source, explanation); titles/applications are editorial
  const wi = html.indexOf('var WQ=') + 7; let WQ = null;
  try { WQ = vm.runInNewContext('(' + html.slice(wi, html.indexOf(',WQT=', wi)) + ')'); } catch { bad('تعذّرت قراءة الوقفات'); }
  if (WQ) p['waqfat'] = sha(JSON.stringify(WQ.map(w => [w.id, w.text, w.verses || null, w.source, w.explanation]))) + ':' + WQ.length;
  return p;
}
const prints = contentPrints();
if (process.argv.includes('--lock')) { fs.writeFileSync(LOCK, JSON.stringify(prints, null, 1) + '\n'); console.log('حُدّثت بصمات المحتوى: ' + Object.keys(prints).length); process.exit(0); }
const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
const changed = Object.keys(lock).filter(k => lock[k] !== prints[k]).concat(Object.keys(prints).filter(k => !(k in lock)));
if (changed.length) bad('تغيّر محتوى ديني محفوظ: ' + changed.slice(0, 10).join('، ') + (changed.length > 10 ? '…' : '') + ' — إن كان التغيير مقصودًا ومراجَعًا فشغّل: node tools/check.mjs --lock');
else ok(`المحتوى الديني مطابق للبصمات المعتمدة (${Object.keys(lock).length} ملفًا وقسمًا)`);

// ---------- 1ب. صفحات المصحف: كل آية مرة واحدة وبالترتيب، ولكل آية علامة نهاية، وبداية كل صفحة توافق خريطة الصفحات ----------
try {
  const QPG = JSON.parse(html.match(/var QPG=(\[\[[^;]*?\]\])[;,]/)[1]);
  const QC = []; for (let n = 1; n <= 114; n++) QC.push(JSON.parse(html.match(new RegExp(`id="qs${n}">([\\s\\S]*?)</script>`))[1]).length);
  let prev = null, endsN = 0, errs = [];
  for (let p = 1; p <= 604; p++) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'mushaf', 'l', String(p).padStart(3, '0') + '.json'), 'utf8'));
    const fonts = new Set([d.f]); let first = null;
    for (const r of d.r) {
      if (r[0] === 'h') continue;
      if (r[0] === 'b') { fonts.add(r[2]); continue; }
      for (const [, s, a, k] of r) {
        if (!first && k !== 2) first = [s, a];
        if (k === 1) { const ok = prev ? (s === prev[0] && a === prev[1] + 1) || (s === prev[0] + 1 && a === 1 && prev[1] === QC[prev[0] - 1]) : s === 1 && a === 1; if (!ok) errs.push(`${p}:${s}:${a}`); prev = [s, a]; endsN++; }
      }
    }
    if (!first || first[0] !== QPG[p - 1][0] || first[1] !== QPG[p - 1][1]) errs.push('page ' + p);
    for (const f of fonts) if (!fs.existsSync(path.join(ROOT, 'mushaf', 'q4', `QCF4_Hafs_${String(f).padStart(2, '0')}_W.woff2`))) errs.push('font ' + f);
  }
  if (!errs.length && endsN === 6236) ok('صفحات المصحف: ٦٠٤ صفحات، و٦٢٣٦ آية بالترتيب، وخطوطها موجودة');
  else bad('صفحات المصحف: ' + errs.slice(0, 8).join('، ') + ` (علامات النهاية ${endsN})`);
} catch (e) { bad('تعذّر فحص صفحات المصحف: ' + e.message); }

// ---------- 2. الشيفرة: كل سكربت في الصفحة وعامل الخدمة والدوال صالحة نحويًا ----------
let si = 0;
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) { si++; try { new vm.Script(m[1]); } catch (e) { bad(`خطأ نحوي في سكربت الصفحة رقم ${si}: ${e.message}`); } }
try { new vm.Script(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')); ok(`الشيفرة سليمة نحويًا (${si} سكربت + عامل الخدمة)`); } catch (e) { bad('خطأ نحوي في sw.js: ' + e.message); }

// ---------- 3. مواقيت الصلاة: مطابقة لمكتبة adhan المعتمدة (أم القرى) بفارق لا يتجاوز دقيقة ----------
try {
  const a = html.indexOf('/* ===== v30 prayer times'), b = html.indexOf('/* ---- qibla ---- */', a);
  const ctx = { ar: String, qget: () => null, kmTo() {}, route() {}, MRI: {}, document: { addEventListener() {}, getElementById: () => null }, navigator: {}, Intl }; vm.createContext(ctx); vm.runInContext(html.slice(a, b), ctx);
  const A = await import('adhan');
  const cities = [['الرياض', 24.7136, 46.6753], ['مكة', 21.3891, 39.8579], ['القاهرة', 30.0444, 31.2357], ['الكويت', 29.3759, 47.9774], ['تبوك', 28.3835, 36.5662]];
  let worst = 0, n = 0;
  for (const [, la, lo] of cities) for (const dt of ['2026-01-15', '2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21']) {
    const [y, m, d] = dt.split('-').map(Number), me = ctx.ptDay(y, m, d, la, lo, false);
    const p = A.CalculationMethod.UmmAlQura(); p.rounding = A.Rounding.Nearest;
    const t = new A.PrayerTimes(new A.Coordinates(la, lo), new Date(y, m - 1, d), p);
    for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) { worst = Math.max(worst, Math.abs(Math.round((me[k] - t[k]) / 6e4))); n++; }
  }
  if (worst <= 1) ok(`مواقيت الصلاة مطابقة (${n} وقتًا في ٥ مدن، أقصى فرق ${worst} دقيقة)`); else bad(`مواقيت الصلاة تختلف ${worst} دقيقة عن المرجع`);
} catch (e) { bad('تعذّر فحص مواقيت الصلاة: ' + e.message); }

// ---------- 4. التنبيهات: الإرسال مرة واحدة لكل مشترك، دون تكرار، وبالمفتاح فقط ----------
try {
  const RealDate = Date; let fake = null;
  globalThis.Date = class extends RealDate { constructor(...a) { if (!a.length && fake) super(fake); else super(...a); } static now() { return fake ?? RealDate.now(); } };
  const cm = new Map(); globalThis.caches = { default: { put: async (r, res) => cm.set(r.url, await res.text()), match: async (r) => cm.has(r.url) ? new Response(cm.get(r.url)) : undefined } };
  const { onRequest } = await import(path.join(ROOT, 'functions/api/push/[action].js'));
  const kv = new Map(); const KV = { get: async (k, t) => { const x = kv.get(k); return x ? (t === 'json' ? JSON.parse(x.v) : x.v) : null; }, put: async (k, v, o) => kv.set(k, { v, o }), delete: async (k) => kv.delete(k), list: async ({ prefix }) => ({ keys: [...kv.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name, metadata: kv.get(name).o && kv.get(name).o.metadata })), list_complete: true }) };
  const env = { REPORTS: KV, PUSH_KEY: 'test-key' }, got = {}, queue = [];
  globalThis.fetch = async (u) => { u = String(u); if (u.includes('workers.dev')) { queue.push(decodeURIComponent(u.split('?to=')[1])); return new Response('ok'); } got[u] = (got[u] || 0) + 1; return new Response(null, { status: 201 }); };
  const req = (a, q, b, h = {}) => onRequest({ request: new Request('https://iathar.pages.dev/api/push/' + a + q, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://iathar.pages.dev', ...h }, body: b ? JSON.stringify(b) : undefined }), env, params: { action: a } });
  for (let k = 0; k < 400; k++) await req('sub', '', { endpoint: 'https://fcm.googleapis.com/fcm/send/t' + k, tz: 'Asia/Riyadh', m: null, e: k % 3 ? null : '14:55', pr: 'fdami', lat: 24.71, lng: 46.67 });
  const denied = (await req('run', '?w=1&n=6&i=0')).status;
  const H = { 'x-push-key': 'test-key' };
  await req('run', '?w=1&n=6&build=1', null, H);
  for (let mm = 54; mm <= 57; mm++) { fake = new RealDate(`2026-10-21T11:${mm}:03Z`).getTime(); for (let i = 0; i < 6; i++) queue.push(`https://iathar.pages.dev/api/push/run?w=1&n=6&i=${i}`); while (queue.length) { const u = new URL(queue.shift()); fake += 50; await onRequest({ request: new Request(u, { method: 'POST', headers: H }), env, params: { action: 'run' } }); } }
  globalThis.Date = RealDate;
  const c = Object.values(got), twice = c.filter(x => x === 2).length, more = c.filter(x => x > 2).length;
  // Asr in Riyadh 2026-10-21 is 14:55 local (11:55Z): every subscriber gets Asr once; those with evening adhkar at 14:55 get it one minute later.
  if (denied === 403 && Object.keys(got).length === 400 && twice === 134 && !more) ok('التنبيهات: ٤٠٠ مشترك وصلهم أذان العصر مرة واحدة، والأذكار المتزامنة بعده، ويُرفض التشغيل بلا مفتاح');
  else bad(`التنبيهات: denied=${denied} unique=${Object.keys(got).length} twice=${twice} more=${more}`);
} catch (e) { bad('تعذّر فحص التنبيهات: ' + e.message); }

if (failed) { console.error(`\nفشل ${failed} فحص — لن يُنشر التعديل.`); process.exit(1); }
console.log('\nكل الفحوص نجحت.');
