/**
 * Synthetic needs, written the way companies tend to write them. Each runs through the scripted
 * task designer, exactly like a need typed on the company page. The ML need carries bias bait on
 * purpose, so the wishes the designer sets aside are visible in the demo.
 */
export const SEED_CHALLENGES = [
  {
    key: "kaari-visits",
    companyIds: ["co-kaari"],
    daysBeforeEvent: 4,
    need: "Home care coordinator: prioritising care visits with patient safety first, prioritisation when staff are short, calm on the phone with families, stakeholder communication",
  },
  {
    key: "otso-letter",
    companyIds: ["co-otso"],
    daysBeforeEvent: 6,
    need: "Health communicator for our patient letters: plain language, accessibility, patient safety, calm on the phone with patients",
  },
  {
    key: "pooled-care",
    companyIds: ["co-kaari", "co-otso"],
    daysBeforeEvent: 5,
    need: "Nurse for shift handovers: patient safety, prioritisation, stakeholder communication, care coordination",
  },
  {
    key: "merituuli-plate",
    companyIds: ["co-merituuli"],
    daysBeforeEvent: 7,
    need: "Cook for our lunch kitchen: food safety and allergens, serving customers, showing how you work",
  },
  {
    key: "harjula-tiling",
    companyIds: ["co-harjula"],
    daysBeforeEvent: 8,
    need: "Tiler for bathroom renovations: preparing surfaces, waterproofing, safety at work",
  },
  {
    key: "harjula-wiring",
    companyIds: ["co-harjula"],
    daysBeforeEvent: 3,
    need: "Electrician for apartment renovations: electrical safety, safety at work, showing how you work",
  },
  {
    key: "vesto-bills",
    companyIds: ["co-vesto"],
    daysBeforeEvent: 6,
    need: "Customer service agent for billing calls: calm on the phone, plain language, serving customers",
  },
  {
    key: "kuulas-reminder",
    companyIds: ["co-kuulas"],
    daysBeforeEvent: 5,
    need: "Graphic designer for public service letters: visual design, plain language, accessibility",
  },
  {
    key: "kirkas-night",
    companyIds: ["co-kirkas"],
    daysBeforeEvent: 9,
    need: "Cleaning shift supervisor for office buildings at night: shift planning, prioritisation, safety at work, stakeholder communication",
  },
  {
    key: "tuulos-ml",
    companyIds: ["co-tuulos"],
    daysBeforeEvent: 9,
    need: "ML engineer for our pick robots: model evaluation, data quality, code review, Python, 5 years of experience, young native speaker from a top university",
  },
  {
    key: "pooled-data",
    companyIds: ["co-saarnivo", "co-kivira"],
    daysBeforeEvent: 7,
    need: "Data engineer for meter data pipelines: pipeline reliability, SQL, error handling, Airflow",
  },
  {
    key: "saarnivo-forecast",
    companyIds: ["co-saarnivo"],
    daysBeforeEvent: 4,
    need: "Data scientist for load forecasting: model evaluation, data quality, experiment design and clear communication with the operations team",
  },
  {
    key: "kivira-backend",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 2,
    need: "Backend developer for our payments API: API design, error handling, security, testing",
  },
  {
    key: "kivira-pm",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 1,
    need: "Technical project manager for a customer integration: planning, risk management, stakeholder communication",
  },
] as const;

export type SeedChallengeKey = (typeof SEED_CHALLENGES)[number]["key"];
