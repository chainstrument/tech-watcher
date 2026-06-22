import type { SourceConnector, Source } from "@/types";
import { readSources } from "@/lib/storage";
import { RssConnector } from "./rss";
import { HackerNewsConnector } from "./hackernews";
import { GithubConnector } from "./github";

function buildConnector(source: Source): SourceConnector {
  const limit = source.limit;
  switch (source.type) {
    case "rss":
      return new RssConnector(source.id, source.url, limit);
    case "hackernews":
      return new HackerNewsConnector(source.id, limit);
    case "github": {
      const repos = source.url.split(",").map((r) => r.trim());
      return new GithubConnector(source.id, repos);
    }
    default:
      throw new Error(`Unknown source type: ${(source as Source).type}`);
  }
}

export function loadActiveConnectors(): {
  sourceId: string;
  sourceName: string;
  connector: SourceConnector;
}[] {
  const sources = readSources();
  return sources
    .filter((s) => s.active)
    .map((source) => ({
      sourceId: source.id,
      sourceName: source.name,
      connector: buildConnector(source),
    }));
}
