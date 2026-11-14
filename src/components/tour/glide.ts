/** The compare card's own resting point when it shows what the company reads. */
const READS_AT = 30;
const TICK_MS = 45;
/** Lets the spotlight land before the handle moves, so the eye is already there. */
const SETTLE_MS = 700;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (window.clearTimeout(timer), resolve()), { once: true });
  });

/**
 * Glides the compare slider inside `root` once: from all of what was written to what the company
 * reads. It only presses the slider's own keys (End, then the left arrow), so it does what a
 * keyboard user could do. Skips quietly when the screen shows tabs instead of a slider.
 */
export async function glideCompare(root: HTMLElement, signal: AbortSignal) {
  await wait(SETTLE_MS, signal);
  const slider = root.querySelector<HTMLElement>('[role="slider"]');
  if (!slider || signal.aborted) return;
  const value = () => Number(slider.getAttribute("aria-valuenow") ?? "0");
  const press = (key: string) => slider.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  press("End");
  await wait(250, signal);
  for (let i = 0; i < 60 && !signal.aborted && value() > READS_AT; i++) {
    press("ArrowLeft");
    await wait(TICK_MS, signal);
  }
}
