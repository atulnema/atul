# Alphastrix SEO Agent

An internal command-line agent for client SEO work. Give it a URL, a keyword or a set of competitors and it does the legwork: crawls the site, inspects pages, checks robots.txt and sitemaps, pulls Core Web Vitals from Google, researches the search results, and writes a client-ready Markdown report.

It runs on Claude (Opus 5.5) using the Anthropic TypeScript SDK. Claude decides which checks to run and in what order. The checks themselves are plain code in this folder, so every finding is backed by real data from the site.

## What it can do

| Command | What you get |
| --- | --- |
| `audit <url>` | Technical and on-page audit with a health score, a prioritised fix list, rewritten titles and meta descriptions, an AI-search readiness check and a 30-day plan |
| `keywords <url or topic>` | Keyword map grouped by cluster and intent, quick wins, content gaps and 10 article ideas |
| `write "<keyword>"` | A publish-ready article or page, researched against the current top results, with SEO title, meta description, FAQ section, internal-link suggestions and JSON-LD schema |
| `compare <your-url> <competitor...>` | A scorecard against each competitor, what they do better, keyword gaps and an action plan |
| `ask "<anything>"` | Free-form SEO task using the same tools |

## Setup

You need Node.js 22 or newer and an Anthropic API key from [platform.claude.com](https://platform.claude.com).

```bash
cd seo-agent
npm install
export ANTHROPIC_API_KEY=sk-ant-...        # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
export PAGESPEED_API_KEY=...               # optional, see below
```

## Usage

```bash
# Full audit of a client site (crawls 25 pages by default)
npm run seo -- audit clientsite.com
npm run seo -- audit https://clientsite.com --pages 50
npm run seo -- audit clientsite.com --no-speed          # skip PageSpeed, faster

# Keyword research
npm run seo -- keywords clientsite.com --market "Indore, India"
npm run seo -- keywords "dental implants" --market "Mumbai" --count 60

# Content writing
npm run seo -- write "seo agency in indore" --type "service page" --words 1200
npm run seo -- write "how to rank on google maps" --brief "Audience: local shop owners. Mention our free audit."
npm run seo -- write "digital marketing services" --url https://clientsite.com/services   # rewrite an existing page

# Competitor comparison
npm run seo -- compare clientsite.com competitor-one.com competitor-two.com

# Anything else
npm run seo -- ask "Which pages on clientsite.com are missing schema, and write the JSON-LD for each"
```

Reports stream to the terminal as they're written and are saved to `seo-agent/reports/`. That folder is git-ignored so client reports stay on your machine.

### Options

| Flag | Default | Notes |
| --- | --- | --- |
| `--out <dir>` | `./reports` | Where reports are saved |
| `--effort <level>` | `high` | `low`, `medium`, `high`, `xhigh` or `max`. Lower is faster and cheaper; `high` is the right default for client work |
| `--model <id>` | `claude-opus-5-5` | Any current Claude model ID |
| `--quiet` | off | Don't stream the report to the terminal |

## Cost and speed

At the end of each run the agent prints the time taken, tokens used and an estimated cost, so you can see what each job type costs before you price it into client work. Cost scales mainly with how much the agent reads: a competitor comparison across three sites reads far more than a single-site audit. Use `--effort medium` or fewer `--pages` for quick internal checks.

## How it works

```
src/
  cli.ts       commands and flags, saves the report
  agent.ts     the agent loop (Anthropic SDK tool runner), streaming, usage and cost
  prompts.ts   system prompt and the brief for each command
  tools.ts     the tools Claude can call
  analyze.ts   on-page SEO extraction from HTML
  site.ts      crawler, robots.txt, sitemaps, host checks, PageSpeed Insights
  http.ts      fetching with redirect tracking and a private-network guard
test/          tool tests against a local fixture site (no API key needed)
```

The tools Claude can call:

- **audit_page**: fetches one page and returns its title, meta description, canonical, indexability, headings, word count, image alt text, links, structured data, Open Graph tags, hreflang, render-blocking hints and a list of detected issues. Can also return the page text for content work.
- **crawl_site**: crawls up to 100 same-site pages, respecting robots.txt, and returns per-page stats plus duplicate titles and descriptions, broken pages and non-indexable pages.
- **check_site_files**: robots.txt rules (including rules for AI crawlers), sitemaps, http/https and www consistency, and llms.txt.
- **page_speed**: Google PageSpeed Insights scores, lab metrics and real-user Core Web Vitals.
- **web_search**: Anthropic's hosted web search, used for keyword, search-result and competitor research.

A few behaviours worth knowing:

- The agent has no keyword-volume or backlink database. It estimates demand and difficulty from what it sees in search results and labels those estimates clearly. Verify in a keyword tool before committing budget.
- Text from websites is treated as data, not instructions, and the fetcher refuses private or internal addresses so a malicious page can't point it at your network. To audit a staging site on your LAN, set `SEO_AGENT_ALLOW_PRIVATE=1`.
- If Claude declines a request for policy reasons, the API automatically retries on a fallback model, and the run summary says which model served it.
- **PageSpeed API key**: PageSpeed Insights works without a key but is rate-limited. A free key from Google Cloud (enable "PageSpeed Insights API") removes that limit.

## Development

```bash
npm test            # tool tests against a local fixture site
npm run typecheck
```

To change how reports read, edit `src/prompts.ts`. To add a check, add it in `src/analyze.ts` (per page) or `src/site.ts` (per site) and it flows through to the agent automatically. To add a new tool, define it in `src/tools.ts`.
