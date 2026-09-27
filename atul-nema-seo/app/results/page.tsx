import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { caseStudies } from "@/content/case-studies";
import { createMetadata } from "@/lib/seo";
import { Entrance } from "@/components/motion/Entrance";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CaseStudy } from "@/components/results/CaseStudy";
import { FinalCta } from "@/components/ui/FinalCta";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Primitives";

export const metadata: Metadata = createMetadata({
  title: "SEO Results & Case Studies | Atul Nema SEO",
  description:
    "Representative SEO case studies across local, ecommerce and B2B: the challenge, strategy, execution and measurable growth in enquiries, revenue and pipeline.",
  path: "/results",
});

const measures = [
  { title: "Visibility", body: "Rankings and impressions for the searches that matter to your business." },
  { title: "Qualified traffic", body: "Visitors who match your customer, not just bigger numbers." },
  { title: "Leads", body: "Calls, forms, bookings and demo requests attributed to organic search." },
  { title: "Revenue", body: "Sales and pipeline, the only scoreboard that pays the bills." },
];

export default function ResultsPage() {
  return (
    <>
      <PageHero
        eyebrow="SEO Results"
        watermark="Growth"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Results", path: "/results" },
        ]}
        lines={["Work Measured", "in Growth,", { text: "Not Activity.", highlight: "Not Activity." }]}
        intro="Effective SEO isn’t measured in reports delivered or keywords tracked. It should improve visibility, bring in qualified traffic, and turn that traffic into leads and revenue."
      >
        <Entrance delay={0.45} className="lg:col-span-12">
          <p
            role="note"
            className="flex items-start gap-3 border border-lime/30 bg-lime/[0.06] p-4 text-sm leading-relaxed text-bone sm:items-center sm:p-5"
          >
            <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-lime sm:mt-0" />
            Results shown are representative examples and should be replaced with verified client data before
            publication.
          </p>
        </Entrance>
      </PageHero>

      <section aria-labelledby="measure-title" className="border-t border-bone/10 py-16 lg:py-20">
        <Container>
          <h2 id="measure-title" className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
            What success is measured by
          </h2>
          <Stagger as="ol" className="mt-8 grid border-l border-t border-bone/10 sm:grid-cols-2 lg:grid-cols-4">
            {measures.map((m, i) => (
              <StaggerItem as="li" key={m.title} className="border-b border-r border-bone/10 p-6">
                <span aria-hidden className="font-mono text-[0.66rem] text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-2xl uppercase text-bone">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <nav aria-label="Case studies on this page" className="mt-12">
            <ul className="grid gap-2 sm:grid-cols-3">
              {caseStudies.map((cs) => (
                <li key={cs.slug}>
                  <Link
                    href={`#${cs.slug}`}
                    className="group flex min-h-[56px] items-center justify-between gap-4 border border-bone/10 px-5 py-3 transition-colors hover:border-lime"
                  >
                    <span>
                      <span className="block font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">
                        {cs.number} · {cs.category}
                      </span>
                      <span className="text-bone group-hover:text-lime">{cs.client}</span>
                    </span>
                    <span aria-hidden className="text-lime transition-transform group-hover:translate-y-0.5">↓</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      {caseStudies.map((cs) => (
        <CaseStudy key={cs.slug} study={cs} />
      ))}

      <FinalCta
        eyebrow="Your turn"
        lines={["Let’s Write", { text: "Your Case Study.", highlight: "Case Study." }]}
        copy="Start with a free audit and a clear plan. Then we measure what matters and keep improving it."
        primary={{ label: "Book a Free SEO Audit", href: "/contact" }}
        secondary={{ label: "Explore Services", href: "/services" }}
      />
    </>
  );
}
