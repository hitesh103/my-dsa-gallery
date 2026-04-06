import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Prepared = {
  bind: (...values: unknown[]) => {
    first: <T = unknown>() => Promise<T | null>;
    all: <T = unknown>() => Promise<{ results: T[] }>;
    run: () => Promise<unknown>;
  };
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1Prepared;
  batch?: (statements: unknown[]) => Promise<unknown[]>;
};

export function getD1(): D1DatabaseLike {
  // In OpenNext (Cloudflare), bindings live on getCloudflareContext().env.
  // In local `next dev`, this will typically throw unless you run via Wrangler/OpenNext.
  const ctx = getCloudflareContext();
  const db = (ctx.env as Record<string, unknown> | undefined)?.DB as D1DatabaseLike | undefined;
  if (!db) throw new Error('D1 is not configured (missing binding "DB").');
  return db;
}

