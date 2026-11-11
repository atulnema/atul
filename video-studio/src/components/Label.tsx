import React from "react";
import { fontStyle } from "../fonts";
import type { StyleTokens } from "../styles/types";

/** Small spaced-out label, boxed or plain. Positioned by its parent. */
export const Label: React.FC<{
  children: string;
  tokens: StyleTokens;
  boxed?: boolean;
  color?: string;
}> = ({ children, tokens, boxed = true, color }) => {
  const { label, colors, fonts } = tokens;
  return (
    <div
      style={{
        display: "inline-block",
        fontSize: label.fontSize,
        letterSpacing: `${label.letterSpacing}em`,
        lineHeight: 1,
        whiteSpace: "pre",
        textTransform: label.uppercase ? "uppercase" : "none",
        padding: boxed ? `${label.paddingY}px ${label.paddingX}px` : 0,
        borderRadius: label.radius,
        backgroundColor: boxed ? colors.labelBox : "transparent",
        color: color ?? (boxed ? colors.labelText : colors.onDark),
        ...fontStyle(fonts.label),
      }}
    >
      {children}
    </div>
  );
};
