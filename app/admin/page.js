'use client';
import { useState, useEffect } from 'react';
import { post } from '@/components/Providers';
import { RES, SET, GROUPS, setMeta } from '@/lib/resources';
import { AD, INBOX, MENU } from '@/lib/adminui';
import { Msg } from '@/components/ui';

const api = async (url, method = 'GET', body) => {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return r.ok ? j : { error: j.error || r.status };
};
const label = (k) => k.replace(/_/g, ' ');

async function compress(file, max = 1280) {
  const bmp = await createImageBitmap(file);
  const sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
async function upload(file) {
  const r = await post('/api/upload', { data: await compress(file) });
  return r.url;
}

function Field({ name, type, value, onChange, options }) {
  const [busy, setBusy] = useState(false);
  const v = value ?? '';
  if (options) return <select value={v} onChange={(e) => onChange(e.target.value)}><option value="">Choisir…</option>{options.map((o) => <option key={o}>{o}</option>)}</select>;
  if (type === 'a') return <textarea value={v} onChange={(e) => onChange(e.target.value)} />;
  if (type === 'n') return <input type="number" value={v} onChange={(e) => onChange(e.target.value)} />;
  if (type === 'd') return <input type="datetime-local" value={v} onChange={(e) => onChange(e.target.value)} />;
  if (type === 'b') return <div><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /></div>;
  if (type === 'i' || type === 'm') {
    const urls = type === 'm' ? v.split('\n').filter(Boolean) : v ? [v] : [];
    const pick = async (e) => {
      setBusy(true);
      const out = [];
      for (const f of e.target.files) { const u = await upload(f); if (u) out.push(u); }
      setBusy(false);
      onChange(type === 'm' ? [...urls, ...out].join('\n') : out[0] || v);
      e.target.value = '';
    };
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '.4rem 0' }}>
          {urls.map((u) => <span key={u} style={{ position: 'relative' }}><img className="thumb" src={u} alt="" style={{ width: 64, height: 64 }} /><button type="button" className="ic" style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22 }} onClick={() => onChange(type === 'm' ? urls.filter((x) => x !== u).join('\n') : '')}>×</button></span>)}
        </div>
        <input type="file" accept="image/*" multiple={type === 'm'} onChange={pick} />
        {busy && <small className="mute">Envoi…</small>}
        {type === 'i' && <input placeholder="ou coller une URL" value={v} onChange={(e) => onChange(e.target.value)} />}
      </div>
    );
  }
  return <input value={v} onChange={(e) => onChange(e.target.value)} />;
}

const fmtDate = (v) => { if (!v) return ''; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: v.length > 10 ? 'short' : undefined }); };
const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);

function Crud({ res }) {
  const r = RES[res];
  const A = AD[res];
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null);
  const [m, setM] = useState(null);
  const [start, setStart] = useState('');
  const load = () => api('/api/admin/' + res).then((j) => setRows(Array.isArray(j) ? j : []));
  useEffect(() => { setRows(null); setEdit(null); setM(null); load(); if (res === 'fasting_days') api('/api/admin/settings').then((j) => setStart(j.fast_start || '')); }, [res]);
  const type = (k) => r.f.find((x) => x[0] === k)[1];
  const blank = () => Object.fromEntries(r.f.map(([k, t, d]) => [k, t === 'b' ? d === 'true' : '']));
  async function save(e) {
    e.preventDefault();
    const j = await api('/api/admin/' + res, 'POST', edit);
    if (j.error) return setM({ err: 1, text: 'Enregistrement impossible. Réessayez.' });
    setEdit(null); setM({ text: 'Enregistré. C\'est visible sur le site.' }); load();
  }
  async function del(id) { if (confirm('Supprimer définitivement ?')) { await api('/api/admin/' + res, 'DELETE', { id }); load(); } }
  async function toggle(x, k) { await api('/api/admin/' + res, 'POST', { id: x.id, [k]: !x[k] }); load(); }
  const first = A.show[0];
  const img = A.show.find((k) => ['i', 'm'].includes(type(k)));
  const field = (k) => (
    <label className="f" key={k}>{A.L?.[k] || k}{A.H?.[k] && <small className="mute" style={{ display: 'block', fontWeight: 400 }}>{A.H[k]}</small>}
      <Field name={k} type={type(k)} value={edit[k]} options={A.S?.[k]} onChange={(v) => setEdit({ ...edit, [k]: v })} />
    </label>
  );
  const sumOf = (x) => A.sum.map((k) => (k === 'starts_at' ? fmtDate(x[k]) : k === 'price' ? (x[k] ? x[k] + ' FCFA' : '') : x[k])).filter(Boolean).join(' · ');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><h2 style={{ fontSize: '1.8rem' }}>{A.title}</h2><button className="btn sm" onClick={() => setEdit(blank())}>+ Ajouter</button></div>
      <p className="mute">{A.intro}</p>
      {res === 'fasting_days' && (
        <div className="card flat" style={{ margin: '1rem 0' }}>
          <label className="f" style={{ marginTop: 0 }}>Date du jour 1<small className="mute" style={{ display: 'block', fontWeight: 400 }}>Le programme démarre ce jour-là.</small><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <button className="btn sm" style={{ marginTop: '.8rem' }} onClick={async () => { const j = await api('/api/admin/settings', 'POST', { fast_start: start }); setM(j.error ? { err: 1, text: 'Erreur' } : { text: 'Date enregistrée' }); }}>Enregistrer la date</button>
        </div>
      )}
      <Msg m={m} />
      {edit && (
        <form className="card" onSubmit={save} style={{ margin: '1rem 0' }}>
          {A.show.map(field)}
          {A.en && <details style={{ marginTop: '1rem' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>Version anglaise (facultatif)</summary>{A.en.map(field)}</details>}
          <div style={{ display: 'flex', gap: 8, marginTop: '1.2rem' }}><button className="btn sm">Enregistrer</button><button type="button" className="btn ghost sm" onClick={() => setEdit(null)}>Annuler</button></div>
        </form>
      )}
      {!rows && <p className="mute">Chargement…</p>}
      {rows && !rows.length && <p className="mute" style={{ padding: '1rem 0' }}>Rien pour le moment. Cliquez sur « + Ajouter ».</p>}
      {rows?.map((x) => (
        <div className="row" key={x.id}>
          {img && x[img] && <img className="thumb" src={String(x[img]).split('\n')[0]} alt="" />}
          <div><b>{x[first] || '(sans titre)'}</b><small>{sumOf(x)}</small></div>
          {A.T && Object.entries(A.T).map(([k, l]) => <button key={k} className={'tab sm' + (x[k] ? ' on' : '')} onClick={() => toggle(x, k)}>{x[k] ? l : 'Masqué'}</button>)}
          <button className="btn ghost sm" onClick={() => setEdit({ ...x })}>Modifier</button>
          <button className="btn ghost sm" onClick={() => del(x.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}

function Inbox({ res, onChange }) {
  const I = INBOX[res];
  const [rows, setRows] = useState(null);
  const [pastors, setPastors] = useState([]);
  const load = () => api('/api/admin/' + res).then((j) => { setRows(Array.isArray(j) ? j : []); onChange(); });
  useEffect(() => { setRows(null); load(); if (res === 'appointments') api('/api/admin/pastors').then((j) => Array.isArray(j) && setPastors(j)); }, [res]);
  const patch = async (id, d) => { await api('/api/admin/' + res, 'POST', { id, ...d }); load(); };
  const del = async (id) => { if (confirm('Supprimer définitivement ?')) { await api('/api/admin/' + res, 'DELETE', { id }); load(); } };
  const pName = (id) => pastors.find((p) => p.id === id)?.name;
  return (
    <div>
      <h2 style={{ fontSize: '1.8rem' }}>{I.title}</h2>
      <p className="mute">{I.intro}</p>
      {!rows && <p className="mute">Chargement…</p>}
      {rows && !rows.length && <p className="mute" style={{ padding: '1rem 0' }}>Rien reçu pour le moment.</p>}
      <div className="stack">
        {rows?.map((x) => (
          <div className="card flat" key={x.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <b>{res === 'prayers' ? (x.anonymous ? 'Anonyme' : x.name || 'Anonyme') : res === 'testimonies' ? x.title || x.name : x.name || 'Anonyme'}</b>
              <span className="mute" style={{ fontSize: '.85rem' }}>{fmtDate(x.created_at)}</span>
            </div>
            {res === 'testimonies' && x.title && <div className="mute">Par {x.name}</div>}
            {x.message && <p style={{ margin: '.5rem 0', whiteSpace: 'pre-line' }}>{x.message}</p>}
            {x.body && <p style={{ margin: '.5rem 0', whiteSpace: 'pre-line' }}>{x.body}</p>}
            {res === 'prayers' && x.contact && <p className="mute">Contact : {x.contact}</p>}
            {res === 'appointments' && <p style={{ margin: '.5rem 0' }}>{x.pastor_id ? 'Pasteur : ' + (pName(x.pastor_id) || '…') : 'Pasteur : peu importe'}<br />{x.phone && <>Téléphone : <a href={'tel:' + x.phone}>{x.phone}</a><br /></>}{x.email && <>Email : {x.email}<br /></>}{x.wanted_at && <>Souhaité : {x.wanted_at}<br /></>}{x.note && <>Sujet : {x.note}</>}</p>}
            {res === 'orders' && <p style={{ margin: '.5rem 0', whiteSpace: 'pre-line' }}>Téléphone : <a href={'tel:' + x.phone}>{x.phone}</a>{'\n'}{x.items}{'\n'}<b>Total : {new Intl.NumberFormat('fr-FR').format(x.total || 0)} FCFA</b>{x.note ? '\nNote : ' + x.note : ''}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: '.6rem' }}>
              {I.mod && <><span className={'pill' + (x.approved ? '' : ' red')}>{x.approved ? 'Publié' : 'En attente'}</span><button className="btn sm" onClick={() => patch(x.id, { approved: !x.approved })}>{x.approved ? 'Retirer du site' : 'Publier sur le site'}</button></>}
              {I.status && <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>Suivi :<select style={{ width: 'auto', margin: 0 }} value={x.status || I.status[0]} onChange={(e) => patch(x.id, { status: e.target.value })}>{I.status.map((o) => <option key={o} value={o}>{cap(o)}</option>)}</select></label>}
              <button className="btn ghost sm" onClick={() => del(x.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Push() {
  const [f, setF] = useState({ title: '', body: '', url: '/live' });
  const [m, setM] = useState(null);
  const tpl = [['Culte dans 10 minutes', 'Rejoignez-nous en direct.', '/live'], ['Nouvel événement', 'Découvrez le prochain événement de l\'église.', '/evenements'], ['Rappel important', 'Consultez les annonces de l\'église.', '/']];
  return (
    <form className="card" onSubmit={async (e) => { e.preventDefault(); const j = await api('/api/admin/push', 'POST', f); setM(j.error ? { err: 1, text: 'Envoi impossible. Contactez la personne qui gère le site.' } : { text: `Envoyé à ${j.sent} téléphone(s) sur ${j.total}.` }); }}>
      <h2 style={{ fontSize: '1.8rem' }}>Notifications</h2>
      <p className="mute">Message envoyé sur le téléphone des personnes qui ont installé le site et accepté les notifications.</p>
      <div className="tabs" style={{ marginTop: '1rem' }}>{tpl.map(([a, b, c]) => <button type="button" key={a} className="tab" onClick={() => setF({ title: a, body: b, url: c })}>{a}</button>)}</div>
      <label className="f">Titre<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label className="f">Message<textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
      <label className="f">Page à ouvrir au clic<select value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })}><option value="/live">Direct en ligne</option><option value="/evenements">Événements</option><option value="/">Accueil</option><option value="/boutique">Boutique</option></select></label>
      <button className="btn" style={{ marginTop: '1rem' }}>Envoyer à tous</button><Msg m={m} />
    </form>
  );
}

function Settings({ group }) {
  const [v, setV] = useState(null);
  const [m, setM] = useState(null);
  const g = GROUPS.find((x) => x[0] === group);
  const keys = SET.filter(([k]) => setMeta(k)[0] === group);
  useEffect(() => { setM(null); api('/api/admin/settings').then(setV); }, [group]);
  if (!v) return <p className="mute">Chargement…</p>;
  return (
    <form onSubmit={async (e) => { e.preventDefault(); const body = Object.fromEntries(keys.map(([k]) => [k, v[k]])); const j = await api('/api/admin/settings', 'POST', body); setM(j.error ? { err: 1, text: 'Erreur' } : { text: 'Enregistré' }); }}>
      <h2 style={{ fontSize: '1.8rem' }}>{g[1]}</h2>
      <p className="mute">{g[2]}</p>
      {keys.map(([k, t]) => { const [, lab, hint] = setMeta(k); return (
        <label className="f" key={k}>{lab}{hint && <small className="mute" style={{ display: 'block', fontWeight: 400 }}>{hint}</small>}<Field name={k} type={t} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} /></label>
      ); })}
      <button className="btn" style={{ marginTop: '1.2rem' }}>Enregistrer</button><Msg m={m} />
    </form>
  );
}

export default function Admin() {
  const [ok, setOk] = useState(null);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState('events');
  const [adv, setAdv] = useState(false);
  const [counts, setCounts] = useState({});
  const [menu, setMenu] = useState(false);
  const refresh = async () => {
    const c = {};
    for (const [res, key, val] of [['prayers', 'approved', false], ['testimonies', 'approved', false], ['suggestions', 'approved', false], ['appointments', 'status', 'nouveau'], ['orders', 'status', 'nouvelle']]) {
      const j = await api('/api/admin/' + res);
      if (Array.isArray(j)) c[res] = j.filter((x) => (val === false ? !x[key] : (x[key] || val) === val)).length;
    }
    setCounts(c);
  };
  useEffect(() => { api('/api/admin/login').then((j) => setOk(!!j.admin)); setAdv(new URLSearchParams(location.search).has('avance')); }, []);
  useEffect(() => { if (ok) refresh(); }, [ok]);
  if (ok === null) return null;
  if (!ok) return (
    <div className="wrap" style={{ padding: '120px 0', maxWidth: 420 }}>
      <form className="card" onSubmit={async (e) => { e.preventDefault(); const r = await post('/api/admin/login', { password: pw }); r.ok ? setOk(true) : setErr(true); }}>
        <h1 style={{ fontSize: '2rem' }}>Espace administrateur</h1>
        <label className="f">Mot de passe<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        <button className="btn" style={{ marginTop: '1rem' }}>Entrer</button>
        {err && <Msg m={{ err: 1, text: 'Mot de passe incorrect' }} />}
      </form>
    </div>
  );
  const label = (k) => (AD[k] || INBOX[k] || { title: k === 'push' ? 'Envoyer une notification' : k }).title;
  const go = (k) => { setTab(k); setMenu(false); };
  return (
    <div className="wrap adm">
      <aside>
        <button className="btn ghost sm mob-only" onClick={() => setMenu(!menu)}>{menu ? 'Fermer le menu' : 'Menu : ' + (tab.startsWith('set:') ? 'Avancé' : label(tab))}</button>
        <div className={'adm-menu' + (menu ? ' open' : '')}>
          {MENU.map(([h, keys]) => (
            <div key={h}><p className="adm-h">{h}</p>{keys.map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}>{label(k)}{counts[k] > 0 && <span className="pill red" style={{ marginLeft: 8 }}>{counts[k]}</span>}</button>)}</div>
          ))}
          {adv && <div><p className="adm-h">Avancé (développeur)</p>{GROUPS.map(([k, l]) => <button key={k} className={tab === 'set:' + k ? 'on' : ''} onClick={() => go('set:' + k)}>{l}</button>)}</div>}
          <button onClick={async () => { await post('/api/admin/login', { logout: 1 }); setOk(false); }}>Déconnexion</button>
        </div>
      </aside>
      <section>{tab.startsWith('set:') ? <Settings group={tab.slice(4)} key={tab} /> : tab === 'push' ? <Push /> : INBOX[tab] ? <Inbox res={tab} key={tab} onChange={refresh} /> : <Crud res={tab} key={tab} />}</section>
    </div>
  );
}
