'use client';
import Link from 'next/link';
import { useApp } from './Providers';

export default function Footer() {
  const { t, S } = useApp();
  const soc = [['facebook', 'Facebook'], ['youtube', 'YouTube'], ['instagram', 'Instagram']].filter(([k]) => S[k]);
  return (
    <footer className="bot">
      <div className="wrap foot">
        <div><span className="chip big"><img src="/logo.png" alt="" /></span><p style={{ fontWeight: 600, color: '#fff' }}>{S.church_name}</p><p style={{ opacity: .8 }}>{S.address}</p></div>
        <div>
          <h3>{t('Liens', 'Links')}</h3>
          <p><Link href="/rendez-vous">{t('Rencontrer un pasteur', 'Meet a pastor')}</Link></p>
          <p><Link href="/communaute">{t('Prières et témoignages', 'Prayers and testimonies')}</Link></p>
          <p><Link href="/assistant">{S.ai_name || 'LumièreAI'}</Link></p>
          <p><Link href="/admin">{t('Espace administrateur', 'Admin area')}</Link></p>
        </div>
        {(S.phone || S.whatsapp || S.email || soc.length > 0) && (
          <div>
            <h3>{t('Nous joindre', 'Contact')}</h3>
            {S.phone && <p><a href={'tel:' + S.phone}>{S.phone}</a></p>}
            {S.whatsapp && <p><a href={'https://wa.me/' + S.whatsapp.replace(/\D/g, '')}>WhatsApp</a></p>}
            {S.email && <p><a href={'mailto:' + S.email}>{S.email}</a></p>}
            {soc.map(([k, l]) => <p key={k}><a href={S[k]} target="_blank" rel="noreferrer">{l}</a></p>)}
          </div>
        )}
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} {S.church_name}</div>
    </footer>
  );
}
