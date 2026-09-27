"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** True on devices with a precise pointer and hover (desktop/laptop). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * True when heavy effects (parallax, pointer tracking, custom cursor) should run:
 * a fine pointer, a large screen and no reduced-motion preference.
 */
export function useRichMotion() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  return fine && !reduce;
}
