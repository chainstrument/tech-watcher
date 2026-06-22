import "dotenv/config";
import { runPipeline } from "@/lib/pipeline/run";
import { processNewItems } from "@/lib/ai/batch";

async function main() {
  console.log("[action] running pipeline...");
  const pipeline = await runPipeline();
  console.log(
    `[action] pipeline done — fetched=${pipeline.totalFetched} inserted=${pipeline.totalInserted} skipped=${pipeline.totalSkipped}`
  );

  if (pipeline.totalInserted > 0) {
    console.log("[action] running AI batch...");
    const ai = await processNewItems();
    console.log(
      `[action] AI done — processed=${ai.processed} archived=${ai.archived} errors=${ai.errors}`
    );
  } else {
    console.log("[action] no new items, skipping AI batch");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
