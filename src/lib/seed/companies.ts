import type { Company } from "@/lib/domain/types";

/** Synthetic companies. Invented names; any match with a real company is accidental. */
export const COMPANIES: Company[] = [
  {
    id: "co-tuulos",
    name: "Tuulos Robotics",
    blurb: "Pick robots for cold-storage warehouses. A team of 40 that ships to five sites.",
  },
  {
    id: "co-saarnivo",
    name: "Saarnivo Grid",
    blurb: "Forecasting and control software for district heating and power grids.",
  },
  {
    id: "co-kivira",
    name: "Kivira Labs",
    blurb: "Payments and billing infrastructure for logistics companies.",
  },
];

/** Each company's own reviewer. Synthetic names. */
export const REVIEWERS: Record<string, string> = {
  "co-tuulos": "Anna Koivisto",
  "co-saarnivo": "Mira Salo",
  "co-kivira": "Tomas Berg",
};

/** Synthetic needs, written the way companies tend to write them. The first one carries bias bait on purpose. */
export const SEED_CHALLENGES = [
  {
    key: "tuulos-ml",
    companyIds: ["co-tuulos"],
    approvedBy: "Anna Koivisto",
    daysBeforeEvent: 6,
    need: "ML engineer for our pick robots: model evaluation, data quality, code review, Python, 5 years of experience, young native speaker from a top university",
  },
  {
    key: "saarnivo-forecast",
    companyIds: ["co-saarnivo"],
    approvedBy: "Mira Salo",
    daysBeforeEvent: 3,
    need: "Data scientist for load forecasting: model evaluation, data quality, experiment design and clear communication with the operations team",
  },
  {
    key: "pooled-data",
    companyIds: ["co-saarnivo", "co-kivira"],
    approvedBy: "Mira Salo",
    daysBeforeEvent: 5,
    need: "Data engineer for meter data pipelines: pipeline reliability, SQL, error handling, Airflow",
  },
  {
    key: "kivira-backend",
    companyIds: ["co-kivira"],
    approvedBy: "Tomas Berg",
    daysBeforeEvent: 1,
    need: "Backend developer for our payments API: API design, error handling, security, testing",
  },
  {
    key: "kivira-pm",
    companyIds: ["co-kivira"],
    approvedBy: "Tomas Berg",
    daysBeforeEvent: 2,
    need: "Technical project manager for a customer integration: planning, risk management, stakeholder communication",
  },
] as const;

export type SeedChallengeKey = (typeof SEED_CHALLENGES)[number]["key"];
