import { loadFont } from "@remotion/fonts";
import { useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import type { FontToken, StyleTokens } from "./styles/types";

const loading = new Map<string, Promise<void>>();

const load = (font: FontToken): Promise<void> => {
  if (!font.file) {
    return Promise.resolve();
  }
  const key = `${font.family}|${font.weight}|${font.style}|${font.file}`;
  const existing = loading.get(key);
  if (existing) {
    return existing;
  }
  const promise = loadFont({
    family: font.family,
    url: staticFile(`fonts/${font.file}`),
    weight: font.weight,
    style: font.style,
  });
  loading.set(key, promise);
  return promise;
};

/**
 * Loads the style's font files from public/fonts/ and reports when they are usable.
 *
 * Components that measure text (titles fitted to a width) must wait for this: measuring
 * with a fallback font gives the wrong size, and the result is cached. Rendering is
 * held until the fonts are in and the component has drawn with them.
 */
export const useStyleFonts = (tokens: StyleTokens): boolean => {
  const fonts = Object.values(tokens.fonts);
  const needsLoading = fonts.some((font) => font.file !== null);
  const [ready, setReady] = useState(!needsLoading);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() =>
    needsLoading ? delayRender(`Fonts for style "${tokens.name}"`) : null,
  );

  useEffect(() => {
    if (!needsLoading) {
      return;
    }
    let alive = true;
    Promise.all(fonts.map(load))
      .then(() => {
        if (alive) {
          setReady(true);
        }
      })
      .catch((err) => cancelRender(err));
    return () => {
      alive = false;
    };
    // The font list is fixed for a given style object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  useEffect(() => {
    if (ready && handle !== null) {
      continueRender(handle);
    }
  }, [ready, handle, continueRender]);

  return ready;
};

export const fontStyle = (font: FontToken) => ({
  fontFamily: font.family,
  fontWeight: font.weight,
  fontStyle: font.style,
});
