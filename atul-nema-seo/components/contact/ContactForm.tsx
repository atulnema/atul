"use client";

import { AnimatePresence, m as motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, CircleCheck, LoaderCircle, Mail, MessageCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { siteConfig, whatsappUrl } from "@/config/site";
import { contactServiceOptions } from "@/content/services";
import { cn, ease } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 *  FORM BACKEND
 *  Submissions are POSTed as JSON to NEXT_PUBLIC_CONTACT_FORM_ENDPOINT
 *  (see config/site.ts → forms.contactEndpoint). With no endpoint set,
 *  the form runs in demo mode: it validates, then says clearly that
 *  nothing was sent and offers email/WhatsApp instead.
 * ───────────────────────────────────────────────────────────── */

export const goalOptions = [
  "More qualified leads",
  "More organic traffic",
  "Better local visibility",
  "More ecommerce revenue",
  "Recover lost rankings",
  "Launch or migrate a website",
  "Something else",
];

export const budgetOptions = [
  "Under ₹25,000",
  "₹25,000–₹50,000",
  "₹50,000–₹1,00,000",
  "Above ₹1,00,000",
  "Not Sure Yet",
];

type Values = {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  goal: string;
  budget: string;
  services: string[];
  message: string;
  consent: boolean;
  /** Honeypot. Real visitors never see or fill this. */
  fax: string;
};

type Field = Exclude<keyof Values, "fax">;
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "submitting" | "success" | "error" | "demo";

const initialValues: Values = {
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  goal: "",
  budget: "",
  services: [],
  message: "",
  consent: false,
  fax: "",
};

const fieldOrder: Field[] = ["name", "email", "phone", "company", "website", "goal", "budget", "services", "message", "consent"];

const labels: Record<Field, string> = {
  name: "Full name",
  email: "Work email",
  phone: "Phone number",
  company: "Company name",
  website: "Website URL",
  goal: "Primary SEO goal",
  budget: "Monthly marketing budget",
  services: "Services required",
  message: "Message",
  consent: "Consent",
};

function validateField(field: Field, v: Values): string | undefined {
  switch (field) {
    case "name":
      return v.name.trim().length < 2 ? "Please enter your full name." : undefined;
    case "email":
      if (!v.email.trim()) return "Please enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())
        ? undefined
        : "That email doesn’t look right. Try the format name@company.com.";
    case "phone": {
      if (!v.phone.trim()) return undefined;
      const digits = v.phone.replace(/\D/g, "");
      return digits.length < 7 || digits.length > 15
        ? "Enter a phone number with country code, e.g. +91 98765 43210."
        : undefined;
    }
    case "website": {
      const raw = v.website.trim();
      if (!raw) return "Please enter your website so I can take a look.";
      try {
        const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
        return url.hostname.includes(".") ? undefined : "Enter a full domain, like yourbusiness.com.";
      } catch {
        return "Enter a full domain, like yourbusiness.com.";
      }
    }
    case "goal":
      return v.goal ? undefined : "Choose the goal that matters most right now.";
    case "budget":
      return v.budget ? undefined : "Choose a budget range. “Not Sure Yet” is fine.";
    case "services":
      return v.services.length ? undefined : "Select at least one service, or “Not Sure Yet”.";
    case "message":
      return v.message.length > 3000 ? "Please keep your message under 3,000 characters." : undefined;
    case "consent":
      return v.consent ? undefined : "Please confirm you’re happy to be contacted about your enquiry.";
    default:
      return undefined;
  }
}

function validate(v: Values): Errors {
  const errors: Errors = {};
  for (const field of fieldOrder) {
    const error = validateField(field, v);
    if (error) errors[field] = error;
  }
  return errors;
}

function serviceLabels(values: string[]) {
  return values.map((v) => contactServiceOptions.find((o) => o.value === v)?.label ?? v);
}

function mailtoHref(v: Values) {
  const body = [
    `Name: ${v.name}`,
    `Email: ${v.email}`,
    ...(v.phone ? [`Phone: ${v.phone}`] : []),
    ...(v.company ? [`Company: ${v.company}`] : []),
    `Website: ${v.website}`,
    `Primary goal: ${v.goal}`,
    `Monthly budget: ${v.budget}`,
    `Services: ${serviceLabels(v.services).join(", ")}`,
    "",
    v.message,
  ].join("\n");
  return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
    `SEO enquiry from ${v.name || "the website"}`,
  )}&body=${encodeURIComponent(body)}`;
}

const selectArrow: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #a6a195 50%), linear-gradient(135deg, #a6a195 50%, transparent 50%)",
  backgroundPosition: "calc(100% - 1.25rem) 50%, calc(100% - 0.9rem) 50%",
  backgroundSize: "6px 6px, 6px 6px",
  backgroundRepeat: "no-repeat",
};

const inputBase =
  "block min-h-[52px] w-full border bg-ink-2 px-4 py-3 text-bone placeholder:text-faint transition-colors focus:border-lime focus:outline-none focus-visible:outline-none";

export function ContactForm() {
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitCount, setSubmitCount] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Pre-select a service from ?service=… links elsewhere on the site.
  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get("service");
    if (service && contactServiceOptions.some((o) => o.value === service)) {
      setValues((v) => (v.services.includes(service) ? v : { ...v, services: [...v.services, service] }));
    }
  }, []);

  useEffect(() => {
    if (status === "success" || status === "demo" || status === "error") resultRef.current?.focus();
  }, [status]);

  const set = <K extends keyof Values>(field: K, value: Values[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (field !== "fax" && (touched[field as Field] || submitCount > 0)) {
      setErrors((e) => ({ ...e, [field]: validateField(field as Field, next) }));
    }
  };

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, values) }));
  };

  const toggleService = (value: string) => {
    const next = values.services.includes(value)
      ? values.services.filter((s) => s !== value)
      : [...values.services, value];
    set("services", next);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitCount((c) => c + 1);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    // Quietly drop bot submissions caught by the honeypot.
    if (values.fax) {
      setStatus("success");
      return;
    }

    const endpoint = siteConfig.forms.contactEndpoint;
    if (!endpoint) {
      setStatus("demo");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          company: values.company.trim(),
          website: values.website.trim(),
          goal: values.goal,
          budget: values.budget,
          services: serviceLabels(values.services),
          message: values.message.trim(),
          consent: values.consent,
          source: "contact-page",
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const errorList = fieldOrder.filter((f) => errors[f]);
  const showSummary = submitCount > 0 && errorList.length > 0;
  const firstName = values.name.trim().split(" ")[0];

  const describedBy = (field: Field, hint?: boolean) =>
    [hint && id(`${field}-hint`), errors[field] && id(`${field}-error`)].filter(Boolean).join(" ") || undefined;

  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={id(`${field}-error`)} className="mt-2 flex items-start gap-2 text-sm text-alert">
        <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <span className="sr-only">Error: </span>
          {errors[field]}
        </span>
      </p>
    ) : null;

  const label = (field: Field, required = false) => (
    <label htmlFor={id(field)} className="mb-2 flex items-baseline justify-between gap-3 text-sm text-bone">
      <span>{labels[field]}</span>
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">
        {required ? "Required" : "Optional"}
      </span>
    </label>
  );

  if (status === "success") {
    return (
      <motion.div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="border border-lime/40 bg-ink-2 p-8 focus:outline-none sm:p-12"
      >
        <CircleCheck aria-hidden className="h-10 w-10 text-lime" strokeWidth={1.5} />
        <h3 className="mt-6 font-display text-d3 uppercase text-bone">
          Thanks{firstName ? `, ${firstName}` : ""}. Message received.
        </h3>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Your enquiry is with Atul. Expect a reply {siteConfig.contact.responseTime.toLowerCase()} with the most useful
          next step for your website.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setTouched({});
            setSubmitCount(0);
            setStatus("idle");
          }}
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-bone underline underline-offset-4 hover:text-lime"
        >
          Send another enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={id("form-note")} className="relative">
      <p id={id("form-note")} className="sr-only">
        Fields marked required must be completed.
      </p>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden border border-alert/50 bg-alert/[0.06] focus:outline-none"
          >
            <div className="p-5">
              <p className="flex items-center gap-2 font-medium text-bone">
                <AlertCircle aria-hidden className="h-5 w-5 text-alert" />
                Please fix {errorList.length === 1 ? "1 field" : `${errorList.length} fields`} before sending:
              </p>
              <ul className="mt-3 space-y-1 pl-7 text-sm">
                {errorList.map((f) => (
                  <li key={f}>
                    <a
                      href={`#${id(f === "services" ? `services-${contactServiceOptions[0].value}` : f)}`}
                      className="text-alert underline underline-offset-2 hover:text-bone"
                    >
                      {labels[f]}: {errors[f]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          {label("name", true)}
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            aria-required
            className={cn(inputBase, errors.name ? "border-alert" : "border-bone/15")}
          />
          {errorText("name")}
        </div>

        <div>
          {label("email", true)}
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            aria-required
            className={cn(inputBase, errors.email ? "border-alert" : "border-bone/15")}
          />
          {errorText("email")}
        </div>

        <div>
          {label("phone")}
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={cn(inputBase, errors.phone ? "border-alert" : "border-bone/15")}
          />
          {errorText("phone")}
        </div>

        <div>
          {label("company")}
          <input
            id={id("company")}
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            onBlur={() => blur("company")}
            className={cn(inputBase, "border-bone/15")}
          />
        </div>

        <div className="sm:col-span-2">
          {label("website", true)}
          <input
            id={id("website")}
            name="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="yourbusiness.com"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
            onBlur={() => blur("website")}
            aria-invalid={Boolean(errors.website)}
            aria-describedby={describedBy("website")}
            aria-required
            className={cn(inputBase, errors.website ? "border-alert" : "border-bone/15")}
          />
          {errorText("website")}
        </div>

        <div>
          {label("goal", true)}
          <select
            id={id("goal")}
            name="goal"
            value={values.goal}
            onChange={(e) => set("goal", e.target.value)}
            onBlur={() => blur("goal")}
            aria-invalid={Boolean(errors.goal)}
            aria-describedby={describedBy("goal")}
            aria-required
            className={cn(inputBase, "appearance-none pr-10", errors.goal ? "border-alert" : "border-bone/15", !values.goal && "text-faint")}
            style={selectArrow}
          >
            <option value="" disabled>
              Select a goal
            </option>
            {goalOptions.map((o) => (
              <option key={o} value={o} className="text-bone">
                {o}
              </option>
            ))}
          </select>
          {errorText("goal")}
        </div>

        <div>
          {label("budget", true)}
          <select
            id={id("budget")}
            name="budget"
            value={values.budget}
            onChange={(e) => set("budget", e.target.value)}
            onBlur={() => blur("budget")}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describedBy("budget")}
            aria-required
            className={cn(inputBase, "appearance-none pr-10", errors.budget ? "border-alert" : "border-bone/15", !values.budget && "text-faint")}
            style={selectArrow}
          >
            <option value="" disabled>
              Select a range
            </option>
            {budgetOptions.map((o) => (
              <option key={o} value={o} className="text-bone">
                {o}
              </option>
            ))}
          </select>
          {errorText("budget")}
        </div>

        <fieldset
          className="sm:col-span-2"
          aria-describedby={describedBy("services", true)}
          aria-invalid={Boolean(errors.services)}
        >
          <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-sm text-bone">
            <span>{labels.services}</span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">Required</span>
          </legend>
          <p id={id("services-hint")} className="mb-4 text-sm text-muted">
            Select all that apply.
          </p>
          <div className="flex flex-wrap gap-2">
            {contactServiceOptions.map((option) => {
              const checked = values.services.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "relative inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime",
                    checked ? "border-lime bg-lime text-ink" : "border-bone/20 text-bone/90 hover:border-bone/50",
                  )}
                >
                  <input
                    id={id(`services-${option.value}`)}
                    type="checkbox"
                    name="services"
                    value={option.value}
                    checked={checked}
                    onChange={() => toggleService(option.value)}
                    onBlur={() => blur("services")}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-full border transition-colors",
                      checked ? "border-ink bg-ink text-lime" : "border-bone/30",
                    )}
                  >
                    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {option.label}
                </label>
              );
            })}
          </div>
          {errorText("services")}
        </fieldset>

        <div className="sm:col-span-2">
          {label("message")}
          <textarea
            id={id("message")}
            name="message"
            rows={6}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => blur("message")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("message", true)}
            placeholder="Where are you today, and where do you want organic search to take you?"
            className={cn(inputBase, "resize-y", errors.message ? "border-alert" : "border-bone/15")}
          />
          <p id={id("message-hint")} className="mt-2 text-sm text-faint">
            Share any context: recent traffic changes, competitors, deadlines.
          </p>
          {errorText("message")}
        </div>

        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("fax")}>Leave this field empty</label>
          <input
            id={id("fax")}
            name="fax"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.fax}
            onChange={(e) => set("fax", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="group flex min-h-[44px] cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              id={id("consent")}
              name="consent"
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              onBlur={() => blur("consent")}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={describedBy("consent")}
              aria-required
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime",
                values.consent ? "border-lime bg-lime text-ink" : errors.consent ? "border-alert" : "border-bone/30",
              )}
            >
              {values.consent && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span>
              I agree to be contacted about this enquiry and to my details being handled as described in the{" "}
              <a href="/privacy-policy" className="text-bone underline underline-offset-2 hover:text-lime">
                Privacy Policy
              </a>
              . <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">Required</span>
            </span>
          </label>
          {errorText("consent")}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          aria-busy={status === "submitting"}
          className="group relative inline-flex min-h-[56px] items-center justify-between gap-6 overflow-hidden rounded-full bg-lime py-2 pl-7 pr-2 font-medium text-ink transition-colors disabled:cursor-wait"
        >
          <span aria-hidden className="absolute inset-0 translate-y-[101%] rounded-full bg-bone transition-transform duration-500 ease-expo group-hover:translate-y-0" />
          <span className="relative">{status === "submitting" ? "Sending your enquiry…" : "Send Enquiry"}</span>
          <span aria-hidden className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-bone">
            {status === "submitting" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
            )}
          </span>
        </button>
        <p className="text-sm text-faint">Reply {siteConfig.contact.responseTime.toLowerCase()}.</p>
      </div>

      <AnimatePresence>
        {(status === "demo" || status === "error") && (
          <motion.div
            ref={resultRef}
            tabIndex={-1}
            role="alert"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className={cn(
              "mt-8 border p-6 focus:outline-none sm:p-8",
              status === "demo" ? "border-bone/20 bg-ink-2" : "border-alert/50 bg-alert/[0.06]",
            )}
          >
            <p className="flex items-center gap-2 font-medium text-bone">
              <AlertCircle aria-hidden className={cn("h-5 w-5", status === "demo" ? "text-lime" : "text-alert")} />
              {status === "demo" ? "Demo mode: your message was not sent" : "Your message couldn’t be sent"}
            </p>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              {status === "demo"
                ? "This form isn’t connected to an email service yet. Your details are still here, so you can send them straight to Atul instead:"
                : "Something went wrong on our side. Nothing is lost. Try again, or send your details directly:"}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={mailtoHref(values)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-bone px-5 text-sm font-medium text-ink transition-colors hover:bg-lime"
              >
                <Mail aria-hidden className="h-4 w-4" />
                Send by email
              </a>
              <a
                href={whatsappUrl(`Hi Atul, I'm ${values.name} from ${values.website}. I'd like help with ${serviceLabels(values.services).join(", ")}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-bone/20 px-5 text-sm text-bone transition-colors hover:border-lime hover:text-lime"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                Message on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
