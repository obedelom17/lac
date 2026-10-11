import { q, ensure, getSettings } from "@/lib/db";
import { RES, cols } from "@/lib/resources";
export const dynamic = "force-dynamic";

export async function GET(req, ctx) {
  const params = await ctx.params;
  try {
    if (params.res === "settings") return Response.json(await getSettings());
    const r = RES[params.res];
    if (!r || !r.pub) return Response.json([], { status: 404 });
    await ensure();
    const rows = await q(`SELECT ${cols(r)} FROM ${params.res} ${r.where ? "WHERE " + r.where : ""} ORDER BY ${r.order || "id DESC"} LIMIT 300`);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 });
  }
}
