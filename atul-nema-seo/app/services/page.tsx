import type { Metadata } from "next";
import Link from "next/link";
import { servicesFaqs } from "@/content/faqs";
import { services } from "@/content/services";
import { createMetadata, faqSchema, servicesSchema } from "@/lib/seo";
import { Entrance } from "@/components/motion/Entrance";
import { EngagementModels } from "@/components/services/EngagementModels";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { Accordion } from "@/components/ui/Accordion";
import { FinalCta } from "@/components/ui/FinalCta";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Primitives";
import { SectionIntro } from "@/components/ui/SectionIntro";

export const metadata: Metadata = createMetadata({
  title: "SEO Services | Atul Nema SEO",
  description:
    "SEO audits, technical SEO, local SEO, content strategy, ecommerce SEO and consulting. Flexible services built around your market and growth targets.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="SEO Services"
        watermark="Rise"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
        lines={["Everything Your", "Website Needs", { text: "to Rise.", highlight: "Rise." }]}
        intro="Flexible SEO services designed around your current challenges, market, and growth targets."
      >
        <Entrance delay={0.45} className="lg:col-span-12">
          <nav aria-label="Services on this page">
            <ul className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <li key={s.slug}>
                  <Link
                    href={`#${s.slug}`}
                    className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-bone/15 px-4 text-sm text-bone/85 transition-colors hover:border-lime hover:text-lime"
                  >
                    <span className="font-mono text-[0.66rem] text-faint group-hover:text-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Entrance>
      </PageHero>

      {services.map((service, i) => (
        <ServiceDetail key={service.slug} service={service} index={i} total={services.length} />
      ))}

      <EngagementModels />

      <section aria-labelledby="faq-title" className="border-t border-bone/10 py-20 lg:py-32">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro eyebrow="FAQ" id="faq-title" lines={["Questions,", "Answered."]} size="d2" className="lg:block" />
          </div>
          <div className="lg:col-span-7">
            <Accordion items={servicesFaqs} />
          </div>
        </Container>
      </section>

      <FinalCta
        eyebrow="Start here"
        lines={["Not Sure", { text: "Where to Begin?", highlight: "Begin?" }]}
        copy="Start with a free SEO audit. You’ll get a clear view of your biggest opportunities and an honest recommendation on what to do next."
        primary={{ label: "Book a Free SEO Audit", href: "/contact" }}
        secondary={{ label: "View SEO Results", href: "/results" }}
      />

      <JsonLd data={servicesSchema(services)} />
      <JsonLd data={faqSchema(servicesFaqs)} />
    </>
  );
}
