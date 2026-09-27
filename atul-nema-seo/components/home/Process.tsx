"use client";

import { m as motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { processSteps } from "@/content/home";
import { Container } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { ease } from "@/lib/utils";

export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section aria-labelledby="process-title" className="relative overflow-hidden py-20 lg:py-32">
      <Container>
        <SectionIntro
          eyebrow="Process"
          id="process-title"
          lines={["A Clear Path", { text: "to Organic Growth.", highlight: "Growth." }]}
          intro="Four stages, repeated and refined. No black boxes, no mystery retainers."
        />

        <ol ref={ref} className="relative mt-16 grid gap-0 lg:mt-24 lg:grid-cols-4">
          {/* Progress rail: vertical on mobile, horizontal on desktop */}
          <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-bone/10 lg:bottom-auto lg:left-0 lg:right-0 lg:top-0 lg:h-px lg:w-auto" />
          <motion.span
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute bottom-0 left-[1.1rem] top-0 w-px origin-top bg-lime lg:hidden"
          />
          <motion.span
            aria-hidden
            style={{ scaleX: progress }}
            className="absolute left-0 right-0 top-0 hidden h-px origin-left bg-lime lg:block"
          />

          {processSteps.map((step, i) => (
            <motion.li
              key={step.number}
              className="relative pb-12 pl-12 lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease, delay: i * 0.12 }}
            >
              <span
                aria-hidden
                className="absolute left-[1.1rem] top-1 h-3 w-3 -translate-x-1/2 rotate-45 border border-lime bg-ink lg:left-0 lg:top-0 lg:-translate-y-1/2 lg:translate-x-0"
              />
              <p aria-hidden className="text-outline font-display text-[clamp(4.5rem,9vw,8.5rem)] leading-none">
                {step.number}
              </p>
              <h3 className="mt-4 font-display text-d4 uppercase text-bone">
                <span className="sr-only">Step {step.number}: </span>
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs leading-relaxed text-muted">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
