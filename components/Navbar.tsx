"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { nav, site } from "@/lib/site";
import { INTRO_DURATION } from "./Preloader";
import { Logo, Magnetic, ease } from "./ui";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
    setScrolled(y > 20);
  });

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: INTRO_DURATION + 0.4, duration: 0.6 }}
          className={`mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-full px-4 py-3 transition-all duration-500 md:px-6 ${
            scrolled ? "mx-3 border border-bone/10 bg-ink/70 backdrop-blur-xl md:mx-auto" : ""
          }`}
        >
          <a href="#top" aria-label={`${site.name} home`}>
            <Logo className="text-base" />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-full px-4 py-2 text-sm text-bone/80 transition-colors hover:text-bone"
              >
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                  {item.label}
                </span>
                <span className="absolute inset-x-4 top-full block text-acid transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic className="hidden md:inline-block">
              <a
                href="#contact"
                className="rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-acid"
              >
                Start a project
              </a>
            </Magnetic>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative z-50 grid h-11 w-11 place-items-center rounded-full border border-bone/15 md:hidden"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                className="absolute h-px w-5 bg-bone"
              />
              <motion.span
                animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                className="absolute h-px w-5 bg-bone"
              />
            </button>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink-900 px-6 pb-10 pt-28 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <div key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.7, ease, delay: 0.2 + i * 0.06 }}
                    className="block text-5xl font-semibold tracking-tightest"
                  >
                    {item.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="space-y-2 text-mist"
            >
              <a href={`mailto:${site.email}`} className="block text-bone">
                {site.email}
              </a>
              <p className="text-sm">{site.location}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
