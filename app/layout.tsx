import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alphastrix Digital — Growth-focused digital agency",
  description:
    "Alphastrix Digital builds brands that grow. SEO, performance marketing, web design and social — strategy and execution under one roof.",
  openGraph: {
    title: "Alphastrix Digital",
    description: "Growth-focused digital marketing, design and development.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
