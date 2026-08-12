import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        concrete: {
          950: "#141414",
          900: "#1c1c1e",
          800: "#28282b",
        },
        chalk: "#EDEAE4",
        steel: "#4A4E54",
        volt: "#C4FF4D",
        ember: "#FF5A1F",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
