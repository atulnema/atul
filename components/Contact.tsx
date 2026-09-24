"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { site } from "@/lib/site";
import { Arrow, Magnetic, RevealText, SectionLabel, ease } from "./ui";

const budgets = ["< ₹50k", "₹50k–2L", "₹2L–5L", "₹5L+"];
const interests = ["SEO", "Ads", "Website", "Branding", "Social"];

export default function Contact() {
  const [budget, setBudget] = useState(budgets[1]);
  const [picked, setPicked] = useState<string[]>(["SEO"]);

  // No backend yet: compose a pre-filled email in the visitor's mail client.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = [
      `Name: ${f.get("name")}`,
      `Email: ${f.get("email")}`,
      `Company: ${f.get("company") || "-"}`,
      `Interested in: ${picked.join(", ") || "-"}`,
      `Budget: ${budget}`,
      "",
      String(f.get("message") || ""),
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      `New project enquiry — ${f.get("name")}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
      active ? "border-acid bg-acid text-ink" : "border-bone/15 text-bone/80 hover:border-bone/40"
    }`;
  const input =
    "w-full border-b border-bone/15 bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-bone/30 focus:border-acid";

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden px-5 py-32 md:px-8">
      <div aria-hidden className="absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-iris/20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-[76rem] gap-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionLabel>Let&rsquo;s talk</SectionLabel>
          <h2 className="text-6xl font-semibold leading-[0.9] tracking-tightest md:text-8xl">
            <RevealText
              lines={[
                "Ready to",
                <>
                  <span className="font-serif font-normal italic text-acid">grow</span> faster?
                </>,
              ]}
            />
          </h2>
          <p className="mt-8 max-w-md text-lg text-mist">
            Tell us where you are and where you want to be. We reply within one business day with
            honest thoughts — even if we are not the right fit.
          </p>
          <Magnetic className="mt-10">
            <a href={`mailto:${site.email}`} className="group inline-flex items-center gap-3 text-2xl font-medium md:text-3xl">
              <span className="relative">
                {site.email}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-acid transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </span>
              <Arrow className="h-6 w-6 -rotate-45 text-acid transition-transform duration-500 group-hover:rotate-0" />
            </a>
          </Magnetic>
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
          className="rounded-3xl border border-bone/10 bg-ink-900/70 p-6 backdrop-blur-xl md:p-10"
        >
          <div className="grid gap-2 md:grid-cols-2 md:gap-6">
            <label className="block">
              <span className="sr-only">Your name</span>
              <input required name="name" placeholder="Your name" className={input} autoComplete="name" />
            </label>
            <label className="block">
              <span className="sr-only">Email</span>
              <input required type="email" name="email" placeholder="Email" className={input} autoComplete="email" />
            </label>
          </div>
          <label className="mt-2 block">
            <span className="sr-only">Company</span>
            <input name="company" placeholder="Company / website" className={input} autoComplete="organization" />
          </label>

          <fieldset className="mt-8">
            <legend className="mb-3 text-sm text-mist">I&rsquo;m interested in</legend>
            <div className="flex flex-wrap gap-2">
              {interests.map((it) => {
                const on = picked.includes(it);
                return (
                  <button
                    type="button"
                    key={it}
                    aria-pressed={on}
                    onClick={() => setPicked((p) => (on ? p.filter((x) => x !== it) : [...p, it]))}
                    className={chip(on)}
                  >
                    {it}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm text-mist">Monthly budget</legend>
            <div className="flex flex-wrap gap-2">
              {budgets.map((b) => (
                <button type="button" key={b} aria-pressed={budget === b} onClick={() => setBudget(b)} className={chip(budget === b)}>
                  {b}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="sr-only">Project details</span>
            <textarea name="message" rows={3} placeholder="Tell us about your goals" className={`${input} resize-none`} />
          </label>

          <button
            type="submit"
            className="group relative mt-8 flex w-full items-center justify-between overflow-hidden rounded-full bg-acid px-7 py-5 font-medium text-ink"
          >
            <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
            <span className="relative">Send enquiry</span>
            <Arrow className="relative h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
