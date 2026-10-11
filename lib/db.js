import { neon } from '@neondatabase/serverless';
import { RES, SET_DEFAULTS } from './resources';

export const q = (text, params = []) => neon(process.env.DATABASE_URL).query(text, params);

const FAST = [
  ['Repentance','Repentance','Psaume 51:12'],['Le salut','Salvation','Éphésiens 2:8'],['La nouvelle naissance','The new birth','Jean 3:3'],
  ['La sainteté','Holiness','Hébreux 12:14'],['La Parole de Dieu','The Word of God','Psaume 119:105'],['La prière','Prayer','Luc 18:1'],
  ['Le Saint-Esprit','The Holy Spirit','Actes 1:8'],['L\'amour','Love','1 Corinthiens 13:13'],['Le pardon','Forgiveness','Matthieu 6:14'],
  ['La famille','The family','Josué 24:15'],['Les couples et mariages','Marriages','Éphésiens 5:25'],['Les enfants','Children','Proverbes 22:6'],
  ['Les jeunes','Youth','1 Timothée 4:12'],['Les malades','The sick','Jacques 5:15'],['Le travail et les finances','Work and finances','Philippiens 4:19'],
  ['Le pays et les dirigeants','The nation and leaders','1 Timothée 2:1-2'],['La paix','Peace','Jean 14:27'],['L\'évangélisation','Evangelism','Marc 16:15'],
  ['L\'unité de l\'Église','Unity of the Church','Jean 17:21'],['La persévérance','Perseverance','Galates 6:9'],['Action de grâce','Thanksgiving','1 Thessaloniciens 5:18'],
];
const colSql = ([n, t, d]) => `${n} ${t === 'n' ? 'INTEGER' : t === 'b' ? 'BOOLEAN DEFAULT ' + (d || 'false') : 'TEXT'}`;

export function ensure() {
  if (!globalThis.__dbReady) {
    globalThis.__dbReady = (async () => {
      const stmts = [
        'CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)',
        'CREATE TABLE IF NOT EXISTS images (id SERIAL PRIMARY KEY, mime TEXT, data TEXT)',
        'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, pass TEXT, created_at TIMESTAMPTZ DEFAULT now())',
        'CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, sub TEXT)',
        ...Object.entries(RES).map(([t, r]) => `CREATE TABLE IF NOT EXISTS ${t} (id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now(), ${r.f.map(colSql).join(', ')}${r.extra ? ', ' + r.extra : ''})`),
      ];
      for (const s of stmts) await q(s);
      const [{ n }] = await q('SELECT count(*)::int n FROM services');
      if (!n) {
        const rows = [['1er culte','First service','Dimanche','08:00'],['2nd culte','Second service','Dimanche','10:30'],['Étude biblique','Bible study','Mardi','18:00'],['Réunion de prière','Prayer meeting','Vendredi','18:00']];
        for (const [i, r] of rows.entries()) await q('INSERT INTO services(label,label_en,day,time,pos) VALUES($1,$2,$3,$4,$5)', [r[0], r[1], r[2], r[3], i]);
      }
      const [{ n: m }] = await q('SELECT count(*)::int n FROM fasting_days');
      if (!m) for (const [i, d] of FAST.entries()) await q('INSERT INTO fasting_days(day_no,title,title_en,subject,subject_en,scripture) VALUES($1,$2,$3,$4,$5,$6)', [i + 1, d[0], d[1], 'Priez sur ce sujet : ' + d[0].toLowerCase() + '.', 'Pray on this topic: ' + d[1].toLowerCase() + '.', d[2]]);
    })().catch((e) => { globalThis.__dbReady = null; throw e; });
  }
  return globalThis.__dbReady;
}

export async function getSettings() {
  await ensure();
  const rows = await q('SELECT key,value FROM settings');
  return { ...SET_DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}
