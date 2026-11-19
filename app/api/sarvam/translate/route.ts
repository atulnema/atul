import { MAX_TRANSLATE_CHARS, isLanguage, isTone } from "@/lib/languages";
import { errorResponse, rateLimited, sarvamPost } from "@/lib/sarvam";

export const runtime = "nodejs";

type TranslateResponse = { translated_text?: string; source_language_code?: string };

export async function POST(req: Request) {
  if (rateLimited(req)) {
    return Response.json({ error: "Too many requests. Give it a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const { source, target, tone } = body ?? {};

  if (!text) return Response.json({ error: "Add some text to translate." }, { status: 400 });
  if (text.length > MAX_TRANSLATE_CHARS) {
    return Response.json(
      { error: `Keep it under ${MAX_TRANSLATE_CHARS} characters.` },
      { status: 400 },
    );
  }
  if (!isLanguage(source) || !isLanguage(target) || !isTone(tone)) {
    return Response.json({ error: "Unsupported language or tone." }, { status: 400 });
  }
  if (source === target) return Response.json({ text, source });

  try {
    const data = await sarvamPost<TranslateResponse>("/translate", {
      input: text,
      source_language_code: source,
      target_language_code: target,
      model: "mayura:v1",
      mode: tone,
      numerals_format: "international",
    });
    return Response.json({
      text: data.translated_text ?? "",
      source: data.source_language_code ?? source,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
