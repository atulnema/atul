"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** The active Lenis instance, or null when native scrolling is in use. */
export const getLenis = () => instance;

/**
 * Lenis smooth scrolling on desktop. Touch devices and visitors who prefer
 * reduced motion keep native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    // Loaded on demand so touch devices never download it.
    let cancelled = false;
    import("lenis").then(({ default: LenisClass }) => {
      if (cancelled) return;
      instance = new LenisClass({ autoRaf: true, lerp: 0.11, anchors: { offset: -96 } });
      document.documentElement.classList.add("lenis");
    });
    return () => {
      cancelled = true;
      instance?.destroy();
      instance = null;
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  // Keep Lenis in sync with App Router navigations.
  useEffect(() => {
    if (!instance) return;
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (target) instance.scrollTo(target, { offset: -96, immediate: true });
    else instance.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
