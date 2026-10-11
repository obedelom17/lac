import { NextResponse } from "next/server";
import { sign, cookieOpts, isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(req) { return NextResponse.json({ admin: isAdmin(req) }); }
export async function POST(req) {
  const { password, logout } = await req.json();
  const res = NextResponse.json({ ok: true });
  if (logout) { res.cookies.set("adm", "", { ...cookieOpts, maxAge: 0 }); return res; }
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "bad" }, { status: 401 });
  res.cookies.set("adm", sign("admin"), cookieOpts);
  return res;
}
