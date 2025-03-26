import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grey: {
          500: "#3D5E6C", //paynes grey
          // 200: "#264250", //charcoal
          100: "#1F3645", //gunmetal
        },
        blue: {
          // 500: "#74B3CE", //carolina blue
          // 300: "#629EB0", //moonstone
          200: "#508991", //blue munsell
          100: "#172A3A", //prussian blue
        },
        green: {
          900: "#09BC8A", //mint
          500: "#004346", //midnight green
          100: "#0C3740", //midnight greem (dark)
        },
        white: {
          DEFAULT: "F0EDEE", //antiflash white 
        }
      },
    },
  },
  // darkMode: "class",
  plugins: [heroui()],
} satisfies Config;
