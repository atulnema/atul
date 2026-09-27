export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Shared easing curve for every Framer Motion transition on the site. */
export const ease = [0.16, 1, 0.3, 1] as const;
