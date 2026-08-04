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
    default: `${siteConfig.name} — ${siteConfig.taglineAr}`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "محلل مالي ومدرّب تداول. تحليل الأسواق عبر البنية الفنية (SMC، موجات إليوت، فيبوناتشي) بالتوازي مع القراءة الاقتصادية الكلية والجيوسياسية.",
  alternates: {
    canonical: "/",
    languages: { ar: "/", en: "/en" },
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    alternateLocale: "en_US",
    siteName: siteConfig.name,
  },
};

export default function ArabicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-cairo antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd("ar")) }}
        />
        <Header locale="ar" />
        <main className="flex-1">{children}</main>
        <Footer locale="ar" />
      </body>
    </html>
  );
}
