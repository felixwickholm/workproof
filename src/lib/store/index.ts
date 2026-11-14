import { join } from "node:path";
import { buildSeed } from "@/lib/seed";
import { createMemoryStore } from "./memory";
import type { ProofStore } from "./types";

export type { EventInfo, ProofStore, StoreData } from "./types";

const holder = globalThis as typeof globalThis & { __tryoutStore?: ProofStore };

/** File used for persistence. PROOF_DATA_FILE=off keeps everything in memory. */
function dataFile(): string | undefined {
  const configured = process.env.PROOF_DATA_FILE;
  if (configured === "off") return undefined;
  return configured || join(process.cwd(), ".data", "store.json");
}

/** One store per server process. Kept on globalThis so dev hot reload does not reset it. */
export function getStore(): ProofStore {
  holder.__tryoutStore ??= createMemoryStore(() => buildSeed(new Date()), dataFile());
  return holder.__tryoutStore;
}
