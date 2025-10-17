import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode
        light: {
          bg: {
            primary: "#FFFFFF",
            secondary: "#F5F5F5",
            tertiary: "#ECECEC",
            card: "#FFFFFF",
            hover: "#F8F8F8",
          },
          text: {
            primary: "#000000",
            secondary: "#666666",
            tertiary: "#999999",
          },
          border: {
            primary: "#E0E0E0",
            subtle: "#F0F0F0",
          },
          accent: "#000000",
        },
        // Dark mode
        dark: {
          bg: {
            primary: "#000000",
            secondary: "#0A0A0A",
            tertiary: "#1A1A1A",
            card: "#0A0A0A",
            hover: "#1A1A1A",
            modal: "rgb(6 6 6 / 0.95)", // Custom modal background
          },
          text: {
            primary: "#FFFFFF",
            secondary: "#A0A0A0",
            tertiary: "#707070",
          },
          border: {
            primary: "#2A2A2A",
            subtle: "#1A1A1A",
          },
          accent: "#FFFFFF",
        },
        // Alerts (same for both themes)
        alert: {
          error: "#DC2626",
          errorDark: "#EF4444",
          warning: "#F59E0B",
          warningDark: "#FBBF24",
          success: "#10B981",
          successDark: "#34D399",
          info: "#3B82F6",
          infoDark: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      fontSize: {
        h1: ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        micro: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        currency: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      borderRadius: {
        card: "8px",
        button: "6px",
      },
      transitionDuration: {
        smooth: "150ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideIn: "slideIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
