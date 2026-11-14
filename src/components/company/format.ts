import { ApiError, errorText } from "@/lib/client/api";

/** How long a proof has waited for a human, in the short form an inbox uses: 4 min, 2 h, 3 d. */
export function waitingFor(submittedAt: string, now: number | null): string {
  if (now === null) return "";
  const minutes = Math.max(0, Math.floor((now - new Date(submittedAt).getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

/** The first non-empty line of the work, for a list preview. */
export function firstLine(work: string): string {
  return work.split("\n").find((line) => line.trim())?.trim() ?? "";
}

/** Validation messages from the API are written for people; show them. Anything else gets plain words. */
export function companyErrorText(error: unknown): string {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) return error.message;
  return errorText(error);
}

/**
 * How many wishes the company listed. Each set-aside line is one wish, except the
 * "Not used: a, b, c (not skills)" note, which names several.
 */
export function countWishes(coreSkills: number, setAside: string[]): number {
  return setAside.reduce((sum, line) => sum + (isNotUsed(line) ? notUsedNames(line).length : 1), coreSkills);
}

export function isNotUsed(line: string) {
  return line.startsWith("Not used");
}

export function notUsedNames(line: string): string[] {
  return line
    .replace(/^Not used:\s*/, "")
    .replace(/\s*\(not skills\)\s*$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "Infrastructure as code: not core for this task" becomes the wish and the reason. */
export function splitAside(line: string): { wish: string; reason: string } {
  const at = line.indexOf(": ");
  if (at < 0) return { wish: line, reason: "" };
  const reason = line.slice(at + 2);
  return { wish: line.slice(0, at), reason: reason.charAt(0).toUpperCase() + reason.slice(1) };
}

/** Second look is a strength: another employer had no opening, and the skills fit this task. */
export const SECOND_LOOK_LINE = "Another employer had no opening for this proof. The skills match your task.";
