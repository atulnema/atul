import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/config/site";
import { featuredServices } from "@/content/services";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Primitives";
import { NewsletterForm } from "./NewsletterForm";
import { Year } from "./Year";

const heading = "mb-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-faint";
const link = "inline-flex min-h-[44px] items-center text-bone/85 transition-colors hover:text-lime lg:min-h-[36px]";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-ink-2" aria-labelledby="footer-title">
      <span aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,245,60,0.08),transparent)]" />
      <Container className="relative pb-10 pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 id="footer-title" className="font-display text-[clamp(2.75rem,4.8vw,4.75rem)] uppercase leading-[0.92] text-bone">
              {siteConfig.logo.primary} <span className="text-lime">/</span>{" "}
              <span className="text-muted">{siteConfig.logo.secondary}</span>
            </h2>
            <p className="mt-4 text-lg text-muted">{siteConfig.tagline}</p>

            <div className="mt-10 max-w-md">
              <p id="newsletter-title" className="text-base text-bone">
                Monthly SEO insights without the noise.
              </p>
              <NewsletterForm />
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            <nav aria-label="Footer">
              <h3 className={heading}>Navigation</h3>
              <ul>
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className={heading}>Services</h3>
              <ul>
                {featuredServices.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services#${s.slug}`} className={link}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className={heading}>Contact</h3>
              <address className="not-italic">
                <ul>
                  <li>
                    <a href={`mailto:${siteConfig.contact.email}`} className={`${link} break-all`}>
                      {siteConfig.contact.email}
                    </a>
                  </li>
                  <li>
                    <a href={`tel:${siteConfig.contact.phoneHref}`} className={link}>
                      {siteConfig.contact.phone}
                    </a>
                  </li>
                  <li>
                    <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={link}>
                      WhatsApp
                    </a>
                  </li>
                  <li className="flex min-h-[36px] items-center text-muted">{siteConfig.contact.location}</li>
                </ul>
              </address>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social profiles">
                {siteConfig.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-bone/15 px-4 text-sm text-bone/85 transition-colors hover:border-lime hover:text-lime"
                    >
                      {s.label}
                      <ArrowUpRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-4 border-t border-bone/10 pt-6 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <Year /> {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy-policy" className="inline-flex min-h-[44px] items-center hover:text-lime">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-[44px] items-center hover:text-lime">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
