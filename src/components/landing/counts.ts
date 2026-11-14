/** The four headline numbers of the demo event, in outcome words. */
export interface HeroCounts {
  /** Proofs handed in: each is one person's finished challenge. */
  took: number;
  invited: number;
  /** First talks both sides confirmed. */
  met: number;
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
    { value: c.took, noun: noun(c.took, "challenge done", "challenges done") },
    { value: c.invited, noun: noun(c.invited, "person invited", "people invited") },
    { value: c.met, noun: noun(c.met, "first talk", "first talks") },
    { value: c.automatedDecisions, noun: noun(c.automatedDecisions, "decision made by AI", "decisions made by AI") },
  ];
}
