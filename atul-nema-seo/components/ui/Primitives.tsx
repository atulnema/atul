import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
}) {
  return <Tag className={cn("mx-auto w-full max-w-site px-5 sm:px-8 lg:px-12", className)}>{children}</Tag>;
}

/** Small uppercase label that sits above headings. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-muted", className)}>
      <span aria-hidden className="block h-2 w-2 rotate-45 bg-lime" />
      <span>{children}</span>
    </p>
  );
}

/** Mono label used for editorial numbering, e.g. "01 / 05". */
export function Index({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-xs uppercase tracking-[0.18em] text-faint", className)}>{children}</span>;
}

/** Label clarifying that a figure or quote is sample content. */
export function SampleBadge({ children = "Representative example", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-bone/15 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-muted" />
      {children}
    </span>
  );
}

/** Soft radial glow for section backgrounds. */
export function Glow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.14),transparent)] blur-2xl",
        className,
      )}
    />
  );
}
