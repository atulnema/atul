import { continueRender, delayRender, staticFile } from "remotion";

const faces = [
  ["Inter", 500, "inter-latin-500-normal.woff2"],
  ["Inter", 600, "inter-latin-600-normal.woff2"],
  ["Inter", 700, "inter-latin-700-normal.woff2"],
  ["Inter", 800, "inter-latin-800-normal.woff2"],
  ["Inter", 900, "inter-latin-900-normal.woff2"],
  ["JetBrains Mono", 500, "jetbrains-mono-latin-500-normal.woff2"],
  ["JetBrains Mono", 700, "jetbrains-mono-latin-700-normal.woff2"],
] as const;

if (typeof window !== "undefined" && typeof FontFace !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    faces.map(([family, weight, file]) =>
      new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, {
        weight: String(weight),
      })
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
