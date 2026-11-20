// Deterministic on-page SEO extraction. The model gets facts, not raw HTML,
// so its recommendations are grounded in what is actually on the page.

import * as cheerio from "cheerio";
import type { FetchResult } from "./http.js";

export type Severity = "critical" | "warning" | "info";
export interface Issue {
  severity: Severity;
  check: string;
  detail: string;
}

export interface PageReport {
  url: string;
  finalUrl: string;
  status: number;
  redirects: { url: string; status: number }[];
  responseMs: number;
  htmlKb: number;
  headers: Record<string, string | undefined>;
  lang: string | null;
  title: { text: string | null; length: number };
  metaDescription: { text: string | null; length: number };
  canonical: string | null;
  metaRobots: string | null;
  indexable: boolean;
  viewport: string | null;
  headings: { h1: string[]; outline: string[] };
  wordCount: number;
  images: { total: number; missingAlt: number; missingAltSamples: string[]; lazyLoaded: number };
  links: { internal: number; external: number; nofollow: number; internalSamples: string[] };
  structuredData: { jsonLdTypes: string[]; jsonLdErrors: number; microdata: boolean };
  social: Record<string, string>;
  hreflang: { lang: string; href: string }[];
  performanceHints: { headScripts: number; blockingHeadScripts: number; stylesheets: number; mixedContent: number };
  issues: Issue[];
  text?: string;
}

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

function collectJsonLdTypes(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) return node.forEach((n) => collectJsonLdTypes(n, out));
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") out.add(t);
    if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && out.add(x));
    if (obj["@graph"]) collectJsonLdTypes(obj["@graph"], out);
  }
}

export function analyzePage(res: FetchResult, opts: { includeText?: boolean; maxTextWords?: number } = {}): PageReport {
  const $ = cheerio.load(res.body);
  const base = new URL(res.finalUrl);
  const issues: Issue[] = [];
  const add = (severity: Severity, check: string, detail: string) => issues.push({ severity, check, detail });

  const title = clean($("head > title").first().text()) || null;
  const metaDescription = clean($('meta[name="description" i]').attr("content")) || null;
  const canonicalRaw = $('link[rel="canonical" i]').attr("href");
  const canonical = canonicalRaw ? new URL(canonicalRaw, base).toString() : null;
  const metaRobots = clean($('meta[name="robots" i]').attr("content")) || null;
  const xRobots = res.headers["x-robots-tag"];
  const noindex = /noindex/i.test(`${metaRobots ?? ""} ${xRobots ?? ""}`);
  const viewport = $('meta[name="viewport" i]').attr("content") ?? null;
  const lang = $("html").attr("lang") ?? null;

  // Headings
  const h1 = $("h1").map((_, el) => clean($(el).text())).get().filter(Boolean);
  const outline = $("h1, h2, h3")
    .map((_, el) => `${el.tagName.toUpperCase()}: ${clean($(el).text()).slice(0, 120)}`)
    .get()
    .slice(0, 60);

  // Structured data (parse before stripping scripts)
  const types = new Set<string>();
  let jsonLdErrors = 0;
  $('script[type="application/ld+json" i]').each((_, el) => {
    try {
      collectJsonLdTypes(JSON.parse($(el).text()), types);
    } catch {
      jsonLdErrors++;
    }
  });
  const microdata = $("[itemscope]").length > 0;

  // Social tags
  const social: Record<string, string> = {};
  $('meta[property^="og:"], meta[name^="twitter:"]').each((_, el) => {
    const key = $(el).attr("property") ?? $(el).attr("name");
    const val = $(el).attr("content");
    if (key && val && Object.keys(social).length < 20) social[key] = val.slice(0, 200);
  });

  const hreflang = $('link[rel="alternate" i][hreflang]')
    .map((_, el) => ({ lang: $(el).attr("hreflang") ?? "", href: $(el).attr("href") ?? "" }))
    .get()
    .slice(0, 30);

  // Performance hints from markup
  const headScripts = $("head script[src]");
  const blockingHeadScripts = headScripts.filter((_, el) => {
    const s = $(el);
    return s.attr("async") === undefined && s.attr("defer") === undefined && s.attr("type") !== "module";
  }).length;
  const stylesheets = $('link[rel="stylesheet" i]').length;
  const mixedContent =
    base.protocol === "https:"
      ? $("img[src^='http:'], script[src^='http:'], link[href^='http:'][rel='stylesheet' i], iframe[src^='http:']").length
      : 0;

  // Images
  const imgs = $("img");
  const missingAltEls = imgs.filter((_, el) => $(el).attr("alt") === undefined);
  const images = {
    total: imgs.length,
    missingAlt: missingAltEls.length,
    missingAltSamples: missingAltEls.map((_, el) => $(el).attr("src") ?? "").get().filter(Boolean).slice(0, 8),
    lazyLoaded: imgs.filter((_, el) => $(el).attr("loading") === "lazy").length,
  };

  // Links
  let internal = 0, external = 0, nofollow = 0;
  const internalSet = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")!;
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
    let u: URL;
    try {
      u = new URL(href, base);
    } catch {
      return;
    }
    if (/nofollow/i.test($(el).attr("rel") ?? "")) nofollow++;
    if (u.hostname.replace(/^www\./, "") === base.hostname.replace(/^www\./, "")) {
      internal++;
      u.hash = "";
      internalSet.add(u.toString());
    } else external++;
  });

  // Visible text
  $("script, style, noscript, template, svg").remove();
  const text = clean($("body").text());
  const words = text ? text.split(" ") : [];

  // ---- Checks ----
  if (res.status >= 400) add("critical", "http-status", `Page returns HTTP ${res.status}`);
  if (res.redirects.length > 1) add("warning", "redirect-chain", `${res.redirects.length} redirects before the final URL`);
  if (noindex) add("critical", "indexability", `Page is set to noindex (${metaRobots ?? xRobots})`);
  if (!title) add("critical", "title", "Missing <title>");
  else if (title.length < 30) add("warning", "title", `Title is short (${title.length} chars); aim for ~50–60`);
  else if (title.length > 60) add("warning", "title", `Title is ${title.length} chars and will likely be truncated (~60 max)`);
  if (!metaDescription) add("warning", "meta-description", "Missing meta description");
  else if (metaDescription.length < 70 || metaDescription.length > 160)
    add("info", "meta-description", `Meta description is ${metaDescription.length} chars; aim for ~120–155`);
  if (h1.length === 0) add("critical", "h1", "No H1 on the page");
  else if (h1.length > 1) add("info", "h1", `${h1.length} H1 tags; one clear H1 is easier to interpret`);
  if (!canonical) add("warning", "canonical", "No canonical tag");
  else if (canonical.replace(/\/$/, "") !== res.finalUrl.replace(/\/$/, ""))
    add("info", "canonical", `Canonical points elsewhere: ${canonical}`);
  if (!viewport) add("critical", "mobile", "No viewport meta tag; page is not mobile-friendly");
  if (!lang) add("info", "lang", "No lang attribute on <html>");
  if (words.length < 300) add("warning", "thin-content", `Only ~${words.length} words of visible text`);
  if (images.missingAlt > 0) add("warning", "image-alt", `${images.missingAlt} of ${images.total} images have no alt attribute`);
  if (types.size === 0 && !microdata) add("warning", "structured-data", "No structured data (JSON-LD or microdata) found");
  if (jsonLdErrors > 0) add("critical", "structured-data", `${jsonLdErrors} JSON-LD block(s) fail to parse`);
  if (!social["og:title"] || !social["og:image"]) add("info", "social", "Missing Open Graph title and/or image");
  if (mixedContent > 0) add("warning", "mixed-content", `${mixedContent} resources load over plain http on an https page`);
  if (blockingHeadScripts > 2) add("info", "render-blocking", `${blockingHeadScripts} render-blocking scripts in <head>`);
  if (res.ms > 2000) add("warning", "server-response", `Full HTML took ${res.ms} ms to download`);
  if (base.protocol !== "https:") add("critical", "https", "Final URL is not served over HTTPS");
  if (internal < 3) add("info", "internal-links", `Only ${internal} internal links on the page`);

  const maxWords = opts.maxTextWords ?? 1500;
  return {
    url: res.requestedUrl,
    finalUrl: res.finalUrl,
    status: res.status,
    redirects: res.redirects,
    responseMs: res.ms,
    htmlKb: Math.round(res.bytes / 1024),
    headers: {
      "content-type": res.headers["content-type"],
      "x-robots-tag": xRobots,
      "cache-control": res.headers["cache-control"],
      "content-encoding": res.headers["content-encoding"],
      server: res.headers["server"],
    },
    lang,
    title: { text: title, length: title?.length ?? 0 },
    metaDescription: { text: metaDescription, length: metaDescription?.length ?? 0 },
    canonical,
    metaRobots,
    indexable: !noindex && res.status < 400,
    viewport,
    headings: { h1, outline },
    wordCount: words.length,
    images,
    links: { internal, external, nofollow, internalSamples: [...internalSet].slice(0, 40) },
    structuredData: { jsonLdTypes: [...types], jsonLdErrors, microdata },
    social,
    hreflang,
    performanceHints: { headScripts: headScripts.length, blockingHeadScripts, stylesheets, mixedContent },
    issues,
    ...(opts.includeText ? { text: words.slice(0, maxWords).join(" ") + (words.length > maxWords ? " …" : "") } : {}),
  };
}

/** Pulls same-site links out of a page for the crawler. */
export function extractInternalLinks(html: string, pageUrl: string): string[] {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);
  const bare = (h: string) => h.replace(/^www\./, "");
  const out = new Set<string>();
  $("a[href]").each((_, el) => {
    try {
      const u = new URL($(el).attr("href")!, base);
      if (!/^https?:$/.test(u.protocol) || bare(u.hostname) !== bare(base.hostname)) return;
      if (/\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|mp3|docx?|xlsx?)$/i.test(u.pathname)) return;
      u.hash = "";
      out.add(u.toString());
    } catch {
      /* ignore malformed hrefs */
    }
  });
  return [...out];
}
