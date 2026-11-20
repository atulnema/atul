// The agent loop: Claude plans the work, calls the SEO tools, and writes the report.
// The SDK's tool runner handles the request → tool call → result cycle.

import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages";
import { SYSTEM_PROMPT } from "./prompts.js";
import { buildTools, webSearchTool } from "./tools.js";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface RunOptions {
  model: string;
  effort: Effort;
  maxIterations: number;
  quiet?: boolean;
}

export interface RunResult {
  report: string;
  stopReason: string | null;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number; searches: number };
  servedBy: string;
}

const dim = (s: string) => (process.stderr.isTTY ? `\x1b[2m${s}\x1b[0m` : s);

export async function runAgent(task: string, opts: RunOptions): Promise<RunResult> {
  const client = new Anthropic();
  const log = (name: string, detail: string) => process.stderr.write(dim(`  → ${name}: ${detail}\n`));

  const runner = client.beta.messages.toolRunner({
    model: opts.model,
    max_tokens: 64000,
    system: SYSTEM_PROMPT,
    tools: [...buildTools(log), webSearchTool],
    messages: [{ role: "user", content: task }],
    output_config: { effort: opts.effort },
    // Cache the growing conversation so each turn only pays full price for new tokens.
    cache_control: { type: "ephemeral" },
    // If the model declines a request for policy reasons, retry on the server-defined fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    max_iterations: opts.maxIterations,
    thread: false,
    stream: true,
  });

  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, searches: 0 };
  let last: BetaMessage | undefined;

  for await (const stream of runner) {
    stream.on("contentBlock", (block) => {
      if (block.type === "server_tool_use" && block.name === "web_search") {
        const q = (block.input as { query?: string }).query;
        log("web_search", q ?? "");
      } else if (block.type === "fallback") {
        log("fallback", `${block.from.model} declined; continuing on ${block.to.model}`);
      }
    });
    if (!opts.quiet) stream.on("text", (delta) => process.stdout.write(delta));

    last = await stream.finalMessage();
    usage.input += last.usage.input_tokens;
    usage.output += last.usage.output_tokens;
    usage.cacheRead += last.usage.cache_read_input_tokens ?? 0;
    usage.cacheWrite += last.usage.cache_creation_input_tokens ?? 0;
    usage.searches += last.usage.server_tool_use?.web_search_requests ?? 0;
  }

  if (!last) throw new Error("The agent returned no response.");
  if (!opts.quiet) process.stdout.write("\n");

  if (last.stop_reason === "refusal") {
    throw new Error(
      `The model declined this request${last.stop_details?.category ? ` (${last.stop_details.category})` : ""}. Try rephrasing the brief.`,
    );
  }

  const report = last.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return { report, stopReason: last.stop_reason, usage, servedBy: last.model };
}

/** Rough cost at Claude Opus 5.5 list prices; other models will differ. */
export function estimateCostUsd(u: RunResult["usage"]): number {
  return (u.input * 4 + u.cacheWrite * 5 + u.cacheRead * 0.2 + u.output * 20) / 1_000_000 + u.searches * 0.01;
}
