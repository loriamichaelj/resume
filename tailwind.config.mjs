/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // `white` and the two key `ink` surfaces resolve to CSS variables so a
        // single class swap on <html> (.light) re-themes the whole site. The
        // <alpha-value> placeholder keeps Tailwind's /opacity modifiers working.
        white: "rgb(var(--c-fg) / <alpha-value>)",
        ink: {
          950: "rgb(var(--c-ink-950) / <alpha-value>)",
          900: "rgb(var(--c-ink-900) / <alpha-value>)",
          850: "#111114",
          800: "#17171c",
          700: "#22222a",
          600: "#2e2e38",
        },
        flame: "#f4492f",
        rose: "#f367a5",
        violet: "#553deb",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1180px",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(227.58deg, #f4492f -44.04%, #f367a5 42.36%, #553deb 113.95%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease forwards",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
      },
    },
  },
  plugins: [],
};
