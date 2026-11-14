import type { TourView } from "./steps";

/** The part of the Web Storage API these helpers use, so a test can hand in a plain map. */
export type KeyStore = Pick<Storage, "getItem" | "setItem">;

/** Set once the visitor has closed or finished the story in this browser: it then never starts by itself again. */
export const STORY_SEEN_KEY = "workproof.storySeen";
/** Set once a visitor has opened a view in this browser: its Show me button pulses only before. */
export const seenKey = (view: TourView) => `workproof.demoSeen.${view}`;

/** The addresses of Mikko's home, where the app opens and the story starts by itself. */
export const ENTRY_PATHS: readonly string[] = ["/", "/seeker"];

/** `?tour=0` or `?tour=off`: open the app without the story, and remember that. */
export const isOffParam = (value: string | null) => value === "0" || value === "off";

/** Storage can be blocked (private mode, site settings): then nothing is remembered. */
function guarded<T>(run: () => T, fallback: T): T {
  try {
    return run();
  } catch {
    return fallback;
  }
}

export function storySeen(local: KeyStore | undefined): boolean {
  return guarded(() => local?.getItem(STORY_SEEN_KEY) === "1", false);
}

export function markStorySeen(local: KeyStore | undefined) {
  guarded(() => local?.setItem(STORY_SEEN_KEY, "1"), undefined);
}

interface Visit {
  /** The page the app opened on. */
  path: string;
  /** The `?tour=` value, or null. A link that names a tour decides by itself. */
  param: string | null;
  /** The visitor closed or finished the story before in this browser. */
  seen: boolean;
  /**
   * The browser is driven by a test or a crawler (`navigator.webdriver`): the story would cover the
   * page it came to check. The tour's own browser check switches this off to test the start.
   */
  automated: boolean;
}

/** Whether the story starts by itself: on a first visit that opens on Mikko's home, and only then. */
export function shouldAutoStart({ path, param, seen, automated }: Visit): boolean {
  return param === null && !seen && !automated && ENTRY_PATHS.includes(path);
}

/** Whether a view's Show me button gets its one gentle pulse now: the first time the view opens in this browser. */
export function takePulse(view: TourView, local: KeyStore | undefined): boolean {
  const first = guarded(() => local?.getItem(seenKey(view)) === null, false);
  if (first) guarded(() => local?.setItem(seenKey(view), "1"), undefined);
  return first;
}

/** This browser's local storage, or undefined where it is blocked. */
export function localStore(): KeyStore | undefined {
  return guarded(() => window.localStorage, undefined);
}
