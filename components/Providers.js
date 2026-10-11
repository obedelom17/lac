'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SET_DEFAULTS } from '@/lib/resources';

const Ctx = createContext(null);
const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
export const useApp = () => useContext(Ctx);

export function useData(res) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let off = false;
    fetch('/api/public/' + res).then((r) => r.json()).then((j) => !off && setD(Array.isArray(j) ? j : [])).catch(() => !off && setD([]));
    return () => { off = true; };
  }, [res]);
  return d;
}

export async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, ...j };
}

export default function Providers({ children }) {
  const [lang, setLangS] = useState('fr');
  const [theme, setThemeS] = useState('light');
  const [S, setS] = useState(SET_DEFAULTS);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [installEv, setInstallEv] = useState(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [notif, setNotif] = useState('none');
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const h = (e) => { e.preventDefault(); setInstallEv(e); };
    const done = () => { setInstallEv(null); setStandalone(true); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', done);
    setStandalone(matchMedia('(display-mode: standalone)').matches || !!navigator.standalone);
    setIos(/iphone|ipad/i.test(navigator.userAgent));
    if ('Notification' in window) setNotif(Notification.permission);
    return () => { window.removeEventListener('beforeinstallprompt', h); window.removeEventListener('appinstalled', done); };
  }, []);
  const install = async () => { if (!installEv) return; installEv.prompt(); await installEv.userChoice; setInstallEv(null); };
  const enableNotif = async () => {
    try {
      const perm = await Notification.requestPermission();
      setNotif(perm);
      if (perm !== 'granted' || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) }));
      await post('/api/push', sub.toJSON());
    } catch {}
  };

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    setLangS(saved || ((navigator.language || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr'));
    setThemeS(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    try { setCart(JSON.parse(localStorage.getItem('cart') || '[]')); } catch {}
    fetch('/api/public/settings').then((r) => r.json()).then((j) => !j.error && setS(j)).catch(() => {});
    post('/api/auth', { action: 'me' }).then((j) => setUser(j.user || null)).catch(() => {});
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = lang; localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const t = useCallback((fr, en) => (lang === 'en' && en != null ? en : fr), [lang]);
  const tr = useCallback((o, k) => (o ? (lang === 'en' && o[k + '_en'] ? o[k + '_en'] : o[k]) : ''), [lang]);
  const s = useCallback((k) => (lang === 'en' && S[k + '_en'] ? S[k + '_en'] : S[k] || ''), [lang, S]);
  const add = (b) => { setCart((c) => (c.find((x) => x.id === b.id) ? c.map((x) => (x.id === b.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id: b.id, title: b.title, title_en: b.title_en, price: b.price, qty: 1 }])); setCartOpen(true); };
  const setQty = (id, qty) => setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)).filter((x) => x.qty > 0));

  return (
    <Ctx.Provider value={{ lang, setLang: setLangS, theme, toggleTheme: () => setThemeS(theme === 'dark' ? 'light' : 'dark'), S, s, t, tr, cart, add, setQty, clearCart: () => setCart([]), cartOpen, setCartOpen, user, setUser, installEv, install, standalone, ios, notif, enableNotif }}>
      {children}
    </Ctx.Provider>
  );
}
