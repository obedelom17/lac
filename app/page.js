'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useApp, useData } from '@/components/Providers';
import { Img, initials, fmtPrice } from '@/components/ui';
import Verse from '@/components/Verse';

function Hero() {
  const { s, t, S, tr, lang } = useApp();
  const ev = useData('events');
  const sv = useData('services');
  const [paused, setPaused] = useState(false);
  const [i, setI] = useState(0);
  const vid = useRef(null);
  const w = (s('hero_title') || '').split(' ');
  const k = Math.ceil(w.length / 3);
  const title = [w.slice(0, k).join(' '), w.slice(k, 2 * k).join(' '), w.slice(2 * k).join(' ')].filter(Boolean);
  const now = new Date().toISOString().slice(0, 10);
  const cards = (ev || []).filter((e) => (e.starts_at || '') >= now).slice(0, 3).map((e) => ({ k: 'e' + e.id, tag: e.category || t('Événement', 'Event'), date: new Date(e.starts_at).toLocaleDateString(lang, { day: 'numeric', month: 'short' }), title: tr(e, 'title'), text: tr(e, 'description') || e.location, href: '/evenements' }));
  if (!cards.length && sv?.length) cards.push({ k: 's', tag: t('Culte', 'Service'), date: `${sv[0].day} · ${sv[0].time}`, title: tr(sv[0], 'label'), text: S.address, href: '#suite' });
  const n = cards.length;
  const c = cards[n ? i % n : 0];
  useEffect(() => { if (paused || n < 2) return; const id = setInterval(() => setI((x) => x + 1), 6000); return () => clearInterval(id); }, [paused, n]);
  useEffect(() => { if (vid.current) { if (paused) vid.current.pause(); else vid.current.play().catch(() => {}); } }, [paused]);
  return (
    <section className={'hero' + (paused ? ' paused' : '')}>
      {S.hero_video ? <video ref={vid} className="hmedia" src={S.hero_video} poster={S.hero_image || undefined} autoPlay muted loop playsInline /> : S.hero_image ? <img className="hmedia kb" src={S.hero_image} alt="" /> : null}
      <div className="hshade" />
      <div className="embers" aria-hidden="true">{[...Array(16)].map((_, j) => <i key={j} style={{ '--x': ((j * 37 + 11) % 100) + '%', '--s': (3 + (j % 4)) + 'px', '--d': (9 + (j % 6) * 2) + 's', '--l': -((j * 1.7) % 12) + 's', '--dx': ((j % 5) - 2) * 40 + 'px' }} />)}</div>
      <div className="wrap hero-in">
        <h1>{title.map((l, j) => <span key={j}><i>{l}</i></span>)}</h1>
        <p className="lead">{s('hero_sub')}</p>
        <div className="acts">
          <Link className="btn" href="/live"><span className="live-dot" style={{ background: '#fff' }} />{t('Suivre le culte', 'Watch the service')}</Link>
          <a className="btn ghost lt" href="#nouveau">{t('Première visite ?', 'First visit?')}</a>
        </div>
      </div>
      {c && (
        <Link href={c.href} className="hcard" key={c.k}>
          <div className="top2"><span className="tag">{c.tag}</span><span className="dt"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>{c.date}</span></div>
          <b>{c.title}</b>
          {c.text && <p>{c.text}</p>}
          <span className="more">{t('Découvrir', 'Discover')} ›</span>
          {n > 1 && <span className="dots2">{cards.map((x, j) => <i key={x.k} className={j === i % n ? 'on' : ''} />)}</span>}
        </Link>
      )}
      <button className="pause" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶ ' + t('Lecture', 'Play') : '❚❚ ' + t('Pause', 'Pause')}</button>
      <a className="down" href="#suite" aria-label={t('Défiler', 'Scroll down')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6" /></svg></a>
    </section>
  );
}

function Ticker() {
  const { tr, t } = useApp();
  const r = useData('reminders');
  if (!r?.length) return null;
  const items = (p) => r.map((x) => <span key={p + x.id}><b>{tr(x, 'title')}</b> {tr(x, 'body')} {x.amount && `· ${x.amount}`} {x.due_date && `· ${x.due_date}`}</span>);
  return <div className="ticker" aria-label={t('Rappels', 'Reminders')}><div>{items('a')}{items('b')}</div></div>;
}

function Services() {
  const { tr, t } = useApp();
  const d = useData('services');
  return (
    <div className="card rv">
      <h2 style={{ fontSize: '1.9rem', marginBottom: '.6rem' }}>{t('Nos rencontres', 'Our gatherings')}</h2>
      {d?.map((x) => (
        <div className="sched" key={x.id}><b>{x.time}</b><div><div style={{ fontWeight: 600 }}>{tr(x, 'label')}</div>{x.note && <small className="mute">{x.note}</small>}</div><span className="pill">{x.day}</span></div>
      ))}
    </div>
  );
}

function Welcome() {
  const { s, t } = useApp();
  const p = useData('pastors');
  const first = p?.[0];
  return (
    <section className="sec"><div className="wrap two">
      <div className="rv"><h2>{t('Un mot de bienvenue', 'A word of welcome')}</h2></div>
      <div className="stack rv">
        <p className="lead">{s('welcome_text')}</p>
        <div className="person">{first?.photo ? <img src={first.photo} alt={first.name} /> : <div className="avatar">{initials(s('welcome_pastor'))}</div>}<div><b>{first?.name || s('welcome_pastor')}</b><div className="mute">{first ? '' : t('Pasteur de l\'assemblée', 'Pastor')}</div></div></div>
      </div>
    </div></section>
  );
}

function About() {
  const { s, t } = useApp();
  return (
    <section className="sec alt" id="propos"><div className="wrap">
      <h2 className="rv" style={{ marginBottom: '2rem' }}>{t('Qui sommes-nous', 'About us')}</h2>
      <div className="grid g3">
        {[[t('Notre vision', 'Our vision'), 'about_vision'], [t('Ce que nous croyons', 'What we believe'), 'about_faith'], [t('Nos valeurs', 'Our values'), 'about_values']].map(([h, k]) => (
          <div className="card rv flat" key={k}><h3 style={{ marginBottom: '.7rem' }}>{h}</h3><p>{s(k)}</p></div>
        ))}
      </div>
    </div></section>
  );
}

function NewHere() {
  const { s, t } = useApp();
  return (
    <section className="sec" id="nouveau"><div className="wrap">
      <div className="rv" style={{ marginBottom: '2rem' }}><h2>{t('Nouveau parmi nous ?', 'New here?')}</h2><p className="lead mute" style={{ marginTop: '.7rem' }}>{t('Voici à quoi vous attendre, sans surprise.', 'Here is what to expect, no surprises.')}</p></div>
      <div className="grid g3">
        {[[t('Le déroulement du culte', 'What a service is like'), 'new_flow'], [t('Vos enfants', 'Your children'), 'new_kids'], [t('Les jeunes', 'Young people'), 'new_youth']].map(([h, k]) => (
          <div className="card link rv" key={k}><h3 style={{ marginBottom: '.7rem' }}>{h}</h3><p>{s(k)}</p></div>
        ))}
      </div>
    </div></section>
  );
}

function Location() {
  const { s, t, S } = useApp();
  const qy = encodeURIComponent(S.maps_query || S.address || 'Lomé, Togo');
  return (
    <section className="sec alt" id="localisation"><div className="wrap two">
      <div className="stack rv">
        <h2>{t('Où nous trouver', 'Find us')}</h2>
        <p className="lead">{s('address')}</p>
        <p style={{ whiteSpace: 'pre-line' }}>{s('access')}</p>
        <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${qy}`}>{t('Obtenir l\'itinéraire', 'Get directions')}</a>
      </div>
      <iframe className="map rv" title="Plan" loading="lazy" src={`https://maps.google.com/maps?q=${qy}&z=15&output=embed`} />
    </div></section>
  );
}

function Upcoming() {
  const { tr, t, lang } = useApp();
  const d = useData('events');
  const now = new Date().toISOString().slice(0, 10);
  const list = (d || []).filter((e) => (e.starts_at || '') >= now).slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="sec"><div className="wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.2rem' }} className="rv"><h2>{t('À venir', 'Coming up')}</h2><Link href="/evenements" className="btn ghost sm">{t('Tout le calendrier', 'Full calendar')}</Link></div>
      <div className="card rv">{list.map((e) => { const dt = new Date(e.starts_at); return (
        <div className="ev" key={e.id}><div className="date"><b>{dt.getDate()}</b>{dt.toLocaleDateString(lang, { month: 'short' })}</div><div><b>{tr(e, 'title')}</b><div className="mute">{e.category} {e.location && `· ${e.location}`}</div></div></div>); })}</div>
    </div></section>
  );
}

export default function Home() {
  const { t } = useApp();
  const shop = useData('books');
  return (
    <>
      <Hero />
      <Ticker />
      <section className="sec" id="suite"><div className="wrap two"><Services /><div className="rv"><Verse /></div></div></section>
      <Welcome />
      <About />
      <NewHere />
      <Location />
      <Upcoming />
      {shop?.length > 0 && (
        <section className="sec alt"><div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.2rem' }} className="rv"><h2>{t('À la librairie', 'From the bookstore')}</h2><Link href="/boutique" className="btn ghost sm">{t('Voir la boutique', 'Open shop')}</Link></div>
          <ShopRow list={shop.slice(0, 4)} />
        </div></section>
      )}
    </>
  );
}

function ShopRow({ list }) {
  const { tr } = useApp();
  return <div className="grid g4">{list.map((b) => <Link href="/boutique" key={b.id} className="card link prod rv" style={{ textDecoration: 'none' }}><Img src={b.image} alt={tr(b, 'title')} /><h3 style={{ margin: '.8rem 0 .2rem', fontSize: '1.1rem' }}>{tr(b, 'title')}</h3><span className="price">{fmtPrice(b.price)}</span></Link>)}</div>;
}
