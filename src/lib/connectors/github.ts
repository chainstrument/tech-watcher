import type { RawItem } from "@/types";
import { BaseConnector } from "./base";

interface GithubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
}

export class GithubConnector extends BaseConnector {
  private readonly repos: string[];
  private readonly token?: string;

  /** @param repos list of "owner/repo" strings to watch */
  constructor(sourceId: string, repos: string[], token?: string) {
    super(sourceId);
    this.repos = repos;
    this.token = token ?? process.env.GITHUB_TOKEN;
  }

  async fetch(): Promise<RawItem[]> {
    return this.fetchWithRetry(async () => {
      const results = await Promise.all(this.repos.map((repo) => this.fetchReleases(repo)));
      return results.flat();
    });
  }

  private async fetchReleases(repo: string): Promise<RawItem[]> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=10`, {
      headers,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (res.status === 404) {
      console.warn(`[GithubConnector] repo not found: ${repo}`);
      return [];
    }
    if (!res.ok) throw new Error(`GitHub API HTTP ${res.status} for ${repo}`);

    const releases: GithubRelease[] = await res.json();

    return releases
      .filter((r) => !r.draft && !r.prerelease)
      .map((r) => ({
        title: `${repo} ${r.tag_name}${r.name && r.name !== r.tag_name ? ` — ${r.name}` : ""}`,
        url: r.html_url,
        publishedAt: r.published_at ? new Date(r.published_at) : new Date(),
        rawContent: r.body ?? "",
        sourceId: this.sourceId,
      }));
  }
}
