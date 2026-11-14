/**
 * Rejects text that scores, ranks or recommends a person or judges the quality of their work.
 * Every AI output passes through here before it leaves the AI layer.
 * Patterns target judgement language, so task content such as "retry 3 times" passes.
 */

export type JudgementKind = "score" | "rank" | "verdict";

export interface JudgementViolation {
  kind: JudgementKind;
  match: string;
}

const PATTERNS: { kind: JudgementKind; pattern: RegExp }[] = [
  // Scores: "8/10", "4 out of 5.", "4 stars", "score: 7", "scored 85", "85% match", "rated 4".
  // Fractions inside arithmetic ("1/2 + 1/3 = 2/5") are task content, not scores.
  { kind: "score", pattern: /(?<![=+*×-]\s*)(?<![\d/])\b\d+(?:\.\d+)?\s*\/\s*(?:5|10|100)\b(?!\s*(?:[=+*×-]|ms\b|s\b|rows\b|requests\b|items\b|minutes\b|seconds\b))/gi },
  { kind: "score", pattern: /\b\d+(?:\.\d+)?\s+out\s+of\s+(?:5|10|100)\b(?!\s+[a-z])/gi },
  { kind: "score", pattern: /\b\d+(?:\.\d+)?\s*(?:stars?|points? out of)\b/gi },
  { kind: "score", pattern: /\bscor(?:e|es|ed|ing)\s*(?::|=|of|at|is|was)?\s*(?:about\s+)?\d/gi },
  { kind: "score", pattern: /\b(?:overall|final|candidate|fit|match)\s+score\b/gi },
  { kind: "score", pattern: /\bscore\s*:/gi },
  { kind: "score", pattern: /\d+(?:\.\d+)?\s*%\s*(?:match|fit|suitab\w*|qualified|confiden\w*|likely to succeed)/gi },
  { kind: "score", pattern: /\b(?:match|fit|suitability|rating)\b[^.\n\d]{0,12}\d+(?:\.\d+)?\s*%/gi },
  { kind: "score", pattern: /\b(?:rated|rating|ratings|graded?|grades)\b/gi },
  // Ranking.
  { kind: "rank", pattern: /\btop\s+(?:candidate|candidates|talent|performer|performers|pick|picks|choice|tier|\d+|percent)\b/gi },
  { kind: "rank", pattern: /\bbest\b(?![-\s](?:effort|practices?|case)\b)/gi },
  { kind: "rank", pattern: /\b(?:rank|ranks|ranked|ranking|rankings|shortlist(?:ed)?|leaderboard)\b/gi },
  { kind: "rank", pattern: /(?:^|\s)#1\b/g },
  { kind: "rank", pattern: /\bnumber one\b/gi },
  { kind: "rank", pattern: /\b(?:stronger|weaker|smarter|more talented|more capable|more qualified)\s+than\b/gi },
  { kind: "rank", pattern: /\bbetter\s+than\s+(?:the\s+)?(?:other|others|rest|most|average|everyone)\b/gi },
  { kind: "rank", pattern: /\b(?:outperform\w*|stands?\s+out|stand-out|standout|above average|below average)\b/gi },
  // Verdicts and recommendations.
  { kind: "verdict", pattern: /\brecommend(?:s|ed|ing|ation|ations)?\b/gi },
  { kind: "verdict", pattern: /\bshould\s+(?:not\s+)?(?:be\s+)?(?:hire|hired|interview|interviewed|meet|met|reject|rejected|advance|advanced)\b/gi },
  { kind: "verdict", pattern: /\b(?:good|great|perfect|poor|bad|strong|weak|ideal|natural|solid)\s+(?:fit|match|candidate|candidates|hire|applicant)\b/gi },
  { kind: "verdict", pattern: /\b(?:not\s+a\s+fit|culture fit|hire (?:them|her|him)|worth (?:hiring|interviewing|meeting))\b/gi },
  { kind: "verdict", pattern: /\bweak(?:er|est|ness|nesses|ly)?\b(?!\s+(?:password|passwords|hash|hashing|reference|references|key|keys|cipher|ciphers|crypto|signal|typing|consistency|scaling|ref))/gi },
  { kind: "verdict", pattern: /\b(?:impressive|impressively|excellent|outstanding|exceptional|brilliant|talented|gifted|mediocre|subpar|disappointing|poor|poorly|superb|flawless|stellar|amazing)\b/gi },
  { kind: "verdict", pattern: /\b(?:well|highly|over|under|un)[- ]?qualified\b/gi },
  { kind: "verdict", pattern: /\b(?:high|low)[- ]potential\b/gi },
  { kind: "verdict", pattern: /\b(?:good job|well done|nailed it|red flag|red flags|green flag|green flags|meets the bar|below the bar|above the bar|raises the bar)\b/gi },
  { kind: "verdict", pattern: /\blacks?\s+(?:the\s+)?(?:skill|skills|talent|experience|potential|depth|ability)\b/gi },
];

export function findJudgement(text: string): JudgementViolation[] {
  const violations: JudgementViolation[] = [];
  for (const { kind, pattern } of PATTERNS) {
    for (const found of text.matchAll(pattern)) {
      violations.push({ kind, match: found[0].trim() });
    }
  }
  return violations;
}

export class JudgementError extends Error {
  constructor(readonly violations: JudgementViolation[]) {
    super(`Text judges a person or their work: ${violations.map((v) => `"${v.match}"`).join(", ")}`);
    this.name = "JudgementError";
  }
}

export function assertNoJudgement(text: string): void {
  const violations = findJudgement(text);
  if (violations.length > 0) throw new JudgementError(violations);
}

/** Collects every string inside a value, so whole objects can be checked at once. */
export function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}
