"""أثر — خريطة الموقع (sitemap.xml): الصفحة الرئيسية وحدها.

صفحات محركات البحث المستقلة أُلغيت بطلب المالك (2026-11-17)، وصارت روابط أثر نفسها حقيقية (/quran/2…) منذ 2026-11-27.
روابط الصفحات القديمة (/surah/…) تُحوَّل إلى أماكنها في ملف _redirects. تُبنى مع index.html عند تشغيل tools/build.py.
"""
SITE = 'https://atharuk.com'


def pages():
    return {'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                           '  <url><loc>%s/</loc></url>\n</urlset>\n' % SITE}
