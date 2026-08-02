import { buildAnalysisRss } from "@/lib/rss";

export function GET() {
  return new Response(buildAnalysisRss("ar"), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
