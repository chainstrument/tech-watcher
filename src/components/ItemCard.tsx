import type { Item } from "@/types";

const SOURCE_COLORS: Record<string, string> = {
  hackernews: "bg-orange-900/40 text-orange-400 ring-orange-700",
  simonwillison: "bg-violet-900/40 text-violet-400 ring-violet-700",
  "github-blog": "bg-gray-800/60 text-gray-300 ring-gray-600",
  "devto-ai": "bg-blue-900/40 text-blue-400 ring-blue-700",
  changelog: "bg-emerald-900/40 text-emerald-400 ring-emerald-700",
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "text-emerald-400";
  if (score >= 0.4) return "text-yellow-400";
  return "text-gray-500";
}

interface Props {
  item: Item & { sourceLabel: string };
}

export default function ItemCard({ item }: Props) {
  const colorClass = SOURCE_COLORS[item.sourceId] ?? "bg-gray-800/40 text-gray-400 ring-gray-700";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 transition-colors hover:border-gray-700 hover:bg-gray-800/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-100 group-hover:text-white">
          {item.title}
        </p>

        {item.summary && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-400">{item.summary}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${colorClass}`}>
            {item.sourceLabel}
          </span>

          <span className="text-xs text-gray-500">{timeAgo(item.publishedAt)}</span>

          {item.score != null && (
            <span className={`text-xs font-medium ${scoreColor(item.score)}`}>
              {Math.round(item.score * 100)}%
            </span>
          )}

          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400 ring-1 ring-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <svg
        className="mt-0.5 size-4 shrink-0 text-gray-600 group-hover:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
