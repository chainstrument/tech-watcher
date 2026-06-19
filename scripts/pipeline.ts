import "dotenv/config";
import { runPipeline } from "@/lib/pipeline/run";

runPipeline()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
