"use client";

import { m as motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { siteConfig } from "@/config/site";
import { marqueeServices } from "@/content/home";
import { Entrance } from "@/components/motion/Entrance";
import { Marquee } from "@/components/motion/Marquee";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { useRichMotion } from "@/components/motion/hooks";
import { Button, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Primitives";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const rich = useRichMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], rich ? [0, 140] : [0, 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], rich ? [0, -90] : [0, 0]);
  const fade = useTransform(scrollYProgress, [0, 0.8], rich ? [1, 0.2] : [1, 1]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div aria-hidden className="grid-lines grid-fade pointer-events-none absolute inset-0" />
      <span aria-hidden className="pointer-events-none absolute -right-[20%] -top-[30%] h-[60rem] w-[60rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.10),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-[40%] -left-[20%] h-[50rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgba(242,237,227,0.05),transparent)]" />

      <div className="relative mx-auto grid w-full max-w-site gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12">
        <motion.div className="lg:col-span-7 lg:pt-8" style={{ y: textY, opacity: fade }}>
          <Entrance>
            <Eyebrow>SEO Consultant • India • Working Worldwide</Eyebrow>
          </Entrance>

          <SplitHeading
            as="h1"
            id="hero-title"
            trigger="mount"
            delay={0.1}
            lines={["Turn Search", { text: "Into Growth.", highlight: "Growth." }]}
            className="mt-8 font-display text-mega uppercase text-bone max-sm:text-[15vw]"
          />

          <Entrance as="p" delay={0.35} className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            I help ambitious businesses rank higher, attract qualified traffic, and turn Google searches into
            measurable revenue.
          </Entrance>

          <Entrance delay={0.5} className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Button href={siteConfig.cta.primary.href} size="lg">
              {siteConfig.cta.primary.label}
            </Button>
            <TextLink href="/results">Explore My Work</TextLink>
          </Entrance>

          <Entrance as="p" delay={0.7} className="mt-14 flex max-w-md items-center gap-4 text-sm text-muted">
            <span aria-hidden className="h-px w-12 shrink-0 bg-lime" />
            Helping businesses build sustainable organic growth.
          </Entrance>
        </motion.div>

        <motion.div className="relative lg:col-span-5 lg:-mr-6 lg:pt-4" style={{ y: visualY }}>
          <HeroVisual />
        </motion.div>
      </div>

      <div className="relative mt-20 border-y border-bone/10 bg-ink/60 py-5 lg:mt-24">
        <Marquee
          label="SEO services"
          items={marqueeServices}
          itemClassName="font-display text-[clamp(1.75rem,3.4vw,3rem)] uppercase leading-none text-bone/90"
        />
      </div>
    </section>
  );
}
