"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The company the presenter is acting as, and the reviewer name, kept in the browser.
 * Shared by the intake and review screens. Storage can be blocked, so every access is guarded.
 */

const COMPANY_KEY = "tryout.companyId";
const REVIEWER_KEY = "tryout.reviewer";
export const DEFAULT_COMPANY_ID = "co-tuulos";

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}

let memoryCompany: string | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** The chosen company id. The server render and first paint use the default company. */
export function useCompanyId(): [string, (id: string) => void] {
  const id = useSyncExternalStore(
    subscribe,
    () => read(COMPANY_KEY) ?? memoryCompany ?? DEFAULT_COMPANY_ID,
    () => DEFAULT_COMPANY_ID,
  );
  const set = useCallback((next: string) => {
    memoryCompany = next;
    write(COMPANY_KEY, next);
    listeners.forEach((l) => l());
  }, []);
  return [id, set];
}

export function getReviewer(): string {
  return read(REVIEWER_KEY) ?? "";
}

export function saveReviewer(name: string) {
  write(REVIEWER_KEY, name);
}
