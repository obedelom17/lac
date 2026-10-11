'use client';
import { useState } from 'react';
import { useApp } from './Providers';

// Boutons toujours accessibles (pied de page et menu) pour installer l'application / activer les notifications
export default function InstallActions() {
  const { t, installEv, install, standalone, ios, notif, enableNotif } = useApp();
  const [hint, setHint] = useState(false);
  if (standalone && notif !== 'default') return null;
  return (
    <div className="inst">
      {!standalone && <button className="btn sm ghost lt" onClick={() => (installEv ? install() : setHint(!hint))}>{t('Installer l\'application', 'Install the app')}</button>}
      {notif === 'default' && <button className="btn sm ghost lt" onClick={enableNotif}>{t('Activer les notifications', 'Enable notifications')}</button>}
      {hint && <p className="hint">{ios ? t('Touchez Partager, puis « Sur l\'écran d\'accueil ».', 'Tap Share, then "Add to Home Screen".') : t('Ouvrez le menu du navigateur (⋮), puis « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».', 'Open the browser menu (⋮), then "Install app" or "Add to Home Screen".')}</p>}
    </div>
  );
}
