"use client";

import { m as motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useRichMotion } from "@/components/motion/hooks";

/**
 * A subtle follower ring for desktop pointers. The native cursor stays
 * visible; the ring only adds emphasis over interactive elements.
 */
export function CustomCursor() {
  const rich = useRichMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 350, damping: 32, mass: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!rich) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest("a, button, [role='button'], label, select, [data-cursor]")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [rich, x, y]);

  if (!rich) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      <motion.div
        className="absolute left-0 top-0 rounded-full border mix-blend-difference"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 64 : 32,
          height: hovering ? 64 : 32,
          opacity: visible ? 1 : 0,
          borderColor: hovering ? "rgba(212,245,60,0.9)" : "rgba(242,237,227,0.45)",
          backgroundColor: hovering ? "rgba(212,245,60,0.12)" : "rgba(212,245,60,0)",
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-lime"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && !hovering ? 1 : 0 }}
      />
    </div>
  );
}
