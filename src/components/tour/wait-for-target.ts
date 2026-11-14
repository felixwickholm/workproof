/** How long a step waits for its target before it shows the card in the middle instead. */
export const TARGET_TIMEOUT_MS = 6000;
/** The wait for a target whose screen is still being built: short, so the tour never seems stuck. */
export const SOON_TIMEOUT_MS = 2500;

const laidOut = (el: Element) => {
  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
};

/**
 * A target counts once it is on the right page and laid out (Next keeps hidden copies of recent
 * pages). With `text`, the target is the element that says it: the marked one, or else one of its
 * siblings of the same kind (a list marks only its first item, and the story means another).
 */
export function findShown(id: string, path: string, text?: string, selector?: string): HTMLElement | null {
  if (window.location.pathname !== path) return null;
  let marked = [...document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(id)}"]`)].filter(laidOut);
  // A page another team owns may not carry the id yet; the step names a stable element instead.
  if (!marked.length && selector) marked = [...document.querySelectorAll<HTMLElement>(selector)].filter(laidOut);
  if (!text) return marked[0] ?? null;
  for (const el of marked) {
    if (el.textContent?.includes(text)) return el;
    const sibling = [...(el.parentElement?.children ?? [])].find(
      (other): other is HTMLElement => other instanceof HTMLElement && other.tagName === el.tagName && laidOut(other) && Boolean(other.textContent?.includes(text)),
    );
    if (sibling) return sibling;
  }
  return null;
}

/**
 * Resolves with the target once it exists and has a size, or null after the timeout or when the
 * move is abandoned. Checks on every DOM change, at most once a frame.
 */
export function waitForTarget(
  id: string,
  path: string,
  signal: AbortSignal,
  text?: string,
  timeoutMs = TARGET_TIMEOUT_MS,
  selector?: string,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve(null);
    let frame = 0;
    let done = false;
    const finish = (el: HTMLElement | null) => {
      done = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abandon);
      resolve(el);
    };
    const check = () => {
      frame = 0;
      const el = findShown(id, path, text, selector);
      if (el) finish(el);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const abandon = () => finish(null);
    const observer = new MutationObserver(schedule);
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    signal.addEventListener("abort", abandon);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-tour", "class", "style", "hidden"] });
    // The path changes without a DOM change of its own, so look once a frame until then.
    const poll = () => {
      if (done) return;
      schedule();
      if (window.location.pathname !== path) requestAnimationFrame(poll);
    };
    poll();
  });
}

/** Frames in a row a target must keep its place before it counts as settled. */
const STILL_FRAMES = 4;
/** The longest the tour waits for a target to stop moving (a slow smooth scroll). */
export const SETTLE_MAX_MS = 1500;
/** Without a target the card's own travel is all there is to wait for. */
const CARD_TRAVEL_MS = 400;

/**
 * Resolves once the target has kept its place on screen for a few frames (the scroll and the
 * spotlight's travel are over), so a step's time starts only when there is something to look at.
 */
export function waitUntilStill(el: HTMLElement | null, signal: AbortSignal, travelMs = CARD_TRAVEL_MS): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = window.setTimeout(finish, el ? SETTLE_MAX_MS : travelMs);
    signal.addEventListener("abort", finish);
    if (!el) return;
    // The spotlight travels to the target too, so it is never settled sooner than the card.
    const earliest = performance.now() + travelMs;
    let last = "";
    let still = 0;
    const look = () => {
      const r = el.getBoundingClientRect();
      const now = `${Math.round(r.top)}:${Math.round(r.left)}:${Math.round(r.height)}`;
      still = now === last && r.top < window.innerHeight && r.bottom > 0 ? still + 1 : 0;
      last = now;
      if (still >= STILL_FRAMES && performance.now() >= earliest) return finish();
      frame = requestAnimationFrame(look);
    };
    frame = requestAnimationFrame(look);
  });
}
