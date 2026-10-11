'use client';
import { useState } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty, Img, fmtPrice, Load } from '@/components/ui';

export default function Shop() {
  const { t, tr, add } = useApp();
  const books = useData('books');
  const [k, setK] = useState('all');
  const kinds = [...new Set((books || []).map((b) => b.kind).filter(Boolean))];
  const list = (books || []).filter((b) => k === 'all' || b.kind === k);
  return (
    <Page title={t('Boutique de l\'église', 'Church shop')} sub={t('Livres et articles vendus à l\'église, à commander ici.', 'Books and items sold at church, order them here.')}>
      {kinds.length > 0 && <div className="tabs"><button className={'tab' + (k === 'all' ? ' on' : '')} onClick={() => setK('all')}>{t('Tout', 'All')}</button>{kinds.map((x) => <button key={x} className={'tab' + (k === x ? ' on' : '')} onClick={() => setK(x)}>{x}</button>)}</div>}
      {!books && <Load />}
      {books && !list.length && <Empty>{t('Aucun article pour le moment.', 'Nothing for sale yet.')}</Empty>}
      <div className="grid g4">
        {list.map((b) => (
          <article className="card prod rv" key={b.id}>
            <Img src={b.image} alt={tr(b, 'title')} />
            <h3 style={{ margin: '.9rem 0 .2rem', fontSize: '1.15rem' }}>{tr(b, 'title')}</h3>
            {b.author && <div className="mute" style={{ fontSize: '.92rem' }}>{b.author}</div>}
            {tr(b, 'description') && <p style={{ fontSize: '.95rem', margin: '.4rem 0' }}>{tr(b, 'description')}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.8rem' }}><span className="price">{fmtPrice(b.price)}</span><button className="btn sm" onClick={() => add(b)}>{t('Ajouter', 'Add')}</button></div>
          </article>
        ))}
      </div>
    </Page>
  );
}
