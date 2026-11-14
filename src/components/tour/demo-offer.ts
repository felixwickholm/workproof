import type { TourView } from "./steps";

/** The part of the Web Storage API the offer uses, so a test can hand in a plain map. */
export type KeyStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Set once a visitor has opened a view in this browser: its Show me button pulses only before. */
export const seenKey = (view: TourView) => `workproof.demoSeen.${view}`;
/** Set by the one-minute tour's end card for the view it opens, so that view offers its demo. */
export const OFFER_KEY = "workproof.demoOffer";

/** Storage can be blocked (private mode, site settings): then nothing is remembered. */
function guarded<T>(run: () => T, fallback: T): T {
  try {
    return run();
  } catch {
    return fallback;
  }
}

/** Asks the view `view` to offer its demo the next time it opens in this tab. */
export function offerDemo(view: TourView, session: KeyStore | undefined) {
  guarded(() => session?.setItem(OFFER_KEY, view), undefined);
}

/**
 * Whether the view's Show me button gets its one gentle pulse now: the first time the view opens
 * in this browser, or when the one-minute tour just sent the visitor here. Either reason is used
 * up by asking, so the pulse never repeats on its own.
 */
export function takePulse(view: TourView, local: KeyStore | undefined, session: KeyStore | undefined): boolean {
  const offered = guarded(() => session?.getItem(OFFER_KEY) === view, false);
  if (offered) guarded(() => session?.removeItem(OFFER_KEY), undefined);
  const firstVisit = guarded(() => local?.getItem(seenKey(view)) === null, false);
  if (firstVisit) guarded(() => local?.setItem(seenKey(view), "1"), undefined);
  return offered || firstVisit;
}
