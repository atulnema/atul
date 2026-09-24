"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ease } from "./ui";

/** Seconds the intro takes before the page is revealed. Hero timing keys off this. */
export const INTRO_DURATION = 1.8;

export default function Preloader() {
  const [done, setDone] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString().padStart(3, "0"));

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const controls = animate(count, 100, {
      duration: INTRO_DURATION - 0.3,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => setDone(true),
    });
    return () => {
      controls.stop();
      document.documentElement.style.overflow = "";
    };
  }, [count]);

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.style.overflow = "")}>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 md:p-10"
          exit={{ y: "-100%", borderBottomLeftRadius: "50% 20%", borderBottomRightRadius: "50% 20%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex justify-between text-xs uppercase tracking-[0.25em] text-mist">
            <span>Alphastrix Digital</span>
            <span>Loading growth</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="font-serif text-4xl italic text-bone md:text-6xl"
              >
                Built to grow.
              </motion.p>
            </div>
            <motion.span className="font-sans text-7xl font-semibold tabular-nums tracking-tightest text-acid md:text-[10rem] md:leading-none">
              {rounded}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
