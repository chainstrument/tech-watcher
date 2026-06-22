import "dotenv/config";
import { runPipeline } from "@/lib/pipeline/run";
import { processNewItems } from "@/lib/ai/batch";
import { readItems } from "@/lib/storage";

async function main() {
  console.log("[action] running pipeline...");
  const pipeline = await runPipeline();
  console.log(
    `[action] pipeline done — fetched=${pipeline.totalFetched} inserted=${pipeline.totalInserted} skipped=${pipeline.totalSkipped}`
  );

  const pending = readItems().filter((i) => i.status === "nouveau").length;
  if (pending > 0) {
    console.log(`[action] ${pending} items pending AI — running batch...`);
    const ai = await processNewItems();
    console.log(
      `[action] AI done — processed=${ai.processed} archived=${ai.archived} errors=${ai.errors}`
    );
  } else {
    console.log("[action] no pending items, skipping AI batch");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
