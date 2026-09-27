import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ClipReveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

/**
 * Atul's portrait. Set `person.portrait` in config/site.ts (e.g. "/images/atul-nema.jpg",
 * placed in /public) to replace the designed placeholder below.
 */
export function Portrait() {
  const { portrait, portraitAlt, name, jobTitle } = siteConfig.person;
  return (
    <ClipReveal from="bottom" delay={0.3} className="relative">
      <figure className="relative">
        <div className="relative aspect-[4/5] overflow-hidden border border-bone/10 bg-ink-3">
          {portrait ? (
            <Parallax offset={30} className="absolute -inset-y-10 inset-x-0">
              <Image
                src={portrait}
                alt={portraitAlt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover grayscale-[20%]"
              />
            </Parallax>
          ) : (
            <div
              role="img"
              aria-label="Portrait placeholder for Atul Nema"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(212,245,60,0.14),transparent_60%),linear-gradient(to_bottom,#1d1d1a,#0f0f0e)]"
            >
              <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
              {/* Abstract bust silhouette from simple shapes */}
              <span aria-hidden className="absolute left-1/2 top-[22%] h-[30%] w-[38%] -translate-x-1/2 rounded-full bg-gradient-to-b from-bone/[0.14] to-bone/[0.04]" />
              <span aria-hidden className="absolute bottom-0 left-1/2 h-[34%] w-[78%] -translate-x-1/2 rounded-t-[50%] bg-gradient-to-b from-bone/[0.12] to-transparent" />
              <span aria-hidden className="text-outline absolute inset-x-0 bottom-[6%] text-center font-display text-[clamp(5rem,14vw,11rem)] leading-none opacity-70">
                AN
              </span>
              <span className="absolute left-4 top-4 border border-bone/15 bg-ink/70 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                Portrait placeholder
              </span>
            </div>
          )}
          {/* Corner frame marks */}
          <span aria-hidden className="absolute right-3 top-3 h-6 w-6 border-r border-t border-lime" />
          <span aria-hidden className="absolute bottom-3 left-3 h-6 w-6 border-b border-l border-lime" />
        </div>
        <figcaption className="mt-4 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
          <span>{name}</span>
          <span className="text-faint">
            {jobTitle} · {siteConfig.contact.location}
          </span>
        </figcaption>
      </figure>
    </ClipReveal>
  );
}
