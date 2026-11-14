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
  /** Last time any request used this sandbox. */
  lastUsed: number;
}

interface SandboxOptions {
  /** At most this many sandboxes. */
  max: number;
  /** A sandbox older than this is replaced by a fresh one. */
  lifetimeMs: number;
  /**
   * A sandbox used within this time is never evicted to make room: when every sandbox is this recent,
   * a new one is refused instead, so a flood of new visitors cannot wipe the demos people are using.
   */
  protectedMs: number;
}

export interface SandboxRegistry {
  /** The live sandbox for this id, marked as used now. Never creates one. */
  find(id: string, now: number): Sandbox | undefined;
  /**
   * A new sandbox for this id, built with `build`. The caller passes the builder, so a sandbox made after a
   * dev hot reload uses the current seed. Undefined when the registry is full of recently used sandboxes.
   */
  create(id: string, now: number, build: () => StoreData): Sandbox | undefined;
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

  /** Evicts least recently used sandboxes until one more fits. False when only recently used ones are left. */
  function makeRoom(now: number): boolean {
    while (sandboxes.size >= options.max) {
      const oldest = sandboxes.values().next().value;
      if (oldest === undefined) break;
      if (now - oldest.lastUsed < options.protectedMs) return false;
      drop(oldest.id);
    }
    return true;
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
    sandbox.lastUsed = now;
    return sandbox;
  }

  return {
    find: live,
    create(id, now, build) {
      drop(id);
      if (!makeRoom(now)) return undefined;
      const sandbox: Sandbox = { id, code: uniqueCode(), store: createMemoryStore(build), createdAt: now, lastUsed: now };
      sandboxes.set(id, sandbox);
      codes.set(sandbox.code, id);
      return sandbox;
    },
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
