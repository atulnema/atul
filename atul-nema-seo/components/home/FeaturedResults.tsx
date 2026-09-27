import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudies, formatComparison } from "@/content/case-studies";
import { TrendChart } from "@/components/charts/TrendChart";
import { ClipReveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container, SampleBadge } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { cn } from "@/lib/utils";

export function FeaturedResults() {
  return (
    <section aria-labelledby="results-title" className="relative py-20 lg:py-32">
      <Container>
        <SectionIntro
          eyebrow="Featured results"
          id="results-title"
          lines={["Growth You", { text: "Can Measure.", highlight: "Measure." }]}
          intro="Three representative engagements showing how strategy turns into enquiries, revenue and pipeline."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          {caseStudies.map((cs, i) => {
            const primary = cs.comparisons[0];
            const featured = i === 0;
            return (
              <ClipReveal
                key={cs.slug}
                delay={i * 0.12}
                className={cn(featured ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5")}
              >
                <article className="group relative flex h-full flex-col border border-bone/10 bg-ink-2 p-6 transition-colors duration-500 hover:border-lime/50 sm:p-8">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                      <span className="text-lime">Case {cs.number}</span> · {cs.shortClient}
                    </p>
                    {cs.isRepresentative && <SampleBadge />}
                  </header>

                  <h3
                    className={cn(
                      "mt-8 font-display uppercase leading-[0.95] text-bone",
                      featured ? "text-[clamp(2.2rem,4.4vw,4.4rem)]" : "text-[clamp(1.9rem,2.8vw,2.75rem)]",
                    )}
                  >
                    {cs.headline}
                  </h3>

                  <TrendChart
                    points={cs.chart.points}
                    label={`${cs.chart.title}: representative upward trend over ${cs.duration}`}
                    startLabel={cs.chart.startLabel}
                    endLabel={cs.chart.endLabel}
                    delay={0.3 + i * 0.1}
                    className={cn("mt-8", featured ? "h-48 sm:h-64 lg:h-auto lg:min-h-[18rem] lg:flex-1" : "h-28 sm:h-32")}
                  />

                  <dl className="mt-8 grid grid-cols-2 gap-px border border-bone/10 bg-bone/10">
                    <div className="bg-ink-2 p-4">
                      <dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">Before</dt>
                      <dd className="mt-1 font-display text-2xl text-muted sm:text-3xl">
                        {formatComparison(primary.before, primary.unit)}
                      </dd>
                    </div>
                    <div className="bg-ink-2 p-4">
                      <dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">After</dt>
                      <dd className="mt-1 font-display text-2xl text-lime sm:text-3xl">
                        {formatComparison(primary.after, primary.unit)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-faint">{primary.label}</p>

                  <Link
                    href={`/results#${cs.slug}`}
                    className="inline-flex min-h-[44px] items-center gap-2 pt-8 text-sm text-bone transition-colors after:absolute after:inset-0 hover:text-lime"
                  >
                    Read the case study
                    <span className="sr-only">: {cs.client}</span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </article>
              </ClipReveal>
            );
          })}
        </div>

        <p className="mt-6 max-w-2xl text-sm text-faint">
          Results shown are representative examples and should be replaced with verified client data before
          publication.
        </p>

        <div className="mt-10">
          <Button href="/results" variant="outline">
            {`View SEO Results`}
          </Button>
        </div>
      </Container>
    </section>
  );
}
