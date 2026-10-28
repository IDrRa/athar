// ملف إثبات ملكية الموقع في Google Search Console. Cloudflare يحوّل روابط .html إلى روابط بلا امتداد،
// فهذه الدالة تعيد المحتوى مباشرة على الرابط نفسه دون تحويل. لا تحذفها ولا تحذف google1f6e29477e45f773.html.
export const onRequest = () => new Response('google-site-verification: google1f6e29477e45f773.html', { headers: { 'content-type': 'text/html; charset=utf-8' } });
