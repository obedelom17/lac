'use client';
import { useState } from 'react';
import { useApp } from './Providers';
import { verseOfDay } from '@/lib/verses';

export default function Verse() {
  const { lang, t } = useApp();
  const [copied, setCopied] = useState(false);
  const v = verseOfDay();
  const text = `« ${lang === 'en' ? v.en : v.fr} » — ${v.ref}`;
  const url = typeof window !== 'undefined' ? location.origin : '';
  const ig = async () => { try { await navigator.clipboard.writeText(text + ' ' + url); setCopied(true); } catch {} window.open('https://www.instagram.com/', '_blank'); };
  return (
    <div className="verse">
      <p className="mute" style={{ fontWeight: 600 }}>{t('Verset du jour', 'Verse of the day')}</p>
      <blockquote>{lang === 'en' ? v.en : v.fr}</blockquote>
      <p style={{ marginTop: '.6rem', fontWeight: 600 }}>{v.ref}</p>
      <div className="share">
        <a className="btn sm ghost" target="_blank" rel="noreferrer" href={'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url)}>WhatsApp</a>
        <a className="btn sm ghost" target="_blank" rel="noreferrer" href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text)}>Facebook</a>
        <button className="btn sm ghost" onClick={ig}>{copied ? t('Copié, collez dans Instagram', 'Copied, paste in Instagram') : 'Instagram'}</button>
      </div>
    </div>
  );
}
