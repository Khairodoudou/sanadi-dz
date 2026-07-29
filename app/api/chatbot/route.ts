import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es SanadiBot, un assistant médical intelligent intégré dans la plateforme SanadiDZ — une plateforme de santé à domicile en Algérie.

TON RÔLE :
- Répondre UNIQUEMENT aux questions liées à la santé, la médecine, les symptômes, les médicaments, la nutrition, le bien-être et les soins à domicile.
- Aider les patients à comprendre leurs symptômes, les guider vers le bon type de praticien, ou donner des conseils de santé généraux.
- Tu peux répondre en français, arabe ou anglais selon la langue de l'utilisateur.

RÈGLES STRICTES :
1. Si la question n'est PAS liée à la santé ou à la médecine, réponds poliment en indiquant que tu es spécialisé uniquement dans les questions de santé.
2. Ne donne JAMAIS de diagnostic médical définitif. Encourage toujours à consulter un médecin.
3. En cas d'urgence médicale (douleur thoracique, difficulté à respirer, perte de conscience), indique immédiatement d'appeler le 15 (SAMU Algérie).
4. Sois chaleureux, empathique et professionnel. Utilise des emojis médicaux.
5. Mentionne les services SanadiDZ (rendez-vous à domicile, soins infirmiers) quand c'est pertinent.`;

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Use the OpenAI-compatible endpoint (simpler and more reliable)
  const body = {
    model: "grok-3-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Grok API error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data?.error?.message || "AI service unavailable" },
        { status: 502 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("Unexpected Grok response shape:", JSON.stringify(data));
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chatbot fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
