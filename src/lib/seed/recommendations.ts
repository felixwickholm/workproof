/**
 * Companies that scored good work they could not take on, and shared it with another company that hires
 * for the same skills. Each person turned sharing on, each sender scored the work, and each receiving company
 * has a challenge sharing at least two core skills. The seed test replays these rules.
 */
export interface SeedRecommendation {
  proofId: string;
  fromCompanyId: string;
  toCompanyId: string;
  hoursAgo: number;
}

export const SEED_RECOMMENDATIONS: readonly SeedRecommendation[] = [
  { proofId: "proof_chart_01", fromCompanyId: "co-saarnivo", toCompanyId: "co-tuulos", hoursAgo: 118 },
  { proofId: "proof_ml_02", fromCompanyId: "co-tuulos", toCompanyId: "co-saarnivo", hoursAgo: 88 },
  { proofId: "proof_res_04", fromCompanyId: "co-hohka", toCompanyId: "co-saarnivo", hoursAgo: 24 },
];
