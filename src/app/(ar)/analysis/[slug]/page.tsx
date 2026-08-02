import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getDictionary, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getAllSlugs, getPostBySlug } from "@/lib/content";
import { mdxComponents } from "@/lib/mdx-components";
import { ScenarioBox } from "@/components/ScenarioBox";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";

const locale = "ar" as const;

export function generateStaticParams() {
  return getAllSlugs(locale).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/analysis/${slug}`,
    title: post.title,
    description: post.excerpt,
  });
}

export default async function ArabicAnalysisPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post || post.draft) notFound();

  const t = getDictionary(locale);
  const formattedDate = new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.date));

  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <Link
        href={localePath(locale, "/analysis")}
        className="text-sm text-fg-muted hover:text-gold"
      >
        ← {t.postMeta.backToAnalysis}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
        <span className="rounded-full border border-line-strong px-2 py-0.5 text-gold">
          {post.instrument}
        </span>
        <span>
          {t.postMeta.publishedOn} {formattedDate}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {post.readMinutes} {t.postMeta.readTime}
        </span>
      </div>

      <h1 className="mt-4 font-cairo text-3xl font-semibold text-fg sm:text-4xl">
        {post.title}
      </h1>

      <ScenarioBox
        locale={locale}
        instrument={post.instrument}
        bullish={post.scenario.bullish}
        bearish={post.scenario.bearish}
        invalidation={post.scenario.invalidation}
      />

      <div className="prose prose-invert prose-headings:font-cairo prose-headings:font-semibold prose-headings:text-fg prose-p:leading-relaxed prose-p:text-fg-muted prose-strong:text-fg prose-a:text-gold mt-10 max-w-none">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      <RiskDisclaimer locale={locale} variant="post" />
    </article>
  );
}
