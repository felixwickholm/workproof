import { scope, storyFields } from "./page-scan";
import { sampleAnswers } from "./steps";

/**
 * Types the story's sample into the empty story fields on the current screen. Her answer and the
 * reviewers' notes only fill: the visitor then taps the page's own send button and reads what was
 * sent. Short replies and details also press the main button, so the story keeps its pace. Uses the
 * native value setter and an input event, so the page's own React state updates exactly as if a person typed.
 */
export async function fillAndContinue(reduceMotion: boolean, extra: Record<string, string> = {}) {
  const texts = { ...sampleAnswers, ...extra };
  const known = storyFields().filter((el) => texts[el.dataset.fill ?? ""]);
  if (known.length === 0) return;
  const fields = known.filter((el) => !el.value.trim());
  if (fields.length > 0) {
    fields[0].scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    // Taps wait until the typing ends, so a half-written note cannot be sent.
    document.body.style.pointerEvents = "none";
    try {
      await Promise.all(fields.map((el) => typeInto(el, texts[el.dataset.fill ?? ""], reduceMotion)));
    } finally {
      document.body.style.pointerEvents = "";
    }
  }

  // The details screen: she agrees to a Second look, also when the device already knows her name.
  const consent = scope().querySelector<HTMLElement>('main [role="switch"][aria-checked="false"]');
  if (consent && known.some((el) => el.dataset.fill === "name")) consent.click();

  if (known.some((el) => el.dataset.fill === "answer" || el.dataset.fill?.startsWith("note-"))) return;
  await wait(reduceMotion ? 150 : 450);
  await pressPrimary();
}

/** Clicks the screen's main button once it is enabled. A dialog's button comes first. */
async function pressPrimary() {
  for (let tries = 0; tries < 20; tries++) {
    const button = scope().querySelector<HTMLButtonElement>("[data-primary]:not(:disabled)");
    if (button) return button.click();
    await wait(75);
  }
}

function setValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Fills in about 400ms, word by word, so it reads as typing. */
function typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string, instant: boolean) {
  if (instant) {
    setValue(el, text);
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const words = text.split(" ");
    const perTick = Math.max(1, Math.ceil(words.length / 16));
    let shown = 0;
    const id = window.setInterval(() => {
      shown = Math.min(words.length, shown + perTick);
      setValue(el, words.slice(0, shown).join(" "));
      if (shown >= words.length) {
        window.clearInterval(id);
        resolve();
      }
    }, 25);
  });
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
