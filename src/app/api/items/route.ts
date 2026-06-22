import { NextResponse } from "next/server";
import { readItems, readSources } from "@/lib/storage";

export async function GET() {
  const sources = readSources();
  const sourceNames = Object.fromEntries(sources.map((s) => [s.id, s.name]));

  const items = readItems()
    .filter((i) => i.status !== "archivé")
    .slice(0, 60)
    .map((item) => ({ ...item, sourceLabel: sourceNames[item.sourceId] ?? item.sourceId }));

  return NextResponse.json(items);
}
