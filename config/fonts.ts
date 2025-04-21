import { Poppins, Poetsen_One } from "next/font/google";

export const poppins = Poppins({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  variable: "--font-poppins",
});

export const poetsen_one = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  variable: "--font-poetsen-one",
});
