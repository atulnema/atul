import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "./Button";
import { Container, Eyebrow } from "./Primitives";

type Line = Parameters<typeof SplitHeading>[0]["lines"][number];

/** Closing call to action shared across pages. */
export function FinalCta({
  eyebrow = "Free SEO audit",
  lines,
  copy,
  primary,
  secondary,
}: {
  eyebrow?: string;
  lines: Line[];
  copy: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden border-t border-bone/10 py-24 lg:py-40">
      {/* Flight-path arcs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-[55%] aspect-square w-[140vw] -translate-x-1/2 rounded-full border-t border-bone/10 lg:w-[90vw]" />
        <span className="absolute left-1/2 top-[68%] aspect-square w-[120vw] -translate-x-1/2 rounded-full border-t border-lime/25 lg:w-[74vw]" />
        <span className="absolute left-1/2 top-[80%] aspect-square w-[100vw] -translate-x-1/2 rounded-full border-t border-dashed border-bone/10 lg:w-[58vw]" />
        <span className="absolute left-1/2 top-[40%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.13),transparent)]" />
      </div>
      <Container className="relative text-center">
        <Reveal y={12} className="flex justify-center">
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <SplitHeading
          id="cta-title"
          lines={lines}
          split="words"
          className="mx-auto mt-8 max-w-6xl font-display text-d1 uppercase text-bone"
        />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{copy}</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href={primary.href} size="lg">
            {primary.label}
          </Button>
          {secondary && (
            <Button href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </Button>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
