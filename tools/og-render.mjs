// يرسم بطاقات المعاينة 1200×630 — يستدعيه tools/og.py
import fs from 'fs'; import path from 'path'; import { chromium } from 'playwright';
const [, , list, out] = process.argv; const cards = JSON.parse(fs.readFileSync(list, 'utf8'));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const exe = process.env.PW_CHROME || undefined;
const b = await chromium.launch(exe ? { executablePath: exe } : {}); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
const arch = (x0, top, sw, o) => { const x1 = 1200 - x0; return `<path d="M${x0} 640V${top + 170}C${x0} ${top + 80} ${600 - (x1 - x0) * .22} ${top + 30} 600 ${top}C${600 + (x1 - x0) * .22} ${top + 30} ${x1} ${top + 80} ${x1} ${top + 170}V640" fill="none" stroke="#b8913f" stroke-width="${sw}" opacity="${o}"/>` };
const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><link rel="stylesheet" href="file://${root}/fonts.css"><style>
html,body{margin:0}body{width:1200px;height:630px;background:radial-gradient(ellipse at 50% 35%,#211c12 0%,#0d0c0a 55%,#0a0a0a 100%);position:relative;overflow:hidden;font-family:'IBM Plex Sans Arabic'}
svg{position:absolute;inset:0}.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:20px}
.s{color:#c9a85a;font-size:34px;font-weight:500;margin-bottom:4px;min-height:1px}.n{font-family:Amiri;font-weight:700;color:#f3ede0;font-size:150px;line-height:1.45;white-space:nowrap}
.m{color:#c9a85a;font-size:30px;margin-top:0}.f{position:absolute;bottom:34px;left:0;right:0;text-align:center;color:#8d7a52;font-size:24px}.f b{font-family:Amiri;font-weight:700;color:#e9e1cf;font-size:30px}.f i{font-style:normal;margin:0 12px}
</style></head><body><svg viewBox="0 0 1200 630">${arch(390, 60, 3, 1)}${arch(418, 92, 1.5, .45)}</svg>
<div class="c"><div class="s" id="s"></div><div class="n" id="n"></div><div class="m" id="m"></div></div><div class="f"><b>أثر</b><i>·</i>atharuk.com</div></body></html>`;
const tmp = path.join(out, '.render.html'); fs.writeFileSync(tmp, html); await p.goto('file://' + tmp); fs.unlinkSync(tmp);
await p.evaluate(() => document.fonts.ready);
for (const [f, s, n, m] of cards) {
  await p.evaluate(([s, n, m]) => { const N = document.getElementById('n'); document.getElementById('s').textContent = s; document.getElementById('m').textContent = m; N.innerHTML = n.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/ﷺ/g, '<span style="font-family:IBM Plex Sans Arabic;font-size:.42em;font-weight:500">ﷺ</span>'); let z = 150; N.style.fontSize = z + 'px'; N.style.whiteSpace = 'nowrap'; N.style.width = ''; N.style.lineHeight = ''; while (N.scrollWidth > 390 && z > 84) { z -= 4; N.style.fontSize = z + 'px' } if (N.scrollWidth > 390 && / /.test(n)) { N.style.whiteSpace = 'normal'; N.style.width = '390px'; N.style.textAlign = 'center'; N.style.lineHeight = '1.3'; z = 96; N.style.fontSize = z + 'px'; while (N.scrollHeight > 270 && z > 60) { z -= 4; N.style.fontSize = z + 'px' } }
    // ذيل الحروف النازلة (ي ن ح ع…) لا يلمس السطر الذي تحته: يُقاس حبر آخر سطر فعليًا، ويُزاح السطر التالي بقدر الحاجة
    const M = document.getElementById('m'); M.style.marginTop = '0';
    const mk = document.createElement('span'); mk.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; N.appendChild(mk);
    const base = mk.getBoundingClientRect().top; mk.remove();
    const cx = document.createElement('canvas').getContext('2d'); cx.font = '700 ' + z + 'px Amiri';
    const last = (N.innerText.split('\n').pop() || '').replace(/ﷺ/g, '');
    const ink = base + cx.measureText(last).actualBoundingBoxDescent, gap = M.getBoundingClientRect().top - ink;
    if (gap < 14) M.style.marginTop = Math.ceil(14 - gap) + 'px';
  }, [s, n, m]);
  await p.evaluate(() => document.fonts.ready);
  const file = path.join(out, f + '.jpg'); fs.mkdirSync(path.dirname(file), { recursive: true });
  await p.screenshot({ path: file, type: 'jpeg', quality: 86 });
}
await b.close();
