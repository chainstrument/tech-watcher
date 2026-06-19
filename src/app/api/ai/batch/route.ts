import { NextResponse } from "next/server";
import { processNewItems } from "@/lib/ai/batch";

export const maxDuration = 120;

export async function POST() {
  try {
    const result = await processNewItems();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/ai/batch]", err);
    return NextResponse.json({ error: "AI batch failed" }, { status: 500 });
  }
}
