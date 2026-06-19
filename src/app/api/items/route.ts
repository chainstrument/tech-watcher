import { NextResponse } from "next/server";
import { HackerNewsConnector } from "@/lib/connectors/hackernews";
import { RssConnector } from "@/lib/connectors/rss";
import type { RawItem } from "@/types";

const RSS_FEEDS = [
  { id: "theregister", url: "https://www.theregister.com/headlines.atom", label: "The Register" },
  { id: "lobsters", url: "https://lobste.rs/rss", label: "Lobsters" },
];

export async function GET() {
  const results = await Promise.allSettled([
    new HackerNewsConnector("hackernews", 20).fetch(),
    ...RSS_FEEDS.map((f) => new RssConnector(f.id, f.url).fetch()),
  ]);

  const sourceLabels: Record<string, string> = {
    hackernews: "Hacker News",
    ...Object.fromEntries(RSS_FEEDS.map((f) => [f.id, f.label])),
  };

  const items: (RawItem & { sourceLabel: string })[] = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map((item) => ({ ...item, sourceLabel: sourceLabels[item.sourceId] ?? item.sourceId }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 60);

  return NextResponse.json(items);
}
