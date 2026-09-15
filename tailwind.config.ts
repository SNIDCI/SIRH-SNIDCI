import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16202B",
        canvas: "#F4F6F4",
        surface: "#FFFFFF",
        line: "#DDE3E0",
        slate: "#5B6B6A",
        accent: {
          DEFAULT: "#3A6B58",
          soft: "#E4EEE8",
          dark: "#274A3E",
        },
        amber: "#B8863B",
        rose: "#A24444",
      },
      fontFamily: {
        serif: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
