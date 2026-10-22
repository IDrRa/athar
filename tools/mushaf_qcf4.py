#!/usr/bin/env python3
"""أثر — يبني صفحات المصحف من حزمة quran-qcf4 (خطوط مجمع الملك فهد QCF4، طبعة المدينة ١٤٤١هـ).

التشغيل:  python3 tools/mushaf_qcf4.py <مجلد package من quran-qcf4> <مجلد package من quran-meta>
  - ينسخ الخطوط إلى mushaf/q4/ كما هي دون أي تعديل.
  - يكتب تخطيط كل صفحة إلى mushaf/q4/l/NNN.json.
  - يعيد بناء خريطة الصفحات (QPG وQJZ وQHZ) في src/js/05-quran.js لتطابق حدود صفحات هذه الطبعة.
  - يتحقق: ٦٠٤ صفحات، و٦٢٣٦ آية لكل منها علامة نهاية واحدة، وتسلسل الآيات متصل بلا فجوات.

صيغة الصفحة: {"p": رقم, "f": رقم خط الصفحة, "r": [صفوف]}، والصف واحد من:
  ["h", رقم السورة]             رأس السورة (يرسمه الموقع)
  ["b", حرف, رقم الخط]           البسملة
  [[حرف, سورة, آية, نوع], ...]   كلمات السطر؛ النوع ٠ كلمة، ١ علامة نهاية الآية، ٢ علامة الحزب ۞
"""
import json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKG, META = sys.argv[1], sys.argv[2]


def fidx(name):
    m = re.fullmatch(r'QCF4_Hafs_(\d\d)', name)
    assert m, name
    return int(m.group(1))


# 1. fonts, copied unmodified
out = os.path.join(ROOT, 'mushaf', 'q4')
os.makedirs(out, exist_ok=True)
for n in range(1, 48):
    shutil.copyfile(os.path.join(PKG, 'fonts-woff2', 'QCF4_Hafs_%02d_W.woff2' % n), os.path.join(out, 'QCF4_Hafs_%02d_W.woff2' % n))

# 2. page layouts
seq, ends, firsts, fonts = [], {}, [], []
for p in range(1, 605):
    d = json.load(open(os.path.join(PKG, 'pages', '%03d.json' % p), encoding='utf-8'))
    pf = fidx(d['font']); fonts.append(pf)
    rows = []
    for L in d['lines']:
        ws = L['words']; t0 = ws[0]['type']
        if t0 == 'surah_header':
            rows.append('H'); continue
        if t0 == 'bismillah':
            assert len(ws) == 1; rows.append(['b', ws[0]['char'], fidx(ws[0]['font'])]); continue
        row, pend = [], []
        for w in ws:
            assert fidx(w['font']) == pf, (p, w)
            if w['type'] == 'quarter': pend.append(w['char']); continue
            s, a = map(int, w['verse_key'].split(':'))
            for q in pend: row.append([q, s, a, 2])
            pend = []
            kind = 1 if w['type'] == 'end' else 0
            assert w['type'] in ('word', 'end'), w['type']
            row.append([w['char'], s, a, kind])
            if kind == 1: ends[(s, a)] = ends.get((s, a), 0) + 1
            if not seq or seq[-1] != (s, a): seq.append((s, a))
        assert not pend, ('quarter at line end', p)
        rows.append(row)
    # surah headers: the surah whose first verse follows the header
    for i, r in enumerate(rows):
        if r == 'H':
            nxt = next(x for x in rows[i + 1:] if isinstance(x, list) and x and x[0] != 'b')
            rows[i] = ['h', nxt[0][1]]
            assert nxt[0][2] == 1, ('header not followed by verse 1', p)
    first = next(x for x in rows if x[0] not in ('h', 'b'))[0]
    firsts.append((first[1], first[2]))
    with open(os.path.join(ROOT, 'mushaf', 'q4', 'l', '%03d.json' % p), 'w', encoding='utf-8') as f:
        json.dump({'p': p, 'f': pf, 'r': rows}, f, ensure_ascii=False, separators=(',', ':'))

QC = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
allv = [(s, a) for s in range(1, 115) for a in range(1, QC[s - 1] + 1)]
assert seq == allv, 'verse sequence is not continuous'
assert len(ends) == 6236 and set(ends.values()) == {1}, 'every verse must have exactly one end marker'

# 3. page map (first verse, juz, quarter) from quran-meta lists, same method that reproduces the previous map exactly
js = r'''
import * as H from %s;
const st = %s.map(([s,a]) => H.findAyahIdBySurah(s,a)), HQ = H.HizbQuarterList.slice(1,241), JZ = H.JuzList.slice(1,31);
const end = (p) => p < 604 ? st[p] - 1 : 6236;
const pageOf = (x) => { let lo=0, hi=603; while (lo<hi) { const m=(lo+hi+1)>>1; if (st[m]<=x) lo=m; else hi=m-1 } return lo+1 };
const pg = st.map((x,i) => { const [s,a] = H.findSurahAyahByAyahId(x); let q=0; for (let k=0;k<240;k++) if (HQ[k]>=x && HQ[k]<=end(i+1)) { q=k+1; break } return [s,a,H.findJuzByAyahId(x),q] });
const jz = JZ.map(x => { const [s,a] = H.findSurahAyahByAyahId(x); return [s,a,pageOf(x)] });
const hz = HQ.filter((_,k) => k%%4===0).map(x => { const [s,a] = H.findSurahAyahByAyahId(x); return [s,a,pageOf(x)] });
console.log(JSON.stringify({pg,jz,hz}));
''' % (json.dumps('file://' + os.path.join(os.path.abspath(META), 'dist', 'hafs.js')), json.dumps(firsts))
m = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
src = os.path.join(ROOT, 'src', 'js', '05-quran.js')
s = open(src, encoding='utf-8', newline='').read()
s, n1 = re.subn(r'var QPG=\[\[[^;]*?\]\](?=[;,])', 'var QPG=' + json.dumps(m['pg'], separators=(',', ':')), s, count=1)
s, n2 = re.subn(r'var QJZ=\[\[.*?\]\](?=,QHZ=)', 'var QJZ=' + json.dumps(m['jz'], separators=(',', ':')), s, count=1)
s, n3 = re.subn(r'QHZ=\[\[.*?\]\](?=[;,])', 'QHZ=' + json.dumps(m['hz'], separators=(',', ':')), s, count=1)
assert (n1, n2, n3) == (1, 1, 1)
open(src, 'w', encoding='utf-8', newline='').write(s)

# font start pages, for loading a page's font before its layout arrives
starts = [p for p in range(1, 605) if p == 1 or fonts[p - 1] != fonts[p - 2]]
assert fonts == sorted(fonts) and len(starts) == 47
print(json.dumps({'fontStarts': starts}))
print('✓ ٦٠٤ صفحة، ٦٢٣٦ آية، وخريطة الصفحات حُدّثت')
