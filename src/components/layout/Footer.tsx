import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary, localePath } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";

const QUICK_LINKS = [
  { key: "about", path: "/about" },
  { key: "analysis", path: "/analysis" },
  { key: "academy", path: "/academy" },
  { key: "vip", path: "/vip" },
  { key: "contact", path: "/contact" },
] as const;

const SOCIAL_LINKS = [
  { label: "Telegram", href: siteConfig.links.telegramChannel },
  { label: "Instagram", href: siteConfig.links.instagram },
  { label: "X", href: siteConfig.links.x },
  { label: "YouTube", href: siteConfig.links.youtube },
] as const;

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const name = locale === "ar" ? "رفيق عرابي" : "Rafik Orabi";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-cairo text-base font-semibold text-fg">{name}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-muted">
              {locale === "ar" ? siteConfig.taglineAr : siteConfig.taglineEn}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              {t.footer.quickLinks}
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.key}
                  href={localePath(locale, item.path)}
                  className="text-sm text-fg-muted hover:text-gold"
                >
                  {t.nav[item.key]}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              {t.footer.followMe}
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href === "FILL_IN" ? "#" : item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-fg-muted hover:text-gold"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <RiskDisclaimer locale={locale} variant="footer" />

        <p className="mt-6 text-xs text-fg-muted">
          © {year} {name} · {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
