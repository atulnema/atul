"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { work } from "@/lib/site";
import { Arrow, RevealText, SectionLabel, ease } from "./ui";

function Card({ item, index }: { item: (typeof work)[number]; index: number }) {
  return (
    <a
      href="#contact"
      className="group relative block aspect-[4/5] h-[62vh] max-h-[640px] min-h-[380px] max-w-[85vw] shrink-0 overflow-hidden rounded-3xl border border-bone/10"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110`}
      />
      <div className="bg-grid absolute inset-0 opacity-60" />
      <span className="text-outline absolute -right-4 top-4 select-none text-[10rem] font-semibold leading-none tracking-tightest">
        0{index + 1}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/60 to-transparent p-6 pt-24 md:p-8 md:pt-32">
        <p className="text-xs uppercase tracking-[0.2em] text-bone/60">{item.category}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">{item.client}</h3>
            <p className="mt-2 font-serif text-2xl italic text-acid">{item.result}</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bone text-ink transition-transform duration-500 group-hover:-rotate-45">
            <Arrow className="h-4 w-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  // Measure how far the track needs to travel so the last card lands in view.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative scroll-mt-0"
      style={{ height: `calc(100vh + ${distance * 1.6}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-12 flex w-full max-w-7xl items-end justify-between gap-8 px-5 md:px-8">
          <div>
            <SectionLabel>Selected work</SectionLabel>
            <h2 className="text-5xl font-semibold leading-[0.95] tracking-tightest md:text-7xl">
              <RevealText
                lines={[
                  <>
                    Results that <span className="font-serif font-normal italic text-acid">speak.</span>
                  </>,
                ]}
              />
            </h2>
          </div>
          <div className="hidden w-48 md:block">
            <div className="h-px w-full bg-bone/10">
              <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-acid" />
            </div>
            <p className="mt-3 text-right text-xs uppercase tracking-[0.2em] text-mist">Scroll to explore</p>
          </div>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease }}
          className="flex w-max gap-5 px-5 md:px-8"
        >
          {work.map((w, i) => (
            <Card key={w.client} item={w} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
