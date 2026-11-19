// Server-only Sarvam client. Import this from route handlers only: it reads
// SARVAM_API_KEY, which must never reach the browser.

const DEFAULT_BASE_URL = "https://api.sarvam.ai";
const TIMEOUT_MS = 30_000;

export class SarvamError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function sarvamPost<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) {
    throw new SarvamError("The studio isn't configured yet: SARVAM_API_KEY is not set.", 503);
  }
  const base = (process.env.SARVAM_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "api-subscription-key": key, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new SarvamError("Couldn't reach Sarvam. Try again in a moment.", 502);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Sarvam errors look like {"error": {"message": "...", "code": "..."}}.
    const upstream = data?.error?.message || data?.message;
    if (res.status === 401 || res.status === 403) {
      throw new SarvamError("Sarvam rejected the API key.", 502);
    }
    if (res.status === 429) {
      throw new SarvamError("Sarvam rate limit hit. Wait a few seconds and retry.", 429);
    }
    throw new SarvamError(upstream || `Sarvam returned ${res.status}.`, res.status >= 500 ? 502 : 400);
  }
  return data as T;
}

// Best-effort, per-instance rate limit so a public page can't drain the key.
// For real traffic, put the route behind auth or use a shared store (e.g. Redis).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

export function rateLimited(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof SarvamError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}
