"use client";

import { m as motion, type Variants } from "framer-motion";
import { cn, ease } from "@/lib/utils";

type Line = string | { text: string; className?: string; /** Part of the line to render in the accent color. */ highlight?: string };

function renderText(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) return text;
  const [before, after] = text.split(highlight);
  return (
    <>
      {before}
      <span className="text-lime">{highlight}</span>
      {after}
    </>
  );
}

type SplitHeadingProps = {
  lines: Line[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "lines" slides each line out of a mask; "words" staggers every word. */
  split?: "lines" | "words";
  /** Animate on mount (hero headings) or when scrolled into view. */
  trigger?: "mount" | "inView";
  delay?: number;
  id?: string;
};

const parent = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const rise: Variants = {
  hidden: { y: "108%", rotate: 2 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease } },
};

/**
 * Headline revealed line-by-line (or word-by-word) from clipping masks.
 * The text stays in the DOM as real heading text, so it is indexable and
 * read normally by screen readers.
 */
export function SplitHeading({
  lines,
  as = "h2",
  className,
  split = "lines",
  trigger = "inView",
  delay = 0,
  id,
}: SplitHeadingProps) {
  const normalized: { text: string; className?: string; highlight?: string }[] = lines.map((l) =>
    typeof l === "string" ? { text: l } : l,
  );

  // Above the fold: CSS keyframes, so the reveal starts on first paint.
  if (trigger === "mount") {
    const Plain = as;
    let n = 0;
    return (
      <Plain id={id} className={className}>
        {normalized.map((line, i) =>
          split === "lines" ? (
            <span
              key={i}
              className="anim-line -mb-[0.1em] block overflow-hidden pb-[0.1em]"
              style={{ "--d": `${delay + i * 0.12}s` } as React.CSSProperties}
            >
              <span className={cn("anim-rise block", line.className)}>
                {renderText(line.text, line.highlight)}
                {i < normalized.length - 1 ? " " : ""}
              </span>
            </span>
          ) : (
            <span key={i} className={cn("block", line.className)}>
              {line.text.split(" ").map((word, w, arr) => (
                <span
                  key={w}
                  className="anim-line -mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom"
                  style={{ "--d": `${delay + n++ * 0.05}s` } as React.CSSProperties}
                >
                  <span className={cn("anim-rise inline-block", line.highlight?.split(" ").includes(word) && "text-lime")}>
                    {word}
                    {w < arr.length - 1 || i < normalized.length - 1 ? "\u00A0" : ""}
                  </span>
                </span>
              ))}
            </span>
          ),
        )}
      </Plain>
    );
  }

  const Tag = motion[as];
  const animateProps = { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } };

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      {...animateProps}
      variants={parent(split === "words" ? 0.05 : 0.12, delay)}
    >
      {normalized.map((line, i) =>
        split === "lines" ? (
          <span key={i} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
            <motion.span className={cn("block origin-bottom-left", line.className)} variants={rise}>
              {renderText(line.text, line.highlight)}
              {i < normalized.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ) : (
          <span key={i} className={cn("block", line.className)}>
            {line.text.split(" ").map((word, w, arr) => (
              <span key={w} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className={cn("inline-block", line.highlight?.split(" ").includes(word) && "text-lime")}
                  variants={rise}
                >
                  {word}
                  {w < arr.length - 1 || i < normalized.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </span>
        ),
      )}
    </Tag>
  );
}
