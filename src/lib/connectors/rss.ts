import { XMLParser } from "fast-xml-parser";
import type { RawItem } from "@/types";
import { BaseConnector } from "./base";

interface RssEntry {
  title?: string | { "#text": string };
  link?: string | { "@_href": string };
  published?: string;
  pubDate?: string;
  updated?: string;
  summary?: string | { "#text": string };
  description?: string;
  content?: string | { "#text": string };
  "content:encoded"?: string;
  id?: string;
  guid?: string | { "#text": string };
}

interface ParsedFeed {
  rss?: { channel?: { item?: RssEntry | RssEntry[] } };
  feed?: { entry?: RssEntry | RssEntry[] };
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function text(val: string | { "#text": string } | undefined): string {
  if (!val) return "";
  return typeof val === "string" ? val : (val["#text"] ?? "");
}

function extractItems(raw: unknown): RssEntry[] {
  const feed = raw as ParsedFeed;
  const rssItems = feed.rss?.channel?.item;
  const atomEntries = feed.feed?.entry;
  const list = rssItems ?? atomEntries;
  if (!list) return [];
  return Array.isArray(list) ? list : [list];
}

function toDate(entry: RssEntry): Date {
  const raw = entry.published ?? entry.pubDate ?? entry.updated;
  const d = raw ? new Date(raw) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function toUrl(entry: RssEntry): string {
  const link = entry.link;
  if (!link) return text(entry.guid as string | undefined) || entry.id || "";
  if (typeof link === "string") return link;
  return link["@_href"] ?? "";
}

function toContent(entry: RssEntry): string {
  return (
    text(entry["content:encoded"] as string | undefined) ||
    text(entry.content as string | { "#text": string } | undefined) ||
    text(entry.summary as string | { "#text": string } | undefined) ||
    text(entry.description as string | undefined)
  );
}

export class RssConnector extends BaseConnector {
  private readonly url: string;
  private readonly limit: number;

  constructor(sourceId: string, url: string, limit = 30) {
    super(sourceId);
    this.url = url;
    this.limit = limit;
  }

  async fetch(): Promise<RawItem[]> {
    return this.fetchWithRetry(async () => {
      const res = await fetch(this.url, { signal: AbortSignal.timeout(this.timeoutMs) });
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${this.url}`);

      const xml = await res.text();
      const parsed = parser.parse(xml);
      const entries = extractItems(parsed);

      return entries
        .slice(0, this.limit)
        .map((entry) => ({
          title: text(entry.title) || "(no title)",
          url: toUrl(entry),
          publishedAt: toDate(entry),
          rawContent: toContent(entry),
          sourceId: this.sourceId,
        }))
        .filter((item) => item.url);
    });
  }
}
