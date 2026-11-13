// Fonts are bundled from npm so renders are identical offline.
import "@fontsource/bricolage-grotesque/500.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/noto-sans-devanagari/700.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/noto-sans-arabic/700.css";
import "@fontsource/noto-sans-sc/700.css";
import { continueRender, delayRender } from "remotion";

// The CJK families are split into many unicode-range files. Asking for the
// exact strings we draw makes the browser fetch just the slices it needs.
const SAMPLES: [string, string][] = [
  ['500 40px "Bricolage Grotesque"', "Dubz Up"],
  ['700 40px "Bricolage Grotesque"', "Dubz Up"],
  ['800 40px "Bricolage Grotesque"', "Dubz Up ¡Olá! Türkçe Français"],
  ['500 40px "DM Sans"', "Dubz Up"],
  ['700 40px "DM Sans"', "Dubz Up Türkçe Français Português"],
  ['700 40px "Noto Sans Devanagari"', "नमस्ते हिन्दी"],
  ['700 40px "Noto Sans JP"', "こんにちは日本語"],
  ['700 40px "Noto Sans KR"', "안녕하세요한국어"],
  ['700 40px "Noto Sans Arabic"', "مرحبا العربية"],
  ['700 40px "Noto Sans SC"', "你好中文"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(SAMPLES.map(([font, text]) => document.fonts.load(font, text)))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
