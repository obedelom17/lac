import { q, ensure } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!isAdmin(req)) return Response.json({ error: "auth" }, { status: 401 });
  await ensure();
  const { data } = await req.json();
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data || "");
  if (!m || m[2].length > 4000000) return Response.json({ error: "invalid" }, { status: 400 });
  const [row] = await q("INSERT INTO images(mime,data) VALUES($1,$2) RETURNING id", [m[1], m[2]]);
  return Response.json({ url: `/api/img/${row.id}` });
}
