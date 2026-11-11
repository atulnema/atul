/**
 * A style is a set of measured numbers. Every value here comes from a script in
 * scripts/, taken from the reference reel's pixels. Nothing is eyeballed.
 *
 * Lengths are in pixels on `canvas` (the reel's own resolution). Durations are in
 * seconds so a style measured on a 30 fps reel still plays right on 24 or 60 fps footage.
 */

export type FontToken = {
  /** CSS family name the components use. */
  family: string;
  /** File in public/fonts/ that font_match.py scored, or null for a font already on the machine. */
  file: string | null;
  weight: string;
  style: "normal" | "italic";
};

/** cubic-bezier control points, as printed by motion.py. */
export type Bezier = [number, number, number, number];

export type StyleTokens = {
  name: string;
  /** Whose editing this is. Credit them on screen and in the caption when you show their reel. */
  source: { creator: string; reel: string };
  canvas: { width: number; height: number };

  fonts: {
    title: FontToken;
    caption: FontToken;
    label: FontToken;
  };

  colors: {
    /** Text placed over dark footage. */
    onDark: string;
    /** Text placed over light footage or cards. */
    onLight: string;
    captionBox: string;
    captionText: string;
    labelBox: string;
    labelText: string;
    cardBackground: string;
    cardBorder: string;
  };

  caption: {
    fontSize: number;
    /** Top and bottom edge of the caption box, from measure_text.py. */
    boxTop: number;
    boxBottom: number;
    paddingX: number;
    radius: number;
    letterSpacing: number;
    /** Words are grouped into pages that stay up for about this long. */
    pageMs: number;
    /** "karaoke": each word lights up as it is said and stays lit. "current": only the word being said is lit. */
    highlight: "karaoke" | "current";
    /** Opacity of words that are not lit. */
    dimOpacity: number;
  };

  title: {
    /** Every line is scaled so its width equals this. */
    lineWidth: number;
    /** Top edge of the first line's box. */
    top: number;
    /** Line box height as a multiple of that line's font size. */
    lineHeight: number;
    /** Letter spacing in em. */
    letterSpacing: number;
    uppercase: boolean;
    /** How long one letter takes to rise into place. */
    riseSeconds: number;
    /** How far below its resting place a letter starts. */
    risePx: number;
    /** Delay between one letter starting and the next. */
    staggerSeconds: number;
    easing: Bezier;
  };

  label: {
    fontSize: number;
    /** Letter spacing in em. */
    letterSpacing: number;
    uppercase: boolean;
    paddingX: number;
    paddingY: number;
    radius: number;
  };

  card: {
    radius: number;
    borderWidth: number;
    padding: number;
  };

  /** Blur transition between shots, timed with motion.py. */
  whip: {
    inSeconds: number;
    holdSeconds: number;
    outSeconds: number;
    /** Horizontal blur at the peak, in px. */
    blurPx: number;
  };

  grade: {
    /** The .cube built by grade.py, kept next to this file. cut.py bakes it into the footage. */
    lut: string | null;
    strength: number;
  };
};
