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
