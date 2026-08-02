import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary, localePath } from "@/lib/i18n";

export function AnalysisCard({
  locale,
  slug,
  title,
  excerpt,
  date,
  instrument,
  readMinutes,
}: {
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  instrument: string;
  readMinutes: number;
}) {
  const t = getDictionary(locale);
  const formattedDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SY" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  ).format(new Date(date));

  return (
    <Link
      href={localePath(locale, `/analysis/${slug}`)}
      className="group block h-full rounded-2xl border border-line p-5 transition-colors hover:border-gold"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
        <span className="rounded-full border border-line-strong px-2 py-0.5 text-gold">
          {instrument}
        </span>
        <span>{formattedDate}</span>
        <span aria-hidden="true">·</span>
        <span>
          {readMinutes} {t.postMeta.readTime}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-fg transition-colors group-hover:text-gold">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{excerpt}</p>
    </Link>
  );
}
