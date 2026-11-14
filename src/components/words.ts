import type { TaskFormat } from "@/lib/domain/types";

/**
 * Words every mode prints the same way. The seeker, company and city screens each have their own copy
 * module; anything two of them need lives here, so a total or a label never reads two ways.
 */

/** A count and its noun: "1 challenge", "3 people". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** How a challenge is done, in the one word a person, a company and the city all see. */
export const FORMAT_LABEL: Record<TaskFormat, string> = { choose: "Choose", make: "Make", fix: "Fix", read: "Read" };

/** A total out of 10, always with one decimal, so 9 and 9.0 never both appear and a column lines up. */
export function formatTotal(total: number): string {
  return total.toFixed(1);
}

/** "7.5 of 10". */
export function totalOutOf(total: number): string {
  return `${formatTotal(total)} of 10`;
}

/** The server labels a piece of work "Proof K7"; the screens use the plain word: "Work K7". */
export function workLabel(label: string): string {
  return label.replace(/^Proof\b/, "Work");
}

/** "K7": the code alone, for "K7 is Mikko Lahtinen". */
export function workCode(label: string): string {
  return label.replace(/^(Proof|Work)\s+/, "");
}
