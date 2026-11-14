import { EXTRA_CHALLENGES } from "./extra-challenges";

/**
 * Synthetic needs, written the way companies tend to write them. Espoo's talent events are for
 * professions that normally need a university or university of applied sciences degree, mostly in
 * business and tech, so every task here is one. Each runs through the scripted task designer, exactly
 * like a need typed on the company page. The ML need carries bias bait on purpose, so the wishes the
 * designer sets aside are visible in the demo. A task without `places` takes the default number of answers.
 */
const FIRST_CHALLENGES = [
  {
    key: "halla-automate",
    companyIds: ["co-halla"],
    daysBeforeEvent: 3,
    need: "AI developer: picks what matters, practical plan, sees the risk, clear writing",
  },
  {
    key: "saarnivo-chart",
    companyIds: ["co-saarnivo"],
    daysBeforeEvent: 6,
    need: "Data scientist: data visualisation, model evaluation, data quality, scientific reasoning",
  },
  {
    key: "saarnivo-budget",
    companyIds: ["co-saarnivo"],
    daysBeforeEvent: 4,
    need: "Financial analyst for our budget follow-up: budget analysis, bookkeeping accuracy, data quality, stakeholder communication",
  },
  {
    key: "tuulos-ml",
    companyIds: ["co-tuulos"],
    daysBeforeEvent: 9,
    // A popular role: the company chose the most places it can read.
    places: 30,
    need: "ML engineer for our pick robots: model evaluation, data quality, code review, Python, 5 years of experience, young native speaker from a top university",
  },
  {
    key: "kivira-contract",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 5,
    need: "Legal or compliance specialist: contract review, compliance, risk management, clear writing",
  },
  {
    key: "pooled-account",
    companyIds: ["co-vesto", "co-saarnivo"],
    daysBeforeEvent: 2,
    need: "Key account manager for our integration customers: prioritisation, customer discovery, stakeholder communication, risk management",
  },
  {
    key: "harjula-opening",
    companyIds: ["co-harjula"],
    daysBeforeEvent: 6,
    need: "Structural engineer for apartment building renovations: structural design, safety during demolition, clear drawings for site teams, building regulations",
  },
  {
    key: "kide-timing",
    companyIds: ["co-kide"],
    daysBeforeEvent: 5,
    // The city chose room for a big group: about twenty people took it before the company opened it.
    places: 30,
    need: "Chip verification engineer for timing sign-off: timing analysis, digital design, prioritisation, technical explanation",
  },
  {
    key: "revontuli-video",
    companyIds: ["co-revontuli"],
    daysBeforeEvent: 5,
    need: "Marketing specialist: knowing the audience, social media campaigns, experiment design, clear writing",
  },
  {
    key: "pooled-product",
    companyIds: ["co-tuulos", "co-kuulas"],
    daysBeforeEvent: 4,
    // A small team that reads every answer itself chose few places.
    places: 8,
    need: "Product manager for our operator app: prioritisation, user research, stakeholder communication, metric definitions",
  },
  {
    key: "kuulas-booking",
    companyIds: ["co-kuulas"],
    daysBeforeEvent: 4,
    need: "Service designer for a booking app: interaction design, accessibility, clear writing, user research",
  },
  {
    key: "hohka-results",
    companyIds: ["co-hohka"],
    daysBeforeEvent: 7,
    need: "Research scientist: scientific reasoning, statistics, data quality, experiment design",
  },
] as const;

/** Every seeded challenge: the first twelve, drafted from the companies' words, then the ones companies wrote out in full. */
export const SEED_CHALLENGES = [...FIRST_CHALLENGES, ...EXTRA_CHALLENGES] as const;

export type SeedChallengeKey = (typeof SEED_CHALLENGES)[number]["key"];

/**
 * The challenge the city made for a company from its job-ad link. The company has not opened it yet, and
 * about twenty people already did it: "We made a challenge for you."
 */
export const ON_BEHALF = { key: "kide-timing", by: "Sanna Mattila", adUrl: "/ads/kide-chip-verification-engineer" } as const satisfies {
  key: SeedChallengeKey;
  by: string;
  adUrl: string;
};
