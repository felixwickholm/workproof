import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ProofStore, StoreData } from "./types";

/**
 * In-memory store with optional JSON persistence. When the file cannot be written
 * (for example on a read-only file system) it keeps working from memory.
 */
export function createMemoryStore(initial: () => StoreData, file?: string): ProofStore {
  let persist = Boolean(file);
  let data = load();

  function load(): StoreData {
    if (file && existsSync(file)) {
      try {
        const parsed = JSON.parse(readFileSync(file, "utf8")) as StoreData;
        if (parsed.version === 1) return parsed;
      } catch {
        // A damaged file is replaced by fresh data on the next write.
      }
    }
    return initial();
  }

  function save(): void {
    if (!persist || !file) return;
    try {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify(data, null, 2));
    } catch {
      persist = false;
    }
  }

  return {
    async read() {
      return structuredClone(data);
    },
    async update(change) {
      const next = structuredClone(data);
      const result = change(next);
      data = next;
      save();
      return structuredClone(result);
    },
    async replace(next) {
      data = structuredClone(next);
      save();
    },
  };
}
