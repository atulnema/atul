import { tokens as template } from "./_template/tokens";
import type { StyleTokens } from "./types";

/**
 * Every saved style. Add one line per style folder:
 *
 *   import { tokens as paper } from "./paper/tokens";
 *   export const styles = { template, paper } satisfies Record<string, StyleTokens>;
 *
 * Compositions take the style name as a prop, so one edit can be rendered in any of them.
 */
export const styles = { template } satisfies Record<string, StyleTokens>;

export type StyleName = keyof typeof styles;

export const styleNames = Object.keys(styles) as [StyleName, ...StyleName[]];

export const getStyle = (name: string): StyleTokens => {
  const found = (styles as Record<string, StyleTokens>)[name];
  if (!found) {
    throw new Error(
      `Unknown style "${name}". Registered styles: ${styleNames.join(", ")}`,
    );
  }
  return found;
};

export type { StyleTokens } from "./types";
