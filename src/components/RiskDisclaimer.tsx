import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function RiskDisclaimer({
  locale,
  variant = "footer",
}: {
  locale: Locale;
  variant?: "footer" | "post";
}) {
  const t = getDictionary(locale);

  return (
    <div
      className={
        variant === "post"
          ? "mt-12 rounded-2xl border border-line-strong bg-bg-raised p-5"
          : "border-t border-line py-8"
      }
    >
      <p className="text-xs font-semibold tracking-widest text-gold uppercase">
        {t.footer.riskTitle}
      </p>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-fg-muted">
        {t.footer.riskBody}
      </p>
      {variant === "post" && (
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-fg-muted">
          {t.postMeta.postDisclaimer}
        </p>
      )}
    </div>
  );
}
