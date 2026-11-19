import { MAX_SPEAK_CHARS, isLanguage, isVoice } from "@/lib/languages";
import { errorResponse, rateLimited, sarvamPost } from "@/lib/sarvam";

export const runtime = "nodejs";

type TtsResponse = { audios?: string[] };

export async function POST(req: Request) {
  if (rateLimited(req)) {
    return Response.json({ error: "Too many requests. Give it a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const { language, voice } = body ?? {};
  const pace = Number(body?.pace ?? 1);

  if (!text) return Response.json({ error: "Nothing to read out yet." }, { status: 400 });
  if (text.length > MAX_SPEAK_CHARS) {
    return Response.json({ error: `Keep it under ${MAX_SPEAK_CHARS} characters.` }, { status: 400 });
  }
  if (!isLanguage(language) || !isVoice(voice)) {
    return Response.json({ error: "Unsupported language or voice." }, { status: 400 });
  }
  if (!Number.isFinite(pace) || pace < 0.5 || pace > 2) {
    return Response.json({ error: "Pace must be between 0.5 and 2." }, { status: 400 });
  }

  try {
    const data = await sarvamPost<TtsResponse>("/text-to-speech", {
      text,
      target_language_code: language,
      speaker: voice,
      model: "bulbul:v3",
      pace,
      speech_sample_rate: 24000,
      enable_preprocessing: true,
    });
    const audio = data.audios?.[0];
    if (!audio) return Response.json({ error: "Sarvam returned no audio." }, { status: 502 });

    return new Response(Buffer.from(audio, "base64"), {
      headers: { "content-type": "audio/wav", "cache-control": "no-store" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
