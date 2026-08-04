import "server-only";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildAnalysisRss(locale: Locale): string {
  const base = siteConfig.siteUrl;
  const prefix = locale === "ar" ? "" : "/en";
  const posts = getAllPosts(locale);

  const title =
    locale === "ar"
      ? `${siteConfig.name} — التحليلات`
      : `${siteConfig.name} — Analysis`;
  const description = locale === "ar" ? siteConfig.taglineAr : siteConfig.taglineEn;
  const feedUrl = `${base}${prefix}/rss.xml`;
  const siteUrl = `${base}${prefix}`;

  const items = posts
    .map((post) => {
      const url = `${base}${prefix}/analysis/${post.slug}`;
      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${escapeXml(post.excerpt)}</description>
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${siteUrl}</link>
  <description>${escapeXml(description)}</description>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;
}
