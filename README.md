# Rafik Orabi — Personal Brand Site

Arabic-first (RTL, default) trading education and analysis site, with a full
English version at `/en`. Built with Next.js (App Router), TypeScript,
Tailwind CSS v4, and MDX-backed analysis posts.

## Stack & architecture

- **Next.js 16 (App Router)**, deployed to **Cloudflare Workers** via
  [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — Cloudflare's
  current recommended path for full Next.js apps (API routes included), which
  now supersedes the older `@cloudflare/next-on-pages` "Pages" adapter. It
  still lives under **Workers & Pages** in the Cloudflare dashboard. A
  Docker image is also included as a host-agnostic fallback (see Deploy).
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
src/app/{,en/}rss.xml/route.ts   — per-locale analysis RSS feed (static, build-time)
src/components/                  — shared UI (Header, Footer, ScenarioBox, ...)
src/lib/                         — content loader, i18n, metadata, schema.org, site config
wrangler.jsonc                   — Cloudflare Worker config (name, bindings, compat flags)
open-next.config.ts              — OpenNext Cloudflare adapter config
Dockerfile                       — fallback: plain Node image for any other host
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

## Deploy — Cloudflare Workers

This repo is wired up for Cloudflare Workers via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (config in
`wrangler.jsonc` and `open-next.config.ts`). This has been verified locally
in this environment: `npm run build`, `npx opennextjs-cloudflare build`, and
`npx wrangler deploy --dry-run` all complete cleanly, producing a ~1.5 MB
gzipped Worker with the correct `ASSETS` / `IMAGES` / self-reference
bindings. Actually pushing it live requires *your* Cloudflare account —
that's not something that can be done from here. Two ways to finish it:

### Option A — Git integration (recommended, no token sharing)

1. Log into [dash.cloudflare.com](https://dash.cloudflare.com) with your own
   account.
2. Go to **Workers & Pages** → **Create** → connect to Git → authorize the
   Cloudflare GitHub App → select `rafikorabi3-rgb/my-websit`.
3. When it asks for build settings:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx wrangler deploy`
   - (If the dashboard only offers a single command field, use
     `npm run deploy` — it chains both.)
4. Set the production branch (this branch, or `main` once the PR is merged).
5. Deploy. Cloudflare gives you a free `*.workers.dev` URL immediately;
   attach your real domain afterward from the Worker's **Custom Domains**
   tab once you have one.

Every future push to that branch redeploys automatically — no further
action needed on your end, and nothing needs to be shared with me.

### Option B — Ask me to run it

If you'd rather I trigger the deploy directly, generate a
[Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens)
scoped to **just** "Edit Cloudflare Workers" for your account, and share it
as an environment variable (`CLOUDFLARE_API_TOKEN`) rather than in chat.
I'd run `npm run deploy` with it. Prefer Option A unless there's a reason
you want this done from here — a scoped token is safer, but Git integration
means you're never sharing account access at all.

### Before your first deploy

- `wrangler.jsonc` ships with a placeholder
  `vars.NEXT_PUBLIC_SITE_URL: "https://example.com"`. Update it to your real
  domain (or override it as a Cloudflare dashboard environment variable for
  the Worker, without touching the repo) — it feeds canonical URLs, the
  sitemap, RSS, and JSON-LD.
- The RSS routes (`/rss.xml`, `/en/rss.xml`) are forced static
  (`export const dynamic = "force-static"`) on purpose: Workers have no
  filesystem access to the MDX source at request time, so they're rendered
  once at build time like every other page here.
- `npx opennextjs-cloudflare build` prints a wall of
  `ERROR Failed to copy .../node_modules/<mdx-package>` lines during
  bundling. This has been checked and is cosmetic in this environment — the
  packages are still present in the final bundle
  (`.open-next/server-functions/default/node_modules`), and
  `wrangler deploy --dry-run` completes with no errors. All analysis posts
  are statically prerendered anyway, so MDX compilation never runs at
  Worker request time regardless.

## Deploy — Docker (fallback, any other host)

A plain Node Docker image is also included, for hosts other than
Cloudflare (a VPS, Railway, Fly.io, ...):

```bash
docker build -t rafikorabi-site .
docker run -p 3000:3000 --env-file .env.local rafikorabi-site
```

Or without Docker, on any Node host:

```bash
npm run build
npm run start
```

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
