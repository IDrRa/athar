"""أثر — صفحات مستقلة لمحركات البحث: صفحة لكل سورة، ولكل قسم أذكار، ولكل قسم أدعية.

التطبيق نفسه صفحة واحدة تتنقل بالروابط (#/…)، ومحركات البحث تراه صفحةً واحدة. هذه الصفحات نسخة نصية خفيفة
من المحتوى نفسه (من src/data كما هو حرفًا بحرف) لها روابط حقيقية مثل /surah/18/، وفي كل صفحة زر يفتح المكان نفسه في التطبيق.
تُبنى مع index.html عند تشغيل tools/build.py، ولا تُعدَّل يدويًا. التنسيق في src/pages/p.css.
"""
import os, re, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
SITE = 'https://iathar.pages.dev'
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
    q_js = read(os.path.join(SRC, 'js', '05-quran.js'))
    c_js = read(os.path.join(SRC, 'js', '00-core.js')) + read(os.path.join(SRC, 'js', '10-content.js'))
    QN, QC = js_array(q_js, 'QN'), js_array(q_js, 'QC')
    QMD = re.search(r'QMD="([01]{114})"', q_js).group(1)
    QPG = js_array(q_js, 'QPG')
    CA, DG = js_array(c_js, 'CA'), js_array(c_js, 'DG')
    DK = js_array(c_js, 'DK')
    content = [o for o in json.loads(read(os.path.join(SRC, 'data', 'content.json'))) if o.get('status') == 'published']
    sura = [json.loads(read(os.path.join(SRC, 'data', 'quran', '%03d.json' % n))) for n in range(1, 115)]
    bism = sura[0][0]
    lic = json.loads('"' + re.search(r'QLIC="((?:[^"\\]|\\.)*)"', q_js).group(1) + '"')
    q_comment = '\n<!--\n' + lic.replace('--', '- -') + '\n-->'

    def start_page(n):
        best = 1
        for i, g in enumerate(QPG):
            if (g[0], g[1]) <= (n, 1):
                best = i + 1
        return best

    out = {}
    # ---- التفسير الميسر: نص كل آية أو مجموعة آيات كما في tafsir/muyassar (رقم مكان النص = الآية التي يبدأ بها تفسير المجموعة)
    def tafsir_groups(n):
        t = json.loads(read(os.path.join(ROOT, 'tafsir', 'muyassar', '%d.json' % n)))['t']
        gs, v = [], 1
        while v <= len(t):
            x = t[v - 1]
            a = x if isinstance(x, int) else v
            b = a
            while b < len(t) and t[b] == a:
                b += 1
            gs.append((a, b, t[a - 1]))
            v = b + 1
        return gs

    def verses_html(n, a, b, ids=False):
        return ' '.join('<span class="v"%s>%s <span class="vn">﴿%s﴾</span></span>' % (' id="a%d"' % v if ids else '', esc(sura[n - 1][v - 1]), ar(v)) for v in range(a, b + 1))

    TF_SRC = '<p class="ps">التفسير الميسر — مجمع الملك فهد لطباعة المصحف الشريف</p>'
    VERSE_JS = '<script>var m=/^#a(\\d+)$/.exec(location.hash);if(m)document.getElementById("ob").href+="/"+m[1]</script>'

    # ---- سور القرآن
    for n in range(1, 115):
        nm, cnt, md = QN[n - 1], QC[n - 1], 'مدنية' if QMD[n - 1] == '1' else 'مكية'
        path = 'surah/%d/' % n
        up = '../../'
        pg = start_page(n)
        head = '' if n in (1, 9) else '<p class="bs">%s</p>' % esc(bism)
        nav = '<nav class="pn" aria-label="السور المجاورة">%s%s</nav>' % (
            '<a rel="prev" href="../%d/">‹ سورة %s</a>' % (n - 1, esc(QN[n - 2])) if n > 1 else '<span></span>',
            '<a rel="next" href="../%d/">سورة %s ›</a>' % (n + 1, esc(QN[n])) if n < 114 else '<span></span>')
        body = ('<h1>سورة %s</h1><p class="pm">%s · %s آية · تبدأ في الصفحة %s من المصحف</p>' % (esc(nm), md, ar(cnt), ar(pg))
                + '<p class="po"><a class="btn" id="ob" href="%s#/quran/%d">اقرأها في المصحف</a><a class="btn b2" href="tafsir/">معاني الآيات</a></p>' % (up, n)
                + '<div class="q" lang="ar">%s<p>%s</p></div>' % (head, verses_html(n, 1, cnt, True)) + nav + VERSE_JS)
        out[path] = page(path, 'سورة %s مكتوبة كاملة بالتشكيل' % nm,
                         'سورة %s كاملة بالتشكيل: %s، %s آية. اقرأها في أثر نصًّا أو في المصحف بخط المدينة.' % (nm, md, ar(cnt)),
                         [('surah/', 'القرآن الكريم')], body, '', q_comment)
        # معاني الآيات
        tp = path + 'tafsir/'
        rows = ''.join('<article class="pi tf"><p class="tq" lang="ar">%s</p><p class="tt">%s</p></article>' % (verses_html(n, a, b), esc(tx)) for a, b, tx in tafsir_groups(n))
        body = ('<h1>تفسير سورة %s</h1><p class="pm">معاني آياتها من التفسير الميسر</p>' % esc(nm)
                + '<p class="po"><a class="btn" href="../../../#/quran/%d">اقرأها في المصحف</a><a class="btn b2" href="../">نص السورة</a></p>' % n
                + rows + TF_SRC)
        out[tp] = page(tp, 'تفسير سورة %s — التفسير الميسر' % nm,
                       'تفسير سورة %s كاملة من التفسير الميسر (مجمع الملك فهد): معنى كل آية بأسلوب سهل، مع نص الآيات بالتشكيل.' % nm,
                       [('surah/', 'القرآن الكريم'), (path, 'سورة ' + nm)], body, '', q_comment)

    # ---- آيات مشهورة لها أسماء (نفس أسماء البحث في التطبيق)
    for name, n, a, b in [('آية الكرسي', 2, 255, 255), ('خواتيم سورة البقرة', 2, 285, 286), ('آية الدين', 2, 282, 282), ('آية النور', 24, 35, 35)]:
        path = 'surah/%d/%s/' % (n, str(a) if a == b else '%d-%d' % (a, b))
        rng = 'الآية %s' % ar(a) if a == b else 'الآيتان %s و%s' % (ar(a), ar(b))
        tf = [g for g in tafsir_groups(n) if g[1] >= a and g[0] <= b]
        body = ('<h1>%s</h1><p class="pm">سورة %s · %s</p>' % (esc(name), esc(QN[n - 1]), rng)
                + '<p class="po"><a class="btn" href="../../../#/quran/%d/%d">اقرأها في المصحف</a><a class="btn b2" href="../">سورة %s كاملة</a></p>' % (n, a, esc(QN[n - 1]))
                + '<div class="q" lang="ar"><p>%s</p></div>' % verses_html(n, a, b)
                + '<h2>معناها</h2>' + ''.join('<article class="pi tf">%s<p class="tt">%s</p></article>' % ('' if (ga, gb) == (a, b) else '<p class="tq" lang="ar">%s</p>' % verses_html(n, ga, gb), esc(tx)) for ga, gb, tx in tf)
                + TF_SRC)
        out[path] = page(path, '%s مكتوبة بالتشكيل مع معناها' % name,
                         '%s من سورة %s مكتوبة بالتشكيل، مع معناها من التفسير الميسر. اقرأها في أثر.' % (name, QN[n - 1]),
                         [('surah/', 'القرآن الكريم'), ('surah/%d/' % n, 'سورة ' + QN[n - 1])], body, '', q_comment)

    lst = ''.join('<li><a href="%d/"><span class="nn">%s</span><b>سورة %s</b><small>%s · %s آية</small></a></li>'
                  % (n, ar(n), esc(QN[n - 1]), 'مدنية' if QMD[n - 1] == '1' else 'مكية', ar(QC[n - 1])) for n in range(1, 115))
    out['surah/'] = page('surah/', 'سور القرآن الكريم مكتوبة كاملة', 'سور القرآن الكريم الأربع عشرة بعد المئة مكتوبة كاملة بالتشكيل، مرتبة بحسب المصحف.',
                         [], '<h1>سور القرآن الكريم</h1>' + open_btn('../', 'quran', 'افتح المصحف') + '<ul class="pl">%s</ul>' % lst)

    # ---- الأذكار
    rows = []
    for key, name in CA:
        L = [o for o in content if o['type'] == 'dhikr' and o.get('category') == key]
        if not L:
            continue
        path = 'adhkar/%s/' % key
        body = '<h1>%s</h1><p class="pm">%s ذكرًا، مع المصدر والتكرار</p>' % (esc(name), ar(len(L))) + open_btn('../../', 'adhkar/' + key, 'افتحها في أثر') + ''.join(item_card(o) for o in L)
        out[path] = page(path, '%s مكتوبة كاملة' % name, '%s مكتوبة كاملة بالتشكيل من حصن المسلم، مع عدد التكرار ومصدر كل ذكر.' % name, [('adhkar/', 'الأذكار')], body)
        rows.append('<li><a href="%s/"><b>%s</b><small>%s ذكرًا</small></a></li>' % (key, esc(name), ar(len(L))))
    out['adhkar/'] = page('adhkar/', 'الأذكار', 'أذكار الصباح والمساء والنوم والاستيقاظ والصلاة، والتسابيح والاستغفار، مكتوبة كاملة مع مصادرها.',
                          [], '<h1>الأذكار</h1>' + open_btn('../', 'adhkar', 'افتح الأذكار في أثر') + '<ul class="pl">%s</ul>' % ''.join(rows))

    # ---- الأدعية
    rows = []
    for key, name, sub in DK:
        if key == 'general':
            continue
        L = [o for o in content if o['type'] == 'dua' and (o.get('kind') or 'general') == key]
        if not L:
            continue
        path = 'dua/%s/' % key
        body = '<h1>%s</h1><p class="pm">%s — %s دعاء</p>' % (esc(name), esc(sub), ar(len(L))) + open_btn('../../', 'dua/type/' + key, 'افتحها في أثر') + ''.join(item_card(o) for o in L)
        out[path] = page(path, name, '%s: %s، مكتوبة كاملة بالتشكيل مع مصدر كل دعاء.' % (name, sub), [('dua/', 'الأدعية')], body)
        rows.append('<li><a href="%s/"><b>%s</b><small>%s</small></a></li>' % (key, esc(name), esc(sub)))
    grows = []
    for key, name in DG:
        L = [o for o in content if o['type'] == 'dua' and (o.get('kind') or 'general') == 'general' and (o.get('category') or 'other') == key]
        if not L:
            continue
        path = 'dua/general/%s/' % key
        parts, last = [], None
        for o in L:
            t = o.get('title') or ''
            if t and t != last:
                parts.append('<h2>%s</h2>' % esc(t))
            last = t
            parts.append(item_card(o))
        body = '<h1>أدعية %s</h1><p class="pm">من الأدعية العامة — %s دعاء</p>' % (esc(name), ar(len(L))) + open_btn('../../../', 'dua/general/' + key, 'افتحها في أثر') + ''.join(parts)
        out[path] = page(path, 'أدعية %s' % name, 'أدعية %s من حصن المسلم مكتوبة كاملة بالتشكيل مع مصدر كل دعاء.' % name, [('dua/', 'الأدعية')], body)
        grows.append('<li><a href="general/%s/"><b>%s</b><small>%s دعاء</small></a></li>' % (key, esc(name), ar(len(L))))
    out['dua/'] = page('dua/', 'الأدعية', 'أدعية القرآن والأنبياء والنبي ﷺ، والأدعية العامة في المواقف اليومية، مكتوبة كاملة مع مصادرها.', [],
                       '<h1>الأدعية</h1>' + open_btn('../', 'dua', 'افتح الأدعية في أثر') + '<ul class="pl">%s</ul><h2>الأدعية العامة</h2><ul class="pl">%s</ul>' % (''.join(rows), ''.join(grows)))

    files = {p + 'index.html': h for p, h in out.items()}
    files['p.css'] = read(os.path.join(SRC, 'pages', 'p.css'))
    urls = [''] + sorted(out, key=lambda p: [(0, int(x), '') if x.isdigit() else (1, 0, x) for x in p.split('/')])
    files['sitemap.xml'] = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                            + ''.join('  <url><loc>%s/%s</loc></url>\n' % (SITE, u) for u in urls) + '</urlset>\n')
    return files


def stale(files):
    """ملفات قديمة داخل مجلدات الصفحات لم تعد تُبنى (مثل قسم حُذف)."""
    have = set()
    for d in OUT_DIRS:
        for r, _, fs in os.walk(os.path.join(ROOT, d)):
            for f in fs:
                have.add(os.path.relpath(os.path.join(r, f), ROOT).replace(os.sep, '/'))
    return sorted(have - set(files))
