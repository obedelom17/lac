import crypto from 'crypto';
const secret = () => process.env.SECRET || process.env.ADMIN_PASSWORD || 'dev-secret';
const sig = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex').slice(0, 32);
export const sign = (v) => `${v}.${sig(String(v))}`;
export function unsign(s) {
  if (!s) return null;
  const i = s.lastIndexOf('.');
  const v = s.slice(0, i);
  return s.slice(i + 1) === sig(v) ? v : null;
}
export const isAdmin = (req) => unsign(req.cookies.get('adm')?.value) === 'admin';
export const userId = (req) => { const v = unsign(req.cookies.get('usr')?.value); return v ? Number(v) : null; };
export const hash = (p) => { const s = crypto.randomBytes(8).toString('hex'); return s + ':' + crypto.scryptSync(p, s, 32).toString('hex'); };
export const check = (p, h) => { const [s, k] = (h || '').split(':'); return !!k && crypto.timingSafeEqual(Buffer.from(k, 'hex'), crypto.scryptSync(p, s, 32)); };
export const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 };
