import { sampleAnswers } from "./steps";

/**
 * Types Leila's sample into the empty fields on the current screen.
 * Uses the native value setter and an input event, so the page's own React state updates
 * exactly as if a person typed. The page needs no changes.
 */
export function fillSample(reduceMotion: boolean) {
  const main = document.querySelector("main");
  if (!main) return false;

  const targets: [HTMLInputElement | HTMLTextAreaElement, string][] = [];
  main.querySelectorAll("textarea").forEach((el) => {
    if (el.value.trim()) return;
    targets.push([el, el.placeholder.toLowerCase().includes("your answer") ? sampleAnswers.work : sampleAnswers.explain]);
  });
  main.querySelectorAll<HTMLInputElement>('input[autocomplete="name"]').forEach((el) => {
    if (!el.value.trim()) targets.push([el, sampleAnswers.name]);
  });
  main.querySelectorAll<HTMLInputElement>('input[type="email"]').forEach((el) => {
    if (!el.value.trim()) targets.push([el, sampleAnswers.contact]);
  });

  for (const [el, text] of targets) typeInto(el, text, reduceMotion);
  return targets.length > 0;
}

function setValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Fills in about 700ms, word by word, so it reads as typing. */
function typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string, instant: boolean) {
  if (instant) return setValue(el, text);
  const words = text.split(" ");
  const perTick = Math.max(1, Math.ceil(words.length / 24));
  let shown = 0;
  const id = window.setInterval(() => {
    shown = Math.min(words.length, shown + perTick);
    setValue(el, words.slice(0, shown).join(" "));
    if (shown >= words.length) window.clearInterval(id);
  }, 30);
}
