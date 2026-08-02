import { buildAnalysisRss } from "@/lib/rss";

export function GET() {
  return new Response(buildAnalysisRss("en"), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
