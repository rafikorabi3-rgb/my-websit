import type { Metadata } from "next";
import { cairo, manrope } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/site-config";
import { personJsonLd } from "@/lib/schema";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.taglineEn}`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "Financial analyst and trading educator. Reading markets through technical structure (SMC, Elliott Wave, Fibonacci) alongside macroeconomic and geopolitical context.",
  alternates: {
    canonical: "/en",
    languages: { ar: "/", en: "/en" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SY",
    siteName: siteConfig.name,
  },
};

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${cairo.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-manrope antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd("en")) }}
        />
        <Header locale="en" />
        <main className="flex-1">{children}</main>
        <Footer locale="en" />
      </body>
    </html>
  );
}
