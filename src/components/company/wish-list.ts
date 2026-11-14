import type { ChallengeDraft, WishOutcome } from "@/lib/domain/types";

/** Where a wish ended up: a core skill, a fact about the job shown to people, or set aside. */
export type WishPile = "kept" | "fact" | "aside";

/** One row of the wish sort: a wish the company wrote, or a core skill the designer added to reach three. */
export interface WishRow {
  key: string;
  /** The wish in the company's words, or the neutral category name of a wish about the person. Empty for an added skill. */
  text: string;
  pile: WishPile;
  /** The core skill a kept row stands for. */
  skillId?: string;
  skillLabel?: string;
  /** Why a wish was set aside, in a full sentence. Empty for a kept row or a fact. */
  reason: string;
}

type WishDraft = Pick<ChallengeDraft, "coreSkills" | "setAside" | "wishes">;

/** The reason for wishes that describe a person (age, native language, school), never used at all. */
export const PERSON_REASON = "It describes a person, not the work.";

/** The reason for a wish whose skill the company removed from the draft. */
export const REMOVED_REASON = "You removed it.";

const NOT_CORE_REASON = "Not core for this task.";

const NOT_USED = /^Not used:\s*/;

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Infrastructure as code: not core for this task" becomes the wish and "Not core for this task." */
function splitAside(line: string): { wish: string; reason: string } {
  const at = line.indexOf(": ");
  if (at < 0) return { wish: line, reason: "" };
  const sentence = capitalise(line.slice(at + 2).trim());
  return { wish: line.slice(0, at), reason: /[.!?]$/.test(sentence) ? sentence : `${sentence}.` };
}

/** "Not used: age, native language (not skills)" names several wishes at once. */
function notUsedNames(line: string): string[] {
  return line
    .replace(NOT_USED, "")
    .replace(/\s*\(not skills\)\s*$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** For a draft without per-wish outcomes: the core skills as kept, and each set-aside line as its own wish. */
function wishesFromLines(draft: WishDraft): WishOutcome[] {
  const kept = draft.coreSkills.map((s): WishOutcome => ({ text: s.label, outcome: "kept", skillId: s.id }));
  const aside = draft.setAside.flatMap((line): WishOutcome[] => {
    if (NOT_USED.test(line)) return notUsedNames(line).map((name) => ({ text: name, outcome: "set-aside", reason: PERSON_REASON }));
    const { wish, reason } = splitAside(line);
    return [{ text: wish, outcome: "set-aside", reason }];
  });
  return [...kept, ...aside];
}

/**
 * Every wish the company wrote, sorted into three piles: kept as a core skill, a fact about the job
 * (a work language, a licence) that people are shown, or set aside with its reason.
 * Core skills no wish asked for (the designer's additions) close the kept pile.
 */
export function wishRows(draft: WishDraft): { kept: WishRow[]; facts: WishRow[]; aside: WishRow[] } {
  const labels = new Map(draft.coreSkills.map((s) => [s.id, s.label]));
  const rows = (draft.wishes ?? wishesFromLines(draft)).map((w, i): WishRow => {
    const key = `wish-${i}`;
    const text = capitalise(w.text);
    if (w.outcome === "fact") return { key, text, pile: "fact", reason: "" };
    const skillLabel = w.outcome === "kept" && w.skillId ? labels.get(w.skillId) : undefined;
    return skillLabel
      ? { key, text, pile: "kept", skillId: w.skillId, skillLabel, reason: "" }
      : { key, text, pile: "aside", reason: w.reason ?? NOT_CORE_REASON };
  });
  const kept = rows.filter((r) => r.pile === "kept");
  const added = draft.coreSkills
    .filter((s) => !kept.some((r) => r.skillId === s.id))
    .map((s): WishRow => ({ key: `skill-${s.id}`, text: "", pile: "kept", skillId: s.id, skillLabel: s.label, reason: "" }));
  return { kept: [...kept, ...added], facts: rows.filter((r) => r.pile === "fact"), aside: rows.filter((r) => r.pile === "aside") };
}

/** The draft with one core skill removed by the company: the wishes that became it are set aside, with that reason. */
export function withoutSkill<T extends WishDraft & Pick<ChallengeDraft, "reviewGuide">>(draft: T, skillId: string): T {
  const label = draft.coreSkills.find((s) => s.id === skillId)?.label;
  return {
    ...draft,
    coreSkills: draft.coreSkills.filter((s) => s.id !== skillId),
    reviewGuide: draft.reviewGuide.filter((g) => g.skillId !== skillId),
    setAside: label ? [`${label}: removed by you`, ...draft.setAside] : draft.setAside,
    wishes: draft.wishes?.map((w): WishOutcome => (w.skillId === skillId ? { text: w.text, outcome: "set-aside", reason: REMOVED_REASON } : w)),
  };
}
