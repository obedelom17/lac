import webpush from "web-push";
import { q, ensure } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!isAdmin(req)) return Response.json({ error: "auth" }, { status: 401 });
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return Response.json({ error: "Clés VAPID manquantes" }, { status: 400 });
  await ensure();
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contact@example.org", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const { title, body, url } = await req.json();
  const subs = await q("SELECT endpoint,sub FROM push_subs");
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try { await webpush.sendNotification(JSON.parse(s.sub), JSON.stringify({ title, body, url: url || "/" })); sent++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await q("DELETE FROM push_subs WHERE endpoint=$1", [s.endpoint]); }
  }));
  return Response.json({ sent, total: subs.length });
}
