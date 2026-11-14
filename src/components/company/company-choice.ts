"use client";

import { useCallback, useSyncExternalStore } from "react";
import { COMPANIES, REVIEWERS } from "@/lib/seed/companies";

/**
 * The company the presenter is acting as, and the reviewer name, kept in the browser.
 * Shared by the intake and review screens. Storage can be blocked, so every access is guarded.
 */

const COMPANY_KEY = "workprint.companyId";
const REVIEWER_KEY = "workprint.reviewer";
/** The demo identity in Hiring mode: Anna Koivisto at Kaari Home Care. */
export const DEFAULT_COMPANY_ID = "co-kaari";

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

/** The ids of the event's companies: the API lists exactly these, since no route adds a company. */
const COMPANY_IDS: readonly string[] = COMPANIES.map((c) => c.id);

/**
 * A stored company id only when the event still has that company, else the default. A choice kept
 * from an older demo (say "co-lumo") would otherwise ask the API for a company that is gone.
 */
export function knownCompanyId(stored: string | null, known: readonly string[] = COMPANY_IDS): string {
  return stored !== null && known.includes(stored) ? stored : DEFAULT_COMPANY_ID;
}

/** The chosen company id. The server render and first paint use the default company. */
export function useCompanyId(): [string, (id: string) => void] {
  const id = useSyncExternalStore(
    subscribe,
    () => knownCompanyId(read(COMPANY_KEY) ?? memoryCompany),
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

/**
 * Who reviews for a company: the name typed there before, else the company's own demo reviewer.
 * Each company keeps its own, so a name typed at one company never shows at another.
 */
export function getReviewer(companyId: string): string {
  return read(`${REVIEWER_KEY}.${companyId}`) || REVIEWERS[companyId] || "";
}

/** The person the demo shows a company through, for "You are Anna Koivisto, who hires here." */
export function demoReviewer(companyId: string): string | null {
  return REVIEWERS[companyId] ?? null;
}

export function saveReviewer(companyId: string, name: string) {
  write(`${REVIEWER_KEY}.${companyId}`, name);
  listeners.forEach((l) => l());
}

/** The reviewer for a company, following later changes. The server render uses the demo reviewer. */
export function useReviewer(companyId: string): string {
  return useSyncExternalStore(
    subscribe,
    () => getReviewer(companyId),
    () => REVIEWERS[companyId] ?? "",
  );
}
