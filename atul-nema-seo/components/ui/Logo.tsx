import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Wordmark: ATUL NEMA / SEO */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteConfig.name}, home`}
      className={cn(
        "group inline-flex min-h-[44px] items-center gap-2 font-display text-[1.35rem] uppercase leading-none tracking-[0.02em] text-bone",
        className,
      )}
    >
      <span>{siteConfig.logo.primary}</span>
      <span aria-hidden className="inline-block text-lime transition-transform duration-500 ease-expo group-hover:rotate-[20deg]">
        /
      </span>
      <span className="text-muted transition-colors group-hover:text-bone">{siteConfig.logo.secondary}</span>
    </Link>
  );
}
