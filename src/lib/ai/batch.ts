import { genai, FLASH_MODEL } from "./client";
import { readItems, writeItems } from "@/lib/storage";
import type { Item } from "@/types";

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
  const allItems = readItems();
  const newItems = allItems.filter((i) => i.status === "nouveau");

  if (newItems.length === 0) {
    console.log("[ai/batch] no new items to process");
    return { processed: 0, archived: 0, errors: 0 };
  }

  console.log(`[ai/batch] processing ${newItems.length} items`);

  let processed = 0;
  let archived = 0;
  let errors = 0;

  const updatedMap = new Map<string, Partial<Item>>();

  for (let i = 0; i < newItems.length; i += CHUNK_SIZE) {
    const chunk = newItems.slice(i, i + CHUNK_SIZE);
    try {
      const results = await callGemini(chunk);
      for (const r of results) {
        const isDuplicate = Boolean(r.duplicate_of);
        updatedMap.set(r.id, {
          summary: r.summary ?? undefined,
          tags: r.tags ?? [],
          score: r.score ?? undefined,
          status: isDuplicate ? "archivé" : "traité",
        });
        if (isDuplicate) archived++;
        else processed++;
      }
    } catch (err) {
      console.error(
        `[ai/batch] chunk ${i}–${Math.min(i + CHUNK_SIZE, newItems.length) - 1} failed:`,
        err
      );
      errors += chunk.length;
    }
  }

  const merged = allItems.map((item) => {
    const update = updatedMap.get(item.id);
    return update ? { ...item, ...update } : item;
  });
  writeItems(merged);

  console.log(`[ai/batch] done — processed=${processed} archived=${archived} errors=${errors}`);
  return { processed, archived, errors };
}

async function callGemini(items: Item[]): Promise<AIResult[]> {
  const payload = items.map(({ id, title, url, rawContent }) => ({
    id,
    title,
    url,
    content: rawContent.slice(0, MAX_CONTENT_CHARS),
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
