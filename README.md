# Alphastrix Digital

Marketing website for Alphastrix Digital, built with **Next.js (App Router)**, **Tailwind CSS** and **Framer Motion**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # type-check
```

## What's inside

| Section | Motion |
| --- | --- |
| Preloader | 0→100 counter, curved curtain exit |
| Navbar | Hides on scroll down, glass blur on scroll, rolling link hover, circular mobile menu reveal |
| Hero | Masked line reveal, rotating blurred keyword, pointer‑parallax glow orbs, scroll fade‑out, magnetic CTAs |
| Marquee | Infinite capabilities ticker (pauses on hover) |
| Manifesto | Scroll‑linked word‑by‑word highlight |
| Services | Staggered cards with a pointer‑tracking spotlight |
| Process | Sticky heading, scroll‑drawn timeline, steps light up in turn |
| Stats | Count‑up numbers on enter |
| Work | Pinned section that scrolls case studies horizontally |
| Testimonials | Auto‑rotating quotes with blur‑in words and progress bars |
| Contact | Chip selectors, form composes a pre‑filled email |
| Footer | Parallax wordmark |

All animations respect the OS **reduce motion** setting via `MotionConfig`.

## Editing content

All copy lives in `lib/site.ts`: nav, services, process, stats, case studies, testimonials, email and socials.

> **Before launch:** the stats, case studies and testimonials are placeholders. Swap them for real client results.

The contact form has no backend. It opens the visitor's email client with the enquiry filled in. To collect submissions directly, point `onSubmit` in `components/Contact.tsx` at a form service or an API route.

## Structure

```
app/          layout, page, global styles, favicon
components/   one file per section, plus shared UI primitives in ui.tsx
lib/site.ts   site content
```

## Indic Studio (`/studio`)

A small internal tool for checking regional campaigns. Paste copy, translate it into one of 11 Indian languages, and hear it read in a native voice. It's powered by [Sarvam AI](https://www.sarvam.ai): `mayura:v1` for translation and `bulbul:v3` for speech.

The page is `noindex` and isn't linked from the main nav.

**Setup**

```bash
cp .env.example .env.local   # then paste your key into SARVAM_API_KEY
npm run dev                  # open http://localhost:3000/studio
```

**How it fits together**

| File | Role |
| --- | --- |
| `app/studio/page.tsx`, `components/Studio.tsx` | The UI |
| `app/api/sarvam/translate/route.ts` | Server route that calls Sarvam `/translate` |
| `app/api/sarvam/speak/route.ts` | Server route that calls `/text-to-speech` and returns a WAV |
| `lib/sarvam.ts` | Server-only client: key handling, errors, timeout, rate limit |
| `lib/languages.ts` | Allowed languages, tones and voices (shared by the UI and the routes) |

The API key stays on the server. Both routes validate input against `lib/languages.ts` and cap text length.

> **Before going public:** the routes are open endpoints that spend your Sarvam credits. The built-in rate limit (20 requests/min per IP) runs per server instance only. On a serverless host, put `/studio` behind auth or use a shared rate limiter.

## Sarvam MCP for Claude Code

`.mcp.json` registers Sarvam's official MCP server ([sarvamai/sarvam-mcp](https://github.com/sarvamai/sarvam-mcp)) for this project. Claude Code can then translate, transcribe, speak and run OCR with Sarvam directly. Export your key first, and the config picks it up:

```bash
export SARVAM_API_KEY=sk_...
```

It also sets `SARVAM_MCP_ANALYTICS_URL` to a dead local address. By default, the server sends the arguments and output of every tool call (including your text) to `mcp.sarvam.ai/api/track`. That override is how you turn it off. Remove the line if you're fine with the telemetry.
