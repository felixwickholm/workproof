import type { BlindProof } from "@/lib/domain/types";

/**
 * Jobs to tap instead of typing, led by the degree-level work the event is for. Any other dream job
 * can still be typed or said.
 */
export const SUGGESTIONS = ["Doctor", "Nurse", "Software engineer", "Teacher", "Architect", "Designer", "Lawyer", "Researcher"] as const;

const squash = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();

/** The suggestion the typed job already is, ignoring case and spacing, so its chip shows as chosen. */
export function matchSuggestion(typed: string): string | null {
  const key = squash(typed);
  return SUGGESTIONS.find((s) => s.toLowerCase() === key) ?? null;
}

/** A spoken job comes back as a sentence: "Chef." becomes "Chef". */
export function cleanSpokenJob(text: string): string {
  return text.trim().replace(/[.!?,;:]+$/, "").trim();
}

/**
 * The job as a word inside a sentence: "Chef" becomes "chef". Only a capital that starts a plain
 * word is lowered, so short forms such as "AI" or "UX" keep their capitals.
 */
export function inSentence(job: string): string {
  const clean = job.trim().replace(/\s+/g, " ");
  return /^[A-ZÀ-Þ][a-zß-ÿ]/.test(clean) ? clean.charAt(0).toLowerCase() + clean.slice(1) : clean;
}

/** "a chef", "an electrician", "an AI engineer". */
export function withArticle(job: string): string {
  const lowered = inSentence(job);
  if (!lowered) return "";
  // A short form is read letter by letter: "an ML engineer", "a UX designer".
  const vowelSound = /^[A-Z]{2}/.test(lowered) ? /^[AEFHILMNORSX]/.test(lowered) : /^[aeiou]/i.test(lowered);
  return `${vowelSound ? "an" : "a"} ${lowered}`;
}

/**
 * How far the on-screen keyboard covers the bottom of the layout viewport. iOS keeps fixed
 * elements under the keyboard, so the action bar lifts itself by this much.
 */
export function keyboardInset(innerHeight: number, viewportHeight: number, viewportTop: number): number {
  return Math.max(0, Math.round(innerHeight - viewportHeight - viewportTop));
}

/**
 * The two texts the reveal compares: the answer and the follow-up as written, and the same two
 * as the company reads them. Joined the same way, so the hidden spans line up across both.
 */
export function compareTexts(written: { answer: string; explain: string }, proof: Pick<BlindProof, "work" | "explain">): { original: string; blind: string } {
  const blindExplain = proof.explain[0]?.answer ?? "";
  const join = (a: string, b: string) => (b ? `${a}\n\n${b}` : a);
  return { original: join(written.answer, written.explain), blind: join(proof.work, blindExplain) };
}

/** The practice label, wherever the practice proof shows: on a table's phone it says where the proof goes. */
export function practiceLine(onTable: boolean): string {
  return onTable ? "Practice. Shown blind on this table's screen: label and task only." : "Practice. Not sent to any company.";
}

/** What the reveal says about the name, true to what the person did on the name step. */
export function nameLine(nameGiven: boolean): string {
  return nameGiven ? "Your name was used only to hide it. It was not kept." : "You gave no name.";
}

/** The progress in words, beside the bar. */
export function stepWords(current: number, total: number): string {
  return `Step ${current} of ${total}`;
}

const ELLIPSIS = "…";

/**
 * Text cut for display to `max` characters, at a word boundary when one is near, with an ellipsis.
 * Counts characters, not UTF-16 units, so an emoji is never split in half.
 */
export function clipForDisplay(text: string, max = 60): string {
  const clean = text.trim().replace(/\s+/g, " ");
  const chars = Array.from(clean);
  if (chars.length <= max) return clean;
  const cut = chars.slice(0, max - 1).join("");
  const space = cut.lastIndexOf(" ");
  return `${(space >= max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:!?-]+$/, "")}${ELLIPSIS}`;
}
