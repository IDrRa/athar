// العنوان القديم iathar.pages.dev أُغلق: كل طلب عليه يُحوَّل نهائيًا (301) إلى النطاق الجديد atharuk.com بنفس المسار.
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev') return Response.redirect('https://atharuk.com' + u.pathname + u.search, 301);
  return ctx.next();
}
