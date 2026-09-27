import { cn } from "@/lib/utils";

/**
 * Above-the-fold fade-up that runs as a CSS keyframe from first paint,
 * so hero content never waits for JavaScript (good for LCP).
 */
export function Entrance({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p";
}) {
  return (
    <Tag className={cn("anim-fade-up", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}
