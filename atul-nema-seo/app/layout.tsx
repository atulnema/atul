import type { Metadata, Viewport } from "next";
import { Anton, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { siteSchema } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { JsonLd } from "@/components/ui/JsonLd";
import "./globals.css";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Atul Nema SEO | SEO Consultant in India",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.person.name, url: `${siteConfig.url}/about` }],
  creator: siteConfig.person.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-lime px-5 py-3 font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <SmoothScroll />
          <Header />
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer />
          <CustomCursor />
        </Providers>
        <JsonLd data={siteSchema()} />
      </body>
    </html>
  );
}
