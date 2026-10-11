export const dynamic = 'force-dynamic';

// Transforme un lien YouTube (video, chaine, @nom) en adresse d'integration
export async function GET(req) {
  const u = new URL(req.url).searchParams.get('u') || '';
  let url;
  try { url = new URL(u); } catch { return Response.json({ error: 'lien invalide' }, { status: 400 }); }
  const h = url.hostname.replace(/^(www|m)\./, '');
  if (!['youtube.com', 'youtu.be'].includes(h)) return Response.json({ error: 'lien non YouTube' }, { status: 400 });
  const vid = h === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || (url.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{6,})/) || [])[1];
  if (vid) return Response.json({ embed: `https://www.youtube.com/embed/${vid}?rel=0` });
  const ch = url.pathname.match(/^\/channel\/(UC[\w-]+)/);
  let id = ch && ch[1];
  if (!id && /^\/(@|c\/|user\/)/.test(url.pathname)) {
    try {
      const seg = url.pathname.split('/').filter(Boolean);
      const path = '/' + (seg[0].startsWith('@') ? seg[0] : seg.slice(0, 2).join('/'));
      const r = await fetch('https://www.youtube.com' + path, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' }, cache: 'no-store' });
      const t = await r.text();
      id = (t.match(/"channelId":"(UC[\w-]{20,})"/) || t.match(/channel\/(UC[\w-]{20,})/) || [])[1];
    } catch {}
  }
  if (!id) return Response.json({ error: 'chaine introuvable' }, { status: 404 });
  return Response.json({ embed: `https://www.youtube.com/embed/live_stream?channel=${id}` }, { headers: { 'Cache-Control': 's-maxage=86400' } });
}
