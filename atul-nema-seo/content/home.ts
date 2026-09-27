/**
 * Home page content: statistics, process and testimonials.
 */

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
};

/** Example statistics. Update these with your own verified numbers. */
export const stats: Stat[] = [
  { value: 150, suffix: "%", label: "Average Traffic Growth", note: "Across ongoing engagements" },
  { value: 3, suffix: "×", label: "More Qualified Leads", note: "Typical first-year uplift" },
  { value: 50, suffix: "+", label: "SEO Projects", note: "Audits, retainers and launches" },
  { value: 7, suffix: "+", label: "Years of Experience", note: "Hands-on, across industries" },
];

export const processSteps = [
  {
    number: "01",
    title: "Discover",
    body: "Understand the business, audience, competitors, and current performance.",
  },
  {
    number: "02",
    title: "Diagnose",
    body: "Find the technical, content, authority, and conversion opportunities.",
  },
  {
    number: "03",
    title: "Execute",
    body: "Implement a prioritized SEO roadmap focused on meaningful gains.",
  },
  {
    number: "04",
    title: "Improve",
    body: "Measure results, learn from the data, and compound growth.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  /**
   * PLACEHOLDER FLAG — these testimonials are samples written for layout.
   * Replace each one with a real client testimonial (with permission) and set
   * `isPlaceholder` to false. While true, the site labels the quote as a sample.
   */
  isPlaceholder: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Atul didn’t hand us a 90-page report and disappear. He told us the three things that mattered, helped our developer fix them, and within two quarters organic became our best source of enquiries.",
    name: "Client Name",
    role: "Founder",
    company: "Home Services Company",
    isPlaceholder: true,
  },
  {
    quote:
      "We’d tried two agencies before. The difference was clarity: every month we knew what was done, why it mattered and what came next.",
    name: "Client Name",
    role: "Head of Growth",
    company: "D2C Ecommerce Brand",
    isPlaceholder: true,
  },
  {
    quote:
      "He understands how B2B buyers search. Our comparison pages now bring in demo requests our sales team actually wants to take.",
    name: "Client Name",
    role: "Marketing Director",
    company: "B2B SaaS Company",
    isPlaceholder: true,
  },
];

export const marqueeServices = [
  "Technical SEO",
  "Local SEO",
  "Content Strategy",
  "SEO Audits",
  "Link Building",
  "Ecommerce SEO",
];
