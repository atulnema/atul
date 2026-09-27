import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy as CaseStudyType } from "@/content/case-studies";
import { getService } from "@/content/services";
import { ComparisonBars } from "@/components/charts/ComparisonBars";
import { TrendChart } from "@/components/charts/TrendChart";
import { CountUp } from "@/components/motion/CountUp";
import { ClipReveal, DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { Container, Index, SampleBadge } from "@/components/ui/Primitives";

const label = "font-mono text-xs uppercase tracking-[0.2em] text-faint";

export function CaseStudy({ study }: { study: CaseStudyType }) {
  const titleId = `${study.slug}-title`;
  return (
    <article id={study.slug} aria-labelledby={titleId} className="relative border-t border-bone/10 py-20 lg:py-32">
      <Container>
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <Index className="text-lime">Case study {study.number}</Index>
              <span aria-hidden className="h-px w-8 bg-bone/20" />
              <Index>{study.category}</Index>
              {study.isRepresentative && <SampleBadge />}
            </div>
            <SplitHeading
              as="h2"
              id={titleId}
              lines={[study.client]}
              className="mt-6 font-display text-d2 uppercase text-bone"
            />
          </div>
          <Reveal className="lg:col-span-4 lg:text-right">
            <p aria-hidden className="text-outline font-display text-[clamp(5rem,11vw,10rem)] leading-[0.8]">
              {study.number}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">Engagement · {study.duration}</p>
          </Reveal>
        </div>

        <DrawLine className="mt-12" />

        {/* Challenge + strategy | chart */}
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-5">
            <Reveal>
              <h3 className={label}>Challenge</h3>
              <p className="mt-4 text-lg leading-relaxed text-bone/90">{study.challenge}</p>
            </Reveal>
            <div>
              <h3 className={label}>Strategy</h3>
              <Stagger as="ol" className="mt-4 border-t border-bone/10" stagger={0.06}>
                {study.strategy.map((item, i) => (
                  <StaggerItem as="li" key={item} className="flex items-baseline gap-4 border-b border-bone/10 py-3.5">
                    <span aria-hidden className="font-mono text-[0.66rem] text-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-bone">{item}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>

          <ClipReveal className="lg:col-span-7" from="left">
            <div className="border border-bone/10 bg-ink-2 p-5 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{study.chart.title}</h3>
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">{study.chart.caption}</p>
              </div>
              <TrendChart
                points={study.chart.points}
                label={`${study.chart.title}, ${study.chart.caption.toLowerCase()}: rising from ${study.chart.points[0]} to ${study.chart.points[study.chart.points.length - 1]}`}
                startLabel={study.chart.startLabel}
                endLabel={study.chart.endLabel}
                delay={0.4}
                className="mt-6 h-56 sm:h-72"
              />
              <h3 className="sr-only">Results</h3>
              <ul className="mt-8 grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-3">
                {study.results.map((m) => (
                  <li key={m.label} className="bg-ink-2 p-5">
                    <p className="font-display text-[clamp(2.4rem,4vw,3.5rem)] leading-none text-lime">
                      <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                    </p>
                    <p className="mt-2 text-sm text-muted">{m.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </ClipReveal>
        </div>

        {/* Execution timeline */}
        <div className="mt-20">
          <h3 className={label}>Execution</h3>
          <Stagger as="ol" className="relative mt-6 grid gap-8 md:grid-cols-3 md:gap-6" stagger={0.12}>
            {study.execution.map((step) => (
              <StaggerItem as="li" key={step.title} className="relative border-t border-bone/15 pt-6">
                <span aria-hidden className="absolute -top-[5px] left-0 h-2.5 w-2.5 rotate-45 bg-lime" />
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime">{step.phase}</p>
                <h4 className="mt-3 font-display text-2xl uppercase text-bone">{step.title}</h4>
                <p className="mt-3 leading-relaxed text-muted">{step.detail}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Before / after + links */}
        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="border border-bone/10 p-5 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Before and after</h3>
              <ComparisonBars items={study.comparisons} className="mt-8" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-between gap-10 lg:col-span-5">
            <div>
              <h3 className={label}>Services used</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {study.serviceSlugs.map((slug) => {
                  const s = getService(slug);
                  if (!s) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/services#${slug}`}
                        className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-bone/15 px-4 text-sm text-bone/85 transition-colors hover:border-lime hover:text-lime"
                      >
                        {s.title}
                        <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="text-lg text-bone">Facing a similar challenge?</p>
              <p className="mt-2 text-muted">I’ll show you how this approach could apply to your market.</p>
              <div className="mt-6">
                <Button href={`/contact?service=${study.contactService}#contact-form`}>Request a Similar Strategy</Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </article>
  );
}
