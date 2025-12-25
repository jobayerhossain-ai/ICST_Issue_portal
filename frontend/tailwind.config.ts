import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: {
          cyan: "hsl(var(--primary))",
          purple: "hsl(var(--secondary))",
          blue: "hsl(var(--accent))",
          pink: "hsl(var(--secondary))",
          green: "hsl(var(--accent))",
        },
        sky: {
          50: "hsl(var(--sky-blue-50))",
          100: "hsl(var(--sky-blue-100))",
          200: "hsl(var(--sky-blue-200))",
          300: "hsl(var(--sky-blue-300))",
          400: "hsl(var(--sky-blue-400))",
          500: "hsl(var(--sky-blue-500))",
          600: "hsl(var(--sky-blue-600))",
          700: "hsl(var(--sky-blue-700))",
          800: "hsl(var(--sky-blue-800))",
          900: "hsl(var(--sky-blue-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "apple-smooth": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        "apple": "350ms",
        "apple-slow": "500ms",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "accordion-up": "accordion-up 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-in": "fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
