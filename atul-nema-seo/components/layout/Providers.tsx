"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Framer Motion setup: features load lazily (smaller first bundle) and every
 * animation honors the visitor's "reduce motion" setting.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
