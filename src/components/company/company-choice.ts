"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The company the presenter is acting as, and the reviewer name, kept in the browser.
 * Shared by the intake and review screens. Storage can be blocked, so every access is guarded.
 */

const COMPANY_KEY = "tryout.companyId";
const REVIEWER_KEY = "tryout.reviewer";
const DEFAULT_COMPANY_ID = "co-tuulos";

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
  const set = useCallback((next: string) => setCompanyChoice(next), []);
  return [id, set];
}

/** Acts as another company everywhere at once, for example from the guided story. */
export function setCompanyChoice(id: string) {
  memoryCompany = id;
  write(COMPANY_KEY, id);
  listeners.forEach((l) => l());
}

/** Each company has its own reviewer, so a name typed at one company never shows at another. */
export function getReviewer(companyId: string): string {
  return read(`${REVIEWER_KEY}.${companyId}`) ?? "";
}

export function saveReviewer(companyId: string, name: string) {
  write(`${REVIEWER_KEY}.${companyId}`, name);
}
