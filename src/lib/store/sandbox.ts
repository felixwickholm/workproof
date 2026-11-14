import { CODE_LENGTH, newShareCode } from "./cookie";
import { createMemoryStore } from "./memory";
import type { ProofStore, StoreData } from "./types";

/** One visitor's private copy of the demo event. */
export interface Sandbox {
  id: string;
  /** Short code that lets a phone and the booth laptop share this sandbox. */
  code: string;
  store: ProofStore;
  createdAt: number;
}

export interface SandboxOptions {
  /** At most this many sandboxes; the least recently used goes first. */
  max: number;
  /** A sandbox older than this is replaced by a fresh one. */
  lifetimeMs: number;
}

export interface SandboxRegistry {
  /**
   * The sandbox for this id, created with `build` on first use or after it expired. The caller passes
   * the builder, so a sandbox made after a dev hot reload uses the current seed, not a stale copy.
   */
  open(id: string, now: number, build: () => StoreData): Sandbox;
  /** The live sandbox behind a share code, if there is one. */
  byCode(code: string, now: number): Sandbox | undefined;
  readonly size: number;
}

/**
 * Sandboxes live in memory only: a visitor's demo is not worth a file, and dropping it is harmless.
 * The map keeps insertion order, and every use moves an entry to the end, so the first entry is the least recently used.
 */
export function createSandboxRegistry(options: SandboxOptions): SandboxRegistry {
  const sandboxes = new Map<string, Sandbox>();
  const codes = new Map<string, string>();

  function drop(id: string): void {
    const sandbox = sandboxes.get(id);
    if (!sandbox) return;
    sandboxes.delete(id);
    codes.delete(sandbox.code);
  }

  function uniqueCode(): string {
    for (;;) {
      const code = newShareCode();
      if (!codes.has(code)) return code;
    }
  }

  function create(id: string, now: number, build: () => StoreData): Sandbox {
    while (sandboxes.size >= options.max) {
      const oldest = sandboxes.keys().next().value;
      if (oldest === undefined) break;
      drop(oldest);
    }
    const sandbox: Sandbox = { id, code: uniqueCode(), store: createMemoryStore(build), createdAt: now };
    sandboxes.set(id, sandbox);
    codes.set(sandbox.code, id);
    return sandbox;
  }

  function live(id: string, now: number): Sandbox | undefined {
    const sandbox = sandboxes.get(id);
    if (!sandbox) return undefined;
    if (now - sandbox.createdAt >= options.lifetimeMs) {
      drop(id);
      return undefined;
    }
    sandboxes.delete(id);
    sandboxes.set(id, sandbox);
    return sandbox;
  }

  return {
    open: (id, now, build) => live(id, now) ?? create(id, now, build),
    byCode(code, now) {
      if (code.length !== CODE_LENGTH) return undefined;
      const id = codes.get(code);
      return id === undefined ? undefined : live(id, now);
    },
    get size() {
      return sandboxes.size;
    },
  };
}
