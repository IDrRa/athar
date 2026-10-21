#!/usr/bin/env python3
"""أثر — يجمع ملفات المصدر في src/ إلى ملف الموقع index.html.

الموقع يُنشر ملفًا واحدًا (index.html) ليفتح بسرعة ويعمل بلا إنترنت، لكن التعديل يكون في ملفات src/ الصغيرة:
  src/page.html            هيكل الصفحة، وفيه علامات <!--@css--> و<!--@quran--> و<!--@js-->
  src/css/*.css            التنسيق، يُضمّ بترتيب أسماء الملفات
  src/js/*.js              الشيفرة، تُضمّ بترتيب أسماء الملفات (الأرقام في أولها تحدد الترتيب)
  src/data/quran/NNN.json  نص كل سورة من Tanzil، كما هو حرفًا بحرف
  src/data/*.json          بيانات تُحقن في الشيفرة مكان علامات مثل /*@data:content*/

التشغيل:  python3 tools/build.py          يكتب index.html
          python3 tools/build.py --check  يتأكد أن index.html مطابق للمصدر (يستعمله الفحص التلقائي)
"""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def build():
    page = read(os.path.join(SRC, 'page.html'))
    css = ''.join(read(p) for p in sorted(glob.glob(os.path.join(SRC, 'css', '*.css'))))
    js = ''.join(read(p) for p in sorted(glob.glob(os.path.join(SRC, 'js', '*.js'))))
    js = re.sub(r'/\*@data:([a-z0-9_-]+)\*/', lambda m: read(os.path.join(SRC, 'data', m.group(1) + '.json')), js)
    quran = ''.join('<script type="application/json" id="qs%d">%s</script>\n' % (n, read(os.path.join(SRC, 'data', 'quran', '%03d.json' % n))) for n in range(1, 115))
    for mark, val in (('<!--@css-->', css), ('<!--@quran-->', quran), ('<!--@js-->', js)):
        assert page.count(mark) == 1, mark
        page = page.replace(mark, val)
    return page


if __name__ == '__main__':
    out = build()
    target = os.path.join(ROOT, 'index.html')
    if '--check' in sys.argv:
        if read(target) != out:
            sys.exit('✗ index.html غير مطابق لملفات src/ — شغّل: python3 tools/build.py ثم احفظ التعديل')
        print('✓ index.html مطابق لملفات المصدر')
    else:
        with open(target, 'w', encoding='utf-8', newline='') as f:
            f.write(out)
        print('✓ بُني index.html (%d حرفًا)' % len(out))
