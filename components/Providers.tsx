"use client";

import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Respect the OS "reduce motion" setting across every animation on the site.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
