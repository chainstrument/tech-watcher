import type { RawItem } from "@/types";
import { getDb } from "@/lib/db/client";

interface StoreResult {
  inserted: number;
  skipped: number;
}

/** Insert items that don't already exist (dedup on url + source_id). */
export async function storeItems(items: RawItem[]): Promise<StoreResult> {
  if (items.length === 0) return { inserted: 0, skipped: 0 };

  const db = getDb();
  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const result = await db.query(
      `INSERT INTO items (source_id, title, url, published_at, raw_content, status)
       VALUES ($1, $2, $3, $4, $5, 'nouveau')
       ON CONFLICT (url, source_id) DO NOTHING`,
      [item.sourceId, item.title, item.url, item.publishedAt, item.rawContent]
    );
    if (result.rowCount && result.rowCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}
