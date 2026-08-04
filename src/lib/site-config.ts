/**
 * Single source of truth for business data that changes independently of
 * page copy: links, pricing, contact details, proof numbers. Edit here —
 * nothing below should be hardcoded again inside components or pages.
 *
 * Anything still `[FILL IN]` is a placeholder. Search the repo for
 * "FILL_IN" to find every spot that needs a real value before launch.
 */

export const siteConfig = {
  name: "Rafik Orabi",
  handle: "@RafikOrabi",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",

  taglineAr: "فكّر بعمق، تداول بدقة.",
  taglineEn: "Think Deep. Trade Sharp.",

  proof: {
    // FILL_IN: replace with real, current numbers before launch.
    followers: "FILL_IN",
    studentsTaught: "FILL_IN",
    yearsInMarkets: "FILL_IN",
  },

  links: {
    telegramChannel: "FILL_IN", // public/announcement channel, if different from VIP
    telegramVip: "FILL_IN", // VIP subscription channel/bot link
    instagram: "FILL_IN",
    x: "FILL_IN",
    youtube: "FILL_IN",
    email: "FILL_IN",
    academyEnroll: "FILL_IN", // Lotas Capital Academy enrollment link
    brokerReferral: "FILL_IN", // INGOT Brokers IB link
  },

  vip: {
    priceAmount: "FILL_IN",
    priceCurrency: "FILL_IN",
    billingPeriod: "monthly", // adjust if not monthly
  },

  disclosure: {
    brokerCommissionAr:
      "هذا رابط إحالة — إذا فتحت حسابك عبره فأنا أحصل على عمولة من الوسيط، دون أي تكلفة إضافية عليك.",
    brokerCommissionEn:
      "This is a referral link — if you open your account through it, I earn a commission from the broker at no extra cost to you.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
