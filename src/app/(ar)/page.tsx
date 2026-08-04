import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/content";
import { AnalysisCard } from "@/components/AnalysisCard";
import { OfferCard } from "@/components/OfferCard";
import { NewsletterForm } from "@/components/NewsletterForm";

const locale = "ar" as const;

export const metadata = pageMetadata({
  locale,
  path: "/",
  title: `${siteConfig.name} — ${siteConfig.taglineAr}`,
  description:
    "محلل مالي ومدرّب تداول. قراءة الأسواق عبر البنية الفنية والسياق الكلي، بلا وعود مبالغ فيها.",
});

const METHOD_LAYERS = [
  {
    title: "بنية السوق (Market Structure)",
    body: "أين نحن فعليًا داخل الاتجاه؟ قمم وقيعان، كسور بنية (BOS)، وتغيّرات في الطابع (CHoCH) — قبل أي شيء آخر.",
  },
  {
    title: "التأطير بالموجات و SMC",
    body: "أين تتمركز الـ liquidity، وأين نحن على مقياس إليوت المحتمل؟ هذا ما يحدد مناطق الاهتمام الحقيقية، لا الأرقام العشوائية.",
  },
  {
    title: "السياق الكلي والجيوسياسي",
    body: "بيانات التضخم، قرارات الفائدة، والتوتر الجغرافي — عوامل يمكن أن تُبطل أي قراءة فنية خلال ساعات. تجاهلها مجازفة لا داعي لها.",
  },
];

export default function ArabicHomePage() {
  const t = getDictionary(locale);
  const latestPosts = getAllPosts(locale).slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <p className="reveal text-xs tracking-widest text-gold uppercase">
          {siteConfig.handle}
        </p>
        <h1 className="reveal mt-4 max-w-3xl font-cairo text-4xl leading-tight font-semibold text-fg sm:text-5xl">
          {siteConfig.taglineAr}
        </h1>
        {/* DRAFT: positioning line — refine wording as needed */}
        <p className="reveal mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
          محلل مالي ومدرّب تداول. أقرأ الأسواق عبر البنية الفنية — SMC وموجات
          إليوت وفيبوناتشي — إلى جانب القراءة الاقتصادية الكلية والجيوسياسية.
          لا توصيات جاهزة، بل منطق تقدر تبني عليه قرارك بنفسك.
        </p>

        <div className="reveal mt-9 flex flex-wrap gap-4">
          <Link
            href={localePath(locale, "/vip")}
            className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t.cta.joinVip}
          </Link>
          <Link
            href={localePath(locale, "/academy")}
            className="rounded-full border border-line-strong px-6 py-3 text-sm text-fg transition-colors hover:border-gold hover:text-gold"
          >
            {t.cta.freeCourse}
          </Link>
        </div>

        {/* Proof strip — replace FILL_IN with real, current numbers before launch */}
        <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-line pt-8">
          <div>
            <dt className="text-xs text-fg-muted">المتابعون</dt>
            <dd className="mt-1 text-xl font-semibold text-gold">
              {siteConfig.proof.followers}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">متدرب تم تأهيله</dt>
            <dd className="mt-1 text-xl font-semibold text-gold">
              {siteConfig.proof.studentsTaught}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">سنوات في الأسواق</dt>
            <dd className="mt-1 text-xl font-semibold text-gold">
              {siteConfig.proof.yearsInMarkets}
            </dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-line bg-bg-raised-2 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-fg">كيف أحلّل</h2>
          <p className="mt-2 max-w-xl text-sm text-fg-muted">
            ثلاث طبقات قراءة، بالترتيب، في كل تحليل أنشره.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {METHOD_LAYERS.map((layer, index) => (
              <div
                key={layer.title}
                className="rounded-2xl border border-line p-6"
              >
                <span className="text-xs text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-fg">
                  {layer.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {layer.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-fg">
                {t.nav.analysis}
              </h2>
              <Link
                href={localePath(locale, "/analysis")}
                className="text-sm text-gold hover:opacity-80"
              >
                {t.cta.viewAllAnalysis}
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {latestPosts.map((post) => (
                <AnalysisCard key={post.slug} locale={locale} {...post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-bg-raised-2 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-fg">المسارات</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <OfferCard
              title={t.offers.vipTitle}
              description={t.offers.vipDesc}
              ctaLabel={t.cta.joinVip}
              ctaHref={localePath(locale, "/vip")}
              price={t.offers.priceOnRequest}
              highlight
            />
            <OfferCard
              title={t.offers.academyTitle}
              description={t.offers.academyDesc}
              ctaLabel={t.cta.exploreAcademy}
              ctaHref={localePath(locale, "/academy")}
            />
            <OfferCard
              title={t.offers.freeTitle}
              description={t.offers.freeDesc}
              ctaLabel={t.cta.viewAllAnalysis}
              ctaHref={localePath(locale, "/analysis")}
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-2xl border border-line p-8 sm:p-10">
            <h2 className="text-xl font-semibold text-fg">
              {t.newsletter.title}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-fg-muted">
              {t.newsletter.body}
            </p>
            <div className="mt-6">
              <NewsletterForm
                placeholder={t.newsletter.placeholder}
                buttonLabel={t.newsletter.button}
                successMessage={t.newsletter.success}
                errorMessage={t.newsletter.error}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
