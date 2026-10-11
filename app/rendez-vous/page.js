'use client';
import { useState } from 'react';
import { useApp, useData, post } from '@/components/Providers';
import { Page, Msg, initials } from '@/components/ui';

export default function Appointment() {
  const { t, tr } = useApp();
  const pastors = useData('pastors');
  const init = { pastor_id: '', name: '', phone: '', email: '', wanted_at: '', note: '' };
  const [f, setF] = useState(init);
  const [m, setM] = useState(null);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function send(e) {
    e.preventDefault();
    const r = await post('/api/submit/appointments', f);
    if (r.ok) { setF(init); setM({ text: t('Demande envoyée. Le secrétariat vous rappelle pour confirmer.', 'Request sent. The office will call to confirm.') }); } else setM({ err: 1, text: t('Indiquez votre nom et un téléphone ou un email.', 'Give your name and a phone or email.') });
  }
  return (
    <Page title={t('Rendez-vous pastoral', 'Pastoral appointment')} sub={t('Un entretien ou un accompagnement personnel avec l\'équipe pastorale.', 'A personal conversation or guidance with the pastoral team.')}>
      <div className="grid g2" style={{ marginBottom: '3rem' }}>
        {pastors?.map((p) => (
          <div className="card rv" key={p.id}>
            <div className="person">{p.photo ? <img src={p.photo} alt={p.name} /> : <div className="avatar">{initials(p.name)}</div>}<div><h3>{p.name}</h3><div className="mute">{tr(p, 'role')}</div></div></div>
            {tr(p, 'bio') && <p style={{ margin: '1rem 0' }}>{tr(p, 'bio')}</p>}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.8rem' }}>
              {p.phone && <a className="btn ghost sm" href={'tel:' + p.phone}>{p.phone}</a>}
              {p.whatsapp && <a className="btn ghost sm" href={'https://wa.me/' + p.whatsapp.replace(/\D/g, '')}>WhatsApp</a>}
              {p.email && <a className="btn ghost sm" href={'mailto:' + p.email}>Email</a>}
              <button className="btn sm" onClick={() => { setF({ ...f, pastor_id: p.id }); document.getElementById('rdv').scrollIntoView(); }}>{t('Choisir ce pasteur', 'Pick this pastor')}</button>
            </div>
          </div>
        ))}
      </div>
      <form className="card" id="rdv" onSubmit={send} style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: '1.8rem' }}>{t('Demander un rendez-vous', 'Request an appointment')}</h2>
        <label className="f">{t('Pasteur', 'Pastor')}<select value={f.pastor_id} onChange={on('pastor_id')}><option value="">{t('Peu importe', 'Any')}</option>{pastors?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="f">{t('Votre nom', 'Your name')}<input required value={f.name} onChange={on('name')} /></label>
        <div className="grid g2" style={{ gap: '0 1rem' }}><label className="f">{t('Téléphone', 'Phone')}<input value={f.phone} onChange={on('phone')} /></label><label className="f">Email<input type="email" value={f.email} onChange={on('email')} /></label></div>
        <label className="f">{t('Date et heure souhaitées', 'Preferred date and time')}<input value={f.wanted_at} onChange={on('wanted_at')} placeholder={t('Ex : samedi après-midi', 'E.g. Saturday afternoon')} /></label>
        <label className="f">{t('Sujet (facultatif)', 'Topic (optional)')}<textarea value={f.note} onChange={on('note')} /></label>
        <button className="btn" style={{ marginTop: '1rem' }}>{t('Envoyer la demande', 'Send request')}</button>
        <Msg m={m} />
      </form>
    </Page>
  );
}
