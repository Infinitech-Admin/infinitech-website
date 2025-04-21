import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0A3D62", // Dark Blue
          light: "#0E5A8A", // Medium Blue
          lighter: "#1B7EBF", // Brighter Blue
        },
        gray: {
          900: "#1C1F26", // Dark Gray
          700: "#4F5665", // Medium Gray
          400: "#C5C6C7", // Light Gray
          100: "#F5F5F5", // Very Light Gray
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber/Orange for contrast
          light: "#FFB84D", // Soft Orange for subtle highlights
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;
