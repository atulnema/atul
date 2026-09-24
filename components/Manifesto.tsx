"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { SectionLabel } from "./ui";

const text =
  "Most agencies sell activity. We sell outcomes. Every campaign, page and post we ship is measured against one question — did it grow your business? If it did not, we fix it.";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const highlight = ["outcomes.", "grow", "fix"].some((w) => children.startsWith(w));
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${highlight ? "font-serif italic text-acid" : ""}`}>
      {children}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <section className="mx-auto max-w-7xl px-5 py-32 md:px-8 md:py-44">
      <SectionLabel>Our belief</SectionLabel>
      <p ref={ref} className="max-w-5xl text-3xl font-medium leading-[1.15] tracking-tight md:text-6xl">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}
