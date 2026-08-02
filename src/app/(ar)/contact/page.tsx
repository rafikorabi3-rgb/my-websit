import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/ContactForm";

const locale = "ar" as const;

export const metadata = pageMetadata({
  locale,
  path: "/contact",
  title: "تواصل",
  description: "راسلني مباشرة أو تابعني على منصات التواصل.",
});

const DIRECT_LINKS = [
  { label: "البريد الإلكتروني", value: siteConfig.links.email },
  { label: "تيليجرام", value: siteConfig.links.telegramChannel },
  { label: "Instagram", value: siteConfig.links.instagram },
  { label: "X", value: siteConfig.links.x },
] as const;

export default function ArabicContactPage() {
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">تواصل</p>
      <h1 className="mt-4 font-cairo text-3xl font-semibold text-fg sm:text-4xl">
        تواصل معي
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-fg-muted">
        سؤال عن الأكاديمية، استفسار عن قناة VIP، أو ملاحظة على تحليل — راسلني
        مباشرة.
      </p>

      <div className="mt-10">
        <ContactForm
          labels={{
            name: t.contactForm.name,
            email: t.contactForm.email,
            message: t.contactForm.message,
            submit: t.contactForm.submit,
            success: t.contactForm.success,
            error: t.contactForm.error,
          }}
        />
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase">
          روابط مباشرة
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {DIRECT_LINKS.map((link) => (
            <li key={link.label} className="text-sm text-fg-muted">
              {link.label}:{" "}
              <span className="text-fg">
                {link.value === "FILL_IN" ? "—" : link.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
