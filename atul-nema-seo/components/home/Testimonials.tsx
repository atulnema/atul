import { Quote } from "lucide-react";
import { testimonials } from "@/content/home";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container, SampleBadge } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER TESTIMONIALS — content lives in content/home.ts.
 * Replace with real client quotes before launch.
 */
export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="relative py-20 lg:py-32">
      <Container>
        <SectionIntro eyebrow="Client words" id="testimonials-title" lines={["Clarity Clients", "Can Feel."]} />

        <Stagger className="mt-16 grid gap-5 lg:grid-cols-12" stagger={0.12}>
          {testimonials.map((t, i) => (
            <StaggerItem
              key={i}
              className={cn(
                "flex flex-col justify-between border border-bone/10 p-6 sm:p-10",
                i === 0 ? "bg-ink-2 lg:col-span-12" : "lg:col-span-6",
              )}
            >
              <figure className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <Quote aria-hidden className="h-9 w-9 text-lime" strokeWidth={1.25} />
                  {t.isPlaceholder && <SampleBadge>Sample testimonial</SampleBadge>}
                </div>
                <blockquote
                  className={cn(
                    "mt-8 text-bone",
                    i === 0
                      ? "max-w-5xl text-[clamp(1.5rem,2.8vw,2.6rem)] font-medium leading-[1.2] tracking-tight"
                      : "text-xl leading-relaxed",
                  )}
                >
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4 border-t border-bone/10 pt-6">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 font-display text-sm text-muted"
                  >
                    {t.company.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-bone">{t.name}</span>
                    <span className="block text-sm text-muted">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
