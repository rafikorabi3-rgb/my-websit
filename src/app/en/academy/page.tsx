import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { courseJsonLd } from "@/lib/schema";

const locale = "en" as const;

export const metadata = pageMetadata({
  locale,
  path: "/academy",
  title: "Academy",
  description: "A complete trading curriculum from zero to advanced with Lotas Capital Academy.",
});

const LEVELS = [
  {
    name: "Beginner",
    price: "Free",
    audience:
      "For anyone with no prior background, or who's taken losses from signal groups.",
    topics: [
      "Chart reading and market structure fundamentals",
      "The difference between trend and range",
      "Capital management principles before any trade",
    ],
  },
  {
    name: "Intermediate",
    price: "Paid",
    audience:
      "For those past the fundamentals who want a clear trading methodology.",
    topics: [
      "Introduction to Smart Money Concepts (SMC)",
      "Identifying liquidity zones and order blocks",
      "Building a written, reviewable trading plan",
    ],
  },
  {
    name: "Advanced",
    price: "Paid",
    audience:
      "For those looking to deepen analysis and combine multiple tools into one decision.",
    topics: [
      "Elliott Wave applied alongside SMC",
      "Integrating macro and geopolitical context into decisions",
      "Advanced risk management and trading psychology",
    ],
  },
];

export default function EnglishAcademyPage() {
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
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
        Academy
      </h1>
      {/* DRAFT: refine copy, confirm pricing and enrollment flow */}
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        A complete trading curriculum I build and deliver myself at Lotas
        Capital Academy, across three sequential levels. Each level builds on
        the last — no shortcuts, no promises of quick results.
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
        <h2 className="text-lg font-semibold text-fg">Ready to start?</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Enroll through Lotas Capital Academy and start from the level
          that&apos;s right for you.
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
