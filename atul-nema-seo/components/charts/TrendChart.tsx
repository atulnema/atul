"use client";

import { m as motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { cn, ease } from "@/lib/utils";

type TrendChartProps = {
  points: number[];
  /** Plain-language summary read by screen readers. */
  label: string;
  startLabel?: string;
  endLabel?: string;
  className?: string;
  delay?: number;
  /** Vertical line thickness in px. */
  stroke?: number;
  showArea?: boolean;
  showGrid?: boolean;
  /** Animate when mounted rather than when scrolled into view. */
  onMount?: boolean;
};

/** Catmull-Rom interpolation so a handful of data points draws a smooth curve. */
function smooth(values: number[], samples = 64) {
  const n = values.length;
  if (n < 3) return values.map((v, i) => ({ x: i / Math.max(1, n - 1), v }));
  const out: { x: number; v: number }[] = [];
  for (let s = 0; s <= samples; s++) {
    const t = (s / samples) * (n - 1);
    const i = Math.min(Math.floor(t), n - 2);
    const f = t - i;
    const p0 = values[Math.max(0, i - 1)];
    const p1 = values[i];
    const p2 = values[i + 1];
    const p3 = values[Math.min(n - 1, i + 2)];
    const v =
      0.5 *
      (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    out.push({ x: s / samples, v });
  }
  return out;
}

/**
 * Line + area chart drawn entirely with CSS clip-path polygons (no SVG),
 * revealed left-to-right with a clipping mask when it enters the viewport.
 */
export function TrendChart({
  points,
  label,
  startLabel,
  endLabel,
  className,
  delay = 0,
  stroke = 2,
  showArea = true,
  showGrid = true,
  onMount = false,
}: TrendChartProps) {
  const reduce = useReducedMotion();

  const { line, area, last, dots } = useMemo(() => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const toY = (v: number) => 100 - (((v - min) / range) * 78 + 8);
    const curve = smooth(points).map((p) => ({ x: p.x * 100, y: toY(p.v) }));
    const half = stroke / 2;
    const top = curve.map((p) => `${p.x.toFixed(2)}% calc(${p.y.toFixed(2)}% - ${half}px)`);
    const bottom = [...curve].reverse().map((p) => `${p.x.toFixed(2)}% calc(${p.y.toFixed(2)}% + ${half}px)`);
    return {
      line: `polygon(${[...top, ...bottom].join(",")})`,
      area: `polygon(0% 100%, ${curve.map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(",")}, 100% 100%)`,
      last: curve[curve.length - 1],
      dots: points.map((v, i) => ({ x: (i / (points.length - 1)) * 100, y: toY(v) })),
    };
  }, [points, stroke]);

  // The trigger lives on the (unclipped) wrapper; children animate through variants.
  const trigger = onMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, amount: 0.5 } };

  return (
    <figure className={cn("relative flex flex-col", className)}>
      <motion.div
        role="img"
        aria-label={label}
        className="relative min-h-0 w-full flex-1"
        initial={reduce ? false : "hidden"}
        {...trigger}
      >
        {showGrid && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(242,237,227,0.08)_1px,transparent_1px)] bg-[length:100%_25%]"
          />
        )}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          variants={{
            hidden: { clipPath: "inset(0% 100% 0% 0%)" },
            show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.8, ease, delay } },
          }}
        >
          {showArea && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-lime/25 via-lime/[0.06] to-transparent"
              style={{ clipPath: area }}
            />
          )}
          <div className="absolute inset-0 bg-lime" style={{ clipPath: line }} />
          {dots.map((d, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone/60"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            />
          ))}
        </motion.div>
        <motion.span
          aria-hidden
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${last.x}%`, top: `${last.y}%` }}
          variants={{
            hidden: { opacity: 0, scale: 0 },
            show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease, delay: delay + 1.6 } },
          }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-lime/60" />
          <span className="absolute inset-0 rounded-full border-2 border-ink bg-lime" />
        </motion.span>
      </motion.div>
      {(startLabel || endLabel) && (
        <figcaption className="mt-3 flex justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-faint">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </figcaption>
      )}
    </figure>
  );
}
