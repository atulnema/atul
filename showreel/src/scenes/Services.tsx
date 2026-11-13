import React from "react";
import { AbsoluteFill } from "remotion";
import { Chars } from "../components/Chars";
import { clamp, ease, mix, tw, useBeat, wipe } from "../lib/anim";
import { C, F } from "../lib/theme";

// Four services, two beats each. Every vignette gets its own colour plate
// and its own little piece of interface animation.

type Plate = { bg: string; fg: string; sub: string; accent: string; line: string };

const PLATES: Plate[] = [
  { bg: C.ink, fg: C.bone, sub: C.mist, accent: C.acid, line: "rgba(242,239,233,0.16)" },
  { bg: C.iris, fg: C.bone, sub: "rgba(242,239,233,0.72)", accent: C.acid, line: "rgba(242,239,233,0.3)" },
  { bg: C.bone, fg: C.ink, sub: "#5B5966", accent: C.iris, line: "rgba(7,7,10,0.18)" },
  { bg: C.acid, fg: C.ink, sub: "rgba(7,7,10,0.66)", accent: C.ink, line: "rgba(7,7,10,0.22)" },
];

const Copy: React.FC<{
  b: number;
  no: string;
  lines: [string, string];
  blurb: string;
  tags: string[];
  plate: Plate;
}> = ({ b, no, lines, blurb, tags, plate }) => (
  <div style={{ position: "absolute", left: 120, top: 190, width: 800, color: plate.fg }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: F.mono,
        fontSize: 26,
        letterSpacing: "0.14em",
        opacity: tw(b, 0.05, 0.35),
      }}
    >
      <span style={{ color: plate.accent, fontWeight: 500 }}>{no}</span>
      <span
        style={{
          display: "block",
          width: 150,
          height: 2,
          background: plate.line,
          scale: `${tw(b, 0.1, 0.6)} 1`,
          transformOrigin: "0 50%",
        }}
      />
      <span style={{ color: plate.sub }}>SERVICES / 04</span>
    </div>
    <div
      style={{
        marginTop: 96,
        fontFamily: F.sans,
        fontWeight: 700,
        fontSize: 140,
        letterSpacing: "-0.04em",
        lineHeight: 1,
      }}
    >
      <div>
        <Chars text={lines[0]} b={b} at={0.06} stagger={0.02} dur={0.5} />
      </div>
      <div style={{ marginTop: 6 }}>
        <Chars text={lines[1]} b={b} at={0.16} stagger={0.02} dur={0.5} />
      </div>
    </div>
    <div
      style={{
        marginTop: 44,
        fontFamily: F.serif,
        fontStyle: "italic",
        fontSize: 58,
        lineHeight: 1.1,
        color: plate.sub,
        opacity: tw(b, 0.35, 0.7),
        translate: `0 ${(1 - tw(b, 0.35, 0.8)) * 30}px`,
      }}
    >
      {blurb}
    </div>
    <div style={{ marginTop: 56, display: "flex", gap: 14 }}>
      {tags.map((t, i) => {
        const p = tw(b, 0.5 + i * 0.08, 0.85 + i * 0.08, ease.back);
        return (
          <span
            key={t}
            style={{
              fontFamily: F.mono,
              fontSize: 25,
              letterSpacing: "0.02em",
              padding: "14px 24px",
              borderRadius: 999,
              border: `2px solid ${plate.line}`,
              opacity: clamp(p * 1.5),
              scale: String(mix(p, 0.6, 1)),
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  </div>
);

const stage: React.CSSProperties = { position: "absolute", left: 1000, top: 172, width: 800, height: 780 };

// ----------------------------------------------------------------- 01 SEO
const QUERY = "how to grow my brand";
const ROW_H = 112;

const Seo: React.FC<{ b: number }> = ({ b }) => {
  const typed = Math.round(tw(b, 0.12, 0.7, ease.linear) * QUERY.length);
  // The hero result climbs from #5 to #1.
  const h = mix(tw(b, 0.72, 1.5, ease.inOut), 4, 0);
  const moving = Math.sin(Math.PI * tw(b, 0.72, 1.5, ease.inOut));
  const win = tw(b, 1.5, 1.8, ease.back);
  const row = (slot: number, hero: boolean, i: number) => {
    const enter = tw(b, 0.22 + i * 0.05, 0.6 + i * 0.05);
    return (
      <div
        key={hero ? "hero" : i}
        style={{
          position: "absolute",
          left: 70,
          right: 0,
          top: 150 + slot * (ROW_H + 14),
          height: ROW_H,
          borderRadius: 22,
          background: hero ? C.acid : C.ink8,
          border: hero ? "none" : "1.5px solid rgba(242,239,233,0.09)",
          opacity: enter,
          translate: `0 ${(1 - enter) * 60}px`,
          scale: hero ? String(1 + moving * 0.05 + win * 0.02) : "1",
          rotate: hero ? `${moving * -1.6}deg` : "0deg",
          boxShadow: hero ? `0 ${20 + moving * 30}px ${50 + moving * 40}px rgba(200,255,77,${0.16 + moving * 0.2})` : "none",
          zIndex: hero ? 2 : 1,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 22,
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 12, background: hero ? C.ink : "rgba(242,239,233,0.14)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, width: `${hero ? 62 : 44 + ((i * 37) % 30)}%`, borderRadius: 9, background: hero ? C.ink : "rgba(242,239,233,0.24)" }} />
          <div style={{ marginTop: 14, height: 12, width: `${hero ? 36 : 26 + ((i * 23) % 18)}%`, borderRadius: 6, background: hero ? "rgba(7,7,10,0.45)" : "rgba(242,239,233,0.1)" }} />
        </div>
        {hero && (
          <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: "0.1em", color: C.acid, background: C.ink, padding: "10px 16px", borderRadius: 10 }}>
            YOUR BRAND
          </div>
        )}
      </div>
    );
  };
  return (
    <div style={stage}>
      {/* search field */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 108,
          borderRadius: 54,
          background: C.ink8,
          border: "2px solid rgba(242,239,233,0.16)",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          gap: 24,
          scale: String(mix(tw(b, 0.05, 0.4, ease.back), 0.9, 1)),
          opacity: tw(b, 0.05, 0.25),
        }}
      >
        <svg width={40} height={40} viewBox="0 0 40 40" fill="none" stroke={C.acid} strokeWidth={4} strokeLinecap="round">
          <circle cx={17} cy={17} r={11} />
          <path d="M26 26 L36 36" />
        </svg>
        <span style={{ fontFamily: F.mono, fontSize: 36, color: C.bone }}>
          {QUERY.slice(0, typed)}
          <span style={{ color: C.acid, opacity: typed < QUERY.length || Math.floor(b * 4) % 2 === 0 ? 1 : 0 }}>|</span>
        </span>
      </div>
      {/* fixed rank numerals */}
      {[0, 1, 2, 3, 4].map((s) => (
        <div
          key={s}
          style={{
            position: "absolute",
            left: 0,
            top: 150 + s * (ROW_H + 14),
            height: ROW_H,
            width: 56,
            display: "flex",
            alignItems: "center",
            fontFamily: F.mono,
            fontSize: 30,
            color: Math.round(h) === s ? C.acid : C.mist,
            opacity: tw(b, 0.22 + s * 0.05, 0.5 + s * 0.05),
          }}
        >
          {String(s + 1).padStart(2, "0")}
        </div>
      ))}
      {[0, 1, 2, 3].map((i) => row(i + clamp(i + 1 - h), false, i))}
      {row(h, true, 4)}
      {/* winner ring */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 0,
          top: 150,
          height: ROW_H,
          borderRadius: 22,
          border: `3px solid ${C.acid}`,
          opacity: (1 - tw(b, 1.5, 1.95)) * (b > 1.5 ? 1 : 0),
          scale: `${1 + tw(b, 1.5, 1.95) * 0.12} ${1 + tw(b, 1.5, 1.95) * 0.7}`,
        }}
      />
    </div>
  );
};

// ----------------------------------------------------------------- 02 ADS
const BARS = [0.26, 0.34, 0.3, 0.46, 0.55, 0.66, 0.81, 0.97];
const CHART_H = 330;

const Ads: React.FC<{ b: number }> = ({ b }) => {
  const card = tw(b, 0.05, 0.5);
  const pts = BARS.map((v, i) => [72 + i * 86 + 31, 470 - v * CHART_H - 26] as const);
  const lineP = tw(b, 0.7, 1.45, ease.inOut);
  const headI = lineP * (pts.length - 1);
  const i0 = Math.min(pts.length - 2, Math.floor(headI));
  const f = headI - i0;
  const head = [mix(f, pts[i0][0], pts[i0 + 1][0]), mix(f, pts[i0][1], pts[i0 + 1][1])];
  const chip = (label: string, arrowUp: boolean, at: number, style: React.CSSProperties, bg: string) => {
    const p = tw(b, at, at + 0.35, ease.back);
    const bob = Math.sin((b - at) * Math.PI * 2) * 5;
    return (
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "22px 34px",
          borderRadius: 26,
          background: bg,
          color: C.ink,
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: "-0.03em",
          boxShadow: "0 30px 60px rgba(7,7,10,0.35)",
          opacity: clamp(p * 2),
          scale: String(mix(p, 0.4, 1)),
          ...style,
        }}
      >
        {label}
        <svg width={40} height={40} viewBox="0 0 40 40" style={{ translate: `0 ${arrowUp ? -bob : bob}px`, rotate: arrowUp ? "0deg" : "180deg" }}>
          <path d="M20 34V8M8 19 20 7 32 19" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };
  return (
    <div style={stage}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 40,
          height: 560,
          borderRadius: 36,
          background: C.ink9,
          boxShadow: "0 50px 100px rgba(7,7,10,0.4)",
          opacity: clamp(card * 2),
          translate: `0 ${(1 - card) * 80}px`,
          rotate: `${(1 - card) * 3}deg`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 44, top: 36, right: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.12em", color: C.mist }}>CAMPAIGNS / LIVE</span>
          <span style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: F.mono, fontSize: 22, color: C.acid }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.acid, opacity: 0.4 + 0.6 * Math.abs(Math.sin(b * Math.PI * 2)) }} />
            OPTIMISING
          </span>
        </div>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ position: "absolute", left: 44, right: 44, top: 140 + k * 110, height: 1.5, background: "rgba(242,239,233,0.07)" }} />
        ))}
        {BARS.map((v, i) => {
          const p = tw(b, 0.25 + i * 0.055, 0.7 + i * 0.055, ease.back);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 72 + i * 86,
                bottom: 90,
                width: 62,
                height: v * CHART_H,
                borderRadius: "14px 14px 4px 4px",
                background: i >= 6 ? C.acid : `rgba(242,239,233,${0.14 + i * 0.03})`,
                scale: `1 ${p}`,
                transformOrigin: "50% 100%",
              }}
            />
          );
        })}
        <svg width={800} height={560} style={{ position: "absolute", inset: 0 }}>
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke={C.iris}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - lineP}
            style={{ filter: "drop-shadow(0 0 14px rgba(124,92,255,0.9))" }}
          />
          <circle cx={head[0]} cy={head[1]} r={11 * tw(b, 0.7, 0.8)} fill={C.bone} stroke={C.iris} strokeWidth={5} />
        </svg>
      </div>
      {chip("ROAS", true, 1.0, { left: -50, top: 560, rotate: "-5deg" }, C.acid)}
      {chip("Cost / lead", false, 1.15, { right: -20, top: 610, rotate: "3deg" }, C.bone)}
      {["Google", "Meta", "LinkedIn"].map((n, i) => {
        const p = tw(b, 0.55 + i * 0.1, 0.9 + i * 0.1, ease.back);
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: 430 + i * 5,
              top: -22 + i * 0,
              translate: `${i * 128 - 60}px 0`,
              padding: "12px 20px",
              borderRadius: 999,
              background: C.bone,
              color: C.ink,
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 26,
              scale: String(p),
              rotate: `${(i - 1) * 4}deg`,
              boxShadow: "0 14px 30px rgba(7,7,10,0.3)",
            }}
          >
            {n}
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------------------- 03 WEB
const Web: React.FC<{ b: number }> = ({ b }) => {
  const win = tw(b, 0.05, 0.5);
  const piece = (k: number) => {
    const p = tw(b, 0.2 + k * 0.06, 0.62 + k * 0.06);
    return { opacity: p, translate: `0 ${(1 - p) * 46}px` } as React.CSSProperties;
  };
  // Cursor travels to the CTA and clicks.
  const travel = tw(b, 0.72, 1.28, ease.inOut);
  const cx = mix(travel, 820, 190) + Math.sin(travel * Math.PI) * -60;
  const cy = mix(travel, 760, 398) + Math.sin(travel * Math.PI) * 70;
  const press = tw(b, 1.28, 1.36) - tw(b, 1.36, 1.55);
  const ripple = tw(b, 1.32, 1.85);
  const toast = tw(b, 1.42, 1.75, ease.back);
  const CODE = '<Hero cta="Get started" />';
  const typed = Math.round(tw(b, 0.45, 1.15, ease.linear) * CODE.length);
  return (
    <div style={stage}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 30,
          height: 610,
          borderRadius: 28,
          background: C.ink9,
          boxShadow: "0 60px 110px rgba(7,7,10,0.35)",
          opacity: clamp(win * 2),
          scale: String(mix(win, 0.88, 1)),
          translate: `0 ${(1 - win) * 60}px`,
          overflow: "hidden",
        }}
      >
        {/* chrome */}
        <div style={{ height: 68, background: C.ink8, display: "flex", alignItems: "center", padding: "0 26px", gap: 12 }}>
          {[C.coral, "#FFC83D", C.acid].map((c) => (
            <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
          <span style={{ marginLeft: 24, flex: 1, height: 38, borderRadius: 19, background: C.ink7, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: F.mono, fontSize: 20, color: C.mist }}>
            yourbrand.com
          </span>
        </div>
        {/* page */}
        <div style={{ position: "absolute", left: 44, top: 100, display: "flex", gap: 14, alignItems: "center", ...piece(0) }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: C.acid }} />
          {[70, 54, 62].map((w, i) => (
            <span key={i} style={{ width: w, height: 10, borderRadius: 5, background: "rgba(242,239,233,0.2)", marginLeft: i === 0 ? 270 : 6 }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 44, top: 196, width: 380, height: 44, borderRadius: 12, background: C.bone, ...piece(1) }} />
        <div style={{ position: "absolute", left: 44, top: 254, width: 270, height: 44, borderRadius: 12, background: C.bone, ...piece(2) }} />
        <div style={{ position: "absolute", left: 44, top: 322, width: 330, height: 14, borderRadius: 7, background: "rgba(242,239,233,0.22)", ...piece(3) }} />
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 372,
            width: 224,
            height: 68,
            borderRadius: 34,
            background: C.acid,
            color: C.ink,
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 27,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...piece(4),
            scale: String(1 - press * 0.08),
          }}
        >
          Get started
        </div>
        <div
          style={{
            position: "absolute",
            left: 480,
            top: 170,
            width: 276,
            height: 270,
            borderRadius: 24,
            background: `linear-gradient(140deg, ${C.iris}, #3B2A99 70%, ${C.ink8})`,
            ...piece(3),
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 40, top: 60, width: 190, height: 190, borderRadius: 95, background: C.acid, opacity: 0.9, translate: `${Math.sin(b * 1.4) * 14}px ${Math.cos(b * 1.4) * 10 + 40}px` }} />
        </div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ position: "absolute", left: 44 + k * 244, top: 480, width: 224, height: 160, borderRadius: 20, background: C.ink8, border: "1.5px solid rgba(242,239,233,0.08)", ...piece(5 + k) }}>
            <div style={{ margin: 22, width: 40, height: 40, borderRadius: 12, background: [C.acid, C.iris, C.coral][k] }} />
            <div style={{ marginLeft: 22, width: 130, height: 12, borderRadius: 6, background: "rgba(242,239,233,0.2)" }} />
          </div>
        ))}
        {/* click ripple */}
        <div
          style={{
            position: "absolute",
            left: 156 - 120,
            top: 406 - 120,
            width: 240,
            height: 240,
            borderRadius: 120,
            border: `4px solid ${C.acid}`,
            scale: String(ripple * 1.5),
            opacity: (1 - ripple) * (b > 1.32 ? 1 : 0),
          }}
        />
      </div>
      {/* code chip */}
      <div
        style={{
          position: "absolute",
          left: -70,
          top: 668,
          padding: "22px 30px",
          borderRadius: 20,
          background: C.ink,
          color: C.acid,
          fontFamily: F.mono,
          fontSize: 30,
          boxShadow: "0 30px 60px rgba(7,7,10,0.35)",
          rotate: "-3deg",
          scale: String(tw(b, 0.4, 0.75, ease.back)),
        }}
      >
        <span style={{ color: C.mist }}>{"> "}</span>
        {CODE.slice(0, typed)}
        <span style={{ opacity: Math.floor(b * 4) % 2 ? 0 : 1 }}>▍</span>
      </div>
      {/* toast */}
      <div
        style={{
          position: "absolute",
          right: -30,
          top: -14,
          padding: "20px 28px",
          borderRadius: 20,
          background: C.iris,
          color: C.bone,
          fontFamily: F.sans,
          fontWeight: 600,
          fontSize: 30,
          display: "flex",
          gap: 14,
          alignItems: "center",
          boxShadow: "0 24px 50px rgba(124,92,255,0.45)",
          scale: String(toast),
          rotate: `${mix(toast, 12, 4)}deg`,
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 8, background: C.acid }} />
        New lead captured
      </div>
      {/* cursor */}
      <svg
        width={54}
        height={54}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: cx, top: cy, scale: String(1 - press * 0.2), opacity: tw(b, 0.7, 0.8), filter: "drop-shadow(0 6px 10px rgba(7,7,10,0.4))" }}
      >
        <path d="M4 2 L4 19 L8.6 14.8 L11.8 22 L14.6 20.8 L11.5 13.8 L18 13.6 Z" fill={C.ink} stroke={C.bone} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------- 04 BRAND & SOCIAL
const SWATCHES = [C.iris, C.ink, C.bone, C.coral, C.cyan];

const Social: React.FC<{ b: number }> = ({ b }) => {
  const phone = tw(b, 0.05, 0.55);
  const fan = tw(b, 0.3, 0.95, ease.back);
  const like = tw(b, 1.0, 1.3, ease.back);
  const follow = b > 1.35;
  return (
    <div style={stage}>
      {/* swatch fan */}
      {SWATCHES.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 290,
            top: 250,
            width: 220,
            height: 330,
            borderRadius: 28,
            background: c,
            border: c === C.bone ? "2px solid rgba(7,7,10,0.15)" : "none",
            transformOrigin: "50% 120%",
            rotate: `${(i - 2) * 33 * fan}deg`,
            boxShadow: "0 24px 50px rgba(7,7,10,0.28)",
            opacity: clamp(phone * 3),
          }}
        >
          <div style={{ position: "absolute", left: 20, top: 18, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.08em", color: c === C.ink || c === C.iris ? C.bone : C.ink, opacity: 0.8 }}>
            {["IRIS", "INK", "BONE", "CORAL", "SKY"][i]}
          </div>
        </div>
      ))}
      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 60,
          width: 360,
          height: 690,
          borderRadius: 58,
          background: C.ink,
          padding: 14,
          boxShadow: "0 60px 100px rgba(7,7,10,0.45)",
          translate: `0 ${(1 - phone) * 160}px`,
          rotate: `${mix(phone, 10, -3)}deg`,
          opacity: clamp(phone * 2.5),
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 46, background: C.ink8, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: 14, width: 100, height: 26, borderRadius: 13, background: C.ink, translate: "-50% 0" }} />
          <div style={{ position: "absolute", left: 22, top: 64, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: `linear-gradient(135deg, ${C.acid}, ${C.iris})` }} />
            <div>
              <div style={{ width: 120, height: 12, borderRadius: 6, background: "rgba(242,239,233,0.6)" }} />
              <div style={{ marginTop: 9, width: 78, height: 9, borderRadius: 5, background: "rgba(242,239,233,0.2)" }} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 72,
              padding: "9px 16px",
              borderRadius: 999,
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 18,
              background: follow ? "transparent" : C.acid,
              color: follow ? C.acid : C.ink,
              border: `2px solid ${C.acid}`,
              scale: String(1 + (tw(b, 1.35, 1.45) - tw(b, 1.45, 1.7)) * 0.2),
            }}
          >
            {follow ? "Following" : "Follow"}
          </div>
          <div style={{ position: "absolute", left: 16, right: 16, top: 138, height: 330, borderRadius: 26, background: `linear-gradient(150deg, ${C.iris} 0%, ${C.coral} 100%)`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 22, bottom: 18, fontFamily: F.serif, fontStyle: "italic", fontSize: 76, lineHeight: 0.95, color: C.bone }}>
              Sounds
              <br />
              like you.
            </div>
            {/* double-tap heart */}
            <svg width={150} height={150} viewBox="0 0 24 24" style={{ position: "absolute", left: 90, top: 60, scale: String(like * (1 - tw(b, 1.5, 1.8, ease.in))), opacity: 0.95 }}>
              <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.200 2.800 4.500 6.300 4.500c2.100 0 3.900 1.200 5.700 3.400 1.800-2.200 3.600-3.400 5.700-3.400 3.500 0 5.400 3.700 3.900 7.200C19.500 16.400 12 21 12 21z" fill={C.bone} />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 24, top: 490, display: "flex", gap: 18, alignItems: "center" }}>
            <svg width={38} height={38} viewBox="0 0 24 24" style={{ scale: String(1 + like * 0.15) }}>
              <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.200 2.800 4.500 6.300 4.500c2.100 0 3.900 1.200 5.700 3.400 1.800-2.200 3.600-3.400 5.700-3.400 3.500 0 5.400 3.700 3.900 7.200C19.500 16.400 12 21 12 21z" fill={b > 1.0 ? C.coral : "none"} stroke={b > 1.0 ? C.coral : C.bone} strokeWidth={1.8} />
            </svg>
            <div style={{ width: 30, height: 30, borderRadius: 15, border: `2.5px solid ${C.bone}` }} />
            <div style={{ width: 30, height: 30, borderRadius: 8, border: `2.5px solid ${C.bone}`, rotate: "45deg", scale: "0.8" }} />
          </div>
          <div style={{ position: "absolute", left: 24, top: 552, width: 250, height: 11, borderRadius: 6, background: "rgba(242,239,233,0.5)" }} />
          <div style={{ position: "absolute", left: 24, top: 578, width: 170, height: 11, borderRadius: 6, background: "rgba(242,239,233,0.2)" }} />
        </div>
      </div>
      {/* floating hearts */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = tw(b, 1.02 + i * 0.09, 1.9 + i * 0.05, ease.out);
        return (
          <svg
            key={i}
            width={44 + (i % 3) * 16}
            height={44 + (i % 3) * 16}
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: 560 + ((i * 53) % 150),
              top: 470,
              translate: `${Math.sin(p * 5 + i) * 26}px ${-p * (300 + i * 50)}px`,
              rotate: `${(i - 2) * 9}deg`,
              scale: String(Math.min(1, p * 6)),
              opacity: (1 - tw(b, 1.6, 2.0)) * (p > 0 ? 1 : 0),
            }}
          >
            <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.200 2.800 4.500 6.300 4.500c2.100 0 3.900 1.200 5.700 3.400 1.800-2.200 3.600-3.400 5.700-3.400 3.500 0 5.400 3.700 3.900 7.200C19.500 16.400 12 21 12 21z" fill={i % 2 ? C.iris : C.ink} />
          </svg>
        );
      })}
      {/* type specimen card */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 430,
          width: 230,
          height: 250,
          borderRadius: 28,
          background: C.ink,
          color: C.bone,
          rotate: `${mix(tw(b, 0.45, 0.9, ease.back), -30, -9)}deg`,
          scale: String(tw(b, 0.45, 0.9, ease.back)),
          boxShadow: "0 30px 60px rgba(7,7,10,0.35)",
        }}
      >
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 150, lineHeight: 1, padding: "26px 0 0 30px" }}>
          A<span style={{ color: C.acid }}>a</span>
        </div>
        <div style={{ position: "absolute", left: 30, bottom: 24, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.1em", color: C.mist }}>IDENTITY</div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------- scene
const VIGNETTES: {
  no: string;
  lines: [string, string];
  blurb: string;
  tags: string[];
  dir: "left" | "right" | "up" | "down";
  Art: React.FC<{ b: number }>;
}[] = [
  { no: "01", lines: ["SEO &", "Content"], blurb: "Organic traffic that compounds.", tags: ["Technical SEO", "Content", "Local SEO"], dir: "left", Art: Seo },
  { no: "02", lines: ["Performance", "Ads"], blurb: "Campaigns run on real numbers.", tags: ["Google Ads", "Meta Ads", "LinkedIn"], dir: "up", Art: Ads },
  { no: "03", lines: ["Web Design", "& Build"], blurb: "Built to turn visitors into leads.", tags: ["UX/UI", "Next.js", "Landing Pages"], dir: "right", Art: Web },
  { no: "04", lines: ["Brand &", "Social"], blurb: "A presence that sounds like you.", tags: ["Identity", "Social", "Creative"], dir: "down", Art: Social },
];

export const Services: React.FC = () => {
  const b = useBeat();
  return (
    <AbsoluteFill style={{ background: C.acid }}>
      {VIGNETTES.map((v, i) => {
        const local = b - i * 2;
        // Keep the previous plate alive underneath while the next one wipes over it.
        if (local < 0 || local > 2.4) return null;
        const p = tw(local, 0, 0.38, ease.inOut);
        const plate = PLATES[i];
        const drift = (1 - tw(local, 0, 0.7)) * 90;
        const shift = { left: `${drift}px 0`, right: `${-drift}px 0`, up: `0 ${drift}px`, down: `0 ${-drift}px` }[v.dir];
        return (
          <AbsoluteFill key={v.no} style={{ background: plate.bg, clipPath: wipe(v.dir, p), zIndex: i }}>
            <AbsoluteFill style={{ translate: shift }}>
              <Copy b={local} no={v.no} lines={v.lines} blurb={v.blurb} tags={v.tags} plate={plate} />
              <v.Art b={local} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
