import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-frank)", "serif"],
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "var(--color-primary-fg)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-fg)",
        },
        highlight: {
          DEFAULT: "var(--color-highlight)",
          hover: "var(--color-highlight-hover)",
          foreground: "var(--color-highlight-fg)",
          soft: "var(--color-highlight-soft)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-fg)",
        },
        border: "var(--color-border)",
        ring: "var(--color-ring)",
        status: {
          success: "var(--color-success)",
          "success-surface": "var(--color-success-surface)",
          warning: "var(--color-warning)",
          "warning-surface": "var(--color-warning-surface)",
          pending: "var(--color-pending)",
          "pending-surface": "var(--color-pending-surface)",
          done: "var(--color-done)",
          "done-surface": "var(--color-done-surface)",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 1px 3px oklch(18% 0.03 40 / 0.08), 0 1px 2px oklch(18% 0.03 40 / 0.06)",
        "card-hover": "0 4px 12px oklch(18% 0.03 40 / 0.12), 0 2px 4px oklch(18% 0.03 40 / 0.08)",
        input: "0 0 0 3px var(--color-ring)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
