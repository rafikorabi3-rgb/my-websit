import Link from "next/link";

export function OfferCard({
  title,
  description,
  ctaLabel,
  ctaHref,
  price,
  highlight = false,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  price?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-6 ${
        highlight ? "border-gold bg-bg-raised" : "border-line bg-bg-raised-2"
      }`}
    >
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">
        {description}
      </p>
      {price && <p className="mt-4 text-sm text-gold">{price}</p>}
      <Link
        href={ctaHref}
        className={`mt-6 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
          highlight ? "bg-gold text-bg" : "border border-line-strong text-fg"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
