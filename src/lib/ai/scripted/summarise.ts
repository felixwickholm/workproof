import type { Challenge, ExplainAnswer } from "@/lib/domain/types";
import { flawsFor } from "./compose";

const FIX_WORDS = /\b(?:instead|replace|change|use|add|move|split|remove|switch|rewrite|set|cap|limit|validate|group|keep|drop|ask|check|would)\b/i;

const THEMES: { label: string; pattern: RegExp; when: (c: Challenge) => boolean }[] = [
  { label: "tests", pattern: /\btest(?:s|ing|ed)?\b/i, when: (c) => c.material?.kind === "code" },
  { label: "rollout", pattern: /\b(?:roll ?out|release|deploy|ship|staging|canary|monitor|feature flag)\w*/i, when: (c) => c.material?.kind === "code" },
  { label: "who is affected", pattern: /\b(?:user|users|customer|customers|team|patient|patients|student|students|reader|readers|people)\b/i, when: () => true },
];

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim());
}

/**
 * Describes what the work talks about, as topics, in two or three sentences. It never counts what
 * the answer found and never says whether it is right: a list of keywords reads the same as a careful
 * answer, so the reviewer has to read the work itself.
 */
export function describeWork(challenge: Challenge, answer: string, explain: ExplainAnswer[]): string {
  const text = [answer, ...explain.map((e) => e.answer)].join("\n");
  const lower = text.toLowerCase();
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  if (words < 5) return "The answer is short. It does not yet describe a change or a reason.";

  const sentences: string[] = [];
  const mentioned = flawsFor(challenge).filter((flaw) => flaw.cues.some((cue) => lower.includes(cue)));
  sentences.push(
    mentioned.length > 0 ? `Discusses ${joinLabels(mentioned.map((f) => f.topic))}.` : "Discusses the material in general terms.",
  );

  const fixSentences = sentencesOf(answer).filter((s) => FIX_WORDS.test(s)).map((s) => s.toLowerCase());
  const changed = mentioned.filter((flaw) => fixSentences.some((s) => flaw.cues.some((cue) => s.includes(cue))));
  if (changed.length > 0) sentences.push(`Proposes a change to ${joinLabels(changed.map((f) => f.topic))}.`);
  else sentences.push(fixSentences.length > 0 ? "Proposes changes." : "Describes problems without proposing changes.");

  const missing = THEMES.filter((t) => t.when(challenge) && !t.pattern.test(text)).map((t) => t.label);
  if (missing.length > 0) sentences.push(`Does not mention ${joinLabels(missing.slice(0, 2))}.`);

  return sentences.join(" ");
}

