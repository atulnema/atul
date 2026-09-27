import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Primitives";

type Line = Parameters<typeof SplitHeading>[0]["lines"][number];

/** Eyebrow + split-reveal heading + optional intro paragraph. */
export function SectionIntro({
  eyebrow,
  lines,
  intro,
  id,
  className,
  size = "d2",
  as = "h2",
  aside,
}: {
  eyebrow?: string;
  lines: Line[];
  intro?: React.ReactNode;
  id?: string;
  className?: string;
  size?: "d1" | "d2" | "d3";
  as?: "h1" | "h2";
  aside?: React.ReactNode;
}) {
  const sizes = { d1: "text-d1", d2: "text-d2", d3: "text-d3" };
  return (
    <div className={cn("grid gap-8 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-8">
        {eyebrow && (
          <Reveal y={12}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <SplitHeading as={as} id={id} lines={lines} className={cn("mt-6 font-display uppercase text-bone", sizes[size])} />
      </div>
      {(intro || aside) && (
        <Reveal delay={0.15} className="lg:col-span-4 lg:pb-3">
          {intro && <p className="text-lg leading-relaxed text-muted">{intro}</p>}
          {aside}
        </Reveal>
      )}
    </div>
  );
}
