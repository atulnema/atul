import React from "react";
import type { StyleTokens } from "../styles/types";
import { Label } from "./Label";

/**
 * Framed panel for a picture, clip or screenshot, with an optional label strip below.
 * Size and position come from `style`; the frame comes from the style tokens.
 */
export const Card: React.FC<{
  tokens: StyleTokens;
  style: React.CSSProperties;
  footer?: string;
  children: React.ReactNode;
}> = ({ tokens, style, footer, children }) => {
  const { card, colors } = tokens;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        gap: card.borderWidth,
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          borderRadius: card.radius,
          padding: card.padding,
          backgroundColor: colors.cardBackground,
          // An outline does not change the layout box, so measured sizes stay exact.
          outline: `${card.borderWidth}px solid ${colors.cardBorder}`,
        }}
      >
        {children}
      </div>
      {footer ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Label tokens={tokens}>{footer}</Label>
        </div>
      ) : null}
    </div>
  );
};
