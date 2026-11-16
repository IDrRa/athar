// العنوان القديم iathar.pages.dev أُغلق بطلب المالك: لا يعرض شيئًا (404) ولا يحوِّل إلى الجديد؛ الموقع على atharuk.com فقط.
// ما عدا /api/ : منبّه الإشعارات (athar-cron) يستدعي العنوان القديم، فيبقى يعمل كما هو.
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  if (u.hostname === 'iathar.pages.dev' && !u.pathname.startsWith('/api/'))
    return new Response('', { status: 404, headers: { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' } });
  return ctx.next();
}
