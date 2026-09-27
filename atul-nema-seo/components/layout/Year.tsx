"use client";

/** Current year, computed in the browser so it never goes stale between deploys. */
export function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
