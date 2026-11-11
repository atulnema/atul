import type { Caption } from "@remotion/captions";
import { useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";

/**
 * Loads a captions JSON file from public/ and holds the render until it is in.
 * Returns null while loading, or when no file is given.
 */
export const useCaptions = (file: string | null): Caption[] | null => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() =>
    file ? delayRender(`Captions ${file}`) : null,
  );

  useEffect(() => {
    if (!file || handle === null) {
      return;
    }
    let alive = true;
    fetch(staticFile(file))
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Captions file public/${file} not found. Run scripts/transcribe.mjs first.`,
          );
        }
        return response.json();
      })
      .then((data: Caption[]) => {
        if (alive) {
          setCaptions(data);
        }
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    return () => {
      alive = false;
    };
  }, [file, handle, continueRender, cancelRender]);

  return captions;
};

/** Evenly timed captions from plain text, for previews and frame rebuilds. */
export const captionsFromText = (text: string, msPerWord = 320): Caption[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({
      text: ` ${word}`,
      startMs: index * msPerWord,
      endMs: (index + 1) * msPerWord,
      timestampMs: index * msPerWord,
      confidence: 1,
    }));
