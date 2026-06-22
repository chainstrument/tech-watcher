export type ItemStatus = "nouveau" | "traité" | "archivé";

export interface Source {
  id: string;
  name: string;
  type: "rss" | "hackernews" | "github";
  url: string;
  active: boolean;
  limit?: number;
}

export interface Item {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  publishedAt: Date;
  rawContent: string;
  status: ItemStatus;
  summary?: string;
  score?: number;
  tags?: string[];
  createdAt: Date;
}

export interface RawItem {
  title: string;
  url: string;
  publishedAt: Date;
  rawContent: string;
  sourceId: string;
}

export interface SourceConnector {
  fetch(): Promise<RawItem[]>;
}
