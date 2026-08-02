import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function ScenarioBox({
  locale,
  instrument,
  bullish,
  bearish,
  invalidation,
}: {
  locale: Locale;
  instrument?: string;
  bullish: string;
  bearish: string;
  invalidation: string;
}) {
  const t = getDictionary(locale);

  return (
    <div className="not-prose my-8 rounded-2xl border border-line-strong bg-bg-raised p-5 sm:p-6">
      {instrument && (
        <p className="mb-5 text-xs tracking-widest text-fg-muted uppercase">
          {t.scenario.instrument} · <span className="text-gold">{instrument}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-bull uppercase">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bull" />
            {t.scenario.bullish}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-fg">{bullish}</p>
        </div>

        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-bear uppercase">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bear" />
            {t.scenario.bearish}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-fg">{bearish}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gold-dim bg-bg px-4 py-4">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase">
          {t.scenario.invalidation}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-fg">{invalidation}</p>
      </div>
    </div>
  );
}
