"""أثر — صفحات مستقلة لمحركات البحث: صفحة لكل سورة، ولكل قسم أذكار، ولكل قسم أدعية.

التطبيق نفسه صفحة واحدة تتنقل بالروابط (#/…)، ومحركات البحث تراه صفحةً واحدة. هذه الصفحات نسخة نصية خفيفة
من المحتوى نفسه (من src/data كما هو حرفًا بحرف) لها روابط حقيقية مثل /surah/18/، وفي كل صفحة زر يفتح المكان نفسه في التطبيق.
تُبنى مع index.html عند تشغيل tools/build.py، ولا تُعدَّل يدويًا. التنسيق في src/pages/p.css.
"""
import os, re, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
SITE = 'https://atharuk.com'
OUT_DIRS = ('surah', 'adhkar', 'dua')


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def js_array(src, name):
    i = re.search(r'\b' + name + r'=\[', src).end() - 1
    depth, j, q = 0, i, None
    while True:
        ch = src[j]
        if q:
            if ch == q:
                q = None
        elif ch in '"\'':
            q = ch
        elif ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                break
        j += 1
    return json.loads(src[i:j + 1].replace("'", '"'))


AR = '٠١٢٣٤٥٦٧٨٩'


def ar(n):
    return ''.join(AR[int(c)] for c in str(n))


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


MIHRAB = ('<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">'
          '<path d="M14 58 V30 Q14 14 32 5 Q50 14 50 30 V58 Z"/><path d="M22 58 V33 Q22 22 32 15 Q42 22 42 33 V58"/><line x1="8" y1="58" x2="56" y2="58"/></g></svg>')


def page(path, title, desc, crumbs, body, note='', comment=''):
    """path مثل 'surah/18/'؛ الروابط داخل الصفحة نسبية فتعمل في أي مكان يُنشر فيه الموقع."""
    up = '../' * path.count('/')
    cr = ''.join('<a href="%s%s">%s</a><span aria-hidden="true">›</span>' % (up, h, esc(t)) for h, t in crumbs)
    return '''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(t)s — أثر</title>
<meta name="description" content="%(d)s">
<link rel="canonical" href="%(url)s">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="article">
<meta property="og:site_name" content="أثر">
<meta property="og:locale" content="ar_AR">
<meta property="og:url" content="%(url)s">
<meta property="og:title" content="%(t)s — أثر">
<meta property="og:description" content="%(d)s">
<meta property="og:image" content="%(site)s/icons/og-m4.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="%(up)sicons/favicon-m4.svg">
<link rel="apple-touch-icon" href="%(up)sicons/apple-touch-icon-m4.png">
<link rel="stylesheet" href="%(up)sfonts.css">
<link rel="stylesheet" href="%(up)sp.css">
</head>
<body>
<header class="ph"><a class="pb" href="%(up)s">%(mihrab)s<span>أثر</span></a><nav class="pc" aria-label="مسار الصفحة">%(cr)s</nav></header>
<main>
%(body)s
</main>
<footer class="pf"><nav aria-label="أقسام أثر"><a href="%(up)ssurah/">سور القرآن</a><a href="%(up)sadhkar/">الأذكار</a><a href="%(up)sdua/">الأدعية</a></nav>
%(note)s<p><a href="%(up)s">أثر</a> — ما ينفعك ويبقى أثره</p></footer>%(comment)s
</body>
</html>
''' % {'t': esc(title), 'd': attr(desc), 'url': SITE + '/' + path, 'site': SITE, 'up': up, 'mihrab': MIHRAB, 'cr': cr, 'body': body, 'note': note, 'comment': comment}


def open_btn(up, hash_, label):
    return '<p class="po"><a class="btn" href="%s#/%s">%s</a></p>' % (up, hash_, esc(label))


def item_card(o):
    meta = []
    if o.get('count'):
        meta.append(('التكرار', ar(o['count']) if o['count'].isdigit() else o['count']))
    if o.get('source'):
        meta.append(('المصدر', o['source']))
    if o.get('reference'):
        meta.append(('المرجع', o['reference']))
    dl = '<dl>' + ''.join('<dt>%s</dt><dd>%s</dd>' % (esc(a), esc(b)) for a, b in meta) + '</dl>' if meta else ''
    return '<article class="pi"><p class="pt">%s</p>%s</article>' % (esc(o['text']), dl)


def pages():
    """صفحات البحث المستقلة أُلغيت بطلب المالك (2026-11-17)؛ تبقى خريطة الموقع للصفحة الرئيسية وحدها،
    وروابط الصفحات القديمة تُحوَّل إلى أماكنها داخل التطبيق عبر ملف _redirects."""
    return {'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                           '  <url><loc>%s/</loc></url>\n</urlset>\n' % SITE}


def stale(files):
    """ملفات قديمة داخل مجلدات الصفحات لم تعد تُبنى (مثل قسم حُذف)."""
    have = set()
    for d in OUT_DIRS:
        for r, _, fs in os.walk(os.path.join(ROOT, d)):
            for f in fs:
                have.add(os.path.relpath(os.path.join(r, f), ROOT).replace(os.sep, '/'))
    return sorted(have - set(files))
