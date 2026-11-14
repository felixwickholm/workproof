"use client";

import { useSyncExternalStore } from "react";

/**
 * Proofs this browser has opened, for the unread dot in the review list. Kept for the tab's
 * session only: it marks where the reader is, never anything about the work or the person.
 */
const KEY = "workprint.openedProofs";

/** The stored list, read leniently: anything unreadable counts as nothing opened. */
export function parseOpened(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

/** The stored list with one more id. */
export function withOpened(raw: string | null, proofId: string): string {
  const ids = parseOpened(raw);
  ids.add(proofId);
  return JSON.stringify([...ids]);
}

const listeners = new Set<() => void>();
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

/** Marks a proof as opened in this browser. Storage can be blocked: then it lasts for this page view. */
export function markOpened(proofId: string) {
  const next = withOpened(readRaw(), proofId);
  memory = next;
  try {
    window.sessionStorage.setItem(KEY, next);
  } catch {
    // Storage blocked: the memory copy above is enough for this page view.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let cachedRaw: string | null = null;
let cached = new Set<string>();

function snapshot(): ReadonlySet<string> {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseOpened(raw);
  }
  return cached;
}

/** The opened proof ids, or null on the server, where nothing is known yet. */
export function useOpenedProofs(): ReadonlySet<string> | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
