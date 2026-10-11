'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp, post } from './Providers';

const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };

// Apparition au défilement + service worker + invite d'installation / notifications
export default function Extras() {
  const { t } = useApp();
  const path = usePathname();
  const [ev, setEv] = useState(null);
  const [ios, setIos] = useState(false);
  const [done, setDone] = useState(false);
  const [notif, setNotif] = useState('default');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    const scan = () => document.querySelectorAll('.rv:not(.in)').forEach((n) => io.observe(n));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const h = (e) => { e.preventDefault(); setEv(e); };
    window.addEventListener('beforeinstallprompt', h);
    setIos(/iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone);
    if ('Notification' in window) setNotif(Notification.permission);
    setDone(!!localStorage.getItem('pwa-dismiss'));
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  async function subscribe() {
    try {
      const perm = await Notification.requestPermission();
      setNotif(perm);
      if (perm !== 'granted' || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) }));
      await post('/api/push', sub.toJSON());
    } catch {}
  }
  const hide = () => { localStorage.setItem('pwa-dismiss', '1'); setDone(true); };
  if (!mounted || done) return null;
  const canNotif = 'Notification' in (typeof window === 'undefined' ? {} : window) && notif === 'default';
  if (!ev && !ios && !canNotif) return null;
  return (
    <div className="install" role="dialog">
      <span>{ios ? t('Pour installer : Partager, puis « Sur l\'écran d\'accueil ».', 'To install: Share, then "Add to Home Screen".') : t('Installez le site et recevez les rappels de culte.', 'Install the site and get service reminders.')}</span>
      {ev && <button className="btn sm" onClick={async () => { ev.prompt(); await ev.userChoice; setEv(null); subscribe(); }}>{t('Installer', 'Install')}</button>}
      {!ev && canNotif && <button className="btn sm" onClick={subscribe}>{t('Notifications', 'Notifications')}</button>}
      <button className="ic" style={{ background: 'transparent', color: '#fff', border: 0 }} onClick={hide} aria-label="Fermer">×</button>
    </div>
  );
}
