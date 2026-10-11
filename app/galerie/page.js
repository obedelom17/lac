'use client';
import { useState } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty, Img } from '@/components/ui';

export default function Gallery() {
  const { t, tr } = useApp();
  const albums = useData('albums');
  const [open, setOpen] = useState(null);
  const [lb, setLb] = useState(null);
  const imgs = open ? (open.images || '').split('\n').map((x) => x.trim()).filter(Boolean) : [];
  const step = (n) => setLb((lb + n + imgs.length) % imgs.length);
  return (
    <Page title={t('Galerie', 'Gallery')} sub={t('Retraites, concerts, mariages, baptêmes, actions sociales.', 'Retreats, concerts, weddings, baptisms, outreach.')}>
      {open ? (
        <>
          <button className="btn ghost sm" onClick={() => setOpen(null)}>← {t('Albums', 'Albums')}</button>
          <h2 style={{ margin: '1rem 0 1.4rem' }}>{tr(open, 'title')}</h2>
          <div className="mas">{imgs.map((u, i) => <img key={i} src={u} alt="" loading="lazy" onClick={() => setLb(i)} />)}</div>
        </>
      ) : (
        <>
          {albums && !albums.length && <Empty>{t('Les albums arrivent bientôt.', 'Albums coming soon.')}</Empty>}
          <div className="grid g3">{albums?.map((a) => (
            <button className="alb rv" key={a.id} onClick={() => setOpen(a)}><Img src={a.cover || (a.images || '').split('\n')[0]} alt="" /><span>{tr(a, 'title')}<small style={{ display: 'block', fontFamily: 'var(--f-body)', opacity: .8 }}>{a.category}</small></span></button>
          ))}</div>
        </>
      )}
      {lb !== null && (
        <div className="lb" onClick={() => setLb(null)} role="dialog">
          <img src={imgs[lb]} alt="" onClick={(e) => e.stopPropagation()} />
          <button style={{ top: 16, right: 16 }} onClick={() => setLb(null)} aria-label="Fermer">×</button>
          <button style={{ left: 16 }} onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Précédent">‹</button>
          <button style={{ right: 16 }} onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Suivant">›</button>
        </div>
      )}
    </Page>
  );
}
