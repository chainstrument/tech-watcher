import type { RawItem } from "@/types";
import { BaseConnector } from "./base";

export class MockConnector extends BaseConnector {
  private items: RawItem[];

  constructor(sourceId: string, items?: RawItem[]) {
    super(sourceId);
    this.items = items ?? MockConnector.defaults(sourceId);
  }

  async fetch(): Promise<RawItem[]> {
    return this.fetchWithRetry(async () => this.items);
  }

  private static defaults(sourceId: string): RawItem[] {
    return [
      {
        title: "Mock item 1",
        url: "https://example.com/1",
        publishedAt: new Date("2026-01-01T10:00:00Z"),
        rawContent: "Content of mock item 1",
        sourceId,
      },
      {
        title: "Mock item 2",
        url: "https://example.com/2",
        publishedAt: new Date("2026-01-01T11:00:00Z"),
        rawContent: "Content of mock item 2",
        sourceId,
      },
    ];
  }
}
