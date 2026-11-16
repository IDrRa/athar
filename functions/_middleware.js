// العنوان القديم iathar.pages.dev أُغلق: كل طلب عليه يُحوَّل نهائيًا (301) إلى النطاق الجديد atharuk.com بنفس المسار.
// ما عدا /api/ : منبّه الإشعارات (athar-cron) يستدعي العنوان القديم، فيبقى يعمل كما هو.
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev' && !u.pathname.startsWith('/api/')) return Response.redirect('https://atharuk.com' + u.pathname + u.search, 301);
  return ctx.next();
}
