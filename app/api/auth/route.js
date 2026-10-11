import { NextResponse } from "next/server";
import { q, ensure } from "@/lib/db";
import { sign, userId, hash, check, cookieOpts } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await ensure();
    const b = await req.json();
    if (b.action === "me") {
      const id = userId(req);
      const [u] = id ? await q("SELECT id,name,email FROM users WHERE id=$1", [id]) : [];
      return NextResponse.json({ user: u || null });
    }
    if (b.action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set("usr", "", { ...cookieOpts, maxAge: 0 });
      return res;
    }
    const email = String(b.email || "").trim().toLowerCase();
    const pass = String(b.password || "");
    if (!email.includes("@") || pass.length < 6) return NextResponse.json({ error: "invalid" }, { status: 400 });
    let u;
    if (b.action === "register") {
      const name = String(b.name || "").trim().slice(0, 80);
      if (!name) return NextResponse.json({ error: "invalid" }, { status: 400 });
      const ex = await q("SELECT id FROM users WHERE email=$1", [email]);
      if (ex.length) return NextResponse.json({ error: "exists" }, { status: 409 });
      [u] = await q("INSERT INTO users(name,email,pass) VALUES($1,$2,$3) RETURNING id,name,email", [name, email, hash(pass)]);
    } else {
      const [row] = await q("SELECT * FROM users WHERE email=$1", [email]);
      if (!row || !check(pass, row.pass)) return NextResponse.json({ error: "bad" }, { status: 401 });
      u = { id: row.id, name: row.name, email: row.email };
    }
    const res = NextResponse.json({ user: u });
    res.cookies.set("usr", sign(u.id), cookieOpts);
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
