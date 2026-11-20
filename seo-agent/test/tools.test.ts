// Tests for the SEO tools against a local fixture site. No API key or internet needed.
// Run: npm test

import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { analyzePage } from "../src/analyze.js";
import { assertPublicUrl, fetchWithRedirects } from "../src/http.js";
import { checkSiteFiles, crawlSite, isAllowed, parseRobots } from "../src/site.js";

const filler = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

const GOOD = `<!doctype html><html lang="en"><head>
<title>SEO Services in Indore | Alphastrix Digital Agency</title>
<meta name="description" content="Technical audits, keyword strategy and content that ranks. Alphastrix Digital helps Indian businesses grow organic traffic that compounds.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="/">
<meta property="og:title" content="Alphastrix"><meta property="og:image" content="/og.png">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"},{"@type":"WebSite"}]}</script>
</head><body><h1>SEO that compounds</h1><h2>Services</h2>
<p>${filler(400)}</p>
<a href="/about">About</a><a href="/blog">Blog</a><a href="/private/x">Private</a><a href="/missing">Missing</a>
<a href="https://other.com/" rel="nofollow">Out</a><img src="/a.png" alt="Team"><img src="/b.png">
</body></html>`;

const THIN = (title: string) =>
  `<html><head><title>${title}</title></head><body><p>Short page</p><a href="/">Home</a></body></html>`;

const routes: Record<string, { status?: number; type?: string; body?: string; location?: string }> = {
  "/": { body: GOOD },
  "/about": { body: THIN("Untitled") },
  "/blog": { body: THIN("Untitled") },
  "/private/x": { body: THIN("Secret") },
  "/old": { status: 301, location: "/about" },
  "/robots.txt": { type: "text/plain", body: "User-agent: *\nDisallow: /private/\nSitemap: SITEMAP_URL\n" },
  "/sitemap.xml": {
    type: "application/xml",
    body: `<urlset><url><loc>http://x/</loc><lastmod>2026-01-01</lastmod></url><url><loc>http://x/about</loc></url></urlset>`,
  },
};

let server: Server;
let base: string;

before(async () => {
  process.env.SEO_AGENT_ALLOW_PRIVATE = "1";
  server = createServer((req, res) => {
    const r = routes[req.url ?? "/"];
    if (!r) {
      res.writeHead(404, { "content-type": "text/html" }).end(THIN("Not found"));
      return;
    }
    if (r.location) {
      res.writeHead(r.status ?? 301, { location: r.location }).end();
      return;
    }
    res.writeHead(r.status ?? 200, { "content-type": r.type ?? "text/html" });
    res.end((r.body ?? "").replace("SITEMAP_URL", `${base}/sitemap.xml`));
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
});

after(() => {
  server.close();
  delete process.env.SEO_AGENT_ALLOW_PRIVATE;
});

describe("analyzePage", () => {
  it("extracts on-page facts from a well-built page", async () => {
    const r = analyzePage(await fetchWithRedirects(`${base}/`), { includeText: true });
    assert.equal(r.status, 200);
    assert.equal(r.title.length, "SEO Services in Indore | Alphastrix Digital Agency".length);
    assert.deepEqual(r.headings.h1, ["SEO that compounds"]);
    assert.deepEqual(r.structuredData.jsonLdTypes.sort(), ["Organization", "WebSite"]);
    assert.equal(r.images.total, 2);
    assert.equal(r.images.missingAlt, 1);
    assert.equal(r.links.external, 1);
    assert.equal(r.links.nofollow, 1);
    assert.ok(r.wordCount > 400);
    assert.ok(r.text && r.text.startsWith("SEO that compounds"));
    const checks = r.issues.map((i) => i.check);
    assert.ok(checks.includes("image-alt"));
    assert.ok(!checks.includes("title"));
    assert.ok(!checks.includes("h1"));
  });

  it("flags a thin page with no H1, description, viewport or canonical", async () => {
    const r = analyzePage(await fetchWithRedirects(`${base}/about`));
    const checks = new Set(r.issues.map((i) => i.check));
    for (const c of ["h1", "meta-description", "mobile", "canonical", "thin-content", "title"]) {
      assert.ok(checks.has(c), `expected ${c} issue`);
    }
  });

  it("keeps words apart when a heading is split across elements with no whitespace", async () => {
    const html = `<html><body><h1><span class="block">We build</span><span class="block">brands <i>that</i></span><span>grow.</span></h1><p>One<br>Two</p></body></html>`;
    const r = analyzePage({ requestedUrl: "https://x.com/", finalUrl: "https://x.com/", status: 200, redirects: [], headers: {}, body: html, bytes: html.length, ms: 1 });
    assert.deepEqual(r.headings.h1, ["We build brands that grow."]);
    assert.equal(r.wordCount, 7);
  });

  it("follows and records redirects", async () => {
    const res = await fetchWithRedirects(`${base}/old`);
    assert.equal(res.status, 200);
    assert.equal(res.redirects.length, 1);
    assert.ok(res.finalUrl.endsWith("/about"));
  });
});

describe("robots.txt", () => {
  it("parses rules for all agents and applies longest-match", () => {
    const rules = parseRobots(
      "User-agent: Googlebot\nDisallow: /g/\n\nUser-agent: *\nDisallow: /private/\nAllow: /private/public\nDisallow: /*.pdf$\nSitemap: https://x.com/s.xml",
    );
    assert.deepEqual(rules.sitemaps, ["https://x.com/s.xml"]);
    assert.equal(isAllowed(rules, "/g/page"), true);
    assert.equal(isAllowed(rules, "/private/a"), false);
    assert.equal(isAllowed(rules, "/private/public/a"), true);
    assert.equal(isAllowed(rules, "/files/a.pdf"), false);
    assert.equal(isAllowed(rules, "/files/a.pdf?x=1"), true);
  });
});

describe("crawlSite", () => {
  it("crawls same-site pages, respects robots.txt and finds duplicates and broken pages", async () => {
    const c = await crawlSite(`${base}/`, 10, 2);
    const urls = c.pages.map((p) => new URL(p.url).pathname).sort();
    assert.deepEqual(urls, ["/", "/about", "/blog", "/missing"]);
    assert.ok(c.skippedByRobots.some((u) => u.endsWith("/private/x")));
    assert.equal(c.duplicateTitles.length, 1);
    assert.equal(c.duplicateTitles[0].value, "Untitled");
    assert.deepEqual(c.brokenPages.map((b) => new URL(b.url).pathname), ["/missing"]);
  });
});

describe("checkSiteFiles", () => {
  it("reads robots.txt and the declared sitemap", async () => {
    const s = await checkSiteFiles(`${base}/`);
    assert.equal(s.robotsTxt.status, 200);
    assert.deepEqual(s.robotsTxt.disallowForAllAgents, ["/private/"]);
    assert.equal(s.sitemaps[0].status, 200);
    assert.equal((s.sitemaps[0] as { entries: number }).entries, 2);
  });
});

describe("assertPublicUrl", () => {
  it("blocks private and non-http targets", async () => {
    delete process.env.SEO_AGENT_ALLOW_PRIVATE;
    try {
      await assert.rejects(assertPublicUrl("http://127.0.0.1/"), /private/);
      await assert.rejects(assertPublicUrl("http://169.254.169.254/latest"), /private/);
      await assert.rejects(assertPublicUrl("http://localhost:3000/"), /private/);
      await assert.rejects(assertPublicUrl("file:///etc/passwd"), /http and https/);
    } finally {
      process.env.SEO_AGENT_ALLOW_PRIVATE = "1";
    }
  });
});
