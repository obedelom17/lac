'use client';
import { useState, useEffect } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Page, Empty } from '@/components/ui';

export default function Live() {
  const { t, tr, S } = useApp();
  const pods = useData('podcasts');
  const lives = useData('lives');
  const old = (S.live_channels || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[1] && x[1] !== 'IDENTIFIANT_CHAINE_YOUTUBE').map((x) => ({ id: 'o' + x[1], name: x[0], url: 'https://www.youtube.com/channel/' + x[1] }));
  const sources = lives?.length ? lives : lives ? [...old, ...(S.live_facebook ? [{ id: 'fb', name: 'Facebook', url: S.live_facebook }] : [])] : [];
  const [i, setI] = useState(0);
  const [embed, setEmbed] = useState(null);
  const cur = sources[i];
  useEffect(() => {
    setEmbed(null);
    if (!cur) return;
    if (/facebook\.com|fb\.watch/.test(cur.url)) { setEmbed(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cur.url)}&show_text=false`); return; }
    let off = false;
    fetch('/api/live-resolve?u=' + encodeURIComponent(cur.url)).then((r) => r.json()).then((j) => !off && setEmbed(j.embed || 'err')).catch(() => !off && setEmbed('err'));
    return () => { off = true; };
  }, [cur?.url]);
  return (
    <Page title={t('Culte en direct', 'Live service')} sub={t('Suivez nos rencontres depuis chez vous.', 'Follow our gatherings from home.')}>
      {sources.length > 1 && <div className="tabs">{sources.map((c, k) => <button key={c.id} className={'tab' + (k === i ? ' on' : '')} onClick={() => setI(k)}>{c.name}</button>)}</div>}
      {embed && embed !== 'err' ? <iframe className="video" title={cur.name} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" src={embed} />
        : <div className="card"><p>{cur && embed === 'err' ? t('Le direct est momentanément indisponible.', 'The live stream is temporarily unavailable.') : cur ? t('Chargement du direct…', 'Loading the live stream…') : t('Aucun direct n\'est programmé pour le moment.', 'No live stream is scheduled at the moment.')}</p></div>}
      {cur && <p className="mute" style={{ marginTop: '.8rem' }}><span className="live-dot" />{t('Si aucun direct n\'est en cours, la vidéo reste en attente jusqu\'au prochain culte.', 'If nothing is live, the player waits until the next service.')}</p>}
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
