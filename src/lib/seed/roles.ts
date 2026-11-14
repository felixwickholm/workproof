import type { JobRole } from "@/lib/domain/types";
import type { SeedChallengeKey } from "./challenges";

/**
 * The job roles each seeded challenge is for, in one place. The record names every seed key, so a new
 * seeded challenge does not type-check until it has roles.
 */
export const SEED_ROLES: Record<SeedChallengeKey, readonly JobRole[]> = {
  "halla-order-form": ["designer"],
  "saarnivo-chart": ["data-analyst", "ai-developer"],
  "saarnivo-budget": ["financial-analyst", "data-analyst"],
  "tuulos-ml": ["ai-developer", "software-engineer"],
  "kivira-contract": ["legal"],
  "pooled-account": ["sales"],
  "harjula-opening": ["civil-engineer"],
  "kide-timing": ["hardware-engineer"],
  "revontuli-video": ["marketing"],
  "pooled-product": ["product-manager", "designer"],
  "kuulas-booking": ["designer"],
  "hohka-results": ["researcher", "data-analyst"],
  "lumo-churn": ["data-analyst", "ai-developer"],
  "lumo-assistant": ["ai-developer", "software-engineer"],
  "kajo-visit": ["designer"],
  "kajo-notes": ["software-engineer"],
  "routa-late": ["data-analyst"],
  "routa-feature": ["product-manager"],
  "sointu-dpa": ["legal"],
  "paju-survey": ["data-analyst", "product-manager"],
  "paju-launch": ["marketing"],
  "kaste-drift": ["hardware-engineer", "researcher"],
  "kaste-pilot": ["financial-analyst", "sales"],
  "kuura-forecast": ["financial-analyst"],
  "kuura-login": ["software-engineer"],
  "pilvi-outage": ["software-engineer"],
  "pilvi-cost": ["software-engineer", "financial-analyst"],
  "revontuli-level": ["data-analyst", "product-manager"],
  "tuulos-stop": ["hardware-engineer", "software-engineer"],
  "kivira-checkout": ["software-engineer", "designer"],
};

/** The demo person, Mikko, is a designer: his roles are chosen until the visitor picks their own. */
export const PERSONA_ROLES: readonly JobRole[] = ["designer"];
