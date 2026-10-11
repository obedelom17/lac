'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp, post } from '@/components/Providers';
import { Page } from '@/components/ui';

export default function Assistant() {
  const { t, lang, S } = useApp();
  const [msgs, setMsgs] = useState([]);
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  async function send(text) {
    const q = (text ?? v).trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', content: q }];
    setMsgs(next); setV(''); setBusy(true);
    const r = await post('/api/chat', { messages: next, lang });
    setBusy(false);
    setMsgs([...next, { role: 'assistant', content: r.reply || t('Je ne peux pas répondre pour l\'instant. Réessayez dans un moment.', 'I cannot answer right now. Please try again shortly.') }]);
  }
  const ideas = [t('Pourquoi les boucles d\'oreilles sont interdites dans notre église ?', 'Why are earrings prohibited in our church?'), t('Qu\'est-ce que la nouvelle naissance ?', 'What is the new birth?'), t('Comment prier quand on est découragé ?', 'How do I pray when discouraged?'), t('Pourquoi l\'ajout de cheveux sur les cheveux naturels est interdit dans notre église ?', 'Why are hair extensions on natural hair prohibited in our church?')];
  return (
    <Page title={S.ai_name || 'LumièreAI'} sub={t('Posez vos questions sur la Bible et les enseignements de l\'église. Pour un accompagnement personnel, rencontrez un pasteur.', 'Ask about the Bible and the church\'s teaching. For personal guidance, meet a pastor.')}>
      <div className="card chat" style={{ padding: 0, maxWidth: 780 }}>
        <div className="log">
          {!msgs.length && <><p className="mute">{t('Par où voulez-vous commencer ?', 'Where would you like to start?')}</p><div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{ideas.map((i) => <button key={i} className="tab" onClick={() => send(i)}>{i}</button>)}</div></>}
          {msgs.map((m, i) => <div key={i} className={'b ' + (m.role === 'user' ? 'u' : 'a')}>{m.content}</div>)}
          {busy && <div className="b a dots"><i /><i /><i /></div>}
          <div ref={end} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder={t('Votre question…', 'Your question…')} maxLength={500} aria-label={t('Votre question', 'Your question')} />
          <button className="btn" disabled={busy}>{t('Envoyer', 'Send')}</button>
        </form>
      </div>
    </Page>
  );
}
