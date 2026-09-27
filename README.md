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
| Live agent | Floating chat launcher, spring-in panel, streaming replies with typing indicator |

All animations respect the OS **reduce motion** setting via `MotionConfig`.

## Editing content

All copy lives in `lib/site.ts`: nav, services, process, stats, case studies, testimonials, email and socials.

> **Before launch:** the stats, case studies and testimonials are placeholders. Swap them for real client results.

The contact form has no backend. It opens the visitor's email client with the enquiry filled in. To collect submissions directly, point `onSubmit` in `components/Contact.tsx` at a form service or an API route.

## Live agent

A floating **Live agent** button opens a chat with Astra, an AI assistant powered by Claude. It answers questions about the agency's services and process, and points visitors to the contact form or email when they're ready to talk to a person.

**Setup:** copy `.env.example` to `.env.local` and add your `ANTHROPIC_API_KEY`. In production, set the same variable in your host's environment settings. Without a key the widget still loads, but tells visitors it's offline and offers the email address instead.

**How it works:**

- `components/LiveAgent.tsx` is the chat UI. Conversations persist for the browser tab via `sessionStorage`.
- `app/api/chat/route.ts` validates the conversation, calls Claude and streams the reply back as plain text.
- `lib/agent.ts` holds the agent's name, greeting, suggested questions, model and limits.
- `lib/agentPrompt.ts` builds the system prompt from `lib/site.ts`, so edits to services or process reach the agent automatically. It is only imported on the server.

The route caps history at 24 messages and 2,000 characters per message, and caps each reply at 2,048 tokens. It has no per-visitor rate limiting, so add one (for example at your host or with a middleware) before running paid ads to the site.

## Structure

```
app/          layout, page, global styles, favicon, api/chat route
components/   one file per section, plus shared UI primitives in ui.tsx
lib/site.ts   site content
lib/agent*.ts live agent settings and system prompt
```
