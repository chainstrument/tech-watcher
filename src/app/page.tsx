import { Suspense } from "react";
import ItemList from "@/components/ItemList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Tech Watcher</h1>
            <p className="text-sm text-gray-400">Veille tech en temps réel</p>
          </div>
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-700">
            Live
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <ItemList />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-800/60" />
      ))}
    </div>
  );
}
