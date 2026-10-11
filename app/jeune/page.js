'use client';
import { useState, useEffect } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty } from '@/components/ui';

export default function Fast() {
  const { t, tr, s, S } = useApp();
  const days = useData('fasting_days');
  const start = S.fast_start ? new Date(S.fast_start + 'T00:00') : null;
  const idx = start ? Math.floor((new Date() - start) / 864e5) + 1 : 0;
  const total = days?.length || 21;
  const [sel, setSel] = useState(null);
  useEffect(() => { if (days?.length && sel === null) setSel(idx >= 1 && idx <= total ? idx : 1); }, [days, idx, total, sel]);
  const cur = days?.find((d) => d.day_no === sel);
  const pct = idx < 1 ? 0 : Math.min(100, (idx / total) * 100);
  return (
    <Page title={s('fast_title')} sub={start ? (idx < 1 ? t('Le programme commence bientôt.', 'The program starts soon.') : idx > total ? t('Programme terminé. Merci pour votre persévérance.', 'Program complete. Thank you for persevering.') : t(`Jour ${idx} sur ${total}`, `Day ${idx} of ${total}`)) : t('Un sujet de prière par jour.', 'One prayer topic each day.')}>
      {start && <div className="bar-p" style={{ marginBottom: '2rem' }}><i style={{ width: pct + '%' }} /></div>}
      {days && !days.length && <Empty>{t('Le programme sera publié ici.', 'The program will be posted here.')}</Empty>}
      <div className="days" style={{ marginBottom: '2rem' }}>{days?.map((d) => <button key={d.id} className={(sel === d.day_no ? 'on ' : '') + (d.day_no === idx ? 'today' : '')} onClick={() => setSel(d.day_no)}>{d.day_no}</button>)}</div>
      {cur && (
        <div className="card" style={{ maxWidth: 720 }} key={cur.id}>
          <span className={'pill' + (cur.day_no === idx ? ' red' : '')}>{t('Jour', 'Day')} {cur.day_no}{cur.day_no === idx ? ' · ' + t('aujourd\'hui', 'today') : ''}</span>
          <h2 style={{ margin: '.8rem 0' }}>{tr(cur, 'title')}</h2>
          <p className="lead" style={{ whiteSpace: 'pre-line' }}>{tr(cur, 'subject')}</p>
          {cur.scripture && <p className="verse" style={{ marginTop: '1.2rem', fontWeight: 600 }}>{cur.scripture}</p>}
        </div>
      )}
    </Page>
  );
}
