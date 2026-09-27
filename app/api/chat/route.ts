import Anthropic from "@anthropic-ai/sdk";
import { agent } from "@/lib/agent";
import { systemPrompt } from "@/lib/agentPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    return null;
  }
  const raw = (body as { messages: unknown[] }).messages;
  const messages: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, agent.maxMessageChars);
    if (text) messages.push({ role, content: text });
  }
  // Keep the most recent turns, and make sure the history starts with the visitor.
  const recent = messages.slice(-agent.maxMessages);
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

export async function POST(req: Request) {
  if (!client) {
    console.error("Live agent is offline: set ANTHROPIC_API_KEY to enable it.");
    return Response.json({ error: `${agent.name} is offline right now.` }, { status: 503 });
  }

  const messages = parseMessages(await req.json().catch(() => null));
  if (!messages) {
    return Response.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const stream = client.beta.messages.stream(
    {
      model: agent.model,
      max_tokens: agent.maxTokens,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
      // Chat is latency-sensitive; low effort keeps replies quick.
      output_config: { effort: "low" },
      // If the model declines a request, retry it server-side on Anthropic's recommended fallback.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    },
    { signal: req.signal },
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\n\nI can't help with that one. For anything else, just ask."),
          );
        }
        controller.close();
      } catch (err) {
        if (req.signal.aborted) return controller.close();
        if (err instanceof Anthropic.RateLimitError) {
          console.error("Live agent rate limited:", err.message);
        } else if (err instanceof Anthropic.APIError) {
          console.error(`Live agent API error ${err.status}:`, err.message);
        } else {
          console.error("Live agent error:", err);
        }
        controller.error(err);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
