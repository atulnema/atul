"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { process } from "@/lib/site";
import { RevealText, SectionLabel } from "./ui";

function Step({
  i,
  total,
  progress,
  title,
  body,
}: {
  i: number;
  total: number;
  progress: MotionValue<number>;
  title: string;
  body: string;
}) {
  const start = i / total;
  const opacity = useTransform(progress, [start - 0.1, start + 0.05], [0.25, 1]);
  const dot = useTransform(progress, [start - 0.02, start + 0.04], ["#1C1C26", "#C8FF4D"]);
  return (
    <motion.div style={{ opacity }} className="relative pb-20 pl-12 last:pb-0 md:pl-16">
      <motion.span
        style={{ backgroundColor: dot }}
        className="absolute left-0 top-2 h-[15px] w-[15px] -translate-x-[7px] rounded-full ring-4 ring-ink"
      />
      <span className="font-serif text-lg italic text-mist">Step 0{i + 1}</span>
      <h3 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h3>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-mist">{body}</p>
    </motion.div>
  );
}

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-32 md:px-8">
      <div className="grid gap-16 md:grid-cols-[1fr_1.2fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tightest md:text-7xl">
            <RevealText
              lines={[
                "A process",
                <>
                  built for <span className="font-serif font-normal italic text-acid">momentum.</span>
                </>,
              ]}
            />
          </h2>
          <p className="mt-6 max-w-sm text-mist">
            Four clear stages. You always know what is happening, what is next and how it is
            performing.
          </p>
        </div>

        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-0 top-2 w-px bg-bone/10" aria-hidden />
          <motion.div
            style={{ scaleY: line }}
            className="absolute bottom-0 left-0 top-2 w-px origin-top bg-gradient-to-b from-acid to-iris"
            aria-hidden
          />
          {process.map((p, i) => (
            <Step key={p.title} i={i} total={process.length} progress={scrollYProgress} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
