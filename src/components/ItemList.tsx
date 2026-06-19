import { HackerNewsConnector } from "@/lib/connectors/hackernews";
import { RssConnector } from "@/lib/connectors/rss";
import type { RawItem } from "@/types";
import ItemCard from "./ItemCard";

const RSS_FEEDS = [
  { id: "theregister", url: "https://www.theregister.com/headlines.atom", label: "The Register" },
  { id: "lobsters", url: "https://lobste.rs/rss", label: "Lobsters" },
];

const SOURCE_LABELS: Record<string, string> = {
  hackernews: "Hacker News",
  ...Object.fromEntries(RSS_FEEDS.map((f) => [f.id, f.label])),
};

async function fetchAll(): Promise<(RawItem & { sourceLabel: string })[]> {
  const results = await Promise.allSettled([
    new HackerNewsConnector("hackernews", 20).fetch(),
    ...RSS_FEEDS.map((f) => new RssConnector(f.id, f.url).fetch()),
  ]);

  return results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map((item) => ({ ...item, sourceLabel: SOURCE_LABELS[item.sourceId] ?? item.sourceId }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 60);
}

export default async function ItemList() {
  const items = await fetchAll();

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500">Aucun item — vérifie ta connexion réseau.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm text-gray-500">{items.length} items collectés</p>
      {items.map((item) => (
        <ItemCard key={`${item.sourceId}-${item.url}`} item={item} />
      ))}
    </div>
  );
}
