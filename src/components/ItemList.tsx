import { readItems, readSources } from "@/lib/storage";
import ItemCard from "./ItemCard";

export default function ItemList() {
  const sources = readSources();
  const sourceNames = Object.fromEntries(sources.map((s) => [s.id, s.name]));

  const items = readItems()
    .filter((i) => i.status !== "archivé")
    .slice(0, 60)
    .map((item) => ({ ...item, sourceLabel: sourceNames[item.sourceId] ?? item.sourceId }));

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500">
        Aucun article pour l&apos;instant — le pipeline n&apos;a pas encore tourné.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm text-gray-500">{items.length} articles</p>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
