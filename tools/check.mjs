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
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'mushaf', 'q4', 'l', String(p).padStart(3, '0') + '.json'), 'utf8'));
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
// «المصحف بدون إنترنت» يحفظ في نفس الذاكرة التي يقرأ منها عامل الخدمة، ويحتاج كل الملفات التي يطلبها موجودة
try {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), off = fs.readFileSync(path.join(ROOT, 'src', 'js', '74-offline.js'), 'utf8');
  const a = (sw.match(/const MCACHE='([^']+)'/) || [])[1], b = (off.match(/OFF_C='([^']+)'/) || [])[1];
  const fonts = fs.readdirSync(path.join(ROOT, 'mushaf', 'q4')).filter((f) => /^QCF4_Hafs_\d\d_W\.woff2$/.test(f)).length;
  const lay = fs.readdirSync(path.join(ROOT, 'mushaf', 'q4', 'l')).filter((f) => /^\d{3}\.json$/.test(f)).length;
  const taf = fs.readdirSync(path.join(ROOT, 'tafsir', 'muyassar')).filter((f) => /^\d+\.json$/.test(f)).length;
  if (a && a === b && fonts === 47 && lay === 604 && taf === 114) ok('المصحف بدون إنترنت: يحفظ في ذاكرة عامل الخدمة نفسها، وملفاته كاملة (٤٧ خطًا و٦٠٤ صفحات و١١٤ سورة تفسير)');
  else bad(`المصحف بدون إنترنت: الذاكرة ${a} / ${b}، الخطوط ${fonts}، الصفحات ${lay}، التفسير ${taf}`);
} catch (e) { bad('تعذّر فحص المصحف بدون إنترنت: ' + e.message); }
try { new vm.Script(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')); ok(`الشيفرة سليمة نحويًا (${si} سكربت + عامل الخدمة)`); } catch (e) { bad('خطأ نحوي في sw.js: ' + e.message); }

// ---------- 2ب. تعارض الأسماء بين أجزاء الموقع ----------
// حدث مرتين: نفس السمة data-nt استُخدمت للدفتر وللتنبيهات فأوقف الضغطُ على الدفتر التنبيهات، ونفس الفئة .nw استُخدمت لنص القرآن ولإشعار «الآن».
// القاعدة: سمة data-* يلتقطها معالج عام (closest) لا تُقرأ في ملف آخر، وفئة تولّدها أكثر من شيفرة يجب أن تكون مشتركة عن قصد (في القائمة أدناه).
try {
  const JS = path.join(ROOT, 'src', 'js'), files = fs.readdirSync(JS).map((f) => [f, fs.readFileSync(path.join(JS, f), 'utf8')]);
  const pageHtml = fs.readFileSync(path.join(ROOT, 'src', 'page.html'), 'utf8'), errs = [];
  const dashed = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  const delegated = {}, read = {};
  for (const [f, s] of files) {
    for (const m of s.matchAll(/closest\(\s*'[a-z]*\[data-([a-z0-9-]+)/g)) (delegated[m[1]] ||= new Set()).add(f);
    for (const m of s.matchAll(/\[data-([a-z0-9-]+)|dataset\.([a-zA-Z0-9]+)/g)) (read[m[1] || dashed(m[2])] ||= new Set()).add(f);
  }
  for (const [a, fs1] of Object.entries(delegated)) {
    const others = [...(read[a] || [])].filter((f) => !fs1.has(f));
    if (fs1.size > 1 || others.length) errs.push(`data-${a}: ${[...new Set([...fs1, ...others])].join(' و ')}`);
  }
  // classes intentionally shared by several features (shared look); add a class here only after checking it means the same thing everywhere
  const SHARED = new Set(['qcont', 'apseg', 'qtrack', 'qclip', 'wqs', 'tfmsg', 'kmmut', 'kmend', 'mri', 'pt-card', 'pt-loc', 'nt-go', 'pt-note', 'pt-l', 'rp-f', 'rp-l', 'rp-i', 'rp-b', 'ms-a', 'mrs']);
  const base = new Set();
  for (const f of ['00-base.css', '01-interface.css']) for (const m of fs.readFileSync(path.join(ROOT, 'src', 'css', f), 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g)) base.add(m[1]);
  const emit = {};
  for (const [f, s] of [...files, ['page.html', pageHtml]]) for (const m of s.matchAll(/class(?:Name\s*=\s*|=\\?)["']([^"'\\+]+)/g)) for (const c of m[1].split(/\s+/).filter(Boolean)) (emit[c] ||= new Set()).add(f);
  for (const [c, fs1] of Object.entries(emit)) if (fs1.size > 1 && !base.has(c) && !SHARED.has(c)) errs.push(`.${c}: ${[...fs1].join(' و ')}`);
  if (errs.length) bad('أسماء متعارضة بين أجزاء الموقع: ' + errs.join('، '));
  else ok('لا تعارض في أسماء السمات والفئات بين أجزاء الموقع');
} catch (e) { bad('تعذّر فحص تعارض الأسماء: ' + e.message); }

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

// ---------- 5. تذكير السنن: الكهف يوم الجمعة، وصيام الاثنين والخميس والأيام البيض مساء اليوم الذي قبلها، ولا تذكير في رمضان وأيام التشريق ----------
try {
  const RealDate = Date; let fake = null;
  globalThis.Date = class extends RealDate { constructor(...a) { if (!a.length && fake) super(fake); else super(...a); } static now() { return fake ?? RealDate.now(); } };
  globalThis.caches = { default: { put: async () => {}, match: async () => undefined } };
  const { onRequest } = await import(path.join(ROOT, 'functions/api/push/[action].js') + '?sunnah');
  const kv = new Map(); const KV = { get: async (k, t) => { const x = kv.get(k); return x ? (t === 'json' ? JSON.parse(x.v) : x.v) : null; }, put: async (k, v, o) => kv.set(k, { v, o }), delete: async (k) => kv.delete(k), list: async ({ prefix }) => ({ keys: [...kv.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name, metadata: kv.get(name).o && kv.get(name).o.metadata })), list_complete: true }) };
  const env = { REPORTS: KV, PUSH_KEY: 'test-key' }, got = {};
  globalThis.fetch = async (u) => { u = String(u); got[u] = (got[u] || 0) + 1; return new Response(null, { status: 201 }); };
  const req = (a, q, b, h = {}) => onRequest({ request: new Request('https://iathar.pages.dev/api/push/' + a + q, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://iathar.pages.dev', ...h }, body: b ? JSON.stringify(b) : undefined }), env, params: { action: a } });
  const U = (n) => 'https://fcm.googleapis.com/fcm/send/sn-' + n, base = { tz: 'Asia/Riyadh', m: null, e: null, pr: '' };
  // [name, subscription, local date and hour, expected pushes] — dates checked against the Umm al-Qura calendar
  const cases = [
    ['fast+beed same time', { ft: '21:00', bt: '21:00' }, '2026-11-22T21', 1],      // Sunday, tomorrow 13 Jumada II
    ['fast+beed two times', { ft: '21:00', bt: '21:30' }, '2026-11-22T21', 2],
    ['thursday eve', { ft: '21:00' }, '2027-01-20T21', 1],                           // Wednesday, tomorrow 13 Sha'ban
    ['ramadan monday', { ft: '21:00', bt: '21:00' }, '2027-02-14T21', 0],            // tomorrow 8 Ramadan
    ['tashriq monday', { ft: '21:00' }, '2027-05-16T21', 0],                         // tomorrow 11 Dhu al-Hijjah
    ['13 dhu al-hijjah', { bt: '21:00' }, '2027-05-18T21', 0],
    ['tuesday', { ft: '21:00' }, '2026-11-24T21', 0],
    ['kahf friday', { kt: '09:00' }, '2026-10-30T09', 1],
    ['kahf + morning adhkar', { kt: '09:00', m: '09:00' }, '2026-10-30T09', 2],
    ['kahf thursday', { kt: '09:00' }, '2026-10-29T09', 0],
  ];
  for (const [i, c] of cases.entries()) { // each case alone: subscribe, run every minute around its time, unsubscribe
    fake = null; await req('sub', '', { ...base, ...c[1], endpoint: U(i) });
    const [d, h] = c[2].split('T');
    for (let mm = -1; mm <= 32; mm++) { fake = new RealDate(`${d}T${h}:00:05+03:00`).getTime() + mm * 6e4; await req('run', '?w=1&n=1', null, { 'x-push-key': 'test-key' }); }
    fake = null; await req('sub', '', { endpoint: U(i), action: 'del' });
  }
  globalThis.Date = RealDate;
  const wrong = cases.map((c, i) => [c[0], got[U(i)] || 0, c[3]]).filter(x => x[1] !== x[2]);
  if (!wrong.length) ok(`تذكير السنن: ${cases.length} حالات صحيحة (الكهف، الاثنين والخميس، الأيام البيض، ولا تذكير في رمضان وأيام التشريق)`);
  else bad('تذكير السنن: ' + wrong.map(x => `${x[0]} وصل ${x[1]} والمتوقع ${x[2]}`).join('، '));
} catch (e) { bad('تعذّر فحص تذكير السنن: ' + e.message); }

// ---------- 6. صفحات البحث (surah/ adhkar/ dua/): نص كل آية وكل ذكر ودعاء فيها كما هو في المصدر حرفًا بحرف، وبالترتيب ----------
try {
  const he = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  const errs = []; let nv = 0, ni = 0;
  for (let n = 1; n <= 114; n++) {
    const h = rd(`surah/${n}/index.html`), V = JSON.parse(rd(`src/data/quran/${String(n).padStart(3, '0')}.json`));
    let at = 0;
    V.forEach((v, i) => { const k = h.indexOf(he(v) + ' <span class="vn">', at); if (k < 0) errs.push(`سورة ${n} آية ${i + 1}`); else { at = k + 1; nv++; } });
    if (!h.includes('PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK')) errs.push(`سورة ${n}: كتلة ترخيص النص (تعليق مخفي)`);
  }
  const C = JSON.parse(rd('src/data/content.json')).filter((o) => o.status === 'published');
  for (const o of C.filter((o) => o.category !== 'salawat')) { // salawat: has its own page in the app (#/salawat), not an adhkar section
    const f = o.type === 'dhikr' ? `adhkar/${o.category}/index.html` : (o.kind || 'general') === 'general' ? `dua/general/${o.category || 'other'}/index.html` : `dua/${o.kind}/index.html`;
    if (!fs.existsSync(path.join(ROOT, f)) || !rd(f).includes('<p class="pt">' + he(o.text) + '</p>')) errs.push(o.id); else ni++;
  }
  const locs = (rd('sitemap.xml').match(/<loc>/g) || []).length;
  if (!errs.length && nv === 6236 && locs === 140) ok(`صفحات البحث: ٦٢٣٦ آية و${ni} ذكرًا ودعاءً كما هي في المصدر، وخريطة الموقع ${locs} رابطًا`);
  else bad('صفحات البحث: ' + (errs.slice(0, 5).join('، ') || `آيات ${nv}، روابط ${locs}`));
} catch (e) { bad('تعذّر فحص صفحات البحث: ' + e.message); }

if (failed) { console.error(`\nفشل ${failed} فحص — لن يُنشر التعديل.`); process.exit(1); }
console.log('\nكل الفحوص نجحت.');
