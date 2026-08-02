import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "@/lib/i18n";
import type { Post, PostFrontmatter, PostSummary } from "@/types/content";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function postsDir(locale: Locale) {
  return path.join(CONTENT_ROOT, locale, "analysis");
}

export function getAllSlugs(locale: Locale): string[] {
  const dir = postsDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(locale: Locale, slug: string): Post | null {
  const filePath = path.join(postsDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  return {
    ...frontmatter,
    slug,
    content,
    readMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

export function getAllPosts(
  locale: Locale,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): PostSummary[] {
  return getAllSlugs(locale)
    .map((slug) => getPostBySlug(locale, slug))
    .filter((post): post is Post => post !== null)
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((post) => {
      const { content, ...summary } = post;
      void content;
      return summary;
    });
}
