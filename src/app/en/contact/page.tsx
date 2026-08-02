import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/ContactForm";

const locale = "en" as const;

export const metadata = pageMetadata({
  locale,
  path: "/contact",
  title: "Contact",
  description: "Reach me directly or follow along on social platforms.",
});

const DIRECT_LINKS = [
  { label: "Email", value: siteConfig.links.email },
  { label: "Telegram", value: siteConfig.links.telegramChannel },
  { label: "Instagram", value: siteConfig.links.instagram },
  { label: "X", value: siteConfig.links.x },
] as const;

export default function EnglishContactPage() {
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-xs tracking-widest text-gold uppercase">Contact</p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
        Get in touch
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-fg-muted">
        A question about the Academy, the VIP channel, or feedback on an
        analysis — reach out directly.
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
          Direct links
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
