import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/content";
import { AnalysisCard } from "@/components/AnalysisCard";

const locale = "en" as const;

export const metadata = pageMetadata({
  locale,
  path: "/vip",
  title: "VIP Channel",
  description: "In-depth analysis and daily market coverage, direct on Telegram.",
});

const BENEFITS = [
  "Detailed daily analysis on gold and the dollar, with clear scenarios and invalidation levels",
  "Real-time coverage when market-moving data drops",
  "The reasoning behind every call explained — not just the outcome",
  "A full, reviewable archive of past analysis",
];

export default function EnglishVipPage() {
  const t = getDictionary(locale);
  const samplePosts = getAllPosts(locale).slice(0, 2);
  const joinHref =
    siteConfig.links.telegramVip === "FILL_IN"
      ? "#"
      : siteConfig.links.telegramVip;
  const price =
    siteConfig.vip.priceAmount === "FILL_IN"
      ? t.offers.priceOnRequest
      : `${siteConfig.vip.priceAmount} ${siteConfig.vip.priceCurrency}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">VIP</p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
        VIP Channel
      </h1>
      {/* DRAFT: refine copy, confirm pricing */}
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        Direct daily coverage on Telegram, following the same analytical
        logic you see on this site — with more depth and faster turnaround.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">
            What you get
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-fg">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gold bg-bg-raised p-6 text-center sm:p-8">
          <p className="text-xs text-fg-muted">Subscription</p>
          <p className="mt-2 text-3xl font-semibold text-gold">{price}</p>
          <a
            href={joinHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t.cta.joinVip}
          </a>
        </div>
      </div>

      {samplePosts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-sm font-semibold tracking-widest text-gold uppercase">
            Sample analysis
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {samplePosts.map((post) => (
              <AnalysisCard key={post.slug} locale={locale} {...post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
