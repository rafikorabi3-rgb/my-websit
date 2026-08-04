import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { courseJsonLd } from "@/lib/schema";

const locale = "ar" as const;

export const metadata = pageMetadata({
  locale,
  path: "/academy",
  title: "الأكاديمية",
  description: "منهج تداول متكامل من الصفر حتى الاحتراف مع أكاديمية Lotas Capital.",
});

const LEVELS = [
  {
    name: "المستوى المبتدئ",
    price: "مجاني",
    audience: "لمن لا يملك أي خلفية سابقة، أو تعرّض لخسائر بسبب مجموعات توصيات.",
    topics: [
      "أساسيات قراءة الشارت وبنية السوق",
      "الفرق بين الاتجاه والتذبذب",
      "مبادئ إدارة رأس المال قبل أي صفقة",
    ],
  },
  {
    name: "المستوى المتوسط",
    price: "بسعر مدفوع",
    audience: "لمن أنهى الأساسيات ويريد بناء منهجية تداول واضحة.",
    topics: [
      "مقدمة في Smart Money Concepts (SMC)",
      "تحديد مناطق الـ liquidity والـ order blocks",
      "بناء خطة تداول مكتوبة وقابلة للمراجعة",
    ],
  },
  {
    name: "المستوى المتقدم",
    price: "بسعر مدفوع",
    audience: "لمن يريد تعميق التحليل ودمج عدة أدوات في قرار واحد.",
    topics: [
      "موجات إليوت وتطبيقها العملي مع SMC",
      "دمج السياق الكلي والجيوسياسي في القرار",
      "إدارة مخاطر متقدمة وضبط نفسي أثناء التداول",
    ],
  },
];

export default function ArabicAcademyPage() {
  const t = getDictionary(locale);
  const enrollHref =
    siteConfig.links.academyEnroll === "FILL_IN"
      ? "#"
      : siteConfig.links.academyEnroll;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd(locale)) }}
      />
      <p className="text-xs tracking-widest text-gold uppercase">
        Lotas Capital Academy
      </p>
      <h1 className="mt-4 font-cairo text-3xl font-semibold text-fg sm:text-4xl">
        الأكاديمية
      </h1>
      {/* DRAFT: refine copy, confirm pricing and enrollment flow */}
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        منهج تداول متكامل أبنيه وأقدّمه بنفسي في أكاديمية Lotas Capital، على
        ثلاثة مستويات متتالية. كل مستوى مبني على ما قبله — لا اختصارات، ولا
        وعود بنتائج سريعة.
      </p>

      <div className="mt-12 flex flex-col gap-6">
        {LEVELS.map((level) => (
          <div
            key={level.name}
            className="rounded-2xl border border-line p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-fg">{level.name}</h2>
              <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-gold">
                {level.price}
              </span>
            </div>
            <p className="mt-2 text-sm text-fg-muted">{level.audience}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {level.topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 text-sm text-fg"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-gold bg-bg-raised p-8 text-center">
        <h2 className="text-lg font-semibold text-fg">جاهز تبدأ؟</h2>
        <p className="mt-2 text-sm text-fg-muted">
          سجّل عبر أكاديمية Lotas Capital وابدأ من المستوى المناسب لك.
        </p>
        <a
          href={enrollHref}
          className="mt-5 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          {t.cta.enrollNow}
        </a>
      </div>
    </div>
  );
}
