import { q, ensure } from "@/lib/db";
import { RES } from "@/lib/resources";
import { userId } from "@/lib/auth";
export const dynamic = "force-dynamic";

const clip = (v, n = 4000) => (typeof v === "string" ? v.slice(0, n) : v);

export async function POST(req, ctx) {
  const params = await ctx.params;
  try {
    await ensure();
    const body = await req.json();
    const name = params.res;
    let data = {};
    if (name === "testimonies") {
      const uid = userId(req);
      if (!uid) return Response.json({ error: "auth" }, { status: 401 });
      const [u] = await q("SELECT name FROM users WHERE id=$1", [uid]);
      if (!u || !body.body) return Response.json({ error: "invalid" }, { status: 400 });
      data = { name: u.name, title: clip(body.title, 200), body: clip(body.body), user_id: uid, approved: false };
    } else if (name === "orders") {
      const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50);
      const ids = items.map((i) => Number(i.id)).filter(Boolean);
      if (!ids.length || !body.name || !body.phone) return Response.json({ error: "invalid" }, { status: 400 });
      const books = await q("SELECT id,title,price FROM books WHERE id = ANY($1)", [ids]);
      let total = 0;
      const lines = [];
      for (const it of items) {
        const b = books.find((x) => x.id === Number(it.id));
        const n = Math.max(1, Math.min(99, Number(it.qty) || 1));
        if (b) { total += (b.price || 0) * n; lines.push(`${n} x ${b.title}`); }
      }
      data = { name: clip(body.name, 120), phone: clip(body.phone, 40), items: lines.join("\n"), total, note: clip(body.note, 500), status: "nouvelle" };
    } else {
      const r = RES[name];
      if (!r || !r.submit) return Response.json({ error: "nope" }, { status: 404 });
      for (const k of r.submit) if (k in body) data[k] = clip(body[k], 2000);
      if (name === "prayers") { data.anonymous = !!body.anonymous; data.approved = false; if (!data.message) return Response.json({ error: "invalid" }, { status: 400 }); }
      if (name === "suggestions") { data.approved = false; if (!data.message) return Response.json({ error: "invalid" }, { status: 400 }); }
      if (name === "appointments") { data.status = "nouveau"; data.pastor_id = Number(data.pastor_id) || null; if (!data.name || !(data.phone || data.email)) return Response.json({ error: "invalid" }, { status: 400 }); }
    }
    const keys = Object.keys(data);
    await q(`INSERT INTO ${name} (${keys.join(",")}) VALUES (${keys.map((_, i) => "$" + (i + 1)).join(",")})`, keys.map((k) => data[k]));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 });
  }
}
