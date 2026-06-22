import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import type { Item, RawItem, Source } from "@/types";

const DATA_DIR = join(process.cwd(), "data");
const ITEMS_FILE = join(DATA_DIR, "items.json");
const SOURCES_FILE = join(DATA_DIR, "sources.json");

const MAX_ITEMS = 500;

interface SerializedItem extends Omit<Item, "publishedAt" | "createdAt"> {
  publishedAt: string;
  createdAt: string;
}

export function readSources(): Source[] {
  const raw = readFileSync(SOURCES_FILE, "utf8");
  return JSON.parse(raw) as Source[];
}

export function readItems(): Item[] {
  try {
    const raw = readFileSync(ITEMS_FILE, "utf8");
    const data = JSON.parse(raw) as { items: SerializedItem[] };
    return (data.items ?? []).map((i) => ({
      ...i,
      publishedAt: new Date(i.publishedAt),
      createdAt: new Date(i.createdAt),
    }));
  } catch {
    return [];
  }
}

export function writeItems(items: Item[]): void {
  const sorted = [...items]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_ITEMS);
  writeFileSync(
    ITEMS_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        items: sorted.map((i) => ({
          ...i,
          publishedAt: i.publishedAt.toISOString(),
          createdAt: i.createdAt.toISOString(),
        })),
      },
      null,
      2
    )
  );
}

export function urlToId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

export interface StoreResult {
  inserted: number;
  skipped: number;
}

export function storeRawItems(rawItems: RawItem[]): StoreResult {
  if (rawItems.length === 0) return { inserted: 0, skipped: 0 };

  const existing = readItems();
  const existingUrls = new Set(existing.map((i) => i.url));
  let inserted = 0;
  let skipped = 0;
  const newItems: Item[] = [];

  for (const raw of rawItems) {
    if (existingUrls.has(raw.url)) {
      skipped++;
      continue;
    }
    newItems.push({
      id: urlToId(raw.url),
      sourceId: raw.sourceId,
      title: raw.title,
      url: raw.url,
      publishedAt: raw.publishedAt,
      rawContent: raw.rawContent,
      status: "nouveau",
      createdAt: new Date(),
    });
    inserted++;
  }

  if (newItems.length > 0) {
    writeItems([...existing, ...newItems]);
  }

  return { inserted, skipped };
}
