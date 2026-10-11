'use client';
import { useApp } from './Providers';

export const fmtPrice = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
export function Page({ title, sub, children }) {
  return (
    <>
      <div className="wrap pg"><h1>{title}</h1>{sub && <p className="lead mute" style={{ marginTop: '.8rem' }}>{sub}</p>}</div>
      <div className="wrap" style={{ paddingBottom: 90 }}>{children}</div>
    </>
  );
}
export function Empty({ children }) { return <p className="mute" style={{ padding: '1.5rem 0' }}>{children}</p>; }
export function Load() { const { t } = useApp(); return <p className="mute">{t('Chargement…', 'Loading…')}</p>; }
export const Msg = ({ m }) => (m ? <div className={'msg' + (m.err ? ' err' : '')} role="status">{m.text}</div> : null);
export const Img = ({ src, alt = '', ...p }) => (src ? <img src={src} alt={alt} loading="lazy" {...p} /> : <div className="ph" {...p} />);
export const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
