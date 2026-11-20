"""أثر — بطاقات معاينة الروابط (واتساب وغيره).

يولّد:
  og/s/N.jpg        بطاقة لكل سورة (١١٤)
  og/a/<قسم>.jpg    بطاقة لكل قسم أذكار
  og/d.jpg          بطاقة الأدعية
  og/v/N.json       مطلع كل آية (لوصف رابط الآية)
  og/meta.js        أسماء السور والأقسام والأدعية، تقرؤه functions/_middleware.js
يُشغَّل يدويًا حين تتغيّر السور أو الأقسام أو الأدعية:  python3 tools/og.py
(يحتاج playwright وكروم لرسم الصور؛ build.py لا يعتمد عليه)
"""
import os, re, json, glob, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src'); OUT = os.path.join(ROOT, 'og')
q = open(os.path.join(SRC, 'js', '05-quran.js'), encoding='utf-8').read()
core = open(os.path.join(SRC, 'js', '00-core.js'), encoding='utf-8').read()
QN = json.loads(re.search(r'var QN=(\[[^\]]*\])', q).group(1))
QMD = re.search(r'QMD="([01]{114})"', q).group(1)
CA = json.loads(re.search(r'var CA=(\[\[.*?\]\]);', core).group(1).replace("'", '"'))
V = [json.load(open(os.path.join(SRC, 'data', 'quran', '%03d.json' % n), encoding='utf-8')) for n in range(1, 115)]
C = json.load(open(os.path.join(SRC, 'data', 'content.json'), encoding='utf-8'))
cut = lambda s, n=110: s if len(s) <= n else s[:n].rsplit(' ', 1)[0] + ' …'
os.makedirs(os.path.join(OUT, 'v'), exist_ok=True)
for n, vs in enumerate(V, 1):
    json.dump([cut(x) for x in vs], open(os.path.join(OUT, 'v', '%d.json' % n), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
S = [[QN[i], len(V[i]), int(QMD[i])] for i in range(114)]
A = {k: t for k, t in CA}
D = {o['id']: [o.get('title') or 'دعاء', cut(re.sub(r'\s+', ' ', o['text']))] for o in C if o['type'] == 'dua' and o.get('status', 'published') == 'published'}
with open(os.path.join(OUT, 'meta.js'), 'w', encoding='utf-8') as f:
    f.write('// مولَّد بـ tools/og.py — لا تعدّله يدويًا\n')
    f.write('export const S=%s;\nexport const A=%s;\nexport const D=%s;\n' % tuple(json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in (S, A, D)))
ar = lambda n: str(n).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))
cards = [('s/%d' % (i + 1), 'سورة', QN[i], '%s %s · %s' % (ar(len(V[i])), 'آيات' if 3 <= len(V[i]) <= 10 else 'آية', 'مدنية' if QMD[i] == '1' else 'مكية')) for i in range(114)]
for k, t in CA:
    top, big = ('أذكار', t[6:]) if t.startswith('أذكار ') else ('', t)
    cards.append(('a/' + k, top, big, 'من حصن المسلم'))
cards.append(('d', '', 'دعاء', 'من القرآن والسنة'))
c10 = open(os.path.join(SRC, 'js', '10-content.js'), encoding='utf-8').read()
DK = json.loads(re.search(r'var DK=(\[\[.*?\]\]),', c10).group(1).replace("'", '"'))
DG = json.loads(re.search(r'var DG=(\[\[.*?\]\]);', c10).group(1))
SUB = {'quran': 'من القرآن الكريم', 'prophets': 'من القرآن الكريم', 'sunnah': 'من السنة النبوية', 'general': 'من حصن المسلم'}
for k, t, _ in DK:
    cards.append(('t/' + k, 'أدعية' if t.startswith('أدعية ') else '', t[6:] if t.startswith('أدعية ') else t, SUB.get(k, '')))
for k, t in DG:
    cards.append(('g/' + k, 'أدعية', t, 'من حصن المسلم'))
cards.append(('jumua', 'يوم الجمعة', 'فواتح الدعاء وجوامعه', 'من القرآن والسنة'))
cards.append(('salawat', '', 'الصلاة على النبي ﷺ', 'صيغتها وفضلها'))
with open(os.path.join(OUT, 'meta.js'), 'a', encoding='utf-8') as f:
    f.write('export const DT=%s;\nexport const DGN=%s;\n' % (json.dumps({k: t for k, t, _ in DK}, ensure_ascii=False), json.dumps({k: t for k, t in DG}, ensure_ascii=False)))
json.dump(cards, open('/tmp/og-cards.json', 'w', encoding='utf-8'), ensure_ascii=False)
subprocess.run(['node', os.path.join(ROOT, 'tools', 'og-render.mjs'), '/tmp/og-cards.json', OUT], check=True)
print('✓ og: %d بطاقة، %d دعاء' % (len(cards), len(D)))
