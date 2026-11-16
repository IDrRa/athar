// الانتقال إلى atharuk.com: صفحات محركات البحث على العنوان القديم تُحوَّل نهائيًا (301) إلى النطاق الجديد.
// التطبيق نفسه على العنوان القديم يبقى ليعرض تنبيه الانتقال وينقل بيانات الزائر.
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev') return Response.redirect('https://atharuk.com' + u.pathname + u.search, 301);
  return ctx.next();
}
