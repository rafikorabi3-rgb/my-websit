import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllSlugs } from "@/lib/content";
import { locales } from "@/lib/i18n";

const STATIC_PATHS = ["/", "/about", "/analysis", "/academy", "/vip", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === "ar" ? "" : "/en";

    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}${prefix}${path === "/" ? "" : path}`,
        changeFrequency: path === "/analysis" ? "daily" : "monthly",
      });
    }

    for (const slug of getAllSlugs(locale)) {
      entries.push({
        url: `${base}${prefix}/analysis/${slug}`,
        changeFrequency: "monthly",
      });
    }
  }

  return entries;
}
