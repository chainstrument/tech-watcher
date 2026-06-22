import { loadActiveConnectors } from "@/lib/connectors/registry";
import { ConnectorError } from "@/lib/connectors/base";
import { storeRawItems } from "@/lib/storage";

interface SourceStats {
  sourceName: string;
  fetched: number;
  inserted: number;
  skipped: number;
  error?: string;
}

interface PipelineResult {
  startedAt: Date;
  finishedAt: Date;
  sources: SourceStats[];
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
}

export async function runPipeline(): Promise<PipelineResult> {
  const startedAt = new Date();
  console.log(`[pipeline] run started at ${startedAt.toISOString()}`);

  const activeConnectors = loadActiveConnectors();
  const sourceStats: SourceStats[] = [];

  for (const { sourceName, connector } of activeConnectors) {
    const stat: SourceStats = { sourceName, fetched: 0, inserted: 0, skipped: 0 };

    try {
      const items = await connector.fetch();
      stat.fetched = items.length;

      const { inserted, skipped } = storeRawItems(items);
      stat.inserted = inserted;
      stat.skipped = skipped;
    } catch (err) {
      stat.error = err instanceof ConnectorError ? err.message : String(err);
      console.error(`[pipeline] source "${sourceName}" failed:`, stat.error);
    }

    sourceStats.push(stat);
    console.log(
      `[pipeline] ${sourceName}: fetched=${stat.fetched} inserted=${stat.inserted} skipped=${stat.skipped}${stat.error ? ` error=${stat.error}` : ""}`
    );
  }

  const finishedAt = new Date();
  const result: PipelineResult = {
    startedAt,
    finishedAt,
    sources: sourceStats,
    totalFetched: sourceStats.reduce((s, r) => s + r.fetched, 0),
    totalInserted: sourceStats.reduce((s, r) => s + r.inserted, 0),
    totalSkipped: sourceStats.reduce((s, r) => s + r.skipped, 0),
  };

  console.log(
    `[pipeline] done in ${finishedAt.getTime() - startedAt.getTime()}ms` +
      ` — fetched=${result.totalFetched} inserted=${result.totalInserted} skipped=${result.totalSkipped}`
  );

  return result;
}
