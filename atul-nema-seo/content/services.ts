import type { IconName } from "@/components/ui/Icon";

export type Service = {
  slug: string;
  /** Short name used in navigation, the footer and the home page. */
  name: string;
  /** Full heading on the Services page. */
  title: string;
  icon: IconName;
  /** One-liner for the home page preview. */
  summary: string;
  /** Value-focused description for the Services page. */
  description: string;
  deliverables: string[];
  idealFor: string;
  outcome: string;
  cta: string;
};

export const services: Service[] = [
  {
    slug: "seo-audits",
    name: "SEO Audit",
    title: "SEO Audits",
    icon: "audit",
    summary:
      "A forensic look at your site’s technical health, content and competition, turned into a plan you can act on.",
    description:
      "Most websites don’t have one big SEO problem. They have forty small ones, and nobody knows which to fix first. An audit finds what is actually holding you back and ranks every fix by impact and effort, so your team spends time where it moves the needle.",
    deliverables: [
      "Technical health assessment",
      "Indexing and crawl analysis",
      "Keyword and content gap analysis",
      "Competitor review",
      "Prioritized action plan",
    ],
    idealFor:
      "Businesses whose traffic has plateaued or dropped, teams planning a redesign or migration, and anyone who wants an honest outside view before investing further.",
    outcome:
      "A clear, ranked roadmap with the reasoning behind every recommendation, plus a walkthrough call so nothing gets lost in a PDF.",
    cta: "Request an SEO Audit",
  },
  {
    slug: "technical-seo",
    name: "Technical SEO",
    title: "Technical SEO",
    icon: "technical",
    summary:
      "Fix the foundations: crawlability, speed, structure and schema, so search engines can understand every page you publish.",
    description:
      "Great content can’t rank if Google can’t crawl it, render it or tell which version matters. Technical SEO removes that friction. I work directly with your developers to fix the plumbing and keep it fixed.",
    deliverables: [
      "Site architecture",
      "Core Web Vitals",
      "Crawlability",
      "Schema markup",
      "Redirects and canonicalization",
      "JavaScript SEO",
      "Mobile optimization",
    ],
    idealFor:
      "Growing sites with thousands of URLs, JavaScript-heavy builds, recent migrations, and businesses whose pages are indexed slowly or not at all.",
    outcome:
      "Faster, cleaner pages that get discovered sooner, indexed correctly and given a fair chance to rank.",
    cta: "Discuss Technical SEO",
  },
  {
    slug: "local-seo",
    name: "Local SEO",
    title: "Local SEO",
    icon: "local",
    summary:
      "Win the map pack and the “near me” searches that bring customers to your door, phone and inbox.",
    description:
      "For local businesses, the most valuable searches happen within a few kilometres of you. Local SEO makes sure you show up in Google Maps and local results with the proof customers need to choose you over the business next door.",
    deliverables: [
      "Google Business Profile optimization",
      "Local keyword strategy",
      "Location pages",
      "Citation management",
      "Review strategy",
      "Local link building",
    ],
    idealFor:
      "Clinics, home services, restaurants, law firms, real estate, multi-location brands and any business that serves a defined area.",
    outcome:
      "More calls, direction requests and enquiries from people ready to buy in the areas you actually serve.",
    cta: "Grow Local Visibility",
  },
  {
    slug: "content-strategy",
    name: "Content Strategy",
    title: "Content Strategy",
    icon: "content",
    summary:
      "Map what your buyers search for, then publish the pages that answer them better than anyone else.",
    description:
      "Publishing more isn’t a strategy. I map real search demand to your buyer’s journey, decide which topics deserve a page, and give your writers briefs detailed enough to rank on the first attempt.",
    deliverables: [
      "Keyword research",
      "Search intent mapping",
      "Topic clusters",
      "Content briefs",
      "On-page optimization",
      "Content refreshes",
    ],
    idealFor:
      "Startups, B2B and service businesses building authority, and teams that publish regularly but see little return from it.",
    outcome:
      "A content engine that compounds, with pages that attract qualified visitors and move them closer to a conversation.",
    cta: "Plan Your Content",
  },
  {
    slug: "ecommerce-seo",
    name: "Ecommerce SEO",
    title: "Ecommerce SEO",
    icon: "ecommerce",
    summary:
      "Turn category and product pages into your most profitable sales channel, without paying for every click.",
    description:
      "Ecommerce SEO lives or dies on architecture. I help stores structure categories, tame faceted navigation and strengthen product pages so the right searches land on the pages that sell.",
    deliverables: [
      "Category and product-page optimization",
      "Faceted navigation",
      "Internal linking",
      "Product schema",
      "Merchant search visibility",
      "Organic revenue tracking",
    ],
    idealFor:
      "Shopify, WooCommerce and custom stores, D2C brands, and marketplaces that rely too heavily on paid acquisition.",
    outcome:
      "More non-branded organic sessions reaching category and product pages, and revenue you can attribute to search.",
    cta: "Grow Organic Revenue",
  },
  {
    slug: "seo-consulting",
    name: "SEO Consulting",
    title: "SEO Consulting",
    icon: "consulting",
    summary:
      "Senior SEO thinking on call for in-house teams who need direction, review and a second pair of eyes.",
    description:
      "You have the people. You need someone who has seen the patterns before. Consulting gives your team a clear roadmap, faster decisions and fewer expensive mistakes, without hiring a full-time SEO lead.",
    deliverables: [
      "Monthly strategy calls",
      "Team training",
      "Roadmap guidance",
      "Reporting and measurement",
      "Collaboration with developers and writers",
    ],
    idealFor:
      "Marketing teams, founders and agencies who execute in-house but want an experienced strategist steering the work.",
    outcome:
      "A team that makes better SEO decisions independently, with priorities everyone understands.",
    cta: "Book a Strategy Call",
  },
];

/** The five services previewed on the home page and listed in the footer. */
export const featuredServiceSlugs = [
  "seo-audits",
  "technical-seo",
  "local-seo",
  "content-strategy",
  "ecommerce-seo",
];

export const featuredServices = featuredServiceSlugs
  .map((slug) => services.find((s) => s.slug === slug))
  .filter((s): s is Service => Boolean(s));

export const getService = (slug: string) => services.find((s) => s.slug === slug);

/** Options for the "Services required" field on the contact form. */
export const contactServiceOptions = [
  { value: "seo-audits", label: "SEO Audit" },
  { value: "technical-seo", label: "Technical SEO" },
  { value: "local-seo", label: "Local SEO" },
  { value: "content-strategy", label: "Content Strategy" },
  { value: "ecommerce-seo", label: "Ecommerce SEO" },
  { value: "monthly-seo", label: "Monthly SEO" },
  { value: "not-sure", label: "Not Sure Yet" },
];

export type EngagementModel = {
  name: string;
  kicker: string;
  summary: string;
  bestFor: string;
  includes: string[];
  timeline: string;
  commitment: string;
  reporting: string;
  /** Leave as null to show "Request a Proposal". Add a string like "From ₹40,000" to show a price. */
  price: string | null;
  /** Pre-selects this option on the contact form. */
  contactService?: string;
  featured?: boolean;
};

/**
 * Engagement models on the Services page. Prices are intentionally hidden;
 * set `price` on any model to display one.
 */
export const engagementModels: EngagementModel[] = [
  {
    name: "SEO Audit",
    kicker: "One-time project",
    summary: "Find out exactly what is holding your site back and what to fix first.",
    bestFor: "A clear diagnosis before you commit to ongoing work",
    includes: [
      "Full technical, content and competitor audit",
      "Prioritized action plan",
      "Walkthrough call with your team",
      "30 days of follow-up questions",
    ],
    timeline: "2–4 weeks",
    commitment: "One-time",
    reporting: "Audit report and roadmap",
    price: null,
    contactService: "seo-audits",
  },
  {
    name: "Monthly SEO Growth",
    kicker: "Ongoing partnership",
    summary: "Strategy and hands-on execution, month after month, focused on revenue.",
    bestFor: "Businesses ready to make organic search a core growth channel",
    includes: [
      "Quarterly roadmap and monthly sprints",
      "Technical fixes and on-page optimization",
      "Content planning, briefs and refreshes",
      "Authority and local visibility building",
    ],
    timeline: "Results build over 4–12 months",
    commitment: "Minimum 6 months",
    reporting: "Monthly report and review call",
    price: null,
    contactService: "monthly-seo",
    featured: true,
  },
  {
    name: "SEO Consulting",
    kicker: "Advisory retainer",
    summary: "Senior guidance for in-house teams who handle the execution themselves.",
    bestFor: "Teams with capacity to implement who need direction",
    includes: [
      "Monthly strategy calls",
      "Roadmap and priority reviews",
      "Team training sessions",
      "Async support for developers and writers",
    ],
    timeline: "Flexible",
    commitment: "Month to month",
    reporting: "Shared KPI dashboard",
    price: null,
  },
];
