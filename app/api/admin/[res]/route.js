import { q, ensure, getSettings } from "@/lib/db";
import { RES, SET, cols } from "@/lib/resources";
import { isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

const deny = () => Response.json({ error: "auth" }, { status: 401 });
function pick(r, body) {
  const o = {};
  for (const [k, t] of r.f) if (k in body) {
    let v = body[k];
    if (t === "n") v = v === "" || v == null ? null : Number(v);
    else if (t === "b") v = !!v;
    else v = v == null ? "" : String(v);
    o[k] = v;
  }
  return o;
}

export async function GET(req, ctx) {
  const params = await ctx.params;
  if (!isAdmin(req)) return deny();
  await ensure();
  if (params.res === "settings") return Response.json(await getSettings());
  const r = RES[params.res];
  if (!r) return Response.json({ error: "nope" }, { status: 404 });
  return Response.json(await q(`SELECT ${cols({ ...r, hide: [] })} FROM ${params.res} ORDER BY id DESC LIMIT 500`));
}

export async function POST(req, ctx) {
  const params = await ctx.params;
  if (!isAdmin(req)) return deny();
  await ensure();
  const body = await req.json();
  if (params.res === "settings") {
    for (const [k] of SET) if (k in body) await q("INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2", [k, String(body[k] ?? "")]);
    return Response.json({ ok: true });
  }
  const r = RES[params.res];
  if (!r) return Response.json({ error: "nope" }, { status: 404 });
  const d = pick(r, body);
  const keys = Object.keys(d);
  if (body.id) {
    if (!keys.length) return Response.json({ ok: true });
    await q(`UPDATE ${params.res} SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(",")} WHERE id=$${keys.length + 1}`, [...keys.map((k) => d[k]), Number(body.id)]);
  } else {
    await q(`INSERT INTO ${params.res} (${keys.join(",")}) VALUES (${keys.map((_, i) => "$" + (i + 1)).join(",")})`, keys.map((k) => d[k]));
  }
  return Response.json({ ok: true });
}

export async function DELETE(req, ctx) {
  const params = await ctx.params;
  if (!isAdmin(req)) return deny();
  const r = RES[params.res];
  if (!r) return Response.json({ error: "nope" }, { status: 404 });
  const { id } = await req.json();
  await q(`DELETE FROM ${params.res} WHERE id=$1`, [Number(id)]);
  return Response.json({ ok: true });
}
