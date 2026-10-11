'use client';
import { useState, useEffect } from 'react';
import { post } from '@/components/Providers';
import { RES, SET } from '@/lib/resources';
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

function Field({ name, type, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const v = value ?? '';
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

function Crud({ res }) {
  const r = RES[res];
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null);
  const [m, setM] = useState(null);
  const load = () => api('/api/admin/' + res).then((j) => setRows(Array.isArray(j) ? j : []));
  useEffect(() => { setRows(null); setEdit(null); setM(null); load(); }, [res]);
  const blank = () => Object.fromEntries(r.f.map(([k, t, d]) => [k, t === 'b' ? d === 'true' : '']));
  async function save(e) {
    e.preventDefault();
    const j = await api('/api/admin/' + res, 'POST', edit);
    if (j.error) return setM({ err: 1, text: 'Erreur : ' + j.error });
    setEdit(null); setM({ text: 'Enregistré' }); load();
  }
  async function del(id) { if (confirm('Supprimer ?')) { await api('/api/admin/' + res, 'DELETE', { id }); load(); } }
  async function toggle(x, k) { await api('/api/admin/' + res, 'POST', { id: x.id, [k]: !x[k] }); load(); }
  const first = r.f[0][0];
  const img = r.f.find((x) => x[1] === 'i' || x[1] === 'm');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '1.8rem' }}>{r.label}</h2><button className="btn sm" onClick={() => setEdit(blank())}>Ajouter</button></div>
      <Msg m={m} />
      {edit && (
        <form className="card" onSubmit={save} style={{ margin: '1rem 0' }}>
          {r.f.map(([k, t]) => <label className="f" key={k}>{label(k)}<Field name={k} type={t} value={edit[k]} onChange={(v) => setEdit({ ...edit, [k]: v })} /></label>)}
          <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}><button className="btn sm">Enregistrer</button><button type="button" className="btn ghost sm" onClick={() => setEdit(null)}>Annuler</button></div>
        </form>
      )}
      {!rows && <p className="mute">Chargement…</p>}
      {rows?.map((x) => (
        <div className="row" key={x.id}>
          {img && x[img[0]] && <img className="thumb" src={String(x[img[0]]).split('\n')[0]} alt="" />}
          <div><b>{x[first] || '(vide)'}</b><small>{r.f.slice(1, 4).map(([k]) => x[k]).filter((v) => v !== null && v !== '' && typeof v !== 'boolean').join(' · ')}</small></div>
          {r.f.filter((f) => f[1] === 'b').map(([k]) => <button key={k} className={'tab sm' + (x[k] ? ' on' : '')} onClick={() => toggle(x, k)}>{label(k)}</button>)}
          <button className="btn ghost sm" onClick={() => setEdit({ ...x, starts_at: (x.starts_at || '').slice(0, 16) })}>Modifier</button>
          <button className="btn ghost sm" onClick={() => del(x.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}

function Settings() {
  const [v, setV] = useState(null);
  const [m, setM] = useState(null);
  useEffect(() => { api('/api/admin/settings').then(setV); }, []);
  if (!v) return <p className="mute">Chargement…</p>;
  return (
    <form onSubmit={async (e) => { e.preventDefault(); const j = await api('/api/admin/settings', 'POST', v); setM(j.error ? { err: 1, text: 'Erreur' } : { text: 'Réglages enregistrés' }); }}>
      <h2 style={{ fontSize: '1.8rem' }}>Réglages du site</h2>
      <p className="mute">Textes d'accueil, adresse, liens, chaînes YouTube (une par ligne : Nom|IDENTIFIANT), début du jeûne (AAAA-MM-JJ). Les champs _en sont les traductions anglaises.</p>
      {SET.map(([k, t]) => <label className="f" key={k}>{label(k)}<Field name={k} type={t} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} /></label>)}
      <button className="btn" style={{ marginTop: '1.2rem' }}>Enregistrer</button><Msg m={m} />
    </form>
  );
}

function Push() {
  const [f, setF] = useState({ title: '', body: '', url: '/live' });
  const [m, setM] = useState(null);
  return (
    <form className="card" onSubmit={async (e) => { e.preventDefault(); const j = await api('/api/admin/push', 'POST', f); setM(j.error ? { err: 1, text: String(j.error) } : { text: `Envoyé à ${j.sent} appareil(s) sur ${j.total}` }); }}>
      <h2 style={{ fontSize: '1.8rem' }}>Notification push</h2>
      <label className="f">Titre<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Le culte commence dans 10 minutes" /></label>
      <label className="f">Message<textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
      <label className="f">Lien<input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></label>
      <button className="btn" style={{ marginTop: '1rem' }}>Envoyer à tous</button><Msg m={m} />
    </form>
  );
}

export default function Admin() {
  const [ok, setOk] = useState(null);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState('settings');
  useEffect(() => { api('/api/admin/login').then((j) => setOk(!!j.admin)); }, []);
  if (ok === null) return null;
  if (!ok) return (
    <div className="wrap" style={{ padding: '80px 0', maxWidth: 420 }}>
      <form className="card" onSubmit={async (e) => { e.preventDefault(); const r = await post('/api/admin/login', { password: pw }); r.ok ? setOk(true) : setErr(true); }}>
        <h1 style={{ fontSize: '2rem' }}>Administration</h1>
        <label className="f">Mot de passe<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        <button className="btn" style={{ marginTop: '1rem' }}>Entrer</button>
        {err && <Msg m={{ err: 1, text: 'Mot de passe incorrect' }} />}
      </form>
    </div>
  );
  const tabs = [['settings', 'Réglages du site'], ...Object.entries(RES).map(([k, v]) => [k, v.label]), ['push', 'Notifications']];
  return (
    <div className="wrap adm">
      <aside>
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        <button onClick={async () => { await post('/api/admin/login', { logout: 1 }); setOk(false); }}>Déconnexion</button>
      </aside>
      <section>{tab === 'settings' ? <Settings /> : tab === 'push' ? <Push /> : <Crud res={tab} key={tab} />}</section>
    </div>
  );
}
