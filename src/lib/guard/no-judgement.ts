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

const NUMBER_WORDS = "one|two|three|four|five|six|seven|eight|nine|ten";

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

  // Counts of what an answer found: "9 of 10", "nine out of ten", "covers 2 of 3 issues". Not "step 1 of 3".
  {
    kind: "score",
    pattern: new RegExp(
      `(?<!(?:step|page|part|phase|week|day|item|line|slide|question|stage|sprint|chapter|section|task|row|batch|shard|replica)\\s)\\b(?:\\d+|${NUMBER_WORDS})\\s+(?:of|out of)\\s+(?:\\d+|${NUMBER_WORDS})\\b(?!\\s+(?:rows|requests|items|minutes|seconds|days|hours|records|users|customers|tests|frames|attempts|meters|readings|nodes|servers|pods|patients|students|cases|runs)\\b)`,
      "gi",
    ),
  },
  { kind: "score", pattern: /\b(?:finds|found|names|named|spots|spotted|catches|caught|covers|covered|identifies|identified|misses|missed)\s+(?:all|every|both|none|each|most|only)\b/gi },
  { kind: "score", pattern: /\ball\s+(?:\d+|two|three|four|five)\s+(?:of\s+the\s+)?(?:planted\s+)?(?:flaws|issues|problems|bugs|mistakes)\b/gi },
  { kind: "score", pattern: /\bonly\s+(?:finds|found|names|spots|catches|covers|identifies|mentions)\b/gi },
  { kind: "score", pattern: /[★☆⭐]/gu },
  { kind: "score", pattern: /\bpercentile\b|\btier[- ]?\d\b|\b[A-F][+-]?[- ]tier\b|\btop[- ]tier\b/gi },
  // Letter grades used as verdicts: "an A", "B+ work", "Grade: C". Not "a B-tree" or "C++".
  { kind: "score", pattern: /(?<![\p{L}\p{N}])[A-F][+-](?![\p{L}\p{N}+-])/gu },
  { kind: "score", pattern: /\b(?:an?|solid|clear|strong|weak)\s+[A-F][+-]?(?=\s*[.,!;]|\s+(?:work|answer|grade|level|submission|effort))/g },
  // Ranking and comparison with other people.
  { kind: "rank", pattern: /\b(?:strongest|weakest|smartest|brightest|most talented|most capable|most thorough|least capable)\b/gi },
  { kind: "rank", pattern: /\b(?:first|second|third|\d+(?:st|nd|rd|th))\s+(?:best|strongest|place)\b/gi },
  { kind: "rank", pattern: /\b(?:superior|inferior)\b|\bcut above\b|\btop[- ]notch\b|\bin the (?:queue|pool|batch|group)\b/gi },
  { kind: "rank", pattern: /\b(?:senior|junior|expert|beginner|entry|mid|principal|staff)[- ]level\b/gi },
  // Hiring verdicts.
  { kind: "verdict", pattern: /(?:^|[.!?]\s+)(?:hire|reject|pass|advance|shortlist|invite|decline|approve)\s*[.!]/gim },
  { kind: "verdict", pattern: /\b(?:meet|interview)\s+(?:this|the)\s+(?:person|candidate|applicant|individual)\b/gi },
  { kind: "verdict", pattern: /\b(?:hire|reject|advance|shortlist|invite|pass on)\s+(?:this|the|him|her|them)\s*(?:person|candidate|applicant|one|individual)?\b(?!\s+(?:request|input|call|change|value|token|record|row|field|error|endpoint|payload))/gi },
  { kind: "verdict", pattern: /\b(?:strong|clear|easy)\s+(?:yes|no)\b|\b(?:to|for) (?:an? )?interview\b|\bnext round\b|\bthumbs? (?:up|down)\b|\bkeeper\b/gi },
  { kind: "verdict", pattern: /\bworth (?:a |an )?(?:conversation|call|chat|talk|interview|meeting|look|hire)\b/gi },
  { kind: "verdict", pattern: /\b(?:fantastic|terrific|wonderful|awesome|remarkable|exemplary|sloppy|careless|lazy|shallow|superficial|naïve|inadequate|insufficient|unacceptable|mediocre|lacklustre|lackluster)\b/gi },
  { kind: "verdict", pattern: /\bpromising\s+(?:work|answer|candidate|start|approach|submission|profile|applicant|analysis|thinking)\b|\b(?:is|looks|seems|very|quite|really)\s+promising\b|(?:^|[.!?]\s+)promising\s*(?:[.!,]|$)/gim },
  { kind: "verdict", pattern: /\bnaive\s+(?:approach|answer|solution|thinking|reasoning|view|take|work)\b/gi },
  { kind: "verdict", pattern: /\b(?:high|low|top|poor|great|good|excellent|subpar)[- ]quality\b/gi },
  {
    kind: "verdict",
    pattern: /\b(?:very |really |quite |extremely |pretty )?(?:good|great|nice|bad|fine|solid|strong|weak|thorough|sharp|smart|clever|insightful|thoughtful|careful|brilliant|competent|professional)\s+(?:answer|work|analysis|reasoning|thinking|submission|response|job|attempt|proof|solution|effort|understanding|grasp|candidate|engineer|developer)\b/gi,
  },
  { kind: "verdict", pattern: /\b(?:deep|strong|solid|real|impressive|limited|little|shows?)\s+(?:expertise|mastery|competence|talent)\b/gi },
  { kind: "verdict", pattern: /\bfails?\s+to\s+(?:identify|find|spot|notice|see|catch|address|understand|grasp)\b|\bmiss(?:es|ed)?\s+(?:the\s+|a\s+)?(?:key|main|central|obvious|real|critical|important|point)\b/gi },
  { kind: "verdict", pattern: /\blacks?\s+(?:rigou?r|depth|clarity|focus|structure|insight|understanding|care|nuance)\b/gi },
  // Finnish and Swedish.
  {
    kind: "verdict",
    pattern:
      /(?<![\p{L}])(?:erinomai\p{L}*|loistav\p{L}*|suosittel\p{L}*|lupaav\p{L}*|keskinkertai\p{L}*|paras(?:ta|ten)?|parhai\p{L}*|heikko\p{L}*|heikom\p{L}*|huono\p{L}*|vahva (?:ehdokas|hakija|vastaus)|hyvä (?:ehdokas|hakija|vastaus|työ|ratkaisu)|huomattavan hyvä|arvosana\p{L}*|pisteet|haastatteluun|palkata|palkkaisin|rekommender\p{L}*|bästa|stark kandidat|svag\p{L}*|utmärkt\p{L}*|lovande|anställ (?:henne|honom|personen)|toppkandidat\p{L}*)(?![\p{L}])/giu,
  },
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

/** Counting language a summary must never use: it would read as a checklist score. */
export function countsFindings(summary: string): boolean {
  return (
    /\b(?:all|most|only|every|none)\b/i.test(summary) ||
    /\b(?:\d+|no|one|two|three|four|five|six|several|many|few)\s+(?:of\s+(?:the\s+)?\w+\s+)?(?:\w+\s+)?(?:issues?|flaws?|problems?|points?|mistakes?|errors?|bugs?)\b/i.test(summary)
  );
}

/** Collects every string inside a value, so whole objects can be checked at once. */
export function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}
