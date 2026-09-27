import { Check } from "lucide-react";
import { engagementModels } from "@/content/services";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { cn } from "@/lib/utils";

/** Three editable engagement models. Edit in content/services.ts. */
export function EngagementModels() {
  return (
    <section aria-labelledby="models-title" className="relative border-t border-bone/10 py-20 lg:py-32">
      <Container>
        <SectionIntro
          eyebrow="Ways to work together"
          id="models-title"
          lines={["Choose How", { text: "We Start.", highlight: "Start." }]}
          intro="Every engagement is scoped to your goals and budget. Tell me where you are and I’ll send a clear proposal."
        />

        <Stagger className="mt-16 grid gap-5 lg:grid-cols-3" stagger={0.1}>
          {engagementModels.map((model) => (
            <StaggerItem
              as="article"
              key={model.name}
              className={cn(
                "group relative flex flex-col border p-6 transition-[transform,border-color] duration-500 ease-expo hover:-translate-y-1.5 sm:p-8",
                model.featured ? "border-lime/60 bg-ink-2" : "border-bone/10 hover:border-bone/30",
              )}
            >
              {model.featured && (
                <span className="absolute -top-px left-6 -translate-y-1/2 bg-lime px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink sm:left-8">
                  Most chosen
                </span>
              )}
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">{model.kicker}</p>
              <h3 className="mt-4 font-display text-d4 uppercase text-bone">{model.name}</h3>
              <p className="mt-4 leading-relaxed text-muted">{model.summary}</p>

              <dl className="mt-8 border-t border-bone/10 text-sm">
                {[
                  ["Best for", model.bestFor],
                  ["Timeline", model.timeline],
                  ["Commitment", model.commitment],
                  ["Reporting", model.reporting],
                ].map(([term, value]) => (
                  <div key={term} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-bone/10 py-3.5">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{term}</dt>
                    <dd className="text-bone/90">{value}</dd>
                  </div>
                ))}
              </dl>

              <h4 className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-faint">Includes</h4>
              <ul className="mt-4 space-y-3">
                {model.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-bone/90">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <p className="mb-5 font-display text-2xl uppercase text-bone">{model.price ?? "Tailored to scope"}</p>
                <Button
                  href={model.contactService ? `/contact?service=${model.contactService}#contact-form` : "/contact#contact-form"}
                  variant={model.featured ? "solid" : "outline"}
                  className="w-full"
                  ariaLabel={`Request a proposal for ${model.name}`}
                >
                  Request a Proposal
                </Button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
