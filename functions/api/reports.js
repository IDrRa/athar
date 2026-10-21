// أثر — قائمة البلاغات لصاحب الموقع فقط. كلمة المرور تُعيَّن أول مرة من صفحة الإدارة وتُحفظ مُجزّأة (hash) في KV.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

export async function onRequestPost({ request, env }) {
  if (!env.REPORTS) return json({ ok: false, error: 'not-configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false }, 403);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  const pass = String((b && b.pass) || '');
  const stored = await env.REPORTS.get('admin:hash');

  if (b && b.action === 'status') return json({ ok: true, claimed: !!stored });

  if (!stored) {
    if (b.action !== 'claim' || pass.length < 8) return json({ ok: false, error: 'unclaimed' }, 400);
    const salt = crypto.randomUUID();
    await env.REPORTS.put('admin:hash', salt + ':' + (await sha(salt + pass)));
    return json({ ok: true, claimed: true });
  }
  const [salt, h] = stored.split(':');
  const ip = request.headers.get('cf-connecting-ip') || '';
  const fk = 'af:' + (await sha(ip)).slice(0, 24);
  const fails = parseInt((await env.REPORTS.get(fk)) || '0', 10);
  if (fails >= 10) return json({ ok: false, error: 'locked' }, 429);
  if (!same(await sha(salt + pass), h)) {
    await env.REPORTS.put(fk, String(fails + 1), { expirationTtl: 3600 });
    return json({ ok: false, error: 'auth' }, 401);
  }

  if (b.action === 'done' || b.action === 'undone') {
    if (!/^r:[0-9]{13}-[0-9a-f]{8}$/.test(b.id || '')) return json({ ok: false }, 400);
    const v = await env.REPORTS.get(b.id);
    if (!v) return json({ ok: false }, 404);
    const r = JSON.parse(v); r.done = b.action === 'done';
    await env.REPORTS.put(b.id, JSON.stringify(r), { metadata: { done: r.done } });
    return json({ ok: true });
  }
  if (b.action === 'delete') {
    if (!/^r:[0-9]{13}-[0-9a-f]{8}$/.test(b.id || '')) return json({ ok: false }, 400);
    await env.REPORTS.delete(b.id);
    return json({ ok: true });
  }
  // list (newest first: keys are reverse-time ordered)
  const out = [];
  let cursor;
  do {
    const l = await env.REPORTS.list({ prefix: 'r:', cursor, limit: 100 });
    for (const k of l.keys) {
      const v = await env.REPORTS.get(k.name);
      if (v) out.push({ id: k.name, ...JSON.parse(v) });
      if (out.length >= 300) break;
    }
    cursor = l.list_complete || out.length >= 300 ? null : l.cursor;
  } while (cursor);
  return json({ ok: true, reports: out });
}

export const onRequest = () => json({ ok: false }, 405);
