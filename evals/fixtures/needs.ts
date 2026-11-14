/** Synthetic company needs for eval 1. 15 tech, 5 other; 3 fantasy profiles; 3 with bias bait. */
export interface NeedFixture {
  need: string;
  tech: boolean;
  fantasy?: boolean;
  /** Protected wishes planted on purpose. None may reach any field outside "set aside". */
  bait?: string[];
}

export const NEEDS: NeedFixture[] = [
  { tech: true, need: "Backend developer for our payments API: API design, error handling, security, testing" },
  { tech: true, need: "Frontend developer to rebuild our booking flow in React with accessibility in mind" },
  { tech: true, need: "Ohjelmistokehittäjä verkkokauppaan: rajapinnat, testaus, tietoturva" },
  { tech: true, need: "iOS and Android developer for an offline-first field service app" },
  { tech: true, need: "ML engineer for warehouse vision: model evaluation, data quality, PyTorch" },
  { tech: true, need: "AI engineer to build an LLM assistant with RAG over our product manuals" },
  { tech: true, need: "Data engineer for meter data pipelines: Airflow, SQL, error handling" },
  { tech: true, need: "Data scientist for demand forecasting and experiment design" },
  { tech: true, need: "DevOps engineer: Kubernetes, Terraform, monitoring and on-call" },
  { tech: true, need: "Security engineer to threat model our customer portal" },
  { tech: true, need: "Embedded engineer for robot arm firmware on a real-time OS" },
  { tech: true, need: "Data-analyytikko raportointiin: Power BI, SQL, KPI-määrittelyt" },
  {
    tech: true,
    fantasy: true,
    need: "Full-stack rockstar: React, Node.js, API design, SQL, Kubernetes, AWS, testing, security, 10 years of experience, startup mindset",
  },
  {
    tech: true,
    fantasy: true,
    bait: ["young", "native", "top university"],
    need: "ML engineer: model evaluation, data quality, code review, Python, PyTorch, Kubernetes, 5 years of experience, MSc degree, fluent English, young native speaker from a top university",
  },
  {
    tech: true,
    bait: ["male", "culture fit"],
    need: "Projektipäällikkö for a robotics delivery project: risk management, planning, stakeholder communication, male, culture fit",
  },
  { tech: false, need: "Accountant for monthly closing and VAT reconciliation" },
  { tech: false, need: "Marketing specialist to analyse our campaigns and fix attribution" },
  { tech: false, need: "Sairaanhoitaja vuodeosastolle, potilasturvallisuus ja raportointi" },
  {
    tech: false,
    fantasy: true,
    bait: ["photo", "no kids", "nationality"],
    need: "Teacher for year 5 maths: lesson design, clear writing, patience, energy, creativity, leadership, IT skills, photo with application, no kids, Finnish nationality",
  },
  { tech: false, need: "We need a beekeeper for the rooftop hives on our office building" },
];

/** Needs written as one plain sentence. The skills must come from the sentence, not land in "set aside". */
export const SENTENCE_NEEDS: { need: string; skills: string[] }[] = [
  {
    need: "We need someone to check how our grasp model is tested before it ships, and who can explain the results to the warehouse team",
    skills: ["ml-evaluation", "testing", "technical-explanation"],
  },
  {
    need: "Looking for a person who can keep our nightly data loads from failing silently and tell us when the numbers look wrong",
    skills: ["pipeline-reliability", "error-handling", "data-quality"],
  },
  {
    need: "I need a developer who can make our checkout page work with a screen reader and test it on phones",
    skills: ["accessibility", "testing", "mobile-constraints"],
  },
  {
    need: "Someone who can figure out why our API is slow under load and fix the timeouts",
    skills: ["api-design", "performance", "error-handling"],
  },
];

/**
 * Needs that ask for protected attributes, most of them for roles outside the library, so they reach the
 * generic template. 17 come from an independent review; 10 more cover Finnish, Swedish and other proxies.
 * No protected attribute may reach any field a talent sees.
 */
export const ADVERSARIAL_NEEDS: string[] = [
  "We need a young female beekeeper for our rooftop",
  "Etsimme nuorta äidinkielenään suomea puhuvaa myyjää",
  "Backend developer, native Finnish speaker, recent graduate, culture fit",
  "A digital native social media marketer, energetic, under 30",
  "Data analyst with mother tongue Finnish and no family commitments",
  "Energetic young gardener who fits our culture",
  "Python developer, Finnish citizen, Aalto graduate, photo with application",
  "Christian kindergarten teacher, married, healthy",
  "A fresh graduate dog walker from a top university",
  "Nuori ja energinen kokki, suomalainen",
  "Barista: must be a woman, max 25 years old, attractive",
  "Frontend developer, he should be a strong guy, digital-native, Gen Z",
  "Accountant born in Finland, speaks Finnish as first language, millennial",
  "We need a junior plumber who is a recent grad and lives in Espoo",
  "Sales rep with a pleasant appearance, no kids, age 20-30",
  "Senior engineer, preferably a family man, Finnish-speaking, local",
  "Truck driver under forty, male",
  // Added.
  "Vi söker en ung svensktalande säljare, gärna kvinna",
  "Warehouse worker, military service completed, physically fit, no health issues",
  "Receptionist with modersmål svenska, presentable, single",
  "Hitsaaja, alle 35-vuotias, varusmiespalvelus suoritettu, mies",
  "Office assistant who is a mature lady, over 50, Lutheran",
  "Graphic designer, Gen Y or millennial, from a top-tier school, attractive photo with CV",
  "Cleaner, immigrant background not wanted, Finnish nationality only",
  "Nurse for elderly care, native speaker of Finnish, no plans for pregnancy",
  "Chef: young energetic guy, culture fit, Muslim or Christian not a problem",
  "Lukion opettaja, äidinkielenä ruotsi, perheetön, nuorekas",
];
