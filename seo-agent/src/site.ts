// Site-level checks: robots.txt, sitemaps, llms.txt, HTTPS/www consistency,
// a polite same-site crawler, and Google PageSpeed Insights.

import { analyzePage, extractInternalLinks, type PageReport } from "./analyze.js";
import { fetchWithRedirects, normaliseUrl } from "./http.js";

// ---------- robots.txt ----------

export interface RobotsRules {
  disallow: string[];
  allow: string[];
  sitemaps: string[];
}

/** Minimal robots.txt parser: rules for `User-agent: *` plus all Sitemap lines. */
export function parseRobots(txt: string): RobotsRules {
  const rules: RobotsRules = { disallow: [], allow: [], sitemaps: [] };
  let inStar = false;
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, key, value] = [m[0], m[1].toLowerCase(), m[2].trim()];
    if (key === "sitemap") {
      rules.sitemaps.push(value);
      continue;
    }
    if (key === "user-agent") {
      inStar = lastWasAgent ? inStar || value === "*" : value === "*";
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!inStar) continue;
    if (key === "disallow" && value) rules.disallow.push(value);
    if (key === "allow" && value) rules.allow.push(value);
  }
  return rules;
}

function ruleMatches(rule: string, path: string): boolean {
  const anchored = rule.endsWith("$");
  const pattern = rule
    .replace(/\$$/, "")
    .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${pattern}${anchored ? "$" : ""}`).test(path);
}

/** Longest matching rule wins; Allow wins ties (Google's behaviour). */
export function isAllowed(rules: RobotsRules, path: string): boolean {
  const best = (list: string[]) => Math.max(-1, ...list.filter((r) => ruleMatches(r, path)).map((r) => r.length));
  const d = best(rules.disallow);
  const a = best(rules.allow);
  return d < 0 || a >= d;
}

async function getRobots(origin: string) {
  try {
    const res = await fetchWithRedirects(`${origin}/robots.txt`, { timeoutMs: 10_000 });
    const ok = res.status === 200 && !/text\/html/i.test(res.headers["content-type"] ?? "");
    return { status: res.status, body: ok ? res.body : "", rules: parseRobots(ok ? res.body : "") };
  } catch (e) {
    return { status: 0, body: "", rules: parseRobots(""), error: (e as Error).message };
  }
}

// ---------- sitemap ----------

async function inspectSitemap(url: string) {
  try {
    const res = await fetchWithRedirects(url, { timeoutMs: 15_000 });
    const locs = [...res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
    const isIndex = /<sitemapindex/i.test(res.body);
    return {
      url,
      status: res.status,
      type: isIndex ? "sitemap index" : "urlset",
      entries: locs.length,
      withLastmod: (res.body.match(/<lastmod>/gi) ?? []).length,
      samples: locs.slice(0, 10),
    };
  } catch (e) {
    return { url, status: 0, error: (e as Error).message };
  }
}

// ---------- site files ----------

export async function checkSiteFiles(input: string) {
  const start = new URL(normaliseUrl(input));
  const origin = start.origin;
  const robots = await getRobots(origin);

  const sitemapUrls = robots.rules.sitemaps.length ? robots.rules.sitemaps.slice(0, 3) : [`${origin}/sitemap.xml`];
  const sitemaps = await Promise.all(sitemapUrls.map(inspectSitemap));

  const probe = async (u: string) => {
    try {
      const r = await fetchWithRedirects(u, { timeoutMs: 10_000 });
      return { from: u, to: r.finalUrl, status: r.status, hops: r.redirects.length };
    } catch (e) {
      return { from: u, error: (e as Error).message };
    }
  };
  const bareHost = start.hostname.replace(/^www\./, "");
  const variants = await Promise.all([
    probe(`http://${bareHost}/`),
    probe(`http://www.${bareHost}/`),
    probe(`https://${bareHost}/`),
    probe(`https://www.${bareHost}/`),
  ]);
  const finals = new Set(variants.map((v) => ("to" in v ? v.to : null)).filter(Boolean));

  let llmsTxt: { status: number; preview?: string } | { error: string };
  try {
    const r = await fetchWithRedirects(`${origin}/llms.txt`, { timeoutMs: 10_000 });
    llmsTxt = { status: r.status, preview: r.status === 200 ? r.body.slice(0, 500) : undefined };
  } catch (e) {
    llmsTxt = { error: (e as Error).message };
  }

  const blocksEverything = robots.rules.disallow.includes("/") && !robots.rules.allow.length;
  return {
    origin,
    robotsTxt: {
      status: robots.status,
      disallowForAllAgents: robots.rules.disallow,
      allowForAllAgents: robots.rules.allow,
      sitemapsDeclared: robots.rules.sitemaps,
      blocksEverything,
      aiCrawlerMentions: (robots.body.match(/user-agent:\s*(GPTBot|ClaudeBot|Claude-Web|PerplexityBot|Google-Extended|CCBot|anthropic-ai)/gi) ?? []).slice(0, 10),
      raw: robots.body.slice(0, 2000),
    },
    sitemaps,
    hostVariants: variants,
    canonicalHostConsistent: finals.size === 1,
    llmsTxt,
  };
}

// ---------- crawler ----------

export interface CrawlRow {
  url: string;
  status: number;
  title: string | null;
  titleLen: number;
  descLen: number;
  h1: number;
  words: number;
  indexable: boolean;
  canonicalSelf: boolean;
  ms: number;
  issues: string[];
}

export async function crawlSite(input: string, maxPages = 25, concurrency = 4) {
  const start = new URL(normaliseUrl(input));
  const robots = await getRobots(start.origin);
  const queue: string[] = [start.toString()];
  const seen = new Set(queue);
  const rows: CrawlRow[] = [];
  const errors: { url: string; error: string }[] = [];
  const skippedByRobots: string[] = [];
  const reports: PageReport[] = [];

  const worker = async () => {
    while (queue.length && rows.length + errors.length < maxPages) {
      const url = queue.shift()!;
      if (!isAllowed(robots.rules, new URL(url).pathname)) {
        skippedByRobots.push(url);
        continue;
      }
      try {
        const res = await fetchWithRedirects(url);
        if (!/html/i.test(res.headers["content-type"] ?? "html")) continue;
        const r = analyzePage(res);
        reports.push(r);
        rows.push({
          url,
          status: r.status,
          title: r.title.text,
          titleLen: r.title.length,
          descLen: r.metaDescription.length,
          h1: r.headings.h1.length,
          words: r.wordCount,
          indexable: r.indexable,
          canonicalSelf: !r.canonical || r.canonical.replace(/\/$/, "") === r.finalUrl.replace(/\/$/, ""),
          ms: r.responseMs,
          issues: r.issues.filter((i) => i.severity !== "info").map((i) => i.check),
        });
        for (const link of extractInternalLinks(res.body, res.finalUrl)) {
          if (!seen.has(link) && seen.size < maxPages * 6) {
            seen.add(link);
            queue.push(link);
          }
        }
      } catch (e) {
        errors.push({ url, error: (e as Error).message });
      }
      await new Promise((r) => setTimeout(r, 150)); // be polite
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));

  const dupes = (key: (r: PageReport) => string | null) => {
    const map = new Map<string, string[]>();
    for (const r of reports) {
      const k = key(r);
      if (k) map.set(k, [...(map.get(k) ?? []), r.finalUrl]);
    }
    return [...map.entries()].filter(([, urls]) => urls.length > 1).map(([value, urls]) => ({ value, urls }));
  };

  const issueCounts: Record<string, number> = {};
  for (const r of reports) for (const i of r.issues) issueCounts[`${i.severity}:${i.check}`] = (issueCounts[`${i.severity}:${i.check}`] ?? 0) + 1;

  return {
    start: start.toString(),
    pagesCrawled: rows.length,
    discoveredNotCrawled: Math.max(0, seen.size - rows.length - errors.length - skippedByRobots.length),
    issueCounts,
    duplicateTitles: dupes((r) => r.title.text),
    duplicateDescriptions: dupes((r) => r.metaDescription.text),
    brokenPages: rows.filter((r) => r.status >= 400).map((r) => ({ url: r.url, status: r.status })),
    nonIndexable: rows.filter((r) => !r.indexable).map((r) => r.url),
    skippedByRobots: skippedByRobots.slice(0, 20),
    fetchErrors: errors.slice(0, 20),
    pages: rows,
  };
}

// ---------- PageSpeed Insights ----------

export async function pageSpeed(input: string, strategy: "mobile" | "desktop") {
  const target = normaliseUrl(input);
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", target);
  api.searchParams.set("strategy", strategy);
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) api.searchParams.append("category", c);
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY);

  const res = await fetch(api, { signal: AbortSignal.timeout(90_000) });
  if (!res.ok) {
    const msg = (await res.text()).slice(0, 400);
    throw new Error(`PageSpeed Insights returned HTTP ${res.status}: ${msg}`);
  }
  const data = (await res.json()) as any;
  const lh = data.lighthouseResult ?? {};
  const audits = lh.audits ?? {};
  const score = (k: string) => (lh.categories?.[k]?.score != null ? Math.round(lh.categories[k].score * 100) : null);
  const metric = (k: string) => audits[k]?.displayValue ?? null;
  const field = (src: any) =>
    src?.metrics
      ? Object.fromEntries(
          Object.entries(src.metrics).map(([k, v]: [string, any]) => [k, { p75: v.percentile, rating: v.category }]),
        )
      : null;

  const opportunities = Object.values(audits as Record<string, any>)
    .filter((a) => a.details?.type === "opportunity" && (a.score ?? 1) < 0.9)
    .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
    .slice(0, 8)
    .map((a) => ({ title: a.title, savings: a.displayValue ?? null }));

  return {
    url: target,
    strategy,
    scores: { performance: score("performance"), seo: score("seo"), accessibility: score("accessibility"), bestPractices: score("best-practices") },
    labMetrics: {
      LCP: metric("largest-contentful-paint"),
      CLS: metric("cumulative-layout-shift"),
      TBT: metric("total-blocking-time"),
      FCP: metric("first-contentful-paint"),
      SpeedIndex: metric("speed-index"),
    },
    fieldData: { page: field(data.loadingExperience), origin: field(data.originLoadingExperience) },
    opportunities,
  };
}
