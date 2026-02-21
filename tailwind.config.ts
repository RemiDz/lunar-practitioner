import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Selenite & Void palette
        void: {
          black: "#05050F",
          DEFAULT: "#05050F",
        },
        indigo: {
          deep: "#0A0A2E",
          DEFAULT: "#0A0A2E",
        },
        selenite: {
          white: "#F0EEF8",
          DEFAULT: "#F0EEF8",
        },
        moonsilver: {
          DEFAULT: "#C8C4DC",
        },
        lunar: {
          gold: "#E8C97A",
          DEFAULT: "#E8C97A",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Lato", "Helvetica Neue", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
