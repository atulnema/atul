"use client";

import { m as motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ease } from "@/lib/utils";

let hasHydrated = false;

/**
 * Page transition. The first load renders instantly (no delay to LCP);
 * every client-side navigation after that gets a curtain wipe and a soft rise.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && hasHydrated);

  useEffect(() => {
    hasHydrated = true;
  }, []);

  return (
    <>
      {animate && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[55] origin-top bg-ink-3"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="absolute inset-x-0 bottom-0 h-px bg-lime" />
        </motion.div>
      )}
      <motion.div
        initial={animate ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </>
  );
}
