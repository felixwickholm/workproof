/**
 * Synthetic needs, written the way companies tend to write them. Espoo's talent events are for
 * professions that normally need a university or university of applied sciences degree, so every
 * task here is one. Each runs through the scripted task designer, exactly like a need typed on the
 * company page. The ML need carries bias bait on
 * purpose, so the wishes the designer sets aside are visible in the demo. The five newest tasks lead
 * the work seeker's home, so they are five different kinds of work and none of them is code.
 * A task without `places` takes the default number of answers.
 */
export const SEED_CHALLENGES = [
  {
    key: "kaari-visits",
    companyIds: ["co-kaari"],
    daysBeforeEvent: 3,
    need: "Care team coordinator: prioritising care visits with patient safety first, prioritisation when staff are short, calm on the phone with families, stakeholder communication",
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
    daysBeforeEvent: 7,
    need: "Nurse for shift handovers: patient safety, prioritisation, stakeholder communication, care coordination",
  },
  {
    key: "merituuli-swab",
    companyIds: ["co-merituuli"],
    daysBeforeEvent: 1,
    need: "Food scientist and quality manager: allergens and food safety, laboratory practice, compliance, clear communication with production",
  },
  {
    key: "harjula-opening",
    companyIds: ["co-harjula"],
    daysBeforeEvent: 6,
    need: "Structural engineer for apartment building renovations: structural design, safety during demolition, clear drawings for site teams, building regulations",
  },
  {
    key: "tuulos-board",
    companyIds: ["co-tuulos"],
    daysBeforeEvent: 4,
    need: "Hardware test engineer for our gripper electronics: testing, embedded systems, showing how you work at the bench, safety",
  },
  {
    key: "vesto-delivery",
    companyIds: ["co-vesto"],
    daysBeforeEvent: 2,
    need: "Key account manager for our integrator clients: calm on the phone with unhappy clients, stakeholder communication, prioritisation, customer discovery",
  },
  {
    key: "kuulas-reminder",
    companyIds: ["co-kuulas"],
    daysBeforeEvent: 5,
    need: "Graphic designer for public service letters: visual design, plain language, accessibility",
  },
  {
    key: "kirkas-runs",
    companyIds: ["co-kirkas"],
    daysBeforeEvent: 9,
    need: "Laboratory operations planner for our night shift: prioritisation of urgent samples, patient safety, stakeholder communication, planning",
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
    key: "pooled-data",
    companyIds: ["co-saarnivo", "co-kivira"],
    daysBeforeEvent: 8,
    need: "Data engineer for meter data pipelines: pipeline reliability, SQL, error handling, Airflow",
  },
  {
    key: "saarnivo-forecast",
    companyIds: ["co-saarnivo"],
    daysBeforeEvent: 7,
    need: "Data scientist for load forecasting: model evaluation, data quality, experiment design and clear communication with the operations team",
  },
  {
    key: "kivira-backend",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 8,
    need: "Backend developer for our payments API: API design, error handling, security, testing",
  },
  {
    key: "kivira-pm",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 6,
    // A small team that reads every answer itself chose the fewest places.
    places: 5,
    need: "Technical project manager for a customer integration: planning, risk management, stakeholder communication",
  },
] as const;

export type SeedChallengeKey = (typeof SEED_CHALLENGES)[number]["key"];
