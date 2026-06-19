import type { SourceConnector } from "@/types";
import { getDb } from "@/lib/db/client";
import { RssConnector } from "./rss";
import { HackerNewsConnector } from "./hackernews";
import { GithubConnector } from "./github";

interface SourceRow {
  id: string;
  type: string;
  url: string;
  name: string;
}

function buildConnector(row: SourceRow): SourceConnector {
  switch (row.type) {
    case "rss":
      return new RssConnector(row.id, row.url);
    case "hackernews":
      return new HackerNewsConnector(row.id);
    case "github": {
      const repos = row.url.split(",").map((r) => r.trim());
      return new GithubConnector(row.id, repos);
    }
    default:
      throw new Error(`Unknown source type: ${row.type}`);
  }
}

/** Load all active sources from DB and return instantiated connectors. */
export async function loadActiveConnectors(): Promise<
  { sourceId: string; sourceName: string; connector: SourceConnector }[]
> {
  const db = getDb();
  const { rows } = await db.query<SourceRow>(
    "SELECT id, name, type, url FROM sources WHERE active = true"
  );
  return rows.map((row) => ({
    sourceId: row.id,
    sourceName: row.name,
    connector: buildConnector(row),
  }));
}

// In-memory registry for programmatic use (tests, seeding, dashboard)
const connectors = new Map<string, SourceConnector>();

export const registry = {
  register(sourceId: string, connector: SourceConnector) {
    connectors.set(sourceId, connector);
  },
  unregister(sourceId: string) {
    connectors.delete(sourceId);
  },
  get(sourceId: string): SourceConnector | undefined {
    return connectors.get(sourceId);
  },
  all(): SourceConnector[] {
    return [...connectors.values()];
  },
};
