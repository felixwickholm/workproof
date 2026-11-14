/** The four event totals in the hero, in outcome words. */
export interface HeroCounts {
  proofs: number;
  writtenAnswers: number;
  invitations: number;
  automatedDecisions: number;
}

export interface CountPart {
  value: number;
  noun: string;
}

const noun = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** The counts as figure-and-words pairs, in reading order, so the figures can count up on their own. */
export function countParts(c: HeroCounts): CountPart[] {
  return [
    { value: c.proofs, noun: noun(c.proofs, "proof handed in", "proofs handed in") },
    { value: c.writtenAnswers, noun: noun(c.writtenAnswers, "written reason", "written reasons") },
    { value: c.invitations, noun: noun(c.invitations, "invitation", "invitations") },
    { value: c.automatedDecisions, noun: noun(c.automatedDecisions, "decision made by AI", "decisions made by AI") },
  ];
}
