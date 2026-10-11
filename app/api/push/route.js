import { q, ensure } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  await ensure();
  const sub = await req.json();
  if (!sub?.endpoint) return Response.json({ error: "invalid" }, { status: 400 });
  await q("INSERT INTO push_subs(endpoint,sub) VALUES($1,$2) ON CONFLICT (endpoint) DO UPDATE SET sub=$2", [sub.endpoint, JSON.stringify(sub)]);
  return Response.json({ ok: true });
}
