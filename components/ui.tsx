"use client";

import { motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useRef } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-mist"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-acid" />
      {children}
    </motion.div>
  );
}

/** Headline that reveals line by line, each line sliding up from a mask. */
export function RevealText({
  lines,
  className = "",
  delay = 0,
}: {
  lines: React.ReactNode[];
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.09, delayChildren: delay }}
      className={className}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 1, ease } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Wraps an element so it drifts toward the pointer while hovered. */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function PillButton({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
}) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 text-sm font-medium transition-colors duration-500";
  const styles =
    variant === "solid"
      ? "bg-acid text-ink"
      : "border border-bone/20 text-bone hover:border-bone/60";

  return (
    <Magnetic>
      <a href={href} className={`${base} ${styles}`}>
        {variant === "solid" && (
          <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
        )}
        <span className="relative">{children}</span>
        <span className="relative grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-ink text-bone">
          <Arrow className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-5" />
          <Arrow className="absolute h-3 w-3 -translate-x-5 transition-transform duration-500 group-hover:translate-x-0" />
        </span>
      </a>
    </Magnetic>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <path d="M16 2 30 30H22L16 17 10 30H2L16 2Z" fill="#C8FF4D" />
        <path d="M16 2 30 30H22L16 17Z" fill="#7C5CFF" opacity=".85" />
      </svg>
      <span>
        Alphastrix<span className="text-mist"> Digital</span>
      </span>
    </span>
  );
}
