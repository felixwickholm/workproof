/** How long a step waits for its target before it shows the card in the middle instead. */
export const TARGET_TIMEOUT_MS = 6000;

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
