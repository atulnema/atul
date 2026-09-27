import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { Intro } from "@/components/home/Intro";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedResults } from "@/components/home/FeaturedResults";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCta } from "@/components/ui/FinalCta";

export const metadata: Metadata = createMetadata({
  title: "Atul Nema SEO | SEO Consultant in India",
  description:
    "Grow your rankings, organic traffic, and qualified leads with strategic SEO consulting from Atul Nema.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <Intro />
      <ServicesPreview />
      <FeaturedResults />
      <Process />
      <Testimonials />
      <FinalCta
        lines={["Ready to", { text: "Be Found?", highlight: "Found?" }]}
        copy="Let’s uncover what is holding your website back and build a practical plan for growth."
        primary={{ label: "Get My Free SEO Audit", href: siteConfig.cta.primary.href }}
        secondary={{ label: "Contact Atul", href: "/contact" }}
      />
    </>
  );
}
