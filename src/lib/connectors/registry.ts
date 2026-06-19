import type { SourceConnector } from "@/types";

const connectors = new Map<string, SourceConnector>();

export const registry = {
  register(sourceId: string, connector: SourceConnector) {
    connectors.set(sourceId, connector);
  },

  unregister(sourceId: string) {
    connectors.delete(sourceId);
  },

  get(sourceId: string): SourceConnector | undefined {
    return connectors.get(sourceId);
  },

  all(): SourceConnector[] {
    return [...connectors.values()];
  },
};
