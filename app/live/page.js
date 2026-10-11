'use client';
import { useState } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty } from '@/components/ui';

export default function Live() {
  const { t, tr, S } = useApp();
  const pods = useData('podcasts');
  const chans = (S.live_channels || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[1] && x[1] !== 'IDENTIFIANT_CHAINE_YOUTUBE');
  const [i, setI] = useState(0);
  const cur = chans[i];
  return (
    <Page title={t('Culte en direct', 'Live service')} sub={t('Suivez nos rencontres depuis chez vous.', 'Follow our gatherings from home.')}>
      {chans.length > 1 && <div className="tabs">{chans.map((c, k) => <button key={k} className={'tab' + (k === i ? ' on' : '')} onClick={() => setI(k)}>{c[0]}</button>)}</div>}
      {cur ? <iframe className="video" title={cur[0]} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" src={`https://www.youtube.com/embed/live_stream?channel=${cur[1]}`} />
        : S.live_facebook ? <iframe className="video" title="Facebook Live" allowFullScreen src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(S.live_facebook)}&show_text=false`} />
        : <div className="card"><p>{t('Aucun direct configuré. Ajoutez une chaîne YouTube dans l\'espace administrateur.', 'No live stream configured. Add a YouTube channel in the admin area.')}</p></div>}
      <p className="mute" style={{ marginTop: '.8rem' }}><span className="live-dot" />{t('Si aucun direct n\'est en cours, la vidéo reste en attente jusqu\'au prochain culte.', 'If nothing is live, the player waits until the next service.')}</p>
      {S.live_facebook && cur && <p style={{ marginTop: '.6rem' }}><a href={S.live_facebook} target="_blank" rel="noreferrer" className="btn ghost sm">Facebook Live</a></p>}
      <h2 style={{ margin: '3.5rem 0 1.2rem' }}>{t('Enseignements audio', 'Audio teachings')}</h2>
      {pods && !pods.length && <Empty>{t('Les enseignements seront publiés ici.', 'Teachings will be published here.')}</Empty>}
      <div className="grid g2">
        {pods?.map((p) => (
          <div className="card flat rv" key={p.id}>
            <b style={{ fontSize: '1.1rem' }}>{tr(p, 'title')}</b>
            <div className="mute">{[p.speaker, p.date].filter(Boolean).join(' · ')}</div>
            <audio controls preload="none" src={p.audio_url} style={{ width: '100%', margin: '.8rem 0' }} />
            <a className="btn ghost sm" href={p.audio_url} download target="_blank" rel="noreferrer">{t('Télécharger le MP3', 'Download MP3')}</a>
          </div>
        ))}
      </div>
    </Page>
  );
}
