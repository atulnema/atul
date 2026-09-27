import { Parallax } from "@/components/motion/Parallax";
import { Entrance } from "@/components/motion/Entrance";
import { SplitHeading } from "@/components/motion/SplitHeading";
import type { Crumb } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container, Eyebrow } from "./Primitives";

type Line = Parameters<typeof SplitHeading>[0]["lines"][number];

/** Hero for inner pages: breadcrumbs, eyebrow, mask-revealed H1 and intro. */
export function PageHero({
  eyebrow,
  lines,
  intro,
  crumbs,
  watermark,
  children,
}: {
  eyebrow: string;
  lines: Line[];
  intro?: React.ReactNode;
  crumbs: Crumb[];
  /** Oversized outline word drifting behind the heading. */
  watermark?: string;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-40">
      <div aria-hidden className="grid-lines grid-fade pointer-events-none absolute inset-0" />
      <span aria-hidden className="pointer-events-none absolute -right-[15%] -top-[25%] h-[48rem] w-[48rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.11),transparent)]" />
      {/* Flight-path arcs */}
      <span aria-hidden className="pointer-events-none absolute -right-[30%] top-[18%] aspect-square w-[80vw] rotate-[-18deg] rounded-full border-t border-lime/20" />
      <span aria-hidden className="pointer-events-none absolute -right-[20%] top-[34%] aspect-square w-[64vw] rotate-[-24deg] rounded-full border-t border-dashed border-bone/10" />

      {watermark && (
        <Parallax offset={60} className="pointer-events-none absolute -bottom-[4vw] right-0 select-none" >
          <span aria-hidden className="text-outline block font-display text-[22vw] uppercase leading-none opacity-25">
            {watermark}
          </span>
        </Parallax>
      )}

      <Container className="relative">
        <Breadcrumbs items={crumbs} />
        <Entrance className="mt-8">
          <Eyebrow>{eyebrow}</Eyebrow>
        </Entrance>
        <SplitHeading
          as="h1"
          id="page-title"
          trigger="mount"
          delay={0.1}
          lines={lines}
          className="mt-6 max-w-6xl font-display text-d1 uppercase text-bone"
        />
        {(intro || children) && (
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            {intro && (
              <Entrance delay={0.3} className="lg:col-span-6 lg:col-start-7">
                <p className="text-lg leading-relaxed text-muted sm:text-xl">{intro}</p>
              </Entrance>
            )}
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
