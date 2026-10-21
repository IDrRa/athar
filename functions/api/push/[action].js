// أثر — تذكير الأذكار بالإشعارات (Web Push بلا محتوى؛ عامل الخدمة في الجهاز يكتب نص التنبيه).
// المسارات: /api/push/key · /api/push/sub · /api/push/test · /api/push/run
// التخزين: KV المربوط باسم REPORTS. مفاتيح VAPID تُولَّد مرة واحدة وتُحفظ فيه (لا أسرار في المستودع).
// كل اشتراك مفتاح «s:<hash>» وبياناته في metadata (الرابط، المنطقة الزمنية، الأوقات، آخر إرسال) فلا يحتاج التشغيل الدوري إلى قراءات.

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = (s) => new TextEncoder().encode(s);
async function sha(t) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc(t)))].map(x => x.toString(16).padStart(2, '0')).join(''); }

const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /\.notify\.windows\.com$/, /^push\.services\.mozilla\.com$/];
const okEndpoint = (u) => { try { const x = new URL(u); return x.protocol === 'https:' && PUSH_HOSTS.some(r => r.test(x.hostname)) && u.length < 600; } catch { return false; } };
const okTime = (t) => t === null || (typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t));
const okTz = (z) => { try { new Intl.DateTimeFormat('en', { timeZone: z }); return typeof z === 'string' && z.length < 64; } catch { return false; } };

async function vapid(env) {
  let v = await env.REPORTS.get('push:vapid', 'json');
  if (!v) {
    const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    v = { pub: b64u(await crypto.subtle.exportKey('raw', k.publicKey)), jwk: await crypto.subtle.exportKey('jwk', k.privateKey) };
    const again = await env.REPORTS.get('push:vapid', 'json'); // another request may have just created it
    if (again) return again;
    await env.REPORTS.put('push:vapid', JSON.stringify(v));
  }
  return v;
}

async function send(env, v, endpoint) {
  const aud = new URL(endpoint).origin;
  const h = b64u(enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const p = b64u(enc(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://iathar.pages.dev/' })));
  const key = await crypto.subtle.importKey('jwk', v.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc(h + '.' + p));
  const r = await fetch(endpoint, { method: 'POST', headers: { Authorization: `vapid t=${h}.${p}.${b64u(sig)}, k=${v.pub}`, TTL: '3600', Urgency: 'normal', 'Content-Length': '0' } });
  return r.status;
}

function localNow(tz, now) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const g = (t) => f.find(x => x.type === t).value;
  return { day: `${g('year')}-${g('month')}-${g('day')}`, min: (+g('hour')) * 60 + (+g('minute')) };
}
const toMin = (t) => (+t.slice(0, 2)) * 60 + (+t.slice(3));


// ---- prayer times (Umm al-Qura; same code as the site's مواقيت الصلاة) ----
function ptSun(jd){const D=jd-2451545,r=Math.PI/180,g=(357.529+0.98560028*D)*r,q=280.459+0.98564736*D,L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*r,e=(23.439-0.00000036*D)*r,
 RA=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L))/r/15,dec=Math.asin(Math.sin(e)*Math.sin(L));let eqt=q/15-((RA%24)+24)%24;eqt=((eqt+12)%24+24)%24-12;return {dec,eqt}}
function ptAt(jd0,lat,lng,ang,dir,approx){const r=Math.PI/180,s=ptSun(jd0+approx/24),noon=12-lng/15-s.eqt,c=(-Math.sin(ang*r)-Math.sin(lat*r)*Math.sin(s.dec))/(Math.cos(lat*r)*Math.cos(s.dec));if(c<-1||c>1)return NaN;return noon+dir*Math.acos(c)/r/15}
function ptAsrAng(jd0,lat,approx){const r=Math.PI/180,s=ptSun(jd0+approx/24);return -Math.atan(1/(1+Math.tan(Math.abs(lat*r-s.dec))))/r}
function ptDay(y,m,d,lat,lng,ramadan){const jd0=Date.UTC(y,m-1,d)/864e5+2440587.5,t={};
 for(let i=0;i<3;i++){const s=ptSun(jd0+(t.dhuhr||12)/24);t.dhuhr=12-lng/15-s.eqt;t.fajr=ptAt(jd0,lat,lng,18.5,-1,t.fajr||5);t.sunrise=ptAt(jd0,lat,lng,0.833,-1,t.sunrise||6);
  t.asr=ptAt(jd0,lat,lng,ptAsrAng(jd0,lat,t.asr||15),1,t.asr||15);t.maghrib=ptAt(jd0,lat,lng,0.833,1,t.maghrib||18)}
 t.isha=t.maghrib+(ramadan?2:1.5);const base=Date.UTC(y,m-1,d),o={};for(const k of ['fajr','dhuhr','asr','maghrib','isha'])o[k]=isFinite(t[k])?Math.round((base+t[k]*36e5)/6e4)*6e4:null;return o}
function ramadan(now,tz){try{return parseInt(new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{timeZone:tz,month:'numeric'}).format(now),10)===9}catch{return false}}
const PR={f:'fajr',d:'dhuhr',a:'asr',m:'maghrib',i:'isha'};

async function body(request) { try { return await request.json(); } catch { return null; } }
function sameOrigin(request) { const o = request.headers.get('origin'); return !o || new URL(o).host === new URL(request.url).host; }

export async function onRequest({ request, env, params }) {
  if (!env.REPORTS) return json({ ok: false, error: 'not-configured' }, 503);
  const a = params.action;

  if (a === 'key') return json({ ok: true, key: (await vapid(env)).pub });

  if (a === 'diag') { // health check without personal data: when the scheduler last ran and what the push services answered
    const l = await env.REPORTS.get('push:last', 'json'), s2 = await env.REPORTS.get('push:lastsend', 'json');
    return json({ ok: true, now: Date.now(), keySet: !!env.PUSH_KEY, lastBuild: l && { ago_s: Math.round((Date.now() - l.at) / 1000), built: l.built, of: l.of }, lastSend: s2 && { ago_s: Math.round((Date.now() - s2.at) / 1000), part: s2.part, due: s2.due, status: s2.status } });
  }

  if (a === 'sub' && request.method === 'POST') {
    if (!sameOrigin(request)) return json({ ok: false }, 403);
    const b = await body(request);
    if (!b || !okEndpoint(b.endpoint)) return json({ ok: false, error: 'endpoint' }, 400);
    const id = 's:' + (await sha(b.endpoint)).slice(0, 32);
    if (b.action === 'del') { await env.REPORTS.delete(id); return json({ ok: true }); }
    const m = b.m ?? null, e = b.e ?? null, pr = typeof b.pr === 'string' ? [...new Set(b.pr.replace(/[^fdami]/g, ''))].join('') : '';
    if (!okTime(m) || !okTime(e) || !okTz(b.tz)) return json({ ok: false, error: 'bad' }, 400);
    let la = null, lo = null;
    if (pr) { la = Math.round(+b.lat * 10) / 10; lo = Math.round(+b.lng * 10) / 10; if (!(la >= -66 && la <= 66 && lo >= -180 && lo <= 180)) return json({ ok: false, error: 'loc' }, 400); }
    if (!m && !e && !pr) { await env.REPORTS.delete(id); return json({ ok: true }); }
    await env.REPORTS.put(id, '1', { metadata: { u: b.endpoint, tz: b.tz, m, e, pr, la, lo } });
    return json({ ok: true });
  }

  if (a === 'test' && request.method === 'POST') {
    if (!sameOrigin(request)) return json({ ok: false }, 403);
    const b = await body(request);
    if (!b || !okEndpoint(b.endpoint)) return json({ ok: false }, 400);
    const rk = 'pt:' + (await sha(b.endpoint)).slice(0, 24);
    const n = parseInt((await env.REPORTS.get(rk)) || '0', 10);
    if (n >= 5) return json({ ok: false, error: 'rate' }, 429);
    await env.REPORTS.put(rk, String(n + 1), { expirationTtl: 3600 });
    const st = await send(env, await vapid(env), b.endpoint);
    return json({ ok: st >= 200 && st < 300, status: st });
  }

  if (a === 'run') {
    // Called every 5 minutes by the scheduler Worker (athar-cron). Each reminder is due only in the 5 minutes after
    // its time, so a run never needs to write anything per subscriber. When the PUSH_KEY secret is set, only the
    // scheduler (which sends it in the x-push-key header) may run this.
    if (env.PUSH_KEY && request.headers.get('x-push-key') !== env.PUSH_KEY) return json({ ok: false }, 403);
    const url = new URL(request.url), n = Math.min(Math.max(parseInt(url.searchParams.get('n') || '1', 10) || 1, 1), 240), i = Math.min(Math.max(parseInt(url.searchParams.get('i') || '0', 10) || 0, 0), n - 1);
    // ts: the original run's time, carried through relay hops so every hop sees the same due list.
    const ts = parseInt(url.searchParams.get('ts') || '0', 10), off = Math.max(parseInt(url.searchParams.get('off') || '0', 10) || 0, 0), hop = Math.max(parseInt(url.searchParams.get('hop') || '0', 10) || 0, 0);
    const v = await vapid(env), now = new Date(ts && Math.abs(Date.now() - ts) < 240000 ? ts : Date.now()), due = [];
    const part = (name) => parseInt(name.slice(2, 10), 16) % n;
    // With one partition (n=1) the run lists the subscribers itself. With more, the scheduler also sends a
    // ?build=1 call that lists every subscriber once (one list call per run) and leaves each partition its own
    // slice in the edge cache, plus a full copy in KV when it changed; partitions read their slice from the
    // previous build, so no run parses the whole list and the run costs one list call however many partitions.
    const cache = caches.default, ck = (j) => new Request(`${url.origin}/__push_idx/${n}/${j}`);
    let subs = [];
    if (n === 1 || url.searchParams.get('build') === '1') {
      let all = [], cursor;
      do { const l = await env.REPORTS.list({ prefix: 's:', cursor, limit: 1000 }); for (const k of l.keys) if (k.metadata && k.metadata.u) all.push([k.name, k.metadata]); cursor = l.list_complete ? null : l.cursor; } while (cursor);
      if (n === 1) subs = all;
      else {
        const parts = Array.from({ length: n }, () => []);
        for (const x of all) parts[part(x[0])].push(x);
        await Promise.all(parts.map((p, j) => cache.put(ck(j), new Response(JSON.stringify(p), { headers: { 'cache-control': 'max-age=900' } })).catch(() => {})));
        const full = JSON.stringify(all), h = (await sha(full)).slice(0, 16);
        if ((await env.REPORTS.get('push:idxh')) !== h) { await env.REPORTS.put('push:idx', full); await env.REPORTS.put('push:idxh', h); }
        await env.REPORTS.put('push:last', JSON.stringify({ at: Date.now(), built: all.length, of: n }));
        return json({ ok: true, built: all.length, of: n });
      }
    } else {
      const c = await cache.match(ck(i)).catch(() => null);
      subs = c ? await c.json() : ((await env.REPORTS.get('push:idx', 'json')) || []);
    }
    for (const [name, md] of subs) {
      if (part(name) !== i || !okTz(md.tz)) continue;
      const t = localNow(md.tz, now);
      let hit = null, prev = false;
      if (md.pr && md.la != null) {
        const [y, mo, d] = t.day.split('-').map(Number), P = ptDay(y, mo, d, md.la, md.lo, ramadan(now, md.tz));
        for (const c of md.pr) { const at = P[PR[c]]; if (!at) continue; const g = now - at; if (g >= -30000 && g < 270000) hit = 'prayer'; else if (g >= 270000 && g < 570000) prev = true; }
      }
      // adhkar: due in the 5 minutes after their time; if a prayer took that run, they go out on the next one
      if (!hit) for (const slot of ['m', 'e']) { if (md[slot]) { const d = t.min - toMin(md[slot]); if ((d >= 0 && d < 5) || (prev && d >= 5 && d < 10)) { hit = slot; break; } } }
      if (hit) due.push({ k: name, md, prayer: hit === 'prayer' });
    }
    due.sort((x, y) => (y.prayer ? 1 : 0) - (x.prayer ? 1 : 0) || (x.k < y.k ? -1 : 1));
    let sent = 0, gone = 0, relayed = false;
    // The free plan allows ~50 outgoing requests per invocation: send up to 45 here, and if more are due, hand the
    // rest to a fresh invocation by bouncing through the scheduler Worker (a Function can't call itself directly).
    const B = 45, batch = due.slice(off, off + B);
    if (due.length > off + B && env.PUSH_KEY && hop < 30) {
      const next = new URL(url); next.searchParams.set('ts', String(now.getTime())); next.searchParams.set('off', String(off + B)); next.searchParams.set('hop', String(hop + 1)); next.searchParams.delete('build');
      const relay = (env.PUSH_RELAY || 'https://athar-cron.rashedalzu3bi415.workers.dev') + '/?to=' + encodeURIComponent(next.toString());
      relayed = await fetch(relay, { method: 'POST', headers: { 'x-push-key': env.PUSH_KEY } }).then(r => r.ok).catch(() => false);
    }
    const R = await Promise.all(batch.map(x => send(env, v, x.md.u).catch(() => 0)));
    if (batch.length) await env.REPORTS.put('push:lastsend', JSON.stringify({ at: now.getTime(), part: i, hop, subs: subs.length, due: due.length, status: R, cached: !!subs._c })).catch(() => {});
    for (let j = 0; j < R.length; j++) {
      if (R[j] === 404 || R[j] === 410) { await env.REPORTS.delete(batch[j].k); gone++; } else if (R[j] >= 200 && R[j] < 300) sent++;
    }
    return json({ ok: true, part: i, of: n, hop, subs: subs.length, due: due.length, sent, gone, relayed, left: relayed ? 0 : Math.max(0, due.length - off - B) });
  }

  return json({ ok: false }, 404);
}
