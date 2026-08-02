import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    alternateName: siteConfig.handle,
    url: locale === "ar" ? siteConfig.siteUrl : `${siteConfig.siteUrl}/en`,
    jobTitle:
      locale === "ar"
        ? "محلل مالي ومدرّب تداول"
        : "Financial Analyst & Trading Educator",
    description:
      locale === "ar" ? siteConfig.taglineAr : siteConfig.taglineEn,
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.x,
      siteConfig.links.youtube,
      siteConfig.links.telegramChannel,
    ].filter((link) => link && link !== "FILL_IN"),
  };
}

export function courseJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name:
      locale === "ar"
        ? "منهج التداول — أكاديمية Lotas Capital"
        : "Trading Curriculum — Lotas Capital Academy",
    description:
      locale === "ar"
        ? "منهج تداول متكامل من الصفر حتى الاحتراف: بنية السوق، SMC، موجات إليوت، وإدارة المخاطر."
        : "A complete trading curriculum from zero to advanced: market structure, SMC, Elliott Wave, and risk management.",
    provider: {
      "@type": "Organization",
      name: "Lotas Capital Academy",
    },
    instructor: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };
}
