import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#021c1b", ink2: "#3b5553", ink3: "#647d7a",
        brand: { DEFAULT: "#02df71", hover: "#00c765", mid: "#02b36b", deep: "#027a52" },
        mint: "#f1faf5", mint2: "#dff4e8", line: "#d3e5db",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "Segoe UI", "system-ui", "sans-serif"],
        body: ["Figtree", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
