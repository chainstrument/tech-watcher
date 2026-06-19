import { genai, FLASH_MODEL } from "./client";
import { getDb } from "@/lib/db/client";

interface ItemRow {
  id: string;
  title: string;
  url: string;
  raw_content: string;
}

interface AIResult {
  id: string;
  summary: string;
  tags: string[];
  score: number;
  duplicate_of: string | null;
}

export interface BatchResult {
  processed: number;
  archived: number;
  errors: number;
}

const CHUNK_SIZE = 30;
const MAX_CONTENT_CHARS = 2000;

export async function processNewItems(): Promise<BatchResult> {
  const db = getDb();

  const { rows } = await db.query<ItemRow>(
    "SELECT id, title, url, raw_content FROM items WHERE status = 'nouveau' ORDER BY created_at"
  );

  if (rows.length === 0) {
    console.log("[ai/batch] no new items to process");
    return { processed: 0, archived: 0, errors: 0 };
  }

  console.log(`[ai/batch] processing ${rows.length} items`);

  let processed = 0;
  let archived = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    try {
      const results = await callGemini(chunk);
      const counts = await updateItems(results);
      processed += counts.processed;
      archived += counts.archived;
    } catch (err) {
      console.error(
        `[ai/batch] chunk ${i}–${Math.min(i + CHUNK_SIZE, rows.length) - 1} failed:`,
        err
      );
      errors += chunk.length;
    }
  }

  console.log(`[ai/batch] done — processed=${processed} archived=${archived} errors=${errors}`);
  return { processed, archived, errors };
}

async function callGemini(items: ItemRow[]): Promise<AIResult[]> {
  const payload = items.map(({ id, title, url, raw_content }) => ({
    id,
    title,
    url,
    content: raw_content.slice(0, MAX_CONTENT_CHARS),
  }));

  const prompt = `Tu es un assistant de veille technologique pour développeurs. Analyse ces articles et pour chacun fournis:
- summary: résumé en français, 2-3 phrases claires
- tags: 2-5 tags thématiques en anglais (ex: "AI", "TypeScript", "security", "DevOps", "open-source")
- score: pertinence pour un profil développeur full-stack intéressé par l'IA, le web et les outils (0.0 = hors sujet, 1.0 = très pertinent)
- duplicate_of: l'id d'un autre article de cette liste qui traite exactement du même sujet (même événement/release), sinon null

Réponds UNIQUEMENT avec un tableau JSON valide, un objet par article, dans le même ordre:
[{"id":"...","summary":"...","tags":[...],"score":0.8,"duplicate_of":null}]

Articles à analyser:
${JSON.stringify(payload, null, 2)}`;

  const response = await genai.models.generateContent({
    model: FLASH_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as AIResult[];
}

async function updateItems(results: AIResult[]): Promise<{ processed: number; archived: number }> {
  const db = getDb();
  let processed = 0;
  let archived = 0;

  for (const r of results) {
    const isDuplicate = Boolean(r.duplicate_of);
    await db.query(
      `UPDATE items
       SET summary = $1, tags = $2, score = $3, status = $4
       WHERE id = $5`,
      [r.summary ?? null, r.tags ?? [], r.score ?? null, isDuplicate ? "archivé" : "traité", r.id]
    );
    if (isDuplicate) {
      archived++;
    } else {
      processed++;
    }
  }

  return { processed, archived };
}
