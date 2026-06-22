import type { SourceConnector, Source } from "@/types";
import { readSources } from "@/lib/storage";
import { RssConnector } from "./rss";
import { HackerNewsConnector } from "./hackernews";
import { GithubConnector } from "./github";

function buildConnector(source: Source): SourceConnector {
  switch (source.type) {
    case "rss":
      return new RssConnector(source.id, source.url);
    case "hackernews":
      return new HackerNewsConnector(source.id);
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
