import { Cairo, Manrope } from "next/font/google";

// Self-hosted by Next.js at build time — no runtime request to Google Fonts.
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
