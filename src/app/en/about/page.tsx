import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

const locale = "en" as const;

export const metadata = pageMetadata({
  locale,
  path: "/about",
  title: "About",
  description:
    "My background, why I lead with education, and what I've learned from losses in the markets.",
});

export default function EnglishAboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">About</p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
        {siteConfig.name}
      </h1>

      {/* DRAFT: refine phrasing, facts sourced from project brief */}
      <div className="prose prose-invert prose-headings:font-semibold prose-headings:text-fg prose-p:leading-relaxed prose-p:text-fg-muted prose-strong:text-fg prose-a:text-gold mt-10 max-w-none">
        <p>
          I&apos;ve been in the financial markets for roughly one to two years,
          almost entirely self-taught. I still analyze and trade on a demo
          account today, rebuilding the fundamentals from zero — not because
          I don&apos;t understand the market, but because I believe a
          deliberate rebuild beats carrying forward a shaky foundation.
        </p>

        <p>
          I study Business Administration at the International University for
          Science and Technology (IUST), and I&apos;m currently working on my
          MBA thesis on digital customer loyalty programs in banking. That
          academic background, alongside a background in the Syrian banking
          sector, shapes how I think about risk and systems — before anything
          technical on the chart.
        </p>

        <h2>Why education first</h2>
        <p>
          I&apos;m an analyst and educator, not a signal seller. You
          won&apos;t find &quot;10x your account&quot; here, no profit
          screenshots without context, no countdown timer pressuring a
          decision. The real difference I offer is that I show the
          reasoning: the bullish case, the bearish case, and the invalidation
          level that proves me wrong. If I can&apos;t define when I&apos;m
          wrong, I don&apos;t have real analysis — just an opinion.
        </p>

        <h2>What losses taught me</h2>
        <p>
          I&apos;ve lost trades, and I will lose more. That&apos;s an
          inherent part of trading and there&apos;s no point hiding it. The
          biggest lesson wasn&apos;t technical — it was about position sizing
          and the discipline to commit to an invalidation level before
          entering, not after. Every analysis I publish today is built on
          that exact lesson: the technical read might be right, but risk
          management is what determines whether you stay in the market long
          enough to benefit from it.
        </p>

        <h2>Coaching at Lotas Capital</h2>
        <p>
          I coach at Lotas Capital Academy, where I build and deliver the
          full trading curriculum — beginner through advanced — focused on
          SMC, Elliott Wave, and risk management, following the same logic
          you see in every analysis published here.
        </p>
      </div>
    </article>
  );
}
