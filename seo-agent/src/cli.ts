#!/usr/bin/env -S npx tsx
// Alphastrix SEO agent — command-line entry point.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { estimateCostUsd, runAgent, type Effort } from "./agent.js";
import { auditTask, compareTask, keywordsTask, writeTask } from "./prompts.js";

const HELP = `Alphastrix SEO agent

Usage:
  npm run seo -- audit <url> [--pages 25] [--no-speed]
  npm run seo -- keywords <url-or-topic> [--market "India"] [--count 40]
  npm run seo -- write "<keyword>" [--type "blog post"] [--words 1500] [--url <page-to-rewrite>] [--brief "..."]
  npm run seo -- compare <your-url> <competitor-url> [more competitors...]
  npm run seo -- ask "<any SEO question or task>"

Options (all commands):
  --out <dir>       Where to save reports (default: ./reports)
  --effort <level>  low | medium | high | xhigh | max (default: high)
  --model <id>      Claude model (default: claude-opus-5-5)
  --quiet           Don't stream the report to the terminal

Needs ANTHROPIC_API_KEY. Optional PAGESPEED_API_KEY raises Google PageSpeed rate limits.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    pages: { type: "string" },
    "no-speed": { type: "boolean" },
    market: { type: "string" },
    count: { type: "string" },
    type: { type: "string" },
    words: { type: "string" },
    url: { type: "string" },
    brief: { type: "string" },
    out: { type: "string" },
    effort: { type: "string" },
    model: { type: "string" },
    quiet: { type: "boolean" },
    help: { type: "boolean", short: "h" },
  },
});

const [command, ...args] = positionals;
const num = (v: string | undefined, fallback: number) => (v && Number.isFinite(Number(v)) ? Number(v) : fallback);
const fail = (msg: string): never => {
  console.error(`${msg}\n\n${HELP}`);
  process.exit(1);
};

if (values.help || !command) {
  console.log(HELP);
  process.exit(0);
}

let task: string;
let label: string;
switch (command) {
  case "audit":
    if (!args[0]) fail("audit needs a URL.");
    task = auditTask(args[0], Math.min(num(values.pages, 25), 100), !values["no-speed"]);
    label = `audit-${args[0]}`;
    break;
  case "keywords":
    if (!args[0]) fail("keywords needs a URL or topic.");
    task = keywordsTask(args.join(" "), values.market ?? "India and global English-speaking markets", num(values.count, 40));
    label = `keywords-${args.join(" ")}`;
    break;
  case "write":
    if (!args[0]) fail('write needs a keyword, e.g. write "seo agency in indore".');
    task = writeTask(args.join(" "), {
      type: values.type ?? "blog post",
      words: num(values.words, 1500),
      url: values.url,
      brief: values.brief,
    });
    label = `content-${args.join(" ")}`;
    break;
  case "compare":
    if (args.length < 2) fail("compare needs your URL and at least one competitor URL.");
    task = compareTask(args[0], args.slice(1));
    label = `compare-${args[0]}`;
    break;
  case "ask":
    if (!args[0]) fail("ask needs a question or task.");
    task = `${args.join(" ")}\n\nDate: ${new Date().toISOString().slice(0, 10)}.`;
    label = `ask-${args.join(" ").slice(0, 40)}`;
    break;
  default:
    fail(`Unknown command: ${command}`);
}

const effort = (values.effort ?? "high") as Effort;
if (!["low", "medium", "high", "xhigh", "max"].includes(effort)) fail(`Invalid --effort: ${effort}`);

const slug = label!
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 60);
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const outDir = path.resolve(values.out ?? "reports");
const outFile = path.join(outDir, `${slug}-${stamp}.md`);

console.error(`\nAlphastrix SEO agent · ${command} · effort ${effort}\n`);
const started = Date.now();

try {
  const result = await runAgent(task!, {
    model: values.model ?? "claude-opus-5-5",
    effort,
    maxIterations: 40,
    quiet: values.quiet,
  });

  if (!result.report) throw new Error(`The agent finished without a report (stop reason: ${result.stopReason}).`);
  if (result.stopReason === "max_tokens") console.error("\nWarning: the report hit the length limit and may be cut off.");
  if (result.stopReason === "tool_use") console.error("\nWarning: the agent hit its step limit before finishing.");

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, result.report + "\n");

  const u = result.usage;
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.error(
    `\nSaved: ${outFile}\n` +
      `Time: ${mins} min · Tokens in ${u.input + u.cacheRead + u.cacheWrite} (cached ${u.cacheRead}) / out ${u.output} · ` +
      `Searches ${u.searches} · ~$${estimateCostUsd(u).toFixed(2)}` +
      (result.servedBy !== (values.model ?? "claude-opus-5-5") ? ` · served by ${result.servedBy}` : ""),
  );
} catch (err) {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("\nAuthentication failed. Set ANTHROPIC_API_KEY (see seo-agent/README.md).");
  } else if (err instanceof Anthropic.RateLimitError) {
    console.error("\nRate limited by the Anthropic API. Wait a minute and try again.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`\nAnthropic API error ${err.status}: ${err.message}`);
  } else {
    console.error(`\nError: ${(err as Error).message}`);
  }
  process.exit(1);
}
