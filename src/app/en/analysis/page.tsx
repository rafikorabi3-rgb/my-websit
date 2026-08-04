import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getAllPosts } from "@/lib/content";
import { AnalysisCard } from "@/components/AnalysisCard";

const locale = "en" as const;

export const metadata = pageMetadata({
  locale,
  path: "/analysis",
  title: "Analysis",
  description:
    "Regular analysis on gold, oil, and the dollar, built on technical structure and macro context.",
});

export default function EnglishAnalysisIndexPage() {
  const t = getDictionary(locale);
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">
        {t.nav.analysis}
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
        Analysis
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        Every analysis here follows the same logic: a bullish scenario, a
        bearish scenario, and a clear invalidation level. No calls to follow
        blindly — just reasoning you can check yourself.
      </p>

      {posts.length === 0 ? (
        <p className="mt-16 text-sm text-fg-muted">No analysis published yet.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <AnalysisCard key={post.slug} locale={locale} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
