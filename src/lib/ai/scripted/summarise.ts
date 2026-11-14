import type { Challenge, ExplainAnswer } from "@/lib/domain/types";
import { flawsFor } from "./compose";

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six"];

const FIX_WORDS = /\b(?:instead|replace|change|use|add|move|split|remove|switch|rewrite|set|cap|limit|validate|group|keep|drop|ask|check|would)\b/i;

const THEMES: { label: string; pattern: RegExp; when: (c: Challenge) => boolean }[] = [
  { label: "tests", pattern: /\btest(?:s|ing|ed)?\b/i, when: (c) => c.material?.kind === "code" },
  { label: "how to roll the change out", pattern: /\b(?:roll ?out|release|deploy|ship|staging|canary|monitor|feature flag)\w*/i, when: (c) => c.material?.kind === "code" },
  { label: "who is affected", pattern: /\b(?:user|users|customer|customers|team|patient|patients|student|students|reader|readers|people)\b/i, when: () => true },
];

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function countPoints(answer: string): number {
  const bullets = answer.split("\n").filter((line) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line)).length;
  if (bullets > 0) return bullets;
  return answer.split(/(?<=[.!?])\s+/).filter((s) => s.trim().split(/\s+/).length >= 4).length;
}

/**
 * Describes what the work contains in two or three sentences. It names what is present and
 * what is absent. It never says whether that is good.
 */
export function describeWork(challenge: Challenge, answer: string, explain: ExplainAnswer[]): string {
  const text = [answer, ...explain.map((e) => e.answer)].join("\n");
  const lower = text.toLowerCase();
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  if (words < 5) return "The answer is a few words long. It does not yet describe a change or a reason.";

  const sentences: string[] = [];
  const flaws = flawsFor(challenge);
  const named = flaws.filter((flaw) => flaw.cues.some((cue) => lower.includes(cue)));
  const where = challenge.material?.kind === "code" ? "in the change" : "in the material";

  if (named.length > 0) {
    const count = NUMBER_WORDS[named.length] ?? String(named.length);
    sentences.push(`Names ${count} ${named.length === 1 ? "issue" : "issues"} ${where}: ${joinLabels(named.map((f) => f.label))}.`);
  } else {
    const points = countPoints(answer);
    sentences.push(`Makes ${NUMBER_WORDS[points] ?? String(points)} ${points === 1 ? "point" : "points"} about the material in ${words} words.`);
  }

  const fixes = answer.split(/(?<=[.!?])\s+|\n+/).filter((s) => FIX_WORDS.test(s)).length;
  sentences.push(fixes > 0 ? "Proposes concrete changes." : "Describes problems without proposing changes.");

  const missing = THEMES.filter((t) => t.when(challenge) && !t.pattern.test(text)).map((t) => t.label);
  if (missing.length > 0) sentences.push(`Does not mention ${joinLabels(missing.slice(0, 2))}.`);

  return sentences.join(" ");
}
