import { runPipeline } from "./run";

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // 1h

let timer: ReturnType<typeof setTimeout> | null = null;

async function tick() {
  try {
    await runPipeline();
  } catch (err) {
    console.error("[scheduler] unexpected pipeline error:", err);
  } finally {
    const interval = Number(process.env.PIPELINE_CRON_INTERVAL_MS) || DEFAULT_INTERVAL_MS;
    timer = setTimeout(tick, interval);
  }
}

export function startScheduler() {
  if (timer) return;
  const interval = Number(process.env.PIPELINE_CRON_INTERVAL_MS) || DEFAULT_INTERVAL_MS;
  console.log(`[scheduler] starting — interval=${interval}ms`);
  timer = setTimeout(tick, interval);
}

export function stopScheduler() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    console.log("[scheduler] stopped");
  }
}
