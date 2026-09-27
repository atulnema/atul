import { Check } from "lucide-react";
import type { Service } from "@/content/services";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container, Index } from "@/components/ui/Primitives";

export function ServiceDetail({ service, index, total }: { service: Service; index: number; total: number }) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <section
      id={service.slug}
      aria-labelledby={`${service.slug}-title`}
      className="relative border-t border-bone/10 py-20 lg:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Index>
              {number} / {String(total).padStart(2, "0")}
            </Index>
            <p aria-hidden className="text-outline mt-4 font-display text-[clamp(5rem,12vw,11rem)] leading-[0.8]">
              {number}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-lime/40 text-lime">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
            </div>
            <SplitHeading
              id={`${service.slug}-title`}
              lines={[service.title]}
              className="mt-6 font-display text-d3 uppercase text-bone"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-xl leading-relaxed text-bone/90 sm:text-2xl">{service.description}</p>
          </Reveal>

          <div className="mt-12">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-faint">Deliverables</h3>
            <Stagger as="ul" className="mt-5 grid border-t border-bone/10 sm:grid-cols-2" stagger={0.05}>
              {service.deliverables.map((d) => (
                <StaggerItem as="li" key={d} className="flex items-center gap-3 border-b border-bone/10 py-4 sm:odd:pr-6">
                  <Check aria-hidden className="h-4 w-4 shrink-0 text-lime" />
                  <span className="text-bone">{d}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.1}>
            <dl className="mt-12 grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2">
              <div className="bg-ink p-6">
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-faint">Ideal for</dt>
                <dd className="mt-3 leading-relaxed text-muted">{service.idealFor}</dd>
              </div>
              <div className="bg-ink-2 p-6">
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-lime">Expected outcome</dt>
                <dd className="mt-3 leading-relaxed text-bone/90">{service.outcome}</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.15} className="mt-10">
            <Button href={`/contact?service=${service.slug}#contact-form`}>{service.cta}</Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
