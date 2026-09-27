"use client";

import {
  m as motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: readonly string[];
  /** Base speed in percent of the track per second. Negative reverses direction. */
  speed?: number;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
  label: string;
};

/**
 * Infinite horizontal marquee. It drifts on its own and speeds up with scroll
 * velocity, flipping direction when the visitor scrolls back up.
 */
export function Marquee({ items, speed = 2.2, className, itemClassName, separator, label }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const b = boost.get();
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    const move = direction.current * speed * (delta / 1000) * (1 + Math.abs(b));
    base.set(base.get() - move);
  });

  const sequence = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((item, i) => (
        <li key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          <span>{item}</span>
          <span aria-hidden className="mx-[0.5em] inline-flex items-center">
            {separator ?? <span className="block h-[0.18em] w-[0.18em] rotate-45 bg-lime" />}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} role="region" aria-label={label}>
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        {sequence(false)}
        {sequence(true)}
      </motion.div>
    </div>
  );
}
