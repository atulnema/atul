"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { stats } from "@/lib/site";
import { ease } from "./ui";

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [inView, mv, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

export default function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-bone/10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: i * 0.1 }}
            className="border-bone/10 p-8 odd:border-r md:p-10 lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0"
          >
            <div className="text-5xl font-semibold tabular-nums tracking-tightest md:text-7xl">
              <Counter value={s.value} decimals={s.decimals} />
              <span className="text-acid">{s.suffix}</span>
            </div>
            <p className="mt-3 text-sm text-mist">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
