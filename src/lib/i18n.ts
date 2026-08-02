import "server-only";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export type Dictionary = typeof ar;

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === "ar" ? clean || "/" : `/en${clean}`;
}
