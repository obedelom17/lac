import { getSettings } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { messages = [], lang = "fr" } = await req.json();
    const S = await getSettings();
    const system = `Tu es ${S.ai_name}, l assistant de ${S.church_name}, à Lomé (Togo). Tu réponds aux questions sur la Bible, la foi chrétienne et les doctrines de l église. Réponds dans la langue de l utilisateur (${lang === "en" ? "anglais" : "français"} par défaut). Sois chaleureux, clair et bref (6 phrases maximum). Appuie-toi sur des versets en citant la référence. Doctrines de l église : ${S.doctrine}
Si une question dépasse la Bible ou la foi, ramène poliment la conversation vers ce sujet. Pour une situation personnelle grave, invite à parler à un pasteur via la page Rendez-vous. Ne prétends pas parler au nom de Dieu. N invente jamais un verset.`;
    const history = messages.slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 1000) }));
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", reasoning_effort: "low", temperature: 0.4, max_completion_tokens: 1500, messages: [{ role: "system", content: system }, ...history] }),
    });
    const j = await r.json();
    if (!r.ok) { console.error("Groq error", r.status, j.error); return Response.json({ error: j.error?.message || "groq" }, { status: 502 }); }
    return Response.json({ reply: j.choices?.[0]?.message?.content || "" });
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 });
  }
}
