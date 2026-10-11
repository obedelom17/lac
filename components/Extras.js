'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers';

// Apparition au défilement + bannière d'installation (fermable ; les boutons restent dans le menu et le pied de page)
export default function Extras() {
  const { t, installEv, install, standalone, ios, notif, enableNotif } = useApp();
  const path = usePathname();
  const [off, setOff] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    const scan = () => document.querySelectorAll('.rv:not(.in)').forEach((n) => io.observe(n));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  useEffect(() => setOff(!!localStorage.getItem('pwa-dismiss')), []);

  const hide = () => { localStorage.setItem('pwa-dismiss', '1'); setOff(true); };
  const canNotif = notif === 'default';
  if (off || standalone || (!installEv && !ios && !canNotif)) return null;
  return (
    <div className="install" role="dialog">
      <span>{ios && !installEv ? t('Pour installer : Partager, puis « Sur l\'écran d\'accueil ».', 'To install: Share, then "Add to Home Screen".') : t('Installez le site et recevez les rappels de culte.', 'Install the site and get service reminders.')}</span>
      {installEv && <button className="btn sm" onClick={async () => { await install(); enableNotif(); hide(); }}>{t('Installer', 'Install')}</button>}
      {!installEv && canNotif && <button className="btn sm" onClick={() => { enableNotif(); hide(); }}>{t('Notifications', 'Notifications')}</button>}
      <button className="ic" style={{ background: 'transparent', color: '#fff', border: 0 }} onClick={hide} aria-label="Fermer">×</button>
    </div>
  );
}
