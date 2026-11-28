import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode; vb?: string }> = ({
  size = 96,
  color = "currentColor",
  stroke = 2,
  style,
  children,
  vb = "0 0 24 24",
}) => (
  <svg
    width={size}
    height={size}
    viewBox={vb}
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

export const Mic: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v5" />
    <path d="M8 22h8" />
  </Svg>
);

export const TextIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 7V5h16v2" />
    <path d="M12 5v14" />
    <path d="M9 19h6" />
  </Svg>
);

export const Clone: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="3.2" />
    <path d="M2.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <circle cx="16.5" cy="8" r="3.2" strokeDasharray="2 1.6" />
    <path d="M14.5 14.3c.6-.2 1.3-.3 2-.3 2.7 0 4.9 1.8 5.5 5" strokeDasharray="2 1.6" />
  </Svg>
);

export const Sliders: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 21v-7" />
    <path d="M4 10V3" />
    <path d="M12 21v-9" />
    <path d="M12 8V3" />
    <path d="M20 21v-5" />
    <path d="M20 12V3" />
    <path d="M1 14h6" />
    <path d="M9 8h6" />
    <path d="M17 16h6" />
  </Svg>
);

export const Film: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2.5" />
    <path d="M7 4v16" />
    <path d="M17 4v16" />
    <path d="M2 9h5" />
    <path d="M2 15h5" />
    <path d="M17 9h5" />
    <path d="M17 15h5" />
  </Svg>
);

export const Lock: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.3" />
  </Svg>
);

export const Check: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
);

export const Cross: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Svg>
);

export const User: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4.2-6 8-6s7 2 8 6" />
  </Svg>
);

export const CardIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </Svg>
);

export const Play: React.FC<P & { fill?: string }> = ({ fill = "currentColor", ...p }) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12.5-7.5z" fill={fill} />
  </Svg>
);

export const Cursor: React.FC<P> = ({ size = 72, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path
      d="M4 2.5l15 8.2-6.6 1.6 3.8 7.4-2.9 1.5-3.8-7.4L4.6 18z"
      fill="#fff"
      stroke="#111"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </svg>
);

export const Bookmark: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-6-4.5L6 21z" />
  </Svg>
);

export const Wallet: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3" />
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M16 13.5h2.5" />
  </Svg>
);

export const Globe: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19" />
    <path d="M12 2.5c2.6 2.8 3.9 6 3.9 9.5S14.6 18.7 12 21.5C9.4 18.7 8.1 15.5 8.1 12S9.4 5.3 12 2.5z" />
  </Svg>
);
