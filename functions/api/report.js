// أثر — يستقبل بلاغات الأخطاء ويحفظها في Cloudflare KV (الربط باسم REPORTS).
// لا يُحفظ عنوان IP ولا أي بيانات تعريف؛ يُستخدم بصمة مؤقتة للحدّ من الإرسال المتكرر وتُحذف بعد دقيقة.
const SECTIONS = { quran: 'القرآن الكريم', adhkar: 'الأذكار', dua: 'الأدعية', other: 'أخرى' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n);

async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.REPORTS) return json({ ok: false, error: 'not-configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false }, 403);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  if (!b || b.hp) return json({ ok: true });
  const text = clip(b.text, 1500);
  if (text.length < 3) return json({ ok: false, error: 'empty' }, 400);
  const ip = request.headers.get('cf-connecting-ip') || '';
  const rk = 'rl:' + (await sha(ip + new Date().toISOString().slice(0, 13))).slice(0, 24);
  const n = parseInt((await env.REPORTS.get(rk)) || '0', 10);
  if (n >= 5) return json({ ok: false, error: 'rate' }, 429);
  await env.REPORTS.put(rk, String(n + 1), { expirationTtl: 3600 });
  const t = Date.now();
  const id = 'r:' + (9999999999999 - t).toString().padStart(13, '0') + '-' + crypto.randomUUID().slice(0, 8);
  const rec = { t, section: SECTIONS[b.section] ? b.section : 'other', where: clip(b.where, 160), text, page: clip(b.page, 300), done: false };
  await env.REPORTS.put(id, JSON.stringify(rec), { metadata: { done: false } });
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false }, 405);
