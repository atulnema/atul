"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { nav, site } from "@/lib/site";
import { Logo } from "./ui";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-bone/10 px-5 pt-20 md:px-8">
      <div className="mx-auto grid max-w-[76rem] gap-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo className="text-lg" />
          <p className="mt-4 max-w-xs text-mist">Growth-focused marketing, design and development.</p>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-mist">Explore</p>
          <ul className="space-y-2">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-acid">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-mist">Follow</p>
          <ul className="space-y-2">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="transition-colors hover:text-acid">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <motion.p
        aria-hidden
        style={{ y, opacity }}
        className="mt-20 select-none whitespace-nowrap pb-[0.2em] text-center text-[17vw] font-semibold leading-[0.9] tracking-tightest"
      >
        <span className="bg-gradient-to-b from-bone to-bone/10 bg-clip-text text-transparent">Alphastrix</span>
      </motion.p>

      <div className="mx-auto flex max-w-[76rem] flex-col justify-between gap-2 border-t border-bone/10 py-6 text-sm text-mist md:flex-row">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>{site.location}</p>
      </div>
    </footer>
  );
}
