# Atul Nema SEO

The website for **Atul Nema SEO**, an independent SEO consultant based in India. Five pages (Home, Services, Results, About, Contact), built to turn visitors into free SEO audit requests.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lenis · Lucide React

---

## Quick start

```bash
cd atul-nema-seo
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages are static)
npm run start      # serve the production build
npm run typecheck  # TypeScript check
```

Requires Node.js 20.9 or newer.

---

## Where to edit things

| What | File |
| --- | --- |
| Email, phone, WhatsApp, location, Calendly, socials, domain, form endpoints | `config/site.ts` |
| Home statistics, process steps, testimonials, marquee words | `content/home.ts` |
| Services, deliverables, engagement models | `content/services.ts` |
| Case studies and chart data | `content/case-studies.ts` |
| FAQs (Services and Contact pages) | `content/faqs.ts` |
| About page copy, values, tools, industries | `content/about.ts` |
| Colors, fonts, type scale | `tailwind.config.ts`, `app/layout.tsx` |

Every page reads from these files, so you rarely need to touch components to change copy.

---

## Before you publish: replace the placeholders

The site is complete, but some content is sample material and is labelled that way on the page. Work through this list before launch:

1. **Portrait.** Add a photo to `public/images/` and set `person.portrait` in `config/site.ts` (for example `"/images/atul-nema.jpg"`). Until then a designed placeholder shows on the About page.
2. **Testimonials.** Replace the three quotes in `content/home.ts` with real client testimonials (with permission) and set `isPlaceholder: false`. That removes the "Sample testimonial" label.
3. **Case studies.** Replace the figures in `content/case-studies.ts` with verified client data and set `isRepresentative: false`. Also remove the representative-data notices on the Results page (`app/results/page.tsx`) and the home page (`components/home/FeaturedResults.tsx`).
4. **Statistics.** The home page numbers (150% traffic growth, 3× leads, 50+ projects, 7+ years) live in `content/home.ts`. Keep them only if you can back them up.
5. **Social links.** Replace `"#"` with your LinkedIn, X and Instagram URLs in `config/site.ts`. Real URLs are also added to the Person and ProfessionalService schema automatically.
6. **Booking link.** Set `contact.calendly` to your Calendly or Cal.com URL. Until then, "Book a Call" opens an email.
7. **Domain.** Set `NEXT_PUBLIC_SITE_URL` (or the fallback in `config/site.ts`) so canonical URLs, the sitemap and schema point to the right place.
8. **Forms.** Connect the contact form and newsletter (see below).
9. **Legal pages.** `app/privacy-policy` and `app/terms` hold sensible starter text. Have them reviewed.

---

## Connecting the contact form

The contact form validates every field, shows inline errors plus an error summary, and has loading, success and failure states.

**It never pretends to send.** With no endpoint configured it runs in *demo mode*: after validation it tells the visitor plainly that nothing was sent, and offers a pre-filled email and WhatsApp message instead.

To go live, set an endpoint that accepts a JSON `POST`:

```bash
# .env.local (or your hosting provider's environment settings)
NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/your-form-id
NEXT_PUBLIC_NEWSLETTER_ENDPOINT=https://your-newsletter-endpoint
```

The request body looks like this:

```json
{
  "name": "…", "email": "…", "phone": "…", "company": "…", "website": "…",
  "goal": "…", "budget": "…", "services": ["Local SEO"], "message": "…",
  "consent": true, "source": "contact-page", "submittedAt": "2026-09-27T10:00:00.000Z"
}
```

Any 2xx response shows the success message; anything else shows the retry state. The submit logic is in `components/contact/ContactForm.tsx` (look for `FORM BACKEND`). A hidden honeypot field filters basic spam bots.

**Prefer your own backend?** Create `app/api/contact/route.ts`, send the email with a provider such as Resend or Postmark, and set the endpoint to `/api/contact`.

Links across the site pre-select a service on the form, for example `/contact?service=local-seo#contact-form`.

---

## Motion

Motion is part of the brand here, so every effect has a job and none of them block usability.

| Effect | Where | How |
| --- | --- | --- |
| Line-mask headline reveals | Every hero | CSS keyframes with an ink curtain (starts on first paint) |
| Split-text / line reveals on scroll | Section headings | Framer Motion `whileInView` |
| Staggered entrances | Lists, grids, cards | Framer Motion variants |
| Clip-mask reveals | Case study cards, charts, portrait | Framer Motion `clipPath` |
| Animated statistics | Stats band, case study results | Framer Motion `animate()` count-up |
| Animated chart lines | Hero, results, case studies | CSS `clip-path` polygons revealed left to right |
| Hero visual | Home | Orbiting keywords, tilted comet "flight paths", rank counter, pointer parallax |
| Scroll parallax | Home hero, page watermarks, portrait | `useScroll` + `useTransform` |
| Velocity marquee | Home, About | Drifts on its own and speeds up / reverses with scroll |
| Scroll-drawn process line | Home | `useScroll` + spring |
| Page transitions | All navigations after first load | Curtain wipe and content rise (`app/template.tsx`) |
| Custom cursor | Desktop only | Spring-follow ring that grows over links |
| Smooth scrolling | Desktop only | Lenis, loaded on demand |
| Button and row hovers | Everywhere | Rising fills, sliding arrows, rolling nav labels (CSS) |

**Accessibility and performance rules:**

- `prefers-reduced-motion` is respected everywhere: Framer Motion via `MotionConfig reducedMotion="user"`, CSS via a global media query, and parallax, cursor, clip reveals and Lenis switch off entirely.
- Parallax, pointer effects, the custom cursor and Lenis only run on large screens with a fine pointer. Phones and tablets get native scrolling and lighter motion.
- Hero entrances are CSS keyframes rather than Framer Motion, so the headline appears on first paint instead of waiting for JavaScript. This is deliberate: it keeps LCP fast.
- Framer Motion loads through `LazyMotion`, so its animation features arrive in a separate chunk.
- Only `transform`, `opacity` and `clip-path` are animated (GPU-friendly), and the first page load has no transition overlay.

---

## SEO

- A unique title, meta description, canonical URL, Open Graph and X/Twitter tags on every page (`lib/seo.ts → createMetadata`).
- Structured data:
  - `WebSite`, `Person` and `ProfessionalService` sitewide
  - `Service` × 6 and `FAQPage` on Services
  - `FAQPage` on Contact
  - `BreadcrumbList` on every inner page
- Visible breadcrumbs on inner pages, one `h1` per page and a logical heading order.
- `sitemap.xml` and `robots.txt` are generated from `app/sitemap.ts` and `app/robots.ts`.
- The Open Graph image and favicon are generated at build time (`app/opengraph-image.tsx`, `app/icon.tsx`).
- FAQ answers stay in the HTML even when collapsed, so they're crawlable.

After launch: verify the domain in Google Search Console, submit `/sitemap.xml`, and check the schema with Google's Rich Results Test.

---

## Accessibility

- A skip link, semantic landmarks, labelled navigation regions and `aria-current` on the active page.
- The mobile menu is a real dialog: focus moves in, Tab is trapped, Escape closes it and focus returns to the menu button.
- Visible lime focus rings everywhere, and touch targets of at least 44px.
- Form fields have real labels, required/optional text (not just color), `aria-invalid`, described-by errors, and an error summary that takes focus.
- Text contrast meets WCAG AA. The lowest pair is the faint label color at 4.5:1; body text is 7.6:1 or higher.
- Charts carry text alternatives and every before/after value is printed as text.

---

## Performance

All pages are statically prerendered. Measured with Lighthouse 12 against `next start` on localhost:

| Page | Mobile (simulated 4G) | Desktop |
| --- | --- | --- |
| Home | 89–91 perf · 100 a11y · 100 best practices · 100 SEO | 100 · 100 · 100 · 100 |
| Services | 93 · 100 · 100 · 100 | — |
| Results | 95 · 100 · 100 · 100 | — |
| About | 93 · 100 · 100 · 100 | — |
| Contact | 91 · 100 · 100 · 100 | — |

Cumulative Layout Shift is 0 on every page. On a CDN such as Vercel, expect mobile scores to be equal or better.

Fonts are self-hosted through `next/font` (Anton, Inter Tight and JetBrains Mono). There are no autoplay videos or third-party scripts. Charts and decorative visuals are pure CSS, with no image or SVG downloads.

---

## Deployment

### Vercel (recommended)

1. Import the repository in Vercel.
2. Set **Root Directory** to `atul-nema-seo`.
3. Add the environment variables from `.env.example`.
4. Deploy. Next.js is detected automatically.

### Netlify or any Node host

- Build command: `npm run build`
- Start command: `npm run start` (or use Netlify's Next.js runtime)
- Base directory: `atul-nema-seo`

---

## Project structure

```
atul-nema-seo/
├── app/                   Routes, layout, template (page transitions), sitemap, robots, OG image
│   ├── services/ results/ about/ contact/ privacy-policy/ terms/
├── components/
│   ├── layout/            Header + mobile menu, footer, newsletter, Lenis, cursor, providers
│   ├── motion/            Reveal, Stagger, ClipReveal, SplitHeading, CountUp, Parallax, Marquee, Entrance
│   ├── ui/                Button, PageHero, SectionIntro, FinalCta, Accordion, Breadcrumbs, JsonLd…
│   ├── charts/            TrendChart (CSS clip-path), ComparisonBars
│   ├── home/ services/ results/ about/ contact/
├── config/site.ts         Business details and settings (edit me first)
├── content/               All page copy and data
└── lib/                   SEO helpers, schema builders, utilities
```
