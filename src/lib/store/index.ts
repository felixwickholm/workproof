import { join } from "node:path";
import { buildSeed } from "@/lib/seed";
import { ServiceError } from "@/lib/service/support";
import { SANDBOX_LIFETIME_MS } from "./cookie";
import { createWindowLimiter, creationKey, SANDBOX_WINDOW_MS, SANDBOXES_PER_ADDRESS, type WindowLimiter } from "./creation-limit";
import { createMemoryStore } from "./memory";
import { createSandboxRegistry, type Sandbox, type SandboxRegistry } from "./sandbox";
import { callerScope, type CallerScope } from "./scope";
import type { ProofStore } from "./types";

export type { StoreData } from "./types";

/** At most this many visitor sandboxes are kept in memory. */
const MAX_SANDBOXES = 2000;

/** A sandbox used within this time is never evicted for a newcomer. */
const RECENT_USE_MS = 30 * 60 * 1000;

/** What a request without a sandbox may not do: the shared default event is for reading only. */
export const NO_SANDBOX_MESSAGE = "Open the site first.";

const holder = globalThis as typeof globalThis & {
  __workprintStore?: ProofStore;
  __workprintSandboxes?: SandboxRegistry;
  __workprintSandboxCreation?: WindowLimiter;
};

/** File used for persistence. PROOF_DATA_FILE=off keeps everything in memory. */
function dataFile(): string | undefined {
  const configured = process.env.PROOF_DATA_FILE;
  if (configured === "off") return undefined;
  return configured || join(process.cwd(), ".data", "store.json");
}

/** The shared store used without a sandbox. Kept on globalThis so dev hot reload does not reset it. */
function defaultStore(): ProofStore {
  holder.__workprintStore ??= createMemoryStore(() => buildSeed(new Date()), dataFile());
  return holder.__workprintStore;
}

/** Every visitor's sandbox. Shared through globalThis, since each route bundle has its own copy of this module. */
export function sandboxes(): SandboxRegistry {
  holder.__workprintSandboxes ??= createSandboxRegistry({ max: MAX_SANDBOXES, lifetimeMs: SANDBOX_LIFETIME_MS, protectedMs: RECENT_USE_MS });
  return holder.__workprintSandboxes;
}

function creationLimiter(): WindowLimiter {
  holder.__workprintSandboxCreation ??= createWindowLimiter({ max: SANDBOXES_PER_ADDRESS, windowMs: SANDBOX_WINDOW_MS });
  return holder.__workprintSandboxCreation;
}

/** A new sandbox starts at the "invited" story stage, the default for free exploring. */
const freshEvent = () => buildSeed(new Date(), "invited");

/**
 * The live sandbox for the request, or a new one. A cookie id the registry does not know (first visit, expired,
 * or made up by a script) starts a sandbox only within the per-address limit and while there is room.
 */
function sandboxFor(scope: CallerScope): Sandbox | undefined {
  if (scope.kind !== "request" || !scope.sandboxId) return undefined;
  const now = Date.now();
  const live = sandboxes().find(scope.sandboxId, now);
  if (live) return live;
  if (!creationLimiter().allow(creationKey(scope.headers, process.env.NODE_ENV === "production"), now)) return undefined;
  return sandboxes().create(scope.sandboxId, now, freshEvent);
}

/** The caller's sandbox, or undefined when the request has none (or there is no request). */
export async function currentSandbox(): Promise<Sandbox | undefined> {
  return sandboxFor(await callerScope());
}

/** The shared default event, readable by anyone and changed by nobody. */
const readOnly = (store: ProofStore): ProofStore => ({
  read: () => store.read(),
  update: () => Promise.reject(new ServiceError(401, NO_SANDBOX_MESSAGE)),
  replace: () => Promise.reject(new ServiceError(401, NO_SANDBOX_MESSAGE)),
  flush: () => store.flush(),
});

/**
 * Outside a request (tests, evals, scripts): the default store. In a request with a sandbox: that sandbox.
 * In a request without one: the default store, read-only, so a cookie-less script can neither change the
 * shared event nor create sandboxes that push out real visitors.
 */
async function scoped(): Promise<ProofStore> {
  const scope = await callerScope();
  if (scope.kind === "outside") return defaultStore();
  return sandboxFor(scope)?.store ?? readOnly(defaultStore());
}

/**
 * The store for the current caller. Every call resolves the scope again, so services stay unaware of sandboxes.
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
