import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy | Atul Nema SEO",
  description: "How Atul Nema SEO collects, uses and protects the information you share through this website.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      updated="September 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "When you use the contact form or newsletter sign-up, we collect the details you choose to share: your name, email, phone number, company, website and message.",
            "Like most websites, basic analytics may record anonymous usage data such as pages visited and device type.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "Your details are used only to respond to your enquiry, provide the services you request and, if you subscribe, send the monthly newsletter. We never sell your information.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            `You can ask to see, correct or delete your information at any time by emailing ${siteConfig.contact.email}. Every newsletter includes an unsubscribe link.`,
          ],
        },
        {
          heading: "Contact",
          body: [`Questions about this policy? Email ${siteConfig.contact.email}.`],
        },
      ]}
    />
  );
}
