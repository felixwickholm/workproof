import { join } from "node:path";
import { buildSeed } from "@/lib/seed";
import { SANDBOX_LIFETIME_MS } from "./cookie";
import { createMemoryStore } from "./memory";
import { createSandboxRegistry, type Sandbox, type SandboxRegistry } from "./sandbox";
import { currentSandboxId } from "./scope";
import type { ProofStore } from "./types";

export type { DemoInfo, ProofStore, StoreData } from "./types";
export type { Sandbox } from "./sandbox";

/** At most this many visitor sandboxes are kept in memory. */
export const MAX_SANDBOXES = 400;

const holder = globalThis as typeof globalThis & { __tryoutStore?: ProofStore; __tryoutSandboxes?: SandboxRegistry };

/** File used for persistence. PROOF_DATA_FILE=off keeps everything in memory. */
function dataFile(): string | undefined {
  const configured = process.env.PROOF_DATA_FILE;
  if (configured === "off") return undefined;
  return configured || join(process.cwd(), ".data", "store.json");
}

/** The shared store used without a sandbox. Kept on globalThis so dev hot reload does not reset it. */
function defaultStore(): ProofStore {
  holder.__tryoutStore ??= createMemoryStore(() => buildSeed(new Date()), dataFile());
  return holder.__tryoutStore;
}

/** Every visitor's sandbox. Shared through globalThis, since each route bundle has its own copy of this module. */
export function sandboxes(): SandboxRegistry {
  holder.__tryoutSandboxes ??= createSandboxRegistry({ max: MAX_SANDBOXES, lifetimeMs: SANDBOX_LIFETIME_MS });
  return holder.__tryoutSandboxes;
}

/** A new sandbox starts at the "invited" story stage, the default for free exploring. */
const freshEvent = () => buildSeed(new Date(), "invited");

/** The caller's sandbox, or undefined when the request has none (or there is no request). */
export async function currentSandbox(): Promise<Sandbox | undefined> {
  const id = await currentSandboxId();
  return id ? sandboxes().open(id, Date.now(), freshEvent) : undefined;
}

async function scoped(): Promise<ProofStore> {
  return (await currentSandbox())?.store ?? defaultStore();
}

/**
 * The store for the current caller: their own sandbox inside a request with a sandbox cookie,
 * otherwise the default store. Every call resolves the scope again, so services stay unaware of sandboxes.
 */
const callerStore: ProofStore = {
  async read() {
    return (await scoped()).read();
  },
  async update(change) {
    return (await scoped()).update(change);
  },
  async replace(data) {
    return (await scoped()).replace(data);
  },
  flush() {
    defaultStore().flush();
  },
};

export function getStore(): ProofStore {
  return callerStore;
}
