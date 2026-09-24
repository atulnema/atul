"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { INTRO_DURATION } from "./Preloader";
import { PillButton, ease } from "./ui";

const words = ["grow.", "convert.", "lead.", "scale."];
const D = INTRO_DURATION + 0.35;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  // Pointer parallax for the glowing orbs
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const orbAx = useTransform(sx, (v) => v * 60);
  const orbAy = useTransform(sy, (v) => v * 60);
  const orbBx = useTransform(sx, (v) => v * -90);
  const orbBy = useTransform(sy, (v) => v * -90);

  // Scroll-out: content drifts up and fades as you leave the hero
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const gridScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32"
    >
      {/* Background layers */}
      <motion.div style={{ scale: gridScale }} className="bg-grid absolute inset-0" aria-hidden />
      <motion.div
        aria-hidden
        style={{ x: orbAx, y: orbAy }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease, delay: D - 0.3 }}
        className="absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-iris/40 blur-[120px]"
      />
      <motion.div
        aria-hidden
        style={{ x: orbBx, y: orbBy }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease, delay: D - 0.1 }}
        className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-acid/25 blur-[120px]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-5 md:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: D }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-bone/10 bg-bone/[0.03] px-4 py-2 text-xs text-bone/80 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
          </span>
          Now booking projects for Q4
        </motion.div>

        <h1 className="text-[15vw] font-semibold leading-[0.92] tracking-tightest sm:text-[11vw] lg:text-[8.5rem]">
          {[
            <>We build</>,
            <>
              brands <span className="font-serif font-normal italic text-bone/90">that</span>
            </>,
          ].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease, delay: D + 0.1 + i * 0.1 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="relative block h-[1em]"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, ease, delay: D + 0.3 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={words[index]}
                  initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease }}
                  className="absolute left-0 top-0 bg-gradient-to-r from-acid via-[#E5FF9E] to-iris bg-clip-text text-transparent"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </span>
        </h1>

        <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: D + 0.6 }}
            className="max-w-md text-lg leading-relaxed text-mist"
          >
            Alphastrix Digital is a growth studio for ambitious businesses. SEO, performance
            marketing, design and development — strategy and execution under one roof.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: D + 0.75 }}
            className="flex flex-wrap items-center gap-3"
          >
            <PillButton href="#contact">Book a strategy call</PillButton>
            <PillButton href="#work" variant="ghost">
              See our work
            </PillButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: D + 1.2 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-mist md:flex"
        aria-hidden
      >
        Scroll
        <span className="relative h-12 w-px overflow-hidden bg-bone/10">
          <motion.span
            className="absolute left-0 top-0 h-1/2 w-px bg-acid"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
