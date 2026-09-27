"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { agent } from "@/lib/agent";
import { site } from "@/lib/site";
import { INTRO_DURATION } from "./Preloader";
import { Arrow, ease } from "./ui";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "alphastrix-live-agent";

function loadHistory(): Message[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/** Renders the small subset of markdown the agent is allowed to use: **bold** and "-" bullets. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const bullet = /^\s*[-*•]\s+/.test(line);
        const parts = line.replace(/^\s*[-*•]\s+/, "").split(/(\*\*[^*]+\*\*)/g);
        const content = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold text-bone">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <Fragment key={j}>{part}</Fragment>
          ),
        );
        if (bullet) {
          return (
            <span key={i} className="flex gap-2 pl-1">
              <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-acid" />
              <span>{content}</span>
            </span>
          );
        }
        return line.trim() ? (
          <span key={i} className="block">
            {content}
          </span>
        ) : (
          <span key={i} className="block h-2" />
        );
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label={`${agent.name} is typing`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-mist"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function AgentAvatar({ size = "h-9 w-9" }: { size?: string }) {
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris to-acid`}>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-ink" aria-hidden>
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function LiveAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Wait for the intro on first load; after that the launcher returns instantly.
  const launcherDelay = useRef(INTRO_DURATION + 1);

  // Restore this tab's conversation, and stop any in-flight reply on unmount.
  useEffect(() => {
    setMessages(loadHistory());
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (streaming) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage unavailable: the chat still works, it just won't persist */
    }
  }, [messages, streaming]);

  // Grow the composer with its content, up to its max height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, error]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function send(text: string, base: Message[] = messages) {
    const content = text.trim().slice(0, agent.maxMessageChars);
    if (!content || streaming) return;

    const history: Message[] = [...base, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
      if (!reply.trim()) throw new Error("No reply received.");
    } catch (err) {
      if (controller.signal.aborted) return;
      // Drop the empty assistant bubble; keep the visitor's message so they can retry.
      setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreaming(false);
    }
  }

  function retry() {
    const last = messages[messages.length - 1];
    if (last?.role === "user") send(last.content, messages.slice(0, -1));
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }

  const lastIsEmptyAssistant =
    streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1].content;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => {
              launcherDelay.current = 0;
              setOpen(true);
            }}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: launcherDelay.current, duration: 0.6, ease } }}
            exit={{ opacity: 0, scale: 0.6, y: 20, transition: { duration: 0.25 } }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label={`Chat with ${agent.name}, our live agent`}
            className="group fixed bottom-4 right-4 z-[70] flex items-center gap-3 rounded-full bg-acid py-2 pl-2 pr-5 font-medium text-ink shadow-[0_20px_60px_-15px_rgba(200,255,77,0.55)] md:bottom-6 md:right-6"
          >
            <span className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-acid">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-9Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path d="M8.5 9.5h7M8.5 12.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-iris opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-acid bg-iris" />
              </span>
            </span>
            <span className="text-sm">Live agent</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={`Chat with ${agent.name}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.45, ease }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(640px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-3xl border border-bone/10 bg-ink-900/95 shadow-[0_40px_120px_-30px_rgba(124,92,255,0.45)] backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px]"
          >
            {/* Header */}
            <header className="relative flex items-center gap-3 border-b border-bone/10 px-5 py-4">
              <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-iris/30 blur-3xl" />
              <AgentAvatar />
              <div className="relative min-w-0 flex-1">
                <p className="font-semibold leading-tight">{agent.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-mist">
                  <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                  Online now
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="relative rounded-full px-3 py-1.5 text-xs text-mist transition-colors hover:bg-bone/5 hover:text-bone"
                >
                  New chat
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="relative grid h-9 w-9 place-items-center rounded-full border border-bone/10 text-bone/80 transition-colors hover:border-bone/30 hover:text-bone"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
              <div className="flex gap-3">
                <AgentAvatar size="h-7 w-7" />
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-700/80 px-4 py-3 text-[0.95rem] leading-relaxed text-bone/90">
                  {agent.greeting}
                </div>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {agent.suggestions.map((s, i) => (
                    <motion.button
                      type="button"
                      key={s}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease }}
                      onClick={() => send(s)}
                      className="rounded-full border border-bone/15 px-3.5 py-2 text-left text-sm text-bone/80 transition-colors hover:border-acid hover:text-acid"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-acid px-4 py-3 text-[0.95rem] leading-relaxed text-ink">
                      {m.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="flex gap-3"
                  >
                    <AgentAvatar size="h-7 w-7" />
                    <div className="max-w-[85%] space-y-1 rounded-2xl rounded-tl-md bg-ink-700/80 px-4 py-3 text-[0.95rem] leading-relaxed text-bone/90">
                      {m.content ? <RichText text={m.content} /> : lastIsEmptyAssistant && <TypingDots />}
                    </div>
                  </motion.div>
                ),
              )}

              {error && (
                <div className="rounded-2xl border border-[#FF6B4A]/30 bg-[#FF6B4A]/10 px-4 py-3 text-sm text-bone/90">
                  <p>{error}</p>
                  <p className="mt-2 text-mist">
                    You can{" "}
                    <button type="button" onClick={retry} className="text-acid underline-offset-4 hover:underline">
                      try again
                    </button>{" "}
                    or email us at{" "}
                    <a href={`mailto:${site.email}`} className="text-acid underline-offset-4 hover:underline">
                      {site.email}
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-bone/10 p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-bone/10 bg-ink/60 p-2 transition-colors focus-within:border-acid/60">
                <label htmlFor="live-agent-input" className="sr-only">
                  Message {agent.name}
                </label>
                <textarea
                  id="live-agent-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={agent.maxMessageChars}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={`Message ${agent.name}…`}
                  className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-base outline-none placeholder:text-bone/30 sm:text-[0.95rem]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-acid text-ink transition-opacity disabled:opacity-30"
                >
                  <Arrow className="h-4 w-4 -rotate-90" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[0.7rem] text-mist">
                AI assistant · Prefer a person?{" "}
                <a href="#contact" onClick={() => setOpen(false)} className="text-bone/80 underline-offset-4 hover:text-acid hover:underline">
                  Message the team
                </a>
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
