// العنوان القديم iathar.pages.dev أُغلق بطلب المالك: لا يعرض شيئًا (404) ولا يحوِّل إلى الجديد؛ الموقع على atharuk.com فقط.
// ما عدا /api/ : منبّه الإشعارات (athar-cron) يستدعي العنوان القديم، فيبقى يعمل كما هو.
// روابط أثر حقيقية (/quran/18، /adhkar/morning/3، /dua/<id>…): كل مسار يفتح التطبيق نفسه (index.html).
// وروابط المشاركة منها تأخذ بطاقتها الخاصة لواتساب وغيره (صورة السورة أو القسم وعنوانه) داخل صفحة التطبيق نفسها،
// بلا صفحة وسيطة ولا تحويل. البطاقات مولَّدة بـ tools/og.py
import { S, A, D, DT, DGN } from '../og/meta.js';

const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const ayat = n => AR(n) + (n >= 3 && n <= 10 ? ' آيات' : ' آية');

async function card(ctx, u) {
  let m, t, d, img, to;
  if ((m = u.pathname.match(/^\/quran\/(\d{1,3})(?:\/(\d{1,3}))?\/?$/))) {
    const n = +m[1], v = m[2] ? +m[2] : 0, s = S[n - 1];
    if (!s || v > s[1] || (m[2] && v < 1)) return null;
    img = `/og/s/${n}.jpg`; to = `/quran/${n}` + (v ? `/${v}` : '');
    if (v) {
      t = `سورة ${s[0]} — الآية ${AR(v)}`;
      try { const r = await ctx.env.ASSETS.fetch(new URL(`/og/v/${n}.json`, u)); if (r.ok) d = (await r.json())[v - 1]; } catch (e) {}
      d = d || 'اقرأ الآية في أثر';
    } else { t = `سورة ${s[0]}`; d = `${ayat(s[1])} · ${s[2] ? 'مدنية' : 'مكية'} — اقرأها في أثر`; }
  } else if ((m = u.pathname.match(/^\/adhkar\/([a-z]+)\/?$/)) && A[m[1]]) {
    t = A[m[1]]; d = 'اقرأها كاملة في أثر'; img = `/og/a/${m[1]}.jpg`; to = `/adhkar/${m[1]}`;
  } else if (/^\/salawat\/?$/.test(u.pathname)) {
    t = 'الصلاة على النبي ﷺ'; d = 'صيغة الصلاة على النبي ﷺ وفضلها — اقرأها في أثر'; img = '/og/salawat.jpg'; to = '/salawat';
  } else if (/^\/dua\/jumua(\/all)?\/?$/.test(u.pathname)) {
    t = 'فواتح الدعاء وجوامعه'; d = 'أدعية يوم الجمعة — اقرأها في أثر'; img = '/og/jumua.jpg'; to = '/dua/jumua/all';
  } else if ((m = u.pathname.match(/^\/dua\/type\/([a-z]+)\/?$/)) && DT[m[1]]) {
    t = DT[m[1]]; d = 'اقرأها كاملة في أثر'; img = `/og/t/${m[1]}.jpg`; to = `/dua/type/${m[1]}`;
  } else if ((m = u.pathname.match(/^\/dua\/general\/([a-z]+)\/?$/)) && DGN[m[1]]) {
    t = 'أدعية ' + DGN[m[1]]; d = 'من حصن المسلم — اقرأها في أثر'; img = `/og/g/${m[1]}.jpg`; to = `/dua/general/${m[1]}`;
  } else if ((m = u.pathname.match(/^\/adhkar\/([a-z]+)\/(\d{1,3})\/?$/)) && A[m[1]]) {
    t = A[m[1]]; d = `من ${A[m[1]]} — اقرأه في أثر`; img = `/og/a/${m[1]}.jpg`; to = `/adhkar/${m[1]}/${+m[2]}`;
  } else if ((m = u.pathname.match(/^\/dua\/([A-Za-z0-9-]+)\/?$/)) && D[m[1]]) {
    t = D[m[1]][0]; d = D[m[1]][1]; img = '/og/d.jpg'; to = `/dua/${m[1]}`;
  } else return null;
  return { t, d, img, to };
}

/* يضع عنوان البطاقة ووصفها وصورتها في رأس صفحة التطبيق نفسها */
function withCard(res, c, origin) {
  const set = v => ({ element(e) { e.setAttribute('content', v); } });
  return new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(c.t + ' — أثر'); } })
    .on('meta[property="og:title"]', set(c.t))
    .on('meta[property="og:description"]', set(c.d))
    .on('meta[name="description"]', set(c.d))
    .on('meta[property="og:url"]', set(origin + c.to))
    .on('meta[property="og:image"]', set(origin + c.img))
    .on('meta[property="og:image:alt"]', set(c.t))
    .transform(res);
}

export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev' && !u.pathname.startsWith('/api/'))
    return new Response('', { status: 404, headers: { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' } });
  if (ctx.request.method === 'GET' && /^\/((quran|adhkar|dua)\/|salawat\/?$)/.test(u.pathname)) {
    let c = null; try { c = await card(ctx, u); } catch (e) {}
    const res = await ctx.next();
    if (c && res.ok && (res.headers.get('content-type') || '').includes('text/html')) return withCard(res, c, u.origin);
    return res;
  }
  return ctx.next();
}
