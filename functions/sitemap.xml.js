// خريطة الموقع على العنوان القديم تُحوَّل إلى النطاق الجديد؛ وعلى النطاق الجديد تُقدَّم كما هي.
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev') return Response.redirect('https://atharuk.com/sitemap.xml', 301);
  return ctx.env.ASSETS.fetch(ctx.request);
}
