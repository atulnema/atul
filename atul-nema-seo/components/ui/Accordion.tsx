"use client";

import { m as motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import type { Faq } from "@/content/faqs";
import { cn, ease } from "@/lib/utils";

/** Accessible FAQ accordion. Answers stay in the HTML for crawlers and no-JS visitors. */
export function Accordion({ items, className, headingLevel = 3 }: { items: Faq[]; className?: string; headingLevel?: 3 | 4 }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const Heading = `h${headingLevel}` as "h3" | "h4";

  return (
    <div className={cn("border-t border-bone/15", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <div key={item.question} className="border-b border-bone/15">
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-[64px] w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium text-bone transition-colors hover:text-lime sm:text-xl"
              >
                <span className="flex items-baseline gap-4">
                  <span aria-hidden className="font-mono text-xs text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone/20 transition-all duration-500 ease-expo group-hover:border-lime",
                    isOpen && "rotate-45 border-lime bg-lime text-ink",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </Heading>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.5, ease }}
              className="overflow-hidden"
            >
              <p className="max-w-3xl pb-7 pl-8 text-base leading-relaxed text-muted sm:pl-9">{item.answer}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
