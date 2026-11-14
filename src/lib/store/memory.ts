import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ProofStore, StoreData } from "./types";

/** Writes wait this long, so a burst of requests causes one write. */
const WRITE_DELAY_MS = 250;

/**
 * In-memory store with optional JSON persistence. Reads share the live data without copying;
 * updates work on a copy, so a failed change leaves nothing half done. Writes are debounced,
 * atomic (temporary file, then rename) and flushed when the process exits. When the file cannot
 * be written, for example on a read-only file system, the store keeps working from memory.
 */
export function createMemoryStore(initial: () => StoreData, file?: string): ProofStore {
  let persist = Boolean(file);
  let data = load();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function load(): StoreData {
    if (file && existsSync(file)) {
      try {
        const parsed = JSON.parse(readFileSync(file, "utf8")) as StoreData;
        // A file saved before the demo stages existed has no `demo`; it is rebuilt from the seed.
        if (parsed.version === 1 && parsed.demo) return parsed;
      } catch {
        console.warn(`WorkProof: ${file} could not be read; starting from the demo data.`);
      }
    }
    return initial();
  }

  function flush(): void {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!persist || !file) return;
    try {
      mkdirSync(dirname(file), { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, JSON.stringify(data));
      renameSync(temporary, file);
    } catch (error) {
      persist = false;
      console.warn(`WorkProof: cannot write ${file}; keeping data in memory only. ${error instanceof Error ? error.message : ""}`);
    }
  }

  function save(): void {
    if (!persist || !file || timer) return;
    timer = setTimeout(flush, WRITE_DELAY_MS);
    timer.unref?.();
  }

  if (file) process.once("exit", flush);

  return {
    async read() {
      return data;
    },
    async update(change) {
      const next = structuredClone(data);
      const result = change(next);
      data = next;
      save();
      return result;
    },
    async replace(next) {
      data = structuredClone(next);
      save();
    },
    flush,
  };
}
