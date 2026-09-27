import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image, generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "radial-gradient(circle at 85% 20%, rgba(212,245,60,0.22), transparent 45%), #0B0B0A",
          color: "#F2EDE3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#A6A195" }}>
          SEO Consultant · India · Working Worldwide
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>
          <span>RANK HIGHER.</span>
          <span style={{ color: "#D4F53C" }}>GROW FASTER.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, fontWeight: 700 }}>
          ATUL NEMA <span style={{ color: "#D4F53C", margin: "0 14px" }}>/</span>
          <span style={{ color: "#A6A195" }}>SEO</span>
        </div>
      </div>
    ),
    size,
  );
}
