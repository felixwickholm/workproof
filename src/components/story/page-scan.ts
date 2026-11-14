/**
 * Reads the current screen for the guided story: what is visible, the page's one main action,
 * and whether Leila's answer can still be filled in. The story never anchors to the DOM;
 * it only marks its target with a data attribute that CSS draws as a ring.
 */

const COACH = '[aria-label="Story guide"]';

function shown(el: Element) {
  if (el.closest(COACH) || el.closest("[aria-hidden='true']")) return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  return getComputedStyle(el).visibility !== "hidden";
}

const text = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();

/**
 * A target is a CSS selector, or `text:Label` for a button or link whose text is exactly that label.
 * Returns the first one that is on screen.
 */
export function findTarget(spec: string): HTMLElement | null {
  if (spec.startsWith("text:")) {
    const label = spec.slice(5);
    for (const el of document.querySelectorAll<HTMLElement>("a, button")) {
      if (text(el) === label && shown(el)) return el;
    }
    return null;
  }
  for (const el of document.querySelectorAll<HTMLElement>(spec)) {
    if (shown(el)) return el;
  }
  return null;
}

/** True when the selector matches anywhere, on screen or not (for state such as the chosen company). */
export function exists(selector: string) {
  return document.querySelector(selector) !== null;
}

/** The label of the page's enabled main button, if one is on screen. */
export function pagePrimary(): string | undefined {
  for (const el of document.querySelectorAll<HTMLElement>("[data-primary]")) {
    if ((el as HTMLButtonElement).disabled || !shown(el)) continue;
    return text(el);
  }
  return undefined;
}

/** Empty fields on this screen that "Fill in her answer" would type into. */
export function emptyFields() {
  // Next keeps recent screens mounted but hidden, so only fields on screen count.
  const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'main textarea, main input[autocomplete="name"], main input[type="email"]',
  );
  return Array.from(fields).filter((el) => !el.value.trim() && shown(el));
}

const MARK = "data-story-on";

/** Rings the target and clears every older ring. */
export function markTarget(el: HTMLElement | null) {
  document.querySelectorAll(`[${MARK}]`).forEach((old) => {
    if (old !== el) old.removeAttribute(MARK);
  });
  if (el && !el.hasAttribute(MARK)) el.setAttribute(MARK, "");
}
