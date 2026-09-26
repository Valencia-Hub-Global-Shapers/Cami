import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        ink: "#211E19",
        terracotta: {
          DEFAULT: "#C1652F",
          hover: "#A34F22"
        },
        route: "#2F6F65",
        sand: "#F1E9D8",
        border: "#E6DDCC",
        muted: "#4A4438",
        faint: "#8A8271"
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"]
      },
      borderRadius: {
        card: "16px",
        pill: "999px"
      }
    }
  },
  plugins: []
};

export default config;
