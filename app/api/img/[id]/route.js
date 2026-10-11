import { q, ensure } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(_req, ctx) {
  const params = await ctx.params;
  await ensure();
  const [row] = await q("SELECT mime,data FROM images WHERE id=$1", [Number(params.id) || 0]);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data, "base64"), { headers: { "Content-Type": row.mime, "Cache-Control": "public, max-age=31536000, immutable" } });
}
