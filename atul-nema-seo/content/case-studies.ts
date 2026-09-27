/**
 * ─────────────────────────────────────────────────────────────
 *  CASE STUDIES — REPRESENTATIVE PLACEHOLDER DATA
 * ─────────────────────────────────────────────────────────────
 *  Every figure below is a representative example, not a verified
 *  client result. Replace with real, verified data (and client
 *  permission) before publishing. While `isRepresentative` is true
 *  the site labels the case study as a sample.
 */

export type Metric = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

export type Comparison = {
  label: string;
  before: number;
  after: number;
  /** Formats a raw value for display, e.g. "₹4.5L" or "#48". */
  unit?: "number" | "inr-lakh" | "position" | "percent";
  /** For rankings a lower number is better, so bars are inverted. */
  lowerIsBetter?: boolean;
};

export type CaseStudy = {
  slug: string;
  number: string;
  category: string;
  /** Short label for the home page, e.g. "Local Service Business". */
  shortClient: string;
  client: string;
  duration: string;
  isRepresentative: boolean;
  /** Headline result for the home page preview. */
  headline: string;
  challenge: string;
  strategy: string[];
  execution: { phase: string; title: string; detail: string }[];
  results: Metric[];
  chart: {
    title: string;
    caption: string;
    /** Monthly values; the chart normalizes them automatically. */
    points: number[];
    startLabel: string;
    endLabel: string;
  };
  comparisons: Comparison[];
  serviceSlugs: string[];
  contactService: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "local-seo-home-services",
    number: "01",
    category: "Local SEO",
    shortClient: "Local Service Business",
    client: "Home Services Company",
    duration: "8 months",
    isRepresentative: true,
    headline: "+214% organic enquiries in 8 months",
    challenge:
      "A well-reviewed home services company with low local visibility. Enquiries came in waves from referrals and paid ads, and the website barely appeared in Google Maps outside its own postcode.",
    strategy: [
      "Google Business Profile optimization",
      "Service-area landing pages",
      "Technical fixes",
      "Review acquisition strategy",
      "Local citations and links",
    ],
    execution: [
      {
        phase: "Month 1",
        title: "Foundations",
        detail:
          "Cleaned up the Google Business Profile, fixed duplicate listings and resolved crawl and indexing errors on the site.",
      },
      {
        phase: "Months 2–4",
        title: "Coverage",
        detail:
          "Launched service-area pages for each priority suburb, each with genuinely local proof: jobs, photos and reviews.",
      },
      {
        phase: "Months 5–8",
        title: "Authority",
        detail:
          "Built consistent citations, earned links from local associations and introduced a simple post-job review request.",
      },
    ],
    results: [
      { value: 214, prefix: "+", suffix: "%", label: "Organic enquiries" },
      { value: 126, prefix: "+", suffix: "%", label: "Google Maps actions" },
      { value: 18, label: "Priority keywords in the top three" },
    ],
    chart: {
      title: "Monthly organic enquiries",
      caption: "Representative trend over the 8-month engagement",
      points: [22, 24, 27, 33, 41, 48, 57, 63, 69],
      startLabel: "Month 0",
      endLabel: "Month 8",
    },
    comparisons: [
      { label: "Organic enquiries / month", before: 22, after: 69, unit: "number" },
      { label: "Map pack keywords in top 3", before: 3, after: 18, unit: "number" },
    ],
    serviceSlugs: ["local-seo", "technical-seo", "seo-audits"],
    contactService: "local-seo",
  },
  {
    slug: "ecommerce-seo-consumer-brand",
    number: "02",
    category: "Ecommerce SEO",
    shortClient: "Ecommerce Brand",
    client: "Consumer Ecommerce Brand",
    duration: "10 months",
    isRepresentative: true,
    headline: "+167% non-branded organic revenue",
    challenge:
      "Strong products and loyal repeat customers, but almost all organic sales came from people who already knew the brand name. Category pages were thin and faceted filters had created thousands of near-duplicate URLs.",
    strategy: [
      "Category architecture improvements",
      "Product schema",
      "Internal linking",
      "Commercial content",
      "Core Web Vitals optimization",
    ],
    execution: [
      {
        phase: "Months 1–2",
        title: "Architecture",
        detail:
          "Restructured categories around real search demand and controlled faceted URLs with canonicals and crawl rules.",
      },
      {
        phase: "Months 3–6",
        title: "Pages that sell",
        detail:
          "Rewrote category copy, added product schema and built internal links from high-authority pages to priority categories.",
      },
      {
        phase: "Months 7–10",
        title: "Speed and scale",
        detail:
          "Improved Core Web Vitals on templates and rolled the playbook out across the remaining catalogue.",
      },
    ],
    results: [
      { value: 167, prefix: "+", suffix: "%", label: "Organic revenue" },
      { value: 92, prefix: "+", suffix: "%", label: "Non-branded clicks" },
      { value: 41, suffix: "%", label: "Growth in converting landing pages" },
    ],
    chart: {
      title: "Non-branded organic revenue",
      caption: "Representative trend, indexed monthly",
      points: [100, 104, 112, 121, 138, 156, 181, 204, 229, 248, 267],
      startLabel: "Month 0",
      endLabel: "Month 10",
    },
    comparisons: [
      { label: "Monthly non-branded organic revenue", before: 4.5, after: 12, unit: "inr-lakh" },
      { label: "Converting landing pages", before: 58, after: 82, unit: "number" },
    ],
    serviceSlugs: ["ecommerce-seo", "technical-seo", "content-strategy"],
    contactService: "ecommerce-seo",
  },
  {
    slug: "b2b-seo-technology",
    number: "03",
    category: "B2B SEO",
    shortClient: "B2B Company",
    client: "B2B Technology Company",
    duration: "12 months",
    isRepresentative: true,
    headline: "From page 5 to top 3 for high-intent keywords",
    challenge:
      "High-value services with a long sales cycle and little organic visibility. The blog attracted students and job seekers, not buyers, and the product pages ranked nowhere for commercial terms.",
    strategy: [
      "Search-intent mapping",
      "Bottom-of-funnel content",
      "Comparison pages",
      "Technical cleanup",
      "Authority building",
    ],
    execution: [
      {
        phase: "Months 1–3",
        title: "Intent map",
        detail:
          "Mapped every priority keyword to a funnel stage, pruned 120 low-value posts and fixed rendering issues on product pages.",
      },
      {
        phase: "Months 4–8",
        title: "Buyer content",
        detail:
          "Published use-case, integration and comparison pages written with the sales team, each tied to a demo call to action.",
      },
      {
        phase: "Months 9–12",
        title: "Authority",
        detail:
          "Earned industry links through original data and partner content, lifting commercial pages into the top three.",
      },
    ],
    results: [
      { value: 3, suffix: "×", label: "Qualified demo requests" },
      { value: 12, label: "Top-three commercial rankings" },
      { value: 138, prefix: "+", suffix: "%", label: "Organic pipeline" },
    ],
    chart: {
      title: "Qualified demo requests from organic",
      caption: "Representative trend over 12 months",
      points: [9, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 27],
      startLabel: "Month 0",
      endLabel: "Month 12",
    },
    comparisons: [
      { label: "Avg. position, priority keywords", before: 48, after: 2.6, unit: "position", lowerIsBetter: true },
      { label: "Qualified demo requests / month", before: 9, after: 27, unit: "number" },
    ],
    serviceSlugs: ["content-strategy", "technical-seo", "seo-consulting"],
    contactService: "content-strategy",
  },
];

export const formatComparison = (value: number, unit: Comparison["unit"] = "number") => {
  switch (unit) {
    case "inr-lakh":
      return `₹${value % 1 === 0 ? value : value.toFixed(1)}L`;
    case "position":
      return `#${value % 1 === 0 ? value : value.toFixed(1)}`;
    case "percent":
      return `${value}%`;
    default:
      return value.toLocaleString("en-IN");
  }
};
