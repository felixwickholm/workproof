import type { DecisionKind, MeetingStatus } from "@/lib/domain/types";

/**
 * Decisions made through Second look: the person consented, the owner said not now, and another
 * employer whose task shares at least two core skills read the same blind proof.
 */
export interface SecondLookSeed {
  proofId: string;
  companyId: string;
  kind: DecisionKind;
  feedback: string;
  hoursAgo: number;
  meeting?: MeetingStatus;
}

export const SECOND_LOOK_DECISIONS: SecondLookSeed[] = [
  {
    proofId: "proof_clean_02",
    companyId: "co-kaari",
    kind: "meet",
    feedback:
      "We read your night plan through Second look. You put up the warning sign and kept two people on the wet floor before anything else, and that is how we want visits planned when we are short of carers. We would like to meet you.",
    hoursAgo: 60,
    meeting: "accepted",
  },
  {
    proofId: "proof_call_03",
    companyId: "co-otso",
    kind: "pass",
    feedback:
      "We read your call through Second look. You explained the double contract in words a caller would use and offered a written confirmation. Our patient line needs medical terms in Finnish from the first day, so it is not now.",
    hoursAgo: 30,
  },
  {
    proofId: "proof_design_02",
    companyId: "co-otso",
    kind: "pass",
    feedback:
      "We read your reminder card through Second look. The single button to change the time would save us many empty slots. We have no design role open this winter, and we hope to post a design task in the spring.",
    hoursAgo: 20,
  },
];
