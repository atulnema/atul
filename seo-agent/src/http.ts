// Small HTTP layer for the SEO tools: timeouts, redirect tracking, and a guard
// that stops the agent from being steered into fetching private/internal hosts.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const USER_AGENT =
  "Mozilla/5.0 (compatible; AlphastrixSEOAgent/0.1; +https://www.instagram.com/alphastrix_/)";

const MAX_REDIRECTS = 6;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB is plenty for any HTML page

export interface FetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  redirects: { url: string; status: number }[];
  headers: Record<string, string>;
  body: string;
  bytes: number;
  ms: number;
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateIPv4(mapped[1]) : false;
}

/** Throws unless the URL is http(s) and resolves only to public addresses. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Not a valid URL: ${raw}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Only http and https URLs are allowed (got ${url.protocol})`);
  }
  // Opt-in escape hatch for auditing staging sites on a private network (and for tests).
  if (process.env.SEO_AGENT_ALLOW_PRIVATE === "1") return url;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error(`Refusing to fetch a private host: ${host}`);
  }
  let addresses: { address: string; family: number }[];
  if (isIP(host)) {
    addresses = [{ address: host, family: isIP(host) }];
  } else {
    try {
      addresses = await lookup(host, { all: true });
    } catch (e) {
      // Behind an HTTPS proxy, local DNS may not resolve public names; the proxy does.
      // In that case the hostname checks above are the guard and the proxy resolves the host.
      if (process.env.HTTPS_PROXY || process.env.https_proxy) return url;
      throw e;
    }
  }
  for (const { address, family } of addresses) {
    if (family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address)) {
      throw new Error(`Refusing to fetch ${host}: it resolves to a private address`);
    }
  }
  return url;
}

/** Normalises user input like "example.com" into "https://example.com/". */
export function normaliseUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function fetchWithRedirects(
  rawUrl: string,
  { timeoutMs = 20_000, method = "GET" }: { timeoutMs?: number; method?: "GET" | "HEAD" } = {},
): Promise<FetchResult> {
  const started = performance.now();
  const redirects: { url: string; status: number }[] = [];
  let current = (await assertPublicUrl(normaliseUrl(rawUrl))).toString();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en;q=0.9",
      },
    });

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      redirects.push({ url: current, status: res.status });
      await res.body?.cancel();
      current = (await assertPublicUrl(new URL(location, current).toString())).toString();
      continue;
    }

    const buf = method === "HEAD" ? new ArrayBuffer(0) : await readCapped(res);
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k] = v));
    return {
      requestedUrl: rawUrl,
      finalUrl: current,
      status: res.status,
      redirects,
      headers,
      body: new TextDecoder("utf-8", { fatal: false }).decode(buf),
      bytes: buf.byteLength,
      ms: Math.round(performance.now() - started),
    };
  }
  throw new Error(`Too many redirects (>${MAX_REDIRECTS}) starting at ${rawUrl}`);
}

async function readCapped(res: Response): Promise<ArrayBuffer> {
  if (!res.body) return new ArrayBuffer(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(Math.min(total, MAX_BODY_BYTES));
  let offset = 0;
  for (const c of chunks) {
    out.set(c.subarray(0, out.length - offset), offset);
    offset += c.byteLength;
    if (offset >= out.length) break;
  }
  return out.buffer;
}
