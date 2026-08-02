"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LangToggle({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || "/";

  const target =
    locale === "ar"
      ? `/en${pathname === "/" ? "" : pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  return (
    <Link
      href={target}
      className="rounded-full border border-line-strong px-3 py-1.5 text-xs tracking-wide text-fg-muted transition-colors hover:border-gold hover:text-gold"
    >
      {label}
    </Link>
  );
}
