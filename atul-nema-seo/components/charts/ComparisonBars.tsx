"use client";

import { m as motion } from "framer-motion";
import { formatComparison, type Comparison } from "@/content/case-studies";
import { cn, ease } from "@/lib/utils";

/**
 * Before/after bars. Values are always printed as text, so meaning never
 * depends on color or bar length alone.
 */
export function ComparisonBars({ items, className }: { items: Comparison[]; className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      {items.map((item, idx) => {
        const width = (value: number) => {
          if (item.lowerIsBetter) return Math.max(4, (Math.min(item.before, item.after) / value) * 100);
          return Math.max(4, (value / Math.max(item.before, item.after)) * 100);
        };
        const rows = [
          { key: "Before", value: item.before, bar: "bg-bone/25", text: "text-muted" },
          { key: "After", value: item.after, bar: "bg-lime", text: "text-bone" },
        ];
        return (
          <div key={item.label}>
            <p className="mb-3 text-sm text-muted">{item.label}</p>
            <dl className="space-y-2.5">
              {rows.map((row, r) => (
                <div key={row.key} className="grid grid-cols-[3.75rem_1fr] items-center gap-3">
                  <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-faint">{row.key}</dt>
                  <dd className="flex items-center gap-3">
                    <span aria-hidden className="block h-2.5 flex-1 bg-bone/[0.06]">
                      <motion.span
                        className={cn("block h-full origin-left", row.bar)}
                        style={{ width: `${width(row.value)}%` }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 1.2, ease, delay: idx * 0.15 + r * 0.2 }}
                      />
                    </span>
                    <span className={cn("w-[4.5rem] text-right font-mono text-sm tabular-nums", row.text)}>
                      {formatComparison(row.value, item.unit)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
