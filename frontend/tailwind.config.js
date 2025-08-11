/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Green Colors
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Main Primary
          600: "#16a34a", // Primary Hover
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Secondary Blue Colors
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Main Secondary
          600: "#2563eb", // Secondary Hover
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Accent Colors
        accent: {
          orange: {
            400: "#fb923c",
            500: "#f97316",
            600: "#ea580c",
          },
          purple: {
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea",
          },
        },
        // Semantic Colors
        success: "#22c55e",
        warning: "#f97316",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          "Inter",
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
        "6xl": "3.75rem", // 60px
        "7xl": "4.5rem", // 72px
      },
      spacing: {
        0: "0",
        px: "1px",
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        5: "1.25rem", // 20px
        6: "1.5rem", // 24px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
        16: "4rem", // 64px
        20: "5rem", // 80px
        24: "6rem", // 96px
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        full: "9999px",
      },
      boxShadow: {
        primary: "0 4px 16px rgba(34, 197, 94, 0.15)",
        secondary: "0 4px 16px rgba(59, 130, 246, 0.15)",
        "elevation-1": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "elevation-2": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "elevation-3": "0 8px 32px rgba(0, 0, 0, 0.16)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        "gradient-primary-to-secondary":
          "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #16a34a 0%, #2563eb 50%, #9333ea 100%)",
        "gradient-card": "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
        "gradient-background":
          "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f9fafb 100%)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "pulse-green": "pulse-green 2s infinite",
        "pulse-blue": "pulse-blue 2s infinite",
        float: "float 3s ease-in-out infinite",
        "glow-primary": "glow-primary 2s ease-in-out infinite",
        "glow-secondary": "glow-secondary 2s ease-in-out infinite",
        spin: "spin 1s linear infinite",
        "bounce-dots": "bounce-dots 1.4s ease-in-out infinite both",
      },
      keyframes: {
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInRight: {
          from: {
            opacity: "0",
            transform: "translateX(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "pulse-green": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)",
          },
        },
        "pulse-blue": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "glow-primary": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))",
          },
          "50%": {
            filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))",
          },
        },
        "glow-secondary": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
          },
          "50%": {
            filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))",
          },
        },
        "bounce-dots": {
          "0%, 80%, 100%": {
            transform: "scale(0)",
          },
          "40%": {
            transform: "scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
  // Enable dark mode support
  darkMode: ["class", '[data-theme="dark"]'],
  // Configure safelist to prevent purging of dynamic classes
  safelist: [
    "animate-fade-in-up",
    "animate-slide-in-right",
    "animate-pulse-green",
    "animate-pulse-blue",
    "animate-float",
    "animate-glow-primary",
    "animate-glow-secondary",
    "bg-gradient-primary",
    "bg-gradient-secondary",
    "bg-gradient-primary-to-secondary",
    "bg-gradient-hero",
    "text-primary-500",
    "text-primary-600",
    "text-secondary-500",
    "text-secondary-600",
    "border-primary-500",
    "border-secondary-500",
    "shadow-primary",
    "shadow-secondary",
    "shadow-elevation-1",
    "shadow-elevation-2",
    "shadow-elevation-3",
  ],
};
