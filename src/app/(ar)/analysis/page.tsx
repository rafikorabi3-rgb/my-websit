import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getAllPosts } from "@/lib/content";
import { AnalysisCard } from "@/components/AnalysisCard";

const locale = "ar" as const;

export const metadata = pageMetadata({
  locale,
  path: "/analysis",
  title: "التحليلات",
  description: "تحليلات دورية للذهب والنفط والدولار، مبنية على البنية الفنية والسياق الكلي.",
});

export default function ArabicAnalysisIndexPage() {
  const t = getDictionary(locale);
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">
        {t.nav.analysis}
      </p>
      <h1 className="mt-4 font-cairo text-3xl font-semibold text-fg sm:text-4xl">
        التحليلات
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        كل تحليل هنا يتبع نفس المنطق: سيناريو صاعد، سيناريو هابط، ومستوى
        إبطال واضح. لا توصيات، فقط تفكير تقدر تراجعه بنفسك.
      </p>

      {posts.length === 0 ? (
        <p className="mt-16 text-sm text-fg-muted">
          لا توجد تحليلات منشورة بعد.
        </p>
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
