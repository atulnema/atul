import { capabilities } from "@/lib/site";

export default function Marquee() {
  const items = [...capabilities, ...capabilities];
  return (
    <section aria-label="Capabilities" className="relative border-y border-bone/10 py-7">
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 hover:[animation-play-state:paused]">
          {items.map((c, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap text-2xl font-medium tracking-tight md:text-4xl">
              <span className={i % 2 ? "font-serif font-normal italic text-bone/60" : "text-bone"}>{c}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-acid" aria-hidden>
                <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
