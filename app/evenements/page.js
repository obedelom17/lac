'use client';
import { useState } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty, Img } from '@/components/ui';

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Events() {
  const { t, tr, lang } = useApp();
  const ev = useData('events');
  const [cur, setCur] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [sel, setSel] = useState(null);
  const today = ymd(new Date());
  const first = (cur.getDay() + 6) % 7;
  const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const by = {};
  (ev || []).forEach((e) => { const k = (e.starts_at || '').slice(0, 10); (by[k] = by[k] || []).push(e); });
  const month = ymd(cur).slice(0, 7);
  const list = sel ? by[sel] || [] : (ev || []).filter((e) => (e.starts_at || '').startsWith(month));
  const wd = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: 'narrow' }));
  const go = (n) => { const d = new Date(cur); d.setMonth(d.getMonth() + n); setCur(d); setSel(null); };
  return (
    <Page title={t('Événements', 'Events')} sub={t('Évangélisation, conférences, prière, baptêmes, concerts, retraites.', 'Evangelism, conferences, prayer, baptisms, concerts, retreats.')}>
      <div className="two">
        <div className="card">
          <div className="cal-h"><button className="ic" onClick={() => go(-1)} aria-label="Précédent">‹</button><b style={{ textTransform: 'capitalize', fontFamily: 'var(--f-head)', fontSize: '1.4rem' }}>{cur.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}</b><button className="ic" onClick={() => go(1)} aria-label="Suivant">›</button></div>
          <div className="cal">
            {wd.map((w, i) => <div className="w" key={i}>{w}</div>)}
            {[...Array(first)].map((_, i) => <div className="d e" key={'e' + i} />)}
            {[...Array(days)].map((_, i) => { const k = `${month}-${String(i + 1).padStart(2, '0')}`; return <button key={k} className={'d' + (by[k] ? ' has' : '') + (sel === k ? ' sel' : '') + (k === today ? ' today' : '')} onClick={() => setSel(sel === k ? null : k)}>{i + 1}</button>; })}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '.6rem' }}>{sel ? new Date(sel + 'T12:00').toLocaleDateString(lang, { dateStyle: 'full' }) : t('Ce mois-ci', 'This month')}</h3>
          {ev && !list.length && <Empty>{t('Aucun événement.', 'No events.')}</Empty>}
          {list.map((e) => { const d = new Date(e.starts_at); return (
            <div className="ev" key={e.id}>
              <div className="date"><b>{d.getDate()}</b>{d.toLocaleDateString(lang, { month: 'short' })}</div>
              <div style={{ flex: 1 }}><b style={{ fontSize: '1.1rem' }}>{tr(e, 'title')}</b>
                <div className="mute">{[e.category, d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }), e.location].filter(Boolean).join(' · ')}</div>
                {tr(e, 'description') && <p style={{ marginTop: '.4rem' }}>{tr(e, 'description')}</p>}</div>
              {e.image && <Img src={e.image} style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover' }} />}
            </div>); })}
        </div>
      </div>
    </Page>
  );
}
