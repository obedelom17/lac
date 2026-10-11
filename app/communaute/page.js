'use client';
import { useState } from 'react';
import { useApp, useData, post } from '@/components/Providers';
import { Page, Empty, Msg } from '@/components/ui';

function useForm(url, init, okText) {
  const { t } = useApp();
  const [f, setF] = useState(init);
  const [m, setM] = useState(null);
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    const r = await post(url, f);
    setBusy(false);
    if (r.ok) { setF(init); setM({ text: okText }); } else setM({ err: 1, text: r.status === 401 ? t('Connectez-vous d\'abord.', 'Please sign in first.') : t('Échec de l\'envoi.', 'Could not send.') });
  }
  return { f, on, send, m, busy };
}

function Feed({ res, render }) {
  const { t, lang } = useApp();
  const d = useData(res);
  if (!d) return null;
  if (!d.length) return <Empty>{t('Rien à afficher pour le moment.', 'Nothing to show yet.')}</Empty>;
  return <div className="stack">{d.map((x) => <div className="card flat rv" key={x.id}>{render(x)}<div className="mute" style={{ fontSize: '.85rem', marginTop: '.6rem' }}>{new Date(x.created_at).toLocaleDateString(lang, { dateStyle: 'medium' })}</div></div>)}</div>;
}

function Prayer() {
  const { t } = useApp();
  const F = useForm('/api/submit/prayers', { name: '', message: '', contact: '', anonymous: false }, t('Requête reçue. Elle sera publiée après relecture.', 'Request received. It will appear after review.'));
  return (
    <div className="two">
      <form className="card" onSubmit={F.send}>
        <h3>{t('Besoin de prière ?', 'Need prayer?')}</h3>
        <label className="f">{t('Votre prénom', 'First name')}<input value={F.f.name} onChange={F.on('name')} /></label>
        <label className="f">{t('Votre requête', 'Your request')}<textarea required value={F.f.message} onChange={F.on('message')} /></label>
        <label className="f">{t('Contact (visible par les pasteurs seulement)', 'Contact (pastors only)')}<input value={F.f.contact} onChange={F.on('contact')} placeholder={t('Téléphone ou email, facultatif', 'Phone or email, optional')} /></label>
        <label className="f"><input type="checkbox" checked={F.f.anonymous} onChange={F.on('anonymous')} />{t('Publier sans mon prénom', 'Post without my name')}</label>
        <button className="btn" style={{ marginTop: '1rem' }} disabled={F.busy}>{t('Envoyer', 'Send')}</button>
        <Msg m={F.m} />
      </form>
      <Feed res="prayers" render={(x) => <><p>{x.message}</p><b>{x.anonymous ? t('Anonyme', 'Anonymous') : x.name || t('Anonyme', 'Anonymous')}</b></>} />
    </div>
  );
}

function Auth() {
  const { t, user, setUser } = useApp();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [m, setM] = useState(null);
  async function go(e) {
    e.preventDefault();
    const r = await post('/api/auth', { action: mode, ...f });
    if (r.user) setUser(r.user); else setM({ err: 1, text: r.error === 'exists' ? t('Cet email est déjà inscrit.', 'This email is already registered.') : r.error === 'bad' ? t('Email ou mot de passe incorrect.', 'Wrong email or password.') : t('Mot de passe : 6 caractères minimum.', 'Password: 6 characters minimum.') });
  }
  if (user) return <p className="mute">{t('Connecté :', 'Signed in:')} <b>{user.name}</b> <button className="btn ghost sm" onClick={async () => { await post('/api/auth', { action: 'logout' }); setUser(null); }}>{t('Se déconnecter', 'Sign out')}</button></p>;
  return (
    <form className="card" onSubmit={go}>
      <div className="tabs"><button type="button" className={'tab' + (mode === 'login' ? ' on' : '')} onClick={() => setMode('login')}>{t('Connexion', 'Sign in')}</button><button type="button" className={'tab' + (mode === 'register' ? ' on' : '')} onClick={() => setMode('register')}>{t('Inscription', 'Sign up')}</button></div>
      {mode === 'register' && <label className="f">{t('Nom', 'Name')}<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>}
      <label className="f">Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="f">{t('Mot de passe', 'Password')}<input type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <button className="btn" style={{ marginTop: '1rem' }}>{mode === 'login' ? t('Se connecter', 'Sign in') : t('Créer mon compte', 'Create account')}</button>
      <Msg m={m} />
    </form>
  );
}

function Testimonies() {
  const { t, user } = useApp();
  const F = useForm('/api/submit/testimonies', { title: '', body: '' }, t('Merci. Votre témoignage sera publié après relecture.', 'Thank you. Your testimony will appear after review.'));
  return (
    <div className="two">
      <div className="stack">
        <p className="mute">{t('Inscrivez-vous pour partager ce que Dieu a fait dans votre vie.', 'Sign up to share what God has done in your life.')}</p>
        <Auth />
        {user && (
          <form className="card" onSubmit={F.send}>
            <label className="f">{t('Titre', 'Title')}<input value={F.f.title} onChange={F.on('title')} /></label>
            <label className="f">{t('Votre témoignage', 'Your testimony')}<textarea required value={F.f.body} onChange={F.on('body')} style={{ minHeight: 160 }} /></label>
            <button className="btn" style={{ marginTop: '1rem' }} disabled={F.busy}>{t('Partager', 'Share')}</button>
            <Msg m={F.m} />
          </form>
        )}
      </div>
      <Feed res="testimonies" render={(x) => <>{x.title && <h3 style={{ marginBottom: '.4rem' }}>{x.title}</h3>}<p style={{ whiteSpace: 'pre-line' }}>{x.body}</p><b>{x.name}</b></>} />
    </div>
  );
}

function Ideas() {
  const { t } = useApp();
  const F = useForm('/api/submit/suggestions', { name: '', message: '' }, t('Merci pour votre idée. Elle sera visible après relecture.', 'Thanks for your idea. It will be visible after review.'));
  return (
    <div className="two">
      <form className="card" onSubmit={F.send}>
        <h3>{t('Une idée pour mieux servir ?', 'An idea to serve better?')}</h3>
        <label className="f">{t('Votre prénom (facultatif)', 'First name (optional)')}<input value={F.f.name} onChange={F.on('name')} /></label>
        <label className="f">{t('Votre proposition', 'Your suggestion')}<textarea required value={F.f.message} onChange={F.on('message')} /></label>
        <button className="btn" style={{ marginTop: '1rem' }} disabled={F.busy}>{t('Proposer', 'Submit')}</button>
        <Msg m={F.m} />
      </form>
      <Feed res="suggestions" render={(x) => <><p>{x.message}</p><b>{x.name || t('Anonyme', 'Anonymous')}</b></>} />
    </div>
  );
}

export default function Community() {
  const { t } = useApp();
  const [tab, setTab] = useState('prayer');
  const T = [['prayer', t('Requêtes de prière', 'Prayer requests')], ['testi', t('Témoignages', 'Testimonies')], ['ideas', t('Suggestions', 'Suggestions')]];
  return (
    <Page title={t('Communauté', 'Community')} sub={t('Prier les uns pour les autres, s\'encourager, construire ensemble.', 'Pray for one another, encourage, build together.')}>
      <div className="tabs">{T.map(([k, l]) => <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'prayer' ? <Prayer /> : tab === 'testi' ? <Testimonies /> : <Ideas />}
    </Page>
  );
}
