// Tools the agent can call. Each runs locally and returns compact JSON.
// Failures come back as a JSON error so the agent can adapt instead of crashing.

import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { analyzePage } from "./analyze.js";
import { fetchWithRedirects } from "./http.js";
import { checkSiteFiles, crawlSite, pageSpeed } from "./site.js";

export type ToolLogger = (name: string, detail: string) => void;

const safe = async (fn: () => Promise<unknown>) => {
  try {
    return JSON.stringify(await fn());
  } catch (e) {
    return JSON.stringify({ error: (e as Error).message });
  }
};

export function buildTools(log: ToolLogger) {
  const auditPage = betaZodTool({
    name: "audit_page",
    description:
      "Fetch one URL and return its on-page SEO facts: status, redirects, response time, title, meta description, canonical, robots/indexability, headings outline, word count, images and alt text, internal/external links, structured data types, Open Graph tags, hreflang, render-blocking hints, and a list of detected issues. " +
      "Set include_text to true to also get the page's visible body text (for content analysis, competitor comparison, or rewriting). " +
      "Use this for any single page you need to inspect, including competitor and SERP-result pages.",
    inputSchema: z.object({
      url: z.string().describe("Full URL or bare domain, e.g. https://example.com/services or example.com"),
      include_text: z.boolean().optional().describe("Include the visible body text (first ~1500 words). Default false."),
    }),
    run: async ({ url, include_text }) => {
      log("audit_page", url);
      return safe(async () => analyzePage(await fetchWithRedirects(url), { includeText: include_text }));
    },
  });

  const crawl = betaZodTool({
    name: "crawl_site",
    description:
      "Crawl a website from a start URL, following same-site links and respecting robots.txt, and return a per-page summary table plus site-wide findings: duplicate titles and descriptions, broken pages, non-indexable pages, and issue counts. " +
      "Use this for site audits before drilling into individual pages with audit_page.",
    inputSchema: z.object({
      url: z.string().describe("Start URL or domain"),
      max_pages: z.number().int().min(1).max(100).optional().describe("Maximum pages to crawl (default 25, max 100)"),
    }),
    run: async ({ url, max_pages }) => {
      log("crawl_site", `${url} (up to ${max_pages ?? 25} pages)`);
      return safe(() => crawlSite(url, max_pages ?? 25));
    },
  });

  const siteFiles = betaZodTool({
    name: "check_site_files",
    description:
      "Check a domain's crawl and indexing setup: robots.txt rules (including AI crawler rules), declared and default XML sitemaps with entry counts, whether http/https and www/non-www variants all redirect to one canonical host, and whether an llms.txt file exists.",
    inputSchema: z.object({ url: z.string().describe("Any URL or bare domain on the site") }),
    run: async ({ url }) => {
      log("check_site_files", url);
      return safe(() => checkSiteFiles(url));
    },
  });

  const speed = betaZodTool({
    name: "page_speed",
    description:
      "Run Google PageSpeed Insights (Lighthouse) for a URL. Returns performance/SEO/accessibility/best-practice scores, lab metrics (LCP, CLS, TBT), real-user Core Web Vitals field data (LCP, INP, CLS) when Google has it, and the top improvement opportunities. Takes 20–60 seconds. Use mobile unless desktop is specifically relevant.",
    inputSchema: z.object({
      url: z.string(),
      strategy: z.enum(["mobile", "desktop"]).optional().describe("Default mobile"),
    }),
    run: async ({ url, strategy }) => {
      log("page_speed", `${url} (${strategy ?? "mobile"})`);
      return safe(() => pageSpeed(url, strategy ?? "mobile"));
    },
  });

  return [auditPage, crawl, siteFiles, speed];
}

/** Anthropic-hosted web search, used for keyword, SERP and competitor research. */
export const webSearchTool = {
  type: "web_search_20260209" as const,
  name: "web_search" as const,
  max_uses: 20,
};
