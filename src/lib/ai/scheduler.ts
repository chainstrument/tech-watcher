import { processNewItems } from "./batch";

let timer: ReturnType<typeof setTimeout> | null = null;

function msUntilNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

async function tick() {
  console.log("[ai/scheduler] starting daily batch");
  try {
    await processNewItems();
  } catch (err) {
    console.error("[ai/scheduler] batch error:", err);
  } finally {
    timer = setTimeout(tick, msUntilNextMidnight());
  }
}

export function startAIScheduler() {
  if (timer) return;
  const delay = msUntilNextMidnight();
  const nextRun = new Date(Date.now() + delay).toISOString();
  console.log(`[ai/scheduler] starting — next run at ${nextRun}`);
  timer = setTimeout(tick, delay);
}

export function stopAIScheduler() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    console.log("[ai/scheduler] stopped");
  }
}
