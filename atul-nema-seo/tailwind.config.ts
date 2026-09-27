import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts", "./config/**/*.ts"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B0A",
          2: "#111110",
          3: "#181816",
          4: "#23231F",
        },
        bone: {
          DEFAULT: "#F2EDE3",
          dim: "#D4CEC2",
        },
        muted: "#A6A195",
        faint: "#858075",
        lime: {
          DEFAULT: "#D4F53C",
          deep: "#B5D61C",
        },
        alert: "#FF8A65",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        mega: ["clamp(3.4rem, 9.4vw, 10.5rem)", { lineHeight: "0.86", letterSpacing: "-0.005em" }],
        d1: ["clamp(3rem, 8.4vw, 9rem)", { lineHeight: "0.9", letterSpacing: "-0.005em" }],
        d2: ["clamp(2.5rem, 5.8vw, 6.25rem)", { lineHeight: "0.92" }],
        d3: ["clamp(2rem, 3.6vw, 3.75rem)", { lineHeight: "0.95" }],
        d4: ["clamp(1.6rem, 2.4vw, 2.4rem)", { lineHeight: "1" }],
      },
      maxWidth: {
        site: "90rem",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
