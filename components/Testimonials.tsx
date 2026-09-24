"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { testimonials } from "@/lib/site";
import { SectionLabel, ease } from "./ui";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const t = testimonials[i];

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setI((n) => (n + 1) % testimonials.length), 6000);
    return () => clearTimeout(id);
  }, [i, paused]);

  return (
    <section
      className="mx-auto max-w-7xl px-5 py-32 md:px-8"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <SectionLabel>Kind words</SectionLabel>
      <div className="relative min-h-[22rem] md:min-h-[20rem]">
        <span aria-hidden className="absolute -left-2 -top-10 font-serif text-[10rem] leading-none text-acid/20 md:-left-6">
          &ldquo;
        </span>
        <AnimatePresence mode="wait">
          <motion.figure
            key={i}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative"
          >
            <blockquote className="max-w-5xl text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl">
              {t.quote.split(" ").map((w, k) => (
                <motion.span
                  key={k}
                  className="mr-[0.25em] inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease, delay: k * 0.025 } },
                    exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.3 } },
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </blockquote>
            <motion.figcaption
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { delay: 0.5 } },
                exit: { opacity: 0 },
              }}
              className="mt-10 flex items-center gap-4"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-acid to-iris font-semibold text-ink">
                {t.name.charAt(0)}
              </span>
              <span>
                <span className="block font-medium">{t.name}</span>
                <span className="block text-sm text-mist">{t.role}</span>
              </span>
            </motion.figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex gap-2" role="tablist" aria-label="Testimonials">
        {testimonials.map((_, n) => (
          <button
            key={n}
            role="tab"
            aria-selected={n === i}
            aria-label={`Show testimonial ${n + 1}`}
            onClick={() => setI(n)}
            className="relative h-1 w-16 overflow-hidden rounded-full bg-bone/10"
          >
            {n === i && (
              <motion.span
                key={`${i}-${paused}`}
                className="absolute inset-y-0 left-0 bg-acid"
                initial={{ width: paused ? "100%" : "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: paused ? 0 : 6, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
