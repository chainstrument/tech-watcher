import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/run";

export const maxDuration = 60;

export async function POST() {
  try {
    const result = await runPipeline();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/pipeline/run]", err);
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 });
  }
}
