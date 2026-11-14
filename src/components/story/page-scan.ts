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

/** The label of the screen's enabled main button, if one is on screen. A dialog's button comes first. */
export function pagePrimary(): string | undefined {
  for (const el of scope().querySelectorAll<HTMLElement>("[data-primary]")) {
    if ((el as HTMLButtonElement).disabled || !shown(el)) continue;
    return text(el);
  }
  return undefined;
}

/** The open dialog on screen. A route Next keeps mounted but hidden can hold one too; it does not count. */
export function openDialog(): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>('[aria-modal="true"]')) {
    if (el.getBoundingClientRect().width > 0) return el;
  }
  return null;
}

/** The open dialog, if any, else the whole page: the story reads and acts where the visitor looks. */
export function scope(): ParentNode {
  return openDialog() ?? document;
}

/** The name of the open dialog. */
export function dialogName(): string | undefined {
  return openDialog()?.getAttribute("aria-label") ?? undefined;
}

/** Fields on this screen the story can type into. Next keeps recent screens mounted but hidden. */
export function storyFields() {
  return Array.from(scope().querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-fill]")).filter(shown);
}

/** The first empty story field on screen, by its sample key. */
export function firstEmptyField(): string | undefined {
  return storyFields().find((el) => !el.value.trim())?.dataset.fill;
}

/** The first name in the reviewer field, once it holds one. */
export function reviewerFirst(): string | undefined {
  const value = scope().querySelector<HTMLInputElement>('[data-fill="reviewer"]')?.value.trim();
  return value ? value.split(/\s+/)[0] : undefined;
}

const MARK = "data-story-on";

/** In a fixed or sticky bar, so always in view: scrolling would only move the page under it. */
function pinned(el: HTMLElement) {
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "fixed" || position === "sticky") return true;
  }
  return false;
}

/** Rings the target, following its own corner radius, and clears every older ring. A new target off screen scrolls into view. */
export function markTarget(el: HTMLElement | null, reduceMotion = false) {
  document.querySelectorAll<HTMLElement>(`[${MARK}]`).forEach((old) => {
    if (old !== el) {
      old.removeAttribute(MARK);
      old.style.removeProperty("--story-r");
    }
  });
  if (!el || el.hasAttribute(MARK)) return;
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  el.style.setProperty("--story-r", `${radius + 4}px`);
  el.setAttribute(MARK, "");
  const r = el.getBoundingClientRect();
  if (!pinned(el) && (r.top < 56 || r.bottom > window.innerHeight - 160)) {
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }
}
