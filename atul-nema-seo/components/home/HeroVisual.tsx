"use client";

import { animate, m as motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { TrendChart } from "@/components/charts/TrendChart";
import { useRichMotion } from "@/components/motion/hooks";
import { ease } from "@/lib/utils";

const orbitKeywords = ["search intent", "core web vitals", "local pack", "schema", "topic clusters", "backlinks"];

const tracked = [
  { keyword: "seo consultant", pos: 3, gain: 14 },
  { keyword: "technical audit", pos: 1, gain: 9 },
  { keyword: "local seo india", pos: 2, gain: 21 },
];

const spin = (duration: number, reverse = false) => ({
  animate: { rotate: reverse ? -360 : 360 },
  transition: { duration, repeat: Infinity, ease: "linear" as const },
});

/**
 * Abstract hero composition: a ranking dial, orbiting keywords, tilted
 * "flight path" comet rings and two data panels. Built from CSS shapes and
 * gradients only. Figures are illustrative.
 */
export function HeroVisual() {
  const rich = useRichMotion();
  const reduce = useReducedMotion();
  const rankRef = useRef<HTMLSpanElement>(null);

  // Pointer parallax (desktop only).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });
  const backX = useTransform(sx, (v) => v * -12);
  const backY = useTransform(sy, (v) => v * -12);
  const frontX = useTransform(sx, (v) => v * 22);
  const frontY = useTransform(sy, (v) => v * 22);

  useEffect(() => {
    if (!rich) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rich, px, py]);

  // Ranking climbs from #47 to #1 on load.
  useEffect(() => {
    const el = rankRef.current;
    if (!el || reduce) return;
    const controls = animate(47, 1, {
      duration: 2.6,
      delay: 0.6,
      ease: [0.7, 0, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [reduce]);

  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[34rem] select-none [perspective:1400px]">
      {/* Back layer: dial and rings */}
      <motion.div className="absolute inset-0" style={{ x: backX, y: backY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
        >
          <span className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.16),rgba(212,245,60,0.03)_60%,transparent)]" />
          <span className="absolute inset-0 rounded-full border border-bone/10" />
          <motion.span className="dial-ticks absolute inset-[5%]" {...spin(120)} />
          <span className="absolute inset-[18%] rounded-full border border-dashed border-bone/15" />
          <span className="absolute inset-[31%] rounded-full border border-bone/10" />
          {/* Crosshair */}
          <span className="absolute left-1/2 top-[3%] h-[94%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-bone/10 to-transparent" />
          <span className="absolute left-[3%] top-1/2 h-px w-[94%] -translate-y-1/2 bg-gradient-to-r from-transparent via-bone/10 to-transparent" />
        </motion.div>

        {/* Flight paths: tilted rings with a travelling comet */}
        <div className="absolute inset-[1%]" style={{ transform: "rotateX(70deg) rotateZ(-22deg)" }}>
          <span className="absolute inset-0 rounded-full border border-bone/[0.07]" />
          <motion.div className="absolute inset-0" {...spin(9)}>
            <span className="comet-ring absolute inset-0" />
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_18px_4px_rgba(212,245,60,0.55)]" />
          </motion.div>
        </div>
        <div className="absolute inset-[12%]" style={{ transform: "rotateX(64deg) rotateZ(38deg)" }}>
          <span className="absolute inset-0 rounded-full border border-bone/[0.06]" />
          <motion.div className="absolute inset-0" {...spin(14, true)}>
            <span className="comet-ring absolute inset-0 -scale-x-100 opacity-60" />
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone" />
          </motion.div>
        </div>

        {/* Orbiting keywords */}
        <motion.div className="absolute inset-[18%]" {...spin(70)}>
          {orbitKeywords.map((word, i) => {
            const angle = (i / orbitKeywords.length) * Math.PI * 2;
            return (
              <span
                key={word}
                className={`absolute ${i % 2 ? "hidden sm:block" : ""}`}
                style={{ left: `${50 + Math.cos(angle) * 50}%`, top: `${50 + Math.sin(angle) * 50}%` }}
              >
                <motion.span
                  className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap border border-bone/15 bg-ink/90 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-bone/80"
                  {...spin(70, true)}
                >
                  <span className="h-1 w-1 rounded-full bg-lime" />
                  {word}
                </motion.span>
              </span>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Center: ranking readout */}
      <motion.div
        className="absolute inset-[33%] grid place-items-center rounded-full border border-lime/25 bg-ink-2/95 shadow-[0_0_80px_-10px_rgba(212,245,60,0.25)]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease, delay: 0.5 }}
      >
        <div className="text-center">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted sm:text-[0.6rem]">Position</p>
          <p className="font-display text-[clamp(3rem,9vw,5.5rem)] leading-none text-lime">
            #<span ref={rankRef}>1</span>
          </p>
          <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-faint sm:text-[0.6rem]">Target query</p>
        </div>
      </motion.div>

      {/* Front layer: data panels */}
      <motion.div className="absolute inset-0" style={{ x: frontX, y: frontY }}>
        <motion.div
          className="absolute -left-2 bottom-[2%] w-[62%] border border-bone/[0.12] bg-ink-2 p-4 shadow-2xl shadow-black/60 sm:-left-6 sm:w-[56%]"
          initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 1.2, ease, delay: 0.9 }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted">Organic sessions</p>
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-faint">12 mo</p>
          </div>
          <p className="mt-1 font-display text-3xl leading-none text-bone sm:text-4xl">
            +150<span className="text-lime">%</span>
          </p>
          <TrendChart
            onMount
            delay={1.2}
            showGrid
            label="Illustrative organic sessions trend rising steadily over twelve months"
            points={[12, 14, 13, 17, 19, 22, 21, 26, 29, 31, 34, 38]}
            className="mt-3 h-16 sm:h-20"
          />
        </motion.div>

        <motion.div
          className="absolute -right-1 top-[3%] hidden w-[46%] border border-bone/[0.12] bg-ink-2 p-4 shadow-2xl shadow-black/60 sm:block"
          initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 1.2, ease, delay: 1.1 }}
        >
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted">Rank tracker</p>
          <ul className="mt-3 space-y-2.5">
            {tracked.map((row) => (
              <li key={row.keyword} className="flex items-center justify-between gap-2 border-t border-bone/10 pt-2.5 text-[0.7rem]">
                <span className="truncate text-bone/80">{row.keyword}</span>
                <span className="flex items-center gap-2 font-mono">
                  <span className="text-bone">#{row.pos}</span>
                  <span className="flex items-center text-lime">
                    <ArrowUp className="h-3 w-3" />
                    {row.gain}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
