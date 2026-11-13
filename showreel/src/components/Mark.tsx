import React from "react";
import { C } from "../lib/theme";

/** The Alphastrix "A" mark, same geometry as the site logo. */
export const Mark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} style={{ display: "block", overflow: "visible", ...style }}>
    <path d="M16 2 30 30H22L16 17 10 30H2L16 2Z" fill={C.acid} />
    <path d="M16 2 30 30H22L16 17Z" fill={C.iris} opacity={0.85} />
  </svg>
);
