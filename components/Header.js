'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useApp } from './Providers';
import InstallActions from './Install';

export default function Header() {
  const { t, lang, setLang, theme, toggleTheme, cart, setCartOpen, S } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);
  const ai = S.ai_name || 'LumièreAI';
  const links = [
    ['/', t('Accueil', 'Home')], ['/live', t('Culte en direct', 'Live service')], ['/evenements', t('Événements', 'Events')], ['/boutique', t('Boutique', 'Shop')],
    ['/communaute', t('Communauté', 'Community')], ['/galerie', t('Galerie', 'Gallery')], ['/jeune', t('Jeûne et prière', 'Fasting and prayer')], ['/rendez-vous', t('Rendez-vous pastoral', 'Pastoral appointment')],
  ];
  const quick = [['/live', t('En direct', 'Live')], ['/evenements', t('Événements', 'Events')], ['/boutique', t('Boutique', 'Shop')], ['/rendez-vous', t('Rendez-vous', 'Appointment')]];
  const count = cart.reduce((a, b) => a + b.qty, 0);
  const spark = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7zM19 16l1 2.6 2.6 1-2.6 1L19 23l-1-2.4-2.6-1 2.6-1z" /></svg>;
  return (
    <>
      <header className="top">
        <div className="bar">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu">
            <span>{open ? t('Fermer', 'Close') : 'Menu'}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M4 7h16M4 12h11M4 17h16" />}</svg>
          </button>
          <Link href="/" className="brand" aria-label="Accueil"><span className="chip"><img src="/logo-mark.png" alt="" /></span><span className="bn">{S.church_name || 'Lumière à la Cité'}</span></Link>
          <nav className="quick" aria-label="Principal">
            {quick.map(([h, l]) => <Link key={h} href={h} className={path === h ? 'on' : ''}>{l}</Link>)}
            <Link href="/assistant" className="ai">{spark}{ai}</Link>
          </nav>
          <div className="tools">
            <button className="ic" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} aria-label="Langue / Language">{lang === 'fr' ? 'EN' : 'FR'}</button>
            <button className="ic" onClick={toggleTheme} aria-label={t('Changer de thème', 'Switch theme')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></> : <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />}</svg>
            </button>
            <button className="ic" onClick={() => setCartOpen(true)} aria-label={t('Panier', 'Cart')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6h15l-2 9H8zM6 6 5 3H2M9 20h.01M18 20h.01" /></svg>
              {count > 0 && <span className="n">{count}</span>}
            </button>
          </div>
        </div>
      </header>
      <div className={'menu' + (open ? ' open' : '')} id="menu" aria-hidden={!open}>
        <div className="wrap menu-in">
          <nav>{links.map(([h, l]) => <Link key={h} href={h} className={path === h ? 'on' : ''} tabIndex={open ? 0 : -1}>{l}</Link>)}</nav>
          <div className="menu-side">
            <Link href="/assistant" className="ai big" tabIndex={open ? 0 : -1}>{spark}<span>{ai}<small>{t('Posez vos questions sur la Bible', 'Ask your Bible questions')}</small></span></Link>
            <p>{S.address}</p>
            {S.phone && <p><a href={'tel:' + S.phone}>{S.phone}</a></p>}
            <InstallActions />
          </div>
        </div>
      </div>
    </>
  );
}
