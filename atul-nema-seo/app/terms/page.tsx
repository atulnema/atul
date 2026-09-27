import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = createMetadata({
  title: "Terms | Atul Nema SEO",
  description: "Terms of use for the Atul Nema SEO website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      path="/terms"
      updated="September 2026"
      sections={[
        {
          heading: "Using this website",
          body: [
            "The content on this website is for general information. It is not a guarantee of specific rankings, traffic or revenue, which depend on many factors outside anyone’s control.",
          ],
        },
        {
          heading: "Services",
          body: [
            "Any SEO engagement is governed by a separate written proposal or agreement that sets out scope, timelines and fees.",
          ],
        },
        {
          heading: "Case studies and figures",
          body: [
            "Case studies marked as representative examples illustrate typical approaches and outcomes and are not claims about a specific client.",
          ],
        },
        {
          heading: "Contact",
          body: [`Questions about these terms? Email ${siteConfig.contact.email}.`],
        },
      ]}
    />
  );
}
