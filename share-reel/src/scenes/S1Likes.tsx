import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, INTER, b, captionText, clamp, easeIn, easeOut, glass } from "../theme";
import { GlossyComment, GlossyHeart } from "../Icons";
import { CaptionBlock, Shatter, Slam } from "../Common";

// 0:00 - 0:07 (frames 0-210). Hook + shatter + mask wipe.
export const SHATTER_AT = b(7); // 102 - hand swipe connects on the beat
const POP_AT = b(1) + 4; // icons pop just after the crash zoom
const STRIKE_AT = b(3); // red strikethrough on the beat
const EGO_AT = b(8); // 116
const WIPE_AT = 196;

const Counter: React.FC<{ value: string; from: number }> = ({ value, from }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 6], [0, 1], clamp);
  const y = interpolate(f, [from, from + 10], [20, 0], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        ...glass,
        borderRadius: 999,
        padding: "10px 26px",
        fontFamily: INTER,
        fontWeight: 700,
        fontSize: 40,
        color: C.white,
        opacity: o,
        translate: `0px ${y}px`,
        marginTop: 18,
        display: "inline-block",
      }}
    >
      {value}
    </div>
  );
};

const FloatingIcon: React.FC<{
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  delay: number;
  children: React.ReactNode;
  counter: string;
}> = ({ x, y, fromX, fromY, delay, children, counter }) => {
  const f = useCurrentFrame();
  const t0 = POP_AT + delay;
  const p = interpolate(f, [t0, t0 + 12], [0, 1], { ...clamp, easing: easeOut });
  const s = interpolate(f, [t0, t0 + 7, t0 + 13], [0.2, 1.15, 1], clamp);
  const bob = Math.sin((f + delay * 7) / 11) * 8;
  const tilt = Math.sin((f + delay * 5) / 17) * 6;
  if (f < t0 || f >= SHATTER_AT) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(p, [0, 1], [fromX, x]) - 110,
        top: interpolate(p, [0, 1], [fromY, y]) - 110 + bob,
        width: 220,
        textAlign: "center",
        scale: String(s),
        rotate: `${tilt}deg`,
        opacity: interpolate(f, [t0, t0 + 3], [0, 1], clamp),
      }}
    >
      {children}
      <div>
        <Counter value={counter} from={t0 + 6} />
      </div>
    </div>
  );
};

export const S1Likes: React.FC = () => {
  const f = useCurrentFrame();

  // hand swipe streak sells the "swipe across frame" gesture
  const swipe = interpolate(f, [SHATTER_AT - 8, SHATTER_AT + 4], [-500, 1300], { ...clamp, easing: easeIn });
  const swipeO = interpolate(f, [SHATTER_AT - 8, SHATTER_AT - 4, SHATTER_AT + 2, SHATTER_AT + 5], [0, 0.8, 0.8, 0], clamp);

  const strike = interpolate(f, [STRIKE_AT, STRIKE_AT + 6], [0, 1], { ...clamp, easing: easeOut });
  const capIn = interpolate(f, [6, 12], [0, 1], clamp);
  const capOut = interpolate(f, [SHATTER_AT, SHATTER_AT + 4], [1, 0], clamp);

  // subject mask wipe: a dark panel with a feathered diagonal edge
  const wipe = interpolate(f, [WIPE_AT, 210], [-1400, 1100], { ...clamp, easing: easeIn });

  return (
    <AbsoluteFill>
      <FloatingIcon x={235} y={640} fromX={360} fromY={1000} delay={0} counter="1.2K">
        <GlossyHeart size={200} id="h1" />
      </FloatingIcon>
      <FloatingIcon x={850} y={600} fromX={720} fromY={1000} delay={3} counter="84">
        <GlossyComment size={200} id="c1" />
      </FloatingIcon>

      <Shatter x={235} y={640} at={SHATTER_AT} seed="heart" tint={C.red} />
      <Shatter x={850} y={600} at={SHATTER_AT + 1} seed="cmt" tint="#ff5a5f" />

      <div
        style={{
          position: "absolute",
          top: 520,
          left: swipe,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)",
          scale: "2.4 0.5",
          filter: "blur(18px)",
          opacity: swipeO,
        }}
      />

      {f < SHATTER_AT + 4 && (
        <CaptionBlock y={1230} style={{ opacity: capIn * capOut }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{ ...captionText, fontSize: 104 }}>LIKES &amp;</div>
            <div style={{ ...captionText, fontSize: 104 }}>COMMENTS</div>
            <div
              style={{
                position: "absolute",
                left: -20,
                top: "50%",
                height: 16,
                width: `calc(${strike * 100}% + 40px)`,
                background: C.red,
                borderRadius: 8,
                rotate: "-6deg",
                boxShadow: `0 0 24px ${C.red}, 0 0 60px ${C.red}`,
              }}
            />
          </div>
        </CaptionBlock>
      )}

      <CaptionBlock y={1240}>
        <Slam at={EGO_AT} size={110}>
          EGO BOOST
        </Slam>
        <Slam at={EGO_AT + 5} size={110}>
          <span style={{ color: C.red }}>≠</span> <span style={{ color: C.green }}>GROWTH</span>
        </Slam>
      </CaptionBlock>

      <div
        style={{
          display: f >= WIPE_AT ? "block" : "none",
          position: "absolute",
          top: -200,
          left: wipe,
          width: 1400,
          height: 2400,
          rotate: "12deg",
          background: "linear-gradient(90deg, rgba(5,7,11,0) 0%, #05070b 18%, #05070b 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
