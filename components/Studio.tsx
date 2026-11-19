"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  MAX_SPEAK_CHARS,
  MAX_TRANSLATE_CHARS,
  languages,
  tones,
  voices,
  type LanguageCode,
  type Tone,
  type VoiceId,
} from "@/lib/languages";
import { ease } from "./ui";

const SAMPLE =
  "Your business deserves to be found. We build websites and campaigns that turn local searches into paying customers.";

type Busy = "idle" | "translating" | "speaking";

async function readError(res: Response) {
  const data = await res.json().catch(() => null);
  return data?.error || `Request failed (${res.status}).`;
}

export default function Studio() {
  const [source, setSource] = useState<LanguageCode>("en-IN");
  const [target, setTarget] = useState<LanguageCode>("hi-IN");
  const [tone, setTone] = useState<Tone>("code-mixed");
  const [voice, setVoice] = useState<VoiceId>("priya");
  const [pace, setPace] = useState(1);
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState<Busy>("idle");
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Free the previous blob whenever a new clip replaces it, and on unmount.
  useEffect(() => () => void (audioUrl && URL.revokeObjectURL(audioUrl)), [audioUrl]);

  async function translate() {
    setBusy("translating");
    setError("");
    try {
      const res = await fetch("/api/sarvam/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input, source, target, tone }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      setOutput(data.text);
      setAudioUrl("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("idle");
    }
  }

  async function speak() {
    const text = output.trim() || input.trim();
    const language = output.trim() ? target : source;
    setBusy("speaking");
    setError("");
    try {
      const res = await fetch("/api/sarvam/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, language, voice, pace }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const url = URL.createObjectURL(await res.blob());
      setAudioUrl(url);
      requestAnimationFrame(() => audioRef.current?.play().catch(() => {}));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("idle");
    }
  }

  function swap() {
    setSource(target);
    setTarget(source);
    if (output) {
      setInput(output);
      setOutput("");
      setAudioUrl("");
    }
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
      active ? "border-acid bg-acid text-ink" : "border-bone/15 text-bone/80 hover:border-bone/40"
    }`;
  const select =
    "w-full appearance-none rounded-xl border border-bone/15 bg-ink-800 px-4 py-3 text-base outline-none transition-colors focus:border-acid";
  const panel = "flex flex-col rounded-3xl border border-bone/10 bg-ink-900/80 p-5 sm:p-6";
  const tooLong = input.length > MAX_TRANSLATE_CHARS;
  const speakText = output.trim() || input.trim();

  return (
    <div className="min-h-screen px-4 pb-24 pt-8 sm:px-8 lg:px-16">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm text-mist transition-colors hover:text-bone">
          ← Alphastrix Digital
        </Link>
        <span className="text-xs uppercase tracking-[0.25em] text-mist">Powered by Sarvam AI</span>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
        className="mx-auto mt-16 max-w-6xl"
      >
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-mist">
          <span className="h-1.5 w-1.5 rounded-full bg-acid" />
          Indic Studio
        </div>
        <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tightest sm:text-6xl">
          Your copy, in <span className="font-serif italic text-acid">every</span> Indian language.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-mist">
          Paste a headline or ad, pick a language and tone, then hear it in a native voice. Good for
          checking regional campaigns before they ship.
        </p>

        {/* Language bar */}
        <div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist">From</span>
            <select className={select} value={source} onChange={(e) => setSource(e.target.value as LanguageCode)}>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} · {l.native}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap languages"
            className="mb-1 grid h-11 w-11 place-items-center rounded-full border border-bone/15 text-lg transition-colors hover:border-acid hover:text-acid"
          >
            ⇄
          </button>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist">To</span>
            <select className={select} value={target} onChange={(e) => setTarget(e.target.value as LanguageCode)}>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} · {l.native}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Editors */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className={panel}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={7}
              placeholder="Type or paste your copy…"
              aria-label="Source text"
              className="flex-1 resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-bone/30"
            />
            <div className="mt-4 flex items-center justify-between text-xs text-mist">
              <span className={tooLong ? "text-red-400" : ""}>
                {input.length} / {MAX_TRANSLATE_CHARS}
              </span>
              <button
                type="button"
                onClick={translate}
                disabled={busy !== "idle" || !input.trim() || tooLong}
                className="rounded-full bg-acid px-6 py-3 text-sm font-medium text-ink transition-opacity disabled:opacity-40"
              >
                {busy === "translating" ? "Translating…" : "Translate →"}
              </button>
            </div>
          </div>

          <div className={panel}>
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={7}
              placeholder="Translation appears here. You can edit it before listening."
              aria-label="Translated text"
              lang={target.split("-")[0]}
              className="flex-1 resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-bone/30"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-mist">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(output)}
                disabled={!output}
                className="transition-colors hover:text-bone disabled:opacity-40"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={speak}
                disabled={busy !== "idle" || !speakText || speakText.length > MAX_SPEAK_CHARS}
                className="rounded-full border border-bone/20 px-6 py-3 text-sm font-medium text-bone transition-colors hover:border-acid hover:text-acid disabled:opacity-40"
              >
                {busy === "speaking" ? "Generating voice…" : "▶ Listen"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {audioUrl && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-bone/10 bg-ink-900/80 p-4">
            <audio ref={audioRef} src={audioUrl} controls className="h-10 min-w-0 flex-1 basis-full sm:basis-0" />
            <a href={audioUrl} download={`studio-${target}-${voice}.wav`} className="text-sm text-mist hover:text-bone">
              Download WAV
            </a>
          </div>
        )}

        {/* Settings */}
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-mist">Tone</legend>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button key={t.id} type="button" className={chip(tone === t.id)} onClick={() => setTone(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-mist">Voice</legend>
            <div className="flex flex-wrap gap-2">
              {voices.map((v) => (
                <button key={v.id} type="button" className={chip(voice === v.id)} onClick={() => setVoice(v.id)}>
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-mist">
              Pace · {pace.toFixed(1)}×
            </span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={pace}
              onChange={(e) => setPace(Number(e.target.value))}
              className="w-full accent-[#C8FF4D]"
            />
          </label>
        </div>
      </motion.section>
    </div>
  );
}
