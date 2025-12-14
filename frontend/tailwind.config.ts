import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ink-900": "#05070b",
        "panel-800": "rgba(255,255,255,0.04)",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(79, 70, 229, 0.25)",
      },
      backgroundImage: {
        "orb-gradient": "radial-gradient(circle at 30% 20%, rgba(124,58,237,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.25), transparent 35%), radial-gradient(circle at 60% 70%, rgba(56,239,125,0.18), transparent 45%)",
        noise: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseLine: {
          "0%": { opacity: "0.1", transform: "scaleX(0.8)" },
          "50%": { opacity: "0.6", transform: "scaleX(1)" },
          "100%": { opacity: "0.1", transform: "scaleX(0.8)" },
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        float: "float 12s ease-in-out infinite",
        "pulse-line": "pulseLine 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
