import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  size?: "md" | "lg";
  className?: string;
  external?: boolean;
  icon?: "right" | "up-right";
  ariaLabel?: string;
};

const variants = {
  solid: "bg-lime text-ink",
  outline: "border border-bone/25 text-bone hover:border-bone/70",
  light: "bg-bone text-ink",
};

const fills = {
  solid: "bg-bone",
  outline: "bg-bone",
  light: "bg-lime",
};

/**
 * Rounded call-to-action with a fill that rises on hover and an arrow that
 * slides out and back in. Pure CSS, so it works before hydration.
 */
export function Button({
  href,
  children,
  variant = "solid",
  size = "md",
  className,
  external,
  icon = "right",
  ariaLabel,
}: ButtonProps) {
  const Arrow = icon === "up-right" ? ArrowUpRight : ArrowRight;
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  const classes = cn(
    "group relative inline-flex min-h-[48px] items-center justify-between gap-4 overflow-hidden rounded-full font-medium transition-colors duration-500",
    size === "lg" ? "py-2 pl-7 pr-2 text-base" : "py-1.5 pl-6 pr-1.5 text-[0.95rem]",
    variants[variant],
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-y-[101%] rounded-full transition-transform duration-500 ease-expo group-hover:translate-y-0",
          fills[variant],
        )}
      />
      <span
        className={cn(
          "relative transition-colors duration-500",
          variant === "outline" && "group-hover:text-ink",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-500",
          size === "lg" ? "h-11 w-11" : "h-9 w-9",
          variant === "outline" ? "bg-bone/10 group-hover:bg-ink" : "bg-ink",
          variant === "outline" ? "text-bone" : "text-bone",
        )}
      >
        <Arrow className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-8" />
        <Arrow className="absolute h-4 w-4 -translate-x-8 transition-transform duration-500 ease-expo group-hover:translate-x-0" />
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}

/** Underlined inline link with a nudging arrow. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-[44px] items-center gap-2 text-bone transition-colors hover:text-lime",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-100 bg-current transition-transform duration-500 ease-expo group-hover:origin-left group-hover:animate-[underline_0.7s_cubic-bezier(0.16,1,0.3,1)]"
        />
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-1.5" />
    </Link>
  );
}
