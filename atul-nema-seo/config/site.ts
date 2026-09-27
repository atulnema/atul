/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit your business details here.
 * ─────────────────────────────────────────────────────────────
 *  Everything a visitor sees about how to reach you (email, phone,
 *  WhatsApp, booking link, socials) and every SEO default (domain,
 *  locale, schema) is read from this one file.
 */

export const siteConfig = {
  name: "Atul Nema SEO",
  /** Rendered as "ATUL NEMA / SEO" in the logo. */
  logo: { primary: "Atul Nema", secondary: "SEO" },
  tagline: "Rank Higher. Grow Faster.",
  description:
    "Grow your rankings, organic traffic, and qualified leads with strategic SEO consulting from Atul Nema.",

  /**
   * Production domain, used for canonical URLs, Open Graph and schema.
   * Set NEXT_PUBLIC_SITE_URL in your hosting provider, or change the fallback.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.atulnemaseo.com").replace(/\/$/, ""),
  locale: "en_IN",
  language: "en-IN",
  twitterHandle: "@atulnemaseo",

  person: {
    name: "Atul Nema",
    jobTitle: "SEO Consultant",
    /**
     * Path to Atul's portrait inside /public, e.g. "/images/atul-nema.jpg".
     * Leave as null to show the designed placeholder on the About page.
     */
    portrait: null as string | null,
    portraitAlt: "Portrait of Atul Nema, SEO consultant",
    yearsExperience: 7,
  },

  contact: {
    email: "atulnema10389@gmail.com",
    /** Display format. */
    phone: "+91 95848 41965",
    /** Digits only, with country code — used for tel: links. */
    phoneHref: "+919584841965",
    /** Digits only, with country code, no "+" — used for wa.me links. */
    whatsapp: "919584841965",
    whatsappDisplay: "+91 95848 41965",
    whatsappMessage: "Hi Atul, I'd like to talk about SEO for my business.",
    location: "India",
    region: "India",
    countryCode: "IN",
    areaServed: ["India", "Worldwide"],
    responseTime: "Within one business day",
    workingHours: "Mon–Fri, 10:00–18:00 IST",
    /** Your Calendly (or Cal.com) booking URL. "#" means not set yet. */
    calendly: "#",
  },

  /** Replace "#" with your profile URLs. */
  socials: [
    { label: "LinkedIn", href: "#" },
    { label: "X / Twitter", href: "#" },
    { label: "Instagram", href: "#" },
  ],

  /**
   * Form endpoints. Any service that accepts a JSON POST works
   * (Formspree, Getform, Basin, a Next.js route handler, a Zapier/Make webhook…).
   * Leave empty to keep the forms in clearly labelled demo mode.
   */
  forms: {
    contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT || "",
    newsletterEndpoint: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT || "",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Results", href: "/results" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  cta: {
    primary: { label: "Book a Free SEO Audit", href: "/contact" },
    secondary: { label: "View SEO Results", href: "/results" },
    nav: { label: "Free SEO Audit", href: "/contact" },
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** True when a link in the config is still a placeholder. */
export const isPlaceholderLink = (href: string) => !href || href === "#";

export const whatsappUrl = (message: string = siteConfig.contact.whatsappMessage) =>
  `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;

/** Booking link, falling back to the contact form until a Calendly URL is set. */
export const bookingUrl = () =>
  isPlaceholderLink(siteConfig.contact.calendly) ? "/contact#contact-form" : siteConfig.contact.calendly;
