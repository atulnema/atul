"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m as motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig, whatsappUrl } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { cn, ease } from "@/lib/utils";
import { getLenis } from "./SmoothScroll";

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setScrolled(window.scrollY > 24), []);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock page scroll while the menu is open.
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.style.overflow = "hidden";
      getLenis()?.stop();
    } else {
      root.style.overflow = "";
      getLenis()?.start();
    }
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled
            ? "border-bone/10 bg-ink/80 backdrop-blur-md supports-[backdrop-filter]:bg-ink/65"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-site items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {siteConfig.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-11 items-center overflow-hidden px-4 text-[0.95rem] transition-colors",
                        active ? "text-bone" : "text-muted hover:text-bone",
                      )}
                    >
                      <span className="relative block overflow-hidden">
                        <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full">
                          {item.label}
                        </span>
                        <span
                          aria-hidden
                          className="absolute inset-0 block translate-y-full text-lime transition-transform duration-500 ease-expo group-hover:translate-y-0"
                        >
                          {item.label}
                        </span>
                      </span>
                    </Link>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-lime transition-[opacity,transform] duration-500 ease-expo",
                        active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.cta.nav.href}
              className="group hidden min-h-[44px] items-center gap-2 rounded-full bg-lime px-5 text-sm font-medium text-ink transition-colors hover:bg-bone sm:inline-flex"
            >
              {siteConfig.cta.nav.label}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-1" />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:border-lime hover:text-lime lg:hidden"
            >
              <Menu aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && <MobileMenu pathname={pathname} onClose={close} />}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 42px) 36px)" };
  const shown = reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 42px) 36px)" };

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    focusables()[1]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink lg:hidden"
      initial={hidden}
      animate={shown}
      exit={hidden}
      transition={{ duration: reduce ? 0.2 : 0.75, ease }}
    >
      <span aria-hidden className="pointer-events-none absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.12),transparent)]" />
      <div className="flex h-[72px] items-center justify-between px-5 sm:px-8">
        <Logo onClick={onClose} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:border-lime hover:text-lime"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 px-5 pt-8 sm:px-8">
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
          className="border-t border-bone/10"
        >
          {siteConfig.nav.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="overflow-hidden border-b border-bone/10">
                <motion.div
                  variants={{ hidden: { y: "100%" }, show: { y: "0%", transition: { duration: 0.8, ease } } }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[64px] items-center justify-between py-3 font-display text-[clamp(2.6rem,11vw,4.5rem)] uppercase leading-none",
                      active ? "text-lime" : "text-bone",
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs tracking-[0.2em] text-faint">
                      {active ? "Current" : String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </motion.ul>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.7, ease } }}
        className="space-y-5 px-5 pb-10 pt-10 sm:px-8"
      >
        <Link
          href={siteConfig.cta.primary.href}
          onClick={onClose}
          className="flex min-h-[56px] items-center justify-between rounded-full bg-lime pl-6 pr-2 font-medium text-ink"
        >
          {siteConfig.cta.primary.label}
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-bone">
            <ArrowRight aria-hidden className="h-4 w-4" />
          </span>
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex min-h-[44px] items-center hover:text-lime">
            {siteConfig.contact.email}
          </a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center hover:text-lime"
          >
            WhatsApp
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
