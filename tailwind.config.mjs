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
        },
        // Brand palette as theme variables (see global.css). Dark: aqua ->
        // violet -> rose -> peach, flame as a warm accent. Light: the same slots
        // hold an amber -> orange -> rose sunset.
        aqua: "rgb(var(--c-aqua) / <alpha-value>)",
        violet: "rgb(var(--c-violet) / <alpha-value>)",
        rose: "rgb(var(--c-rose) / <alpha-value>)",
        peach: "rgb(var(--c-peach) / <alpha-value>)",
        flame: "rgb(var(--c-flame) / <alpha-value>)",
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
        // Theme-aware: the light theme swaps in deeper stops for contrast.
        "brand-gradient": "var(--brand-gradient)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-border": {
          to: { "--border-angle": "360deg" },
        },
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "spin-border": "spin-border 6s linear infinite",
        "ping-soft": "ping-soft 2.2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
