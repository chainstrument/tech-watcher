import type { RawItem } from "@/types";
import { BaseConnector } from "./base";

const HN_API = "https://hacker-news.firebaseio.com/v0";

interface HnItem {
  id: number;
  title?: string;
  url?: string;
  text?: string;
  time?: number;
  type?: string;
  score?: number;
}

export class HackerNewsConnector extends BaseConnector {
  private readonly limit: number;

  constructor(sourceId: string, limit = 30) {
    super(sourceId);
    this.limit = limit;
  }

  async fetch(): Promise<RawItem[]> {
    return this.fetchWithRetry(async () => {
      const idsRes = await fetch(`${HN_API}/topstories.json`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!idsRes.ok) throw new Error(`HN topstories HTTP ${idsRes.status}`);

      const ids: number[] = await idsRes.json();
      const topIds = ids.slice(0, this.limit);

      const items = await Promise.all(topIds.map((id) => this.fetchItem(id)));

      return items
        .filter((item): item is HnItem => item !== null && item.type === "story" && !!item.title)
        .map((item) => ({
          title: item.title!,
          url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
          publishedAt: item.time ? new Date(item.time * 1000) : new Date(),
          rawContent: item.text ?? "",
          sourceId: this.sourceId,
        }));
    });
  }

  private async fetchItem(id: number): Promise<HnItem | null> {
    try {
      const res = await fetch(`${HN_API}/item/${id}.json`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
}
