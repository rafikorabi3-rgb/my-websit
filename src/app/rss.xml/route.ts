import { buildAnalysisRss } from "@/lib/rss";

// Prerendered at build time — the deployed runtime (e.g. Cloudflare
// Workers) has no filesystem access to the MDX source content, so this
// must not read files on demand at request time.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildAnalysisRss("ar"), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
