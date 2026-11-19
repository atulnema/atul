import type { Metadata } from "next";
import Studio from "@/components/Studio";

export const metadata: Metadata = {
  title: "Indic Studio — Alphastrix Digital",
  description: "Translate marketing copy into Indian languages and hear it read aloud.",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <Studio />;
}
