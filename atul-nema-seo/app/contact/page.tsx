import type { Metadata } from "next";
import { CalendarDays, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { bookingUrl, isPlaceholderLink, siteConfig, whatsappUrl } from "@/config/site";
import { contactFaqs } from "@/content/faqs";
import { createMetadata, faqSchema } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { ClipReveal, Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";

export const metadata: Metadata = createMetadata({
  title: "Contact Atul Nema | Request a Free SEO Audit",
  description:
    "Tell Atul about your business, website and goals. Request a free SEO audit or book a consultation by email, phone or WhatsApp.",
  path: "/contact",
});

const { contact } = siteConfig;

const channels = [
  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phoneHref}` },
  { icon: MessageCircle, label: "WhatsApp", value: contact.whatsappDisplay, href: whatsappUrl(), external: true },
  { icon: MapPin, label: "Location", value: `${contact.location} · Working worldwide` },
  { icon: Clock, label: "Response time", value: `${contact.responseTime} · ${contact.workingHours}` },
];

export default function ContactPage() {
  const calendlyReady = !isPlaceholderLink(contact.calendly);
  return (
    <>
      <PageHero
        eyebrow="Start a Project"
        watermark="Hello"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        lines={["Let’s Find Your", "Next Growth", { text: "Opportunity.", highlight: "Opportunity." }]}
        intro="Tell me about your business, website, and goals. I’ll review the details and respond with the most useful next step."
      />

      <section aria-labelledby="form-title" className="border-t border-bone/10 py-16 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div id="contact-form" className="lg:col-span-7">
            <h2 id="form-title" className="font-display text-d4 uppercase text-bone">
              Request your free SEO audit
            </h2>
            <p className="mt-3 max-w-lg text-muted">Takes about two minutes. The more context you share, the more useful my reply.</p>
            <Reveal className="mt-10">
              <ContactForm />
            </Reveal>
          </div>

          <aside aria-labelledby="direct-title" className="lg:col-span-5 lg:pl-8">
            <ClipReveal from="bottom" className="lg:sticky lg:top-28">
              <div className="border border-bone/10 bg-ink-2 p-6 sm:p-8">
                <h2 id="direct-title" className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
                  Prefer to reach out directly?
                </h2>
                <ul className="mt-6 divide-y divide-bone/10 border-y border-bone/10">
                  {channels.map(({ icon: IconComponent, label, value, href, external }) => {
                    const inner = (
                      <>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone/15 text-lime transition-colors group-hover:border-lime">
                          <IconComponent aria-hidden className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">{label}</span>
                          <span className="block break-words text-bone transition-colors group-hover:text-lime">{value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="group flex min-h-[64px] items-center gap-4 py-4"
                          >
                            {inner}
                          </a>
                        ) : (
                          <div className="flex min-h-[64px] items-center gap-4 py-4">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8">
                  <p className="flex items-center gap-2 text-bone">
                    <CalendarDays aria-hidden className="h-4 w-4 text-lime" />
                    Rather talk it through?
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Book a free 30-minute consultation at a time that suits you.
                  </p>
                  <div className="mt-5">
                    <Button
                      href={calendlyReady ? bookingUrl() : `mailto:${contact.email}?subject=${encodeURIComponent("Booking a free SEO consultation")}`}
                      variant="light"
                      className="w-full"
                      icon="up-right"
                    >
                      Book a Call
                    </Button>
                  </div>
                </div>
              </div>
            </ClipReveal>
          </aside>
        </Container>
      </section>

      <section aria-labelledby="contact-faq-title" className="border-t border-bone/10 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro eyebrow="Before we talk" id="contact-faq-title" lines={["Good to", "Know."]} className="lg:block" />
          </div>
          <div className="lg:col-span-7">
            <Accordion items={contactFaqs} />
          </div>
        </Container>
      </section>

      <JsonLd data={faqSchema(contactFaqs)} />
    </>
  );
}
