#!/usr/bin/env python3
"""أثر — يجمع ملفات المصدر في src/ إلى ملف الموقع index.html.

الموقع يُنشر ملفًا واحدًا (index.html) ليفتح بسرعة ويعمل بلا إنترنت، لكن التعديل يكون في ملفات src/ الصغيرة:
  src/page.html            هيكل الصفحة، وفيه علامات <!--@css--> و<!--@quran--> و<!--@js-->
  src/css/*.css            التنسيق، يُضمّ بترتيب أسماء الملفات
  src/js/*.js              الشيفرة، تُضمّ بترتيب أسماء الملفات (الأرقام في أولها تحدد الترتيب)
  src/data/quran/NNN.json  نص كل سورة من Tanzil، كما هو حرفًا بحرف
  src/data/*.json          بيانات تُحقن في الشيفرة مكان علامات مثل /*@data:content*/

ويحسب أيضًا رقم الإصدار VERSION في أول sw.js تلقائيًا: بصمة لكل الملفات التي يحفظها عامل الخدمة على الجهاز
(قائمة SHELL في sw.js) ولـ sw.js نفسه. أي تغيير فيها يغيّر الرقم فيصل التحديث لمن ثبّت التطبيق،
وتعديل functions/ وحدها لا يغيّره.

التشغيل:  python3 tools/build.py          يكتب index.html ويحدّث VERSION في sw.js
          python3 tools/build.py --check  يتأكد أن index.html ورقم الإصدار مطابقان للمصدر (يستعمله الفحص التلقائي)
"""
import os, re, sys, glob, json, hashlib

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


VERSION_RE = re.compile(r"const VERSION='([0-9a-f]*)'")
SHELL_RE = re.compile(r'SHELL=(\[[^\]]*\])')


def sw_with_version(sw, index_html):
    """يعيد sw.js وفيه VERSION محسوبًا من محتوى ملفات SHELL (index.html المبني لتوّه) ومن sw.js نفسه."""
    assert len(VERSION_RE.findall(sw)) == 1, 'VERSION في sw.js'
    shell = json.loads(SHELL_RE.search(sw).group(1))
    h = hashlib.sha256()
    h.update(VERSION_RE.sub("const VERSION=''", sw).encode('utf-8'))
    for name in sorted(set('index.html' if n == './' else n for n in shell)):
        data = index_html.encode('utf-8') if name == 'index.html' else open(os.path.join(ROOT, name), 'rb').read()
        h.update(b'\0' + name.encode('utf-8') + b'\0' + hashlib.sha256(data).digest())
    return VERSION_RE.sub("const VERSION='%s'" % h.hexdigest()[:12], sw)


if __name__ == '__main__':
    out = build()
    target = os.path.join(ROOT, 'index.html')
    sw_path = os.path.join(ROOT, 'sw.js')
    sw = read(sw_path)
    sw_new = sw_with_version(sw, out)
    version = VERSION_RE.search(sw_new).group(1)
    if '--check' in sys.argv:
        if read(target) != out:
            sys.exit('✗ index.html غير مطابق لملفات src/ — شغّل: python3 tools/build.py ثم احفظ التعديل')
        if sw != sw_new:
            sys.exit('✗ رقم الإصدار في sw.js لا يطابق الملفات — شغّل: python3 tools/build.py ثم احفظ التعديل')
        print('✓ index.html مطابق لملفات المصدر، ورقم الإصدار %s مطابق للملفات' % version)
    else:
        with open(target, 'w', encoding='utf-8', newline='') as f:
            f.write(out)
        print('✓ بُني index.html (%d حرفًا)' % len(out))
        if sw != sw_new:
            with open(sw_path, 'w', encoding='utf-8', newline='') as f:
                f.write(sw_new)
            print('✓ رقم الإصدار في sw.js صار %s' % version)
        else:
            print('✓ رقم الإصدار في sw.js لم يتغيّر (%s)' % version)
