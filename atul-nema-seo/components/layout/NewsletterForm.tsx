"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error" | "demo";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up. Posts JSON to NEXT_PUBLIC_NEWSLETTER_ENDPOINT when set;
 * otherwise it says plainly that nothing was saved.
 */
export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address, like name@company.com.");
      setStatus("error");
      return;
    }
    setError("");
    const endpoint = siteConfig.forms.newsletterEndpoint;
    if (!endpoint) {
      setStatus("demo");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer-newsletter" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      setEmail("");
    } catch {
      setError("Something went wrong on our side. Please try again in a moment.");
      setStatus("error");
    }
  }

  const messageId = `${id}-msg`;

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="newsletter-title" className="mt-4">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border bg-ink/60 p-1.5 pl-5 transition-colors focus-within:border-lime",
          status === "error" ? "border-alert" : "border-bone/20",
        )}
      >
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status === "error" || undefined}
          aria-describedby={messageId}
          className="min-h-[44px] w-full min-w-0 bg-transparent text-bone placeholder:text-faint focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-bone px-5 text-sm font-medium text-ink transition-colors hover:bg-lime disabled:opacity-70"
        >
          {status === "loading" ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
          {status === "loading" ? "Subscribing" : "Subscribe"}
        </button>
      </div>
      <p id={messageId} role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
        {status === "error" && <span className="text-alert">{error}</span>}
        {status === "success" && <span className="text-lime">You’re in. The next issue lands at the start of the month.</span>}
        {status === "demo" && (
          <span className="text-muted">
            Demo mode: newsletter sign-up isn’t connected yet, so your email was not saved.
          </span>
        )}
      </p>
    </form>
  );
}
