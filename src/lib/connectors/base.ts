import type { RawItem, SourceConnector } from "@/types";

interface RetryOptions {
  retries?: number;
  timeoutMs?: number;
}

export class ConnectorError extends Error {
  constructor(
    public readonly connectorName: string,
    public readonly cause: unknown
  ) {
    super(
      `[${connectorName}] failed: ${cause instanceof Error ? cause.message : String(cause)}`
    );
    this.name = "ConnectorError";
  }
}

export abstract class BaseConnector implements SourceConnector {
  protected readonly sourceId: string;
  protected readonly retries: number;
  protected readonly timeoutMs: number;

  constructor(sourceId: string, options: RetryOptions = {}) {
    this.sourceId = sourceId;
    this.retries = options.retries ?? 1;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  abstract fetch(): Promise<RawItem[]>;

  protected async fetchWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout after ${this.timeoutMs}ms`)),
              this.timeoutMs
            )
          ),
        ]);
      } catch (err) {
        lastError = err;
        if (attempt < this.retries) {
          console.warn(
            `[${this.constructor.name}] attempt ${attempt + 1} failed, retrying…`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }

    const error = new ConnectorError(this.constructor.name, lastError);
    console.error(error.message);
    throw error;
  }
}
