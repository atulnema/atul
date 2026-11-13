import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Brand tokens, lifted from the Alphastrix Digital site (tailwind.config.ts).
export const C = {
  ink: "#07070A",
  ink9: "#0B0B10",
  ink8: "#121219",
  ink7: "#1C1C26",
  bone: "#F2EFE9",
  mist: "#9A98A6",
  acid: "#C8FF4D",
  acidSoft: "#E5FF9E",
  iris: "#7C5CFF",
  coral: "#FF6B4A",
  cyan: "#3DD6FF",
};

export const F = {
  sans: "Inter Tight",
  serif: "Instrument Serif",
  mono: "JetBrains Mono",
};

const font = (family: string, file: string, weight: string, style = "normal") =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

["500", "600", "700", "800", "900"].forEach((w) =>
  font(F.sans, `inter-tight-latin-${w}-normal.woff2`, w),
);
font(F.serif, "instrument-serif-latin-400-normal.woff2", "400");
font(F.serif, "instrument-serif-latin-400-italic.woff2", "400", "italic");
font(F.mono, "jetbrains-mono-latin-400-normal.woff2", "400");
font(F.mono, "jetbrains-mono-latin-500-normal.woff2", "500");
