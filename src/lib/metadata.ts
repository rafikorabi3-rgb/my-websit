import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const arPath = path;
  const enPath = `/en${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: {
      canonical: locale === "ar" ? arPath : enPath,
      languages: { ar: arPath, en: enPath },
    },
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SY" : "en_US",
    },
  };
}
