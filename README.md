# Rafik Orabi — Personal Brand Site

Arabic-first (RTL, default) trading education and analysis site, with a full
English version at `/en`. Built with Next.js (App Router), TypeScript,
Tailwind CSS v4, and MDX-backed analysis posts.

## Stack & architecture

- **Next.js 16 (App Router)** — no Vercel-only features used (no ISR, no
  edge functions), so this deploys to any Node-capable host.
- **Two independent root layouts** — `src/app/(ar)/layout.tsx` (Arabic, no
  URL prefix) and `src/app/en/layout.tsx` (English, `/en` prefix). Each sets
  its own `<html lang dir>` and loads Cairo (Arabic) / Manrope (Latin) —
  both self-hosted at build time via `next/font/google`, so nothing is
  fetched from Google at runtime.
- **Content** lives in `content/ar/analysis/*.mdx` and
  `content/en/analysis/*.mdx` — one MDX file per post, YAML frontmatter for
  structured data (title, date, instrument, the bull/bear/invalidation
  scenario), Markdown/MDX body for the prose. Adding an English post never
  requires touching layout or component code.
- **UI strings** (nav, buttons, footer, form labels) live in
  `messages/ar.json` and `messages/en.json`, loaded through
  `src/lib/i18n.ts`. Page body copy is not dictionary-driven — it's written
  directly in each locale's `page.tsx` (see file structure below).
- **Business data** (prices, social links, referral link, proof numbers)
  lives in one place: `src/lib/site-config.ts`.

```
content/{ar,en}/analysis/*.mdx   — analysis posts
messages/{ar,en}.json            — UI string dictionaries
src/app/(ar)/...                 — Arabic pages (root layout, no URL prefix)
src/app/en/...                   — English pages (root layout, /en prefix)
src/app/api/{newsletter,contact} — stub form endpoints (see below)
src/app/{sitemap,robots}.ts      — SEO
src/app/{,en/}rss.xml/route.ts   — per-locale analysis RSS feed
src/components/                  — shared UI (Header, Footer, ScenarioBox, ...)
src/lib/                         — content loader, i18n, metadata, schema.org, site config
```

## Local setup

```bash
npm install
npm run dev       # http://localhost:3000 (Arabic) and /en (English)
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your
real domain once you have one — it feeds canonical URLs, the sitemap,
robots.txt, RSS, and JSON-LD.

## Editing content

**Business data** (VIP price, broker link, social links, proof numbers):
edit `src/lib/site-config.ts`. Every value still marked `FILL_IN` is a
placeholder — search the repo for `FILL_IN` to find all of them before
launch. Links left as `FILL_IN` render as inert `#` links or an em dash
rather than breaking the build.

**Analysis posts**: add a new `.mdx` file to `content/ar/analysis/` (and
optionally a matching one in `content/en/analysis/`). Frontmatter shape:

```yaml
---
title: "..."
excerpt: "..."
date: "2026-01-01"
instrument: "الذهب (XAUUSD)"
scenario:
  bullish: "..."
  bearish: "..."
  invalidation: "..."
draft: true   # optional — omit or set false to publish
---
```

The scenario fields render as the `ScenarioBox` at the top of the post
automatically — you don't need to repeat them in the MDX body. Everything
after the frontmatter is the post body (Markdown + optional JSX).

**UI strings**: edit `messages/ar.json` / `messages/en.json`. Keep both
files' keys in sync — `src/lib/i18n.ts` types the English dictionary
against the Arabic one, so a build will fail loudly if a key goes missing
rather than silently rendering `undefined`.

**Page copy** (headings, paragraphs on Home/About/Academy/VIP/Contact):
edit the `page.tsx` file directly under `src/app/(ar)/...` or
`src/app/en/...`. Every paragraph I wrote rather than sourced from your
brief is flagged with a `{/* DRAFT */}` comment (works the same way inside
`.mdx` files — MDX parses `<!-- -->` as invalid JSX, so always use the
curly-brace form) — review and rewrite those before launch.

## Newsletter & analytics (intentionally stubbed)

Per the build brief, v1 ships with no real newsletter provider and no
analytics, to keep the surface area small and avoid picking a
sanctions-risky vendor before you have one.

- `src/app/api/newsletter/route.ts` and `src/app/api/contact/route.ts`
  validate input and `console.log` it, returning `200`. Swap the body of
  either handler for a real provider call (Buttondown, ConvertKit, Resend,
  a CRM webhook, ...) when you're ready — the forms themselves
  (`NewsletterForm.tsx`, `ContactForm.tsx`) don't need to change.
- No analytics script is included. Add one deliberately later, and prefer a
  privacy-respecting option (e.g. Plausible) given the audience.

## Compliance (non-negotiable, don't remove)

- `RiskDisclaimer` renders sitewide in the footer (`variant="footer"`) and
  again at the end of every analysis post (`variant="post"`), non-dismissible.
- The broker referral link needs its commission disclosure
  (`siteConfig.disclosure.brokerCommission{Ar,En}`) placed visibly next to
  it wherever you add the actual referral CTA — not buried in the footer.
- No performance claims or fabricated testimonials were added anywhere;
  placeholders are explicit `FILL_IN` markers, never invented numbers.

## Deploy

The app builds with `output: "standalone"`, so it runs as a plain Node
process anywhere — no platform lock-in.

**Docker (recommended for self-hosting):**

```bash
docker build -t rafikorabi-site .
docker run -p 3000:3000 --env-file .env.local rafikorabi-site
```

**Any Node host without Docker:**

```bash
npm run build
node .next/standalone/server.js
```

Serve `public/` and `.next/static/` alongside it as documented in the
[Next.js standalone output guide](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

Whichever host you land on (Cloudflare Pages, Railway, Fly.io, a VPS, ...),
point its build command at `npm run build` and its start command at
`node .next/standalone/server.js` (or use the Dockerfile directly if the
host supports it).

## A note on this Next.js version

This project uses Next.js 16, which is newer than most training data and
has real breaking changes from Next 14/15 — notably the dual-root-layout
pattern (`(ar)` and `en` each define their own `<html>`/`<body>`, since
Arabic lives at `/` with no prefix while English lives at `/en`) and the
`experimental.globalNotFound` flag used for the app-wide 404 page
(`src/app/global-not-found.tsx`). If you or a future AI assistant modify
routing or add new top-level segments, check
`node_modules/next/dist/docs/01-app/` first rather than assuming
Next 14-era conventions still apply.
