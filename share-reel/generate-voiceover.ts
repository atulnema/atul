/**
 * Generates the Hinglish voiceover with ElevenLabs and word timings for sync.
 *
 *   ELEVENLABS_API_KEY=... node --experimental-strip-types generate-voiceover.ts
 *
 * Safe to re-run: lines that already have an MP3 are skipped, so credits are
 * only spent on missing lines. Delete an MP3 to regenerate that line.
 *
 * Writes public/voiceover/<id>.mp3 and src/voiceover.json (durations plus
 * per-word start/end times from the with-timestamps endpoint). Main.tsx
 * places each line on the timeline and drives subtitles from those timings.
 *
 * Hindi is written in Devanagari and English in Latin script on purpose:
 * the multilingual model then pronounces each language natively instead of
 * reading romanised Hindi with an English accent.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// "Brian" - a free premade ElevenLabs voice (deep, confident, narration).
const VOICE_ID = process.env.VOICE_ID ?? "nPczCjzI2devNBz1zQrb";
const MODEL_ID = "eleven_multilingual_v2";

// `sub` is the romanised Hinglish shown on screen; `text` is what is spoken.
export const LINES = [
  {
    id: "01-hook",
    text: "कोई भी content, likes और comments के लिए मत बनाओ...",
    sub: "Koi bhi content likes aur comments ke liye mat banao...",
  },
  {
    id: "02-ego",
    text: "क्योंकि ये सिर्फ ego boost करते हैं... growth नहीं।",
    sub: "...kyunki ye sirf ego boost karte hain, growth nahi.",
  },
  {
    id: "03-share",
    text: "Content सिर्फ इसलिए बनाओ, कि ये दूसरे को भेजा जाए। क्यों?",
    sub: "Content sirf isliye banao ki ye dusre ko bheja jaye. Kyu?",
  },
  {
    id: "04-signal",
    text: "क्योंकि algorithm का सबसे बड़ा signal, सिर्फ shares है।",
    sub: "Kyunki algorithm ka sabse bada signal sirf 'Shares' hai.",
  },
  {
    id: "05-hack",
    text: "और इसका सबसे बड़ा hack पता है क्या है?",
    sub: "Aur iska sabse bada hack pata hai kya hai?",
  },
  {
    id: "06-insult",
    text: "अपनी audience को ऐसा मौका दो, कि वो video भेजकर सामने वाले को playfully insult कर सके...",
    sub: "Apni audience ko aisa mauka do ki woh video bhej kar saamne wale ko playfully insult kar sake...",
  },
  {
    id: "07-example",
    text: "जैसे... अबे तू कितना dumb है, तेरे को ये नहीं पता!",
    sub: "...jaise: 'Abe tu kitna dumb hai, tereko ye nahi pata!'",
  },
  {
    id: "08-question",
    text: "तो असली सवाल, जो आपको खुद से पूछना चाहिए... वो ये है।",
    sub: "Toh asli sawaal jo aapko khud se poochna chahiye, woh ye hai...",
  },
  {
    id: "09-smart",
    text: "मेरे customer को मैं कैसे smart feel कराऊँ, ताकि वो दूसरे लोगों को मेरा content share करे?",
    sub: '"Mere customer ko main kaise smart feel karau, taaki woh dusre logon ko mera content share kare?"',
  },
  {
    id: "10-crack",
    text: "बस ये एक psychology crack कर लो...",
    sub: "Bas yeh ek psychology crack kar lo...",
  },
  {
    id: "11-payoff",
    text: "and you will go from zero to hundred K, very, very, very quickly.",
    sub: "and you will go 0 to 100K very, very, very quickly.",
  },
];

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

const toWords = (a: Alignment) => {
  const words: { w: string; start: number; end: number }[] = [];
  let cur = "";
  let start = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur)
        words.push({
          w: cur,
          start,
          end: a.character_end_times_seconds[i - 1],
        });
      cur = "";
    } else {
      if (!cur) start = a.character_start_times_seconds[i];
      cur += ch;
    }
  });
  if (cur)
    words.push({
      w: cur,
      start,
      end: a.character_end_times_seconds[a.characters.length - 1],
    });
  return words;
};

const measure = (file: string) =>
  Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      file,
    ])
      .toString()
      .trim(),
  );

mkdirSync("public/voiceover", { recursive: true });
const out: unknown[] = [];
let stopped: string | null = null;

for (const line of LINES) {
  const mp3 = `public/voiceover/${line.id}.mp3`;
  const meta = `public/voiceover/${line.id}.json`;

  // Never pay twice: reuse anything already generated.
  if (existsSync(mp3)) {
    const cached = existsSync(meta)
      ? JSON.parse(readFileSync(meta, "utf8"))
      : { id: line.id, duration: measure(mp3), words: null };
    out.push({ ...cached, sub: line.sub });
    console.log(`${line.id}  cached  ${cached.duration.toFixed(2)}s`);
    continue;
  }
  if (stopped) continue;

  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: line.text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.38,
            similarity_boost: 0.8,
            style: 0.45,
            use_speaker_boost: true,
            speed: 1.05,
          },
        }),
      },
    );
  } catch (e) {
    stopped = `${line.id}: ${(e as { cause?: unknown }).cause ?? e}`;
    console.error(
      `stopped at ${stopped} (behind a proxy? set NODE_USE_ENV_PROXY=1)`,
    );
    continue;
  }
  if (!res.ok) {
    // Typically quota_exceeded on the free plan: keep what we have, report the rest.
    stopped = `${line.id}: ${res.status} ${await res.text()}`;
    console.error(`stopped at ${stopped}`);
    continue;
  }
  const data = (await res.json()) as {
    audio_base64: string;
    alignment: Alignment;
  };
  writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
  const entry = {
    id: line.id,
    duration: data.alignment.character_end_times_seconds[data.alignment.character_end_times_seconds.length - 1] ?? 0,
    words: toWords(data.alignment),
  };
  writeFileSync(meta, JSON.stringify(entry));
  out.push({ ...entry, sub: line.sub });
  console.log(
    `${line.id}  ${entry.duration.toFixed(2)}s  ${entry.words.length} words`,
  );
}

writeFileSync(
  "src/voiceover.json",
  JSON.stringify({ voiceId: VOICE_ID, model: MODEL_ID, lines: out }, null, 2) +
    "\n",
);
const missing = LINES.filter(
  (l) => !existsSync(`public/voiceover/${l.id}.mp3`),
).map((l) => l.id);
console.log(
  missing.length ? `missing: ${missing.join(", ")}` : "all lines generated",
);
