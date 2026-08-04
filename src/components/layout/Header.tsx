import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary, localePath } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

const NAV_ITEMS = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  { key: "analysis", path: "/analysis" },
  { key: "academy", path: "/academy" },
  { key: "vip", path: "/vip" },
  { key: "contact", path: "/contact" },
] as const;

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur supports-backdrop-blur:bg-bg/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href={localePath(locale, "/")} className="flex items-baseline gap-2">
          <span className="font-cairo text-lg font-semibold tracking-tight text-fg">
            {locale === "ar" ? "رفيق عرابي" : "Rafik Orabi"}
          </span>
          <span className="hidden text-xs text-gold sm:inline">@RafikOrabi</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={localePath(locale, item.path)}
              className="text-sm text-fg-muted transition-colors hover:text-gold"
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle locale={locale} label={t.nav.langToggleShort} />
          <Link
            href={localePath(locale, "/vip")}
            className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t.cta.joinVip}
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="list-none rounded-full border border-line-strong p-2 text-fg [&::-webkit-details-marker]:hidden">
            <MenuIcon />
          </summary>
          <div className="absolute end-0 top-12 w-60 rounded-2xl border border-line bg-bg-raised p-4 shadow-xl shadow-black/40">
            <nav className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={localePath(locale, item.path)}
                  className="text-sm text-fg-muted hover:text-gold"
                >
                  {t.nav[item.key]}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <LangToggle locale={locale} label={t.nav.langToggleShort} />
              <Link
                href={localePath(locale, "/vip")}
                className="rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-bg"
              >
                {t.cta.joinVip}
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 4.5H16M2 9H16M2 13.5H16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
