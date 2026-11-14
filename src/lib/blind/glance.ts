import type { ExplainAnswer } from "@/lib/domain/types";

const OPENING_WORDS = 12;

const POINT = /^\s{0,8}(?:\d{1,3}[.)]|[-*•])\s/;
const CODE_LINE = /^\s{0,12}(?:def|class|return|import|from|const|let|var|function|if|for|while|SELECT|FROM|WHERE|JOIN)\b|[{};]\s*$|^\s{4,}\S/;

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function about(words: number): string {
  if (words < 20) return `${words} word${words === 1 ? "" : "s"}`;
  return `about ${Math.round(words / 10) * 10} words`;
}

/** Numbered or bulleted points, else paragraphs. */
function shape(work: string): string {
  const lines = work.split("\n");
  const points = lines.filter((line) => POINT.test(line)).length;
  if (points >= 2) return `${points} points`;
  const paragraphs = work.split(/\n\s*\n/).filter((p) => p.trim()).length;
  return `${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}`;
}

function hasCode(work: string): boolean {
  if (work.includes("```")) return true;
  return work.split("\n").filter((line) => CODE_LINE.test(line)).length >= 2;
}

/**
 * The "At a glance" line a reviewer sees above the work. Built by code from the shape of the
 * blind text only: points or paragraphs, length, code, follow-ups answered and the opening words.
 * It never reads what the work says about the task, so it reads the same for right and wrong answers.
 */
export function atAGlance(work: string, explain: ExplainAnswer[]): string {
  const words = wordCount(work);
  const answered = explain.filter((e) => wordCount(e.answer) > 0).length;
  const opening = work.trim().split(/\s+/).slice(0, OPENING_WORDS).join(" ").replace(/["“”]/g, "'");
  return [
    `${shape(work)}, ${about(words)}.`,
    ...(hasCode(work) ? ["Includes a code snippet."] : []),
    ...(explain.length > 0 ? [`Follow-up answers: ${answered}.`] : []),
    ...(opening ? [`Opens with: '${opening}${words > OPENING_WORDS ? "..." : ""}'`] : []),
  ].join(" ");
}
