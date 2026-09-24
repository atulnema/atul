"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/site";
import { Arrow, RevealText, SectionLabel, ease } from "./ui";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8">
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <SectionLabel>What we do</SectionLabel>
          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tightest md:text-7xl">
            <RevealText
              lines={[
                "Everything you need",
                <>
                  to <span className="font-serif font-normal italic text-acid">win online.</span>
                </>,
              ]}
            />
          </h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="max-w-sm text-mist"
        >
          Four disciplines, one team. No handoffs between agencies, no finger-pointing — just a
          single plan that ties it all together.
        </motion.p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s, i) => (
          <motion.article
            key={s.no}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease, delay: (i % 2) * 0.12 }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
            }}
            className="group relative overflow-hidden rounded-3xl border border-bone/10 bg-ink-900 p-8 md:p-10"
          >
            {/* Pointer spotlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(420px circle at var(--x) var(--y), rgba(200,255,77,0.12), transparent 60%)",
              }}
            />
            <div className="relative flex items-start justify-between">
              <span className="font-serif text-xl italic text-mist">{s.no}</span>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-bone/15 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-acid group-hover:bg-acid group-hover:text-ink">
                <Arrow className="h-4 w-4" />
              </span>
            </div>
            <h3 className="relative mt-16 text-3xl font-semibold tracking-tight md:text-4xl">{s.title}</h3>
            <p className="relative mt-4 max-w-md leading-relaxed text-mist">{s.body}</p>
            <div className="relative mt-8 flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full border border-bone/10 px-3 py-1 text-xs text-bone/70">
                  {t}
                </span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
