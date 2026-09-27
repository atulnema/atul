"use client";

import { m as motion, useReducedMotion, type Variants } from "framer-motion";
import { ease } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "p" | "span" | "header" | "aside";
  /** How much of the element must be visible before it animates. */
  amount?: number;
};

/** Fades and lifts content into place when it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 32, as = "div", amount = 0.2 }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </Tag>
  );
}

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/** Parent that staggers its <StaggerItem> children as they enter the viewport. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol" | "dl" | "section";
  amount?: number;
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={container(stagger, delay)}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={staggerItem}>
      {children}
    </Tag>
  );
}

/**
 * Reveals content through an expanding clipping mask. The viewport trigger
 * sits on an unclipped wrapper, because a fully clipped element never
 * registers as intersecting.
 */
export function ClipReveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "center";
}) {
  const reduce = useReducedMotion();
  const hidden = {
    bottom: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    center: "inset(12% 12% 12% 12%)",
  }[from];
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        className="h-full"
        variants={{
          hidden: { clipPath: hidden, opacity: from === "center" ? 0 : 1 },
          show: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, transition: { duration: 1.2, ease, delay } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Thin rule that draws itself from left to right. */
export function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className={`block h-px origin-left bg-bone/15 ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease, delay }}
    />
  );
}
