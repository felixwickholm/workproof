import type { Skill } from "@/lib/domain/types";

/**
 * Shared skill vocabulary. Every challenge uses these ids, so two challenges can be
 * compared by the skills they ask for (Second look). Skills describe work, never people.
 */
export interface SkillDefinition {
  label: string;
  /** Default one-line reason the skill matters. Roles may override it. */
  why: string;
  /** Default note for a human reviewer: what good work shows. Roles may override it. */
  lookFor: string;
  /** Lowercase words and phrases in a company's need that point to this skill. */
  synonyms: string[];
}

export const SKILLS = {
  "code-review": {
    label: "Code review",
    why: "Most code now starts as a draft, often from AI. Someone has to catch what is wrong before it ships.",
    lookFor: "Points to specific lines, explains what would break and when, and separates real defects from style.",
    synonyms: ["code review", "reviewing code", "pull request", "clean code", "code quality", "koodikatselmointi"],
  },
  "api-design": {
    label: "API design",
    why: "Other teams build on these interfaces, so mistakes are expensive to undo.",
    lookFor: "Considers the caller: inputs, error responses, versioning and what happens on bad input.",
    synonyms: ["api", "rest", "graphql", "grpc", "endpoint", "interface design", "rajapinta"],
  },
  "error-handling": {
    label: "Error handling",
    why: "Systems fail at the edges: timeouts, retries and partial writes decide what users see.",
    lookFor: "Names the failure cases, says what the system should do in each, and avoids hiding errors.",
    synonyms: ["error handling", "resilience", "fault tolerance", "robust", "retries", "virheenkäsittely"],
  },
  "data-modelling": {
    label: "Data modelling",
    why: "The shape of the data decides which questions the product can answer later.",
    lookFor: "Questions keys, relations and constraints, and explains how the model handles change.",
    synonyms: ["data model", "schema", "database design", "data modelling", "data modeling", "tietomalli"],
  },
  sql: {
    label: "SQL",
    why: "Most decisions here start from a query, and a wrong join gives a confident wrong number.",
    lookFor: "Reads the query for joins, filters and grouping that change the result, and checks it against the question asked.",
    synonyms: ["sql", "postgres", "postgresql", "mysql", "query", "queries", "bigquery", "snowflake", "tietokanta"],
  },
  testing: {
    label: "Testing",
    why: "Tests are how the team learns a change is safe without asking the author.",
    lookFor: "Proposes tests that would have caught the problems, including edge cases, not only the happy path.",
    synonyms: ["testing", "unit test", "tests", "tdd", "test coverage", "testaus"],
  },
  "security-thinking": {
    label: "Security thinking",
    why: "One unchecked input can expose customer data, so security is part of everyday work.",
    lookFor: "Spots where untrusted input or secrets cross a boundary and proposes a concrete control.",
    synonyms: ["security", "secure coding", "owasp", "authentication", "authorization", "tietoturva"],
  },
  performance: {
    label: "Performance",
    why: "Slow systems cost money and users, and the cause is rarely where people first look.",
    lookFor: "Finds the step that grows with data size or load and estimates its cost with rough numbers.",
    synonyms: ["performance", "latency", "scalability", "scaling", "optimization", "optimisation", "suorituskyky"],
  },
  accessibility: {
    label: "Accessibility",
    why: "Many people use keyboards, screen readers or zoom. If they cannot use the product, it is broken.",
    lookFor: "Checks labels, focus, contrast and keyboard use, and names who is blocked by each issue.",
    synonyms: ["accessibility", "a11y", "wcag", "saavutettavuus"],
  },
  "ui-state": {
    label: "UI state and data flow",
    why: "Most interface bugs come from state that is loading, stale or out of sync.",
    lookFor: "Traces where state lives, covers loading, empty and error states, and spots race conditions.",
    synonyms: ["react", "frontend", "front-end", "state management", "vue", "angular", "typescript", "javascript", "css"],
  },
  "mobile-constraints": {
    label: "Mobile constraints",
    why: "Phones lose network, get killed in the background and run on battery.",
    lookFor: "Considers offline use, app lifecycle, battery and small screens in the proposed changes.",
    synonyms: ["mobile", "ios", "android", "swift", "kotlin", "react native", "flutter", "mobiili"],
  },
  "ml-evaluation": {
    label: "Model evaluation",
    why: "A model is only as trustworthy as the way it was tested.",
    lookFor: "Checks how the data was split, what the metric hides, and whether the test matches real use.",
    synonyms: ["machine learning", "ml", "model evaluation", "pytorch", "tensorflow", "scikit", "deep learning", "computer vision", "koneoppiminen"],
  },
  "data-quality": {
    label: "Data quality",
    why: "Bad input data quietly breaks every model and report built on it.",
    lookFor: "Looks for missing, duplicated, leaked or skewed data and says how to check for it.",
    synonyms: ["data quality", "data cleaning", "data validation", "pandas", "datan laatu"],
  },
  "experiment-design": {
    label: "Experiment design",
    why: "Decisions based on a badly designed test are worse than decisions without one.",
    lookFor: "Questions the comparison, the sample and the success measure before trusting the result.",
    synonyms: ["a/b test", "ab test", "experiment", "experimentation", "statistics", "causal", "tilastotiede"],
  },
  "prompt-design": {
    label: "Prompt and context design",
    why: "Language model features depend on what the model is told and what it can see.",
    lookFor: "Finds instructions that conflict, missing context and places where the model is asked to guess.",
    synonyms: ["prompt", "prompt engineering", "llm", "gpt", "rag", "retrieval", "langchain", "generative ai", "genai"],
  },
  "llm-evaluation": {
    label: "LLM evaluation",
    why: "Language model output changes with every prompt and model update, so it needs repeatable checks.",
    lookFor: "Proposes concrete test cases and a way to tell a regression from noise.",
    synonyms: ["llm evaluation", "evals", "hallucination", "guardrails", "ai safety"],
  },
  "pipeline-reliability": {
    label: "Pipeline reliability",
    why: "Reports and models downstream trust that every run is complete and runs once.",
    lookFor: "Checks reruns, late data, duplicates and what happens when a step fails halfway.",
    synonyms: ["etl", "elt", "data pipeline", "airflow", "dbt", "spark", "kafka", "streaming", "data engineering"],
  },
  observability: {
    label: "Observability",
    why: "You cannot fix what you cannot see, and alerts that fire too often get ignored.",
    lookFor: "Says what to measure, which alert a person should act on, and what can be removed.",
    synonyms: ["monitoring", "observability", "logging", "metrics", "grafana", "prometheus", "alerting", "valvonta"],
  },
  "incident-response": {
    label: "Incident response",
    why: "When something breaks, calm order of work limits the damage.",
    lookFor: "Puts the steps in a sensible order: limit harm first, then find cause, then prevent repeat.",
    synonyms: ["incident", "on-call", "on call", "postmortem", "post-mortem", "sre", "site reliability"],
  },
  "infrastructure-as-code": {
    label: "Infrastructure as code",
    why: "Infrastructure changes reach every service at once, so a small mistake has a large reach.",
    lookFor: "Reads the change for blast radius, defaults that are unsafe, and drift from what is running.",
    synonyms: ["terraform", "kubernetes", "k8s", "docker", "helm", "ci/cd", "cicd", "devops", "ansible", "infrastructure"],
  },
  "cloud-architecture": {
    label: "Cloud architecture",
    why: "Architecture choices fix cost, reliability and lock-in for years.",
    lookFor: "Weighs cost, failure modes and operations load, and states the trade-off chosen.",
    synonyms: ["aws", "azure", "gcp", "cloud", "architecture", "serverless", "pilvi", "arkkitehtuuri"],
  },
  "threat-modelling": {
    label: "Threat modelling",
    why: "Defence works when it starts from what an attacker would actually try.",
    lookFor: "Names a realistic attacker, the path they would take and the cheapest control that blocks it.",
    synonyms: ["threat model", "threat modelling", "threat modeling", "penetration testing", "pentest", "siem", "soc"],
  },
  "embedded-constraints": {
    label: "Embedded and real-time constraints",
    why: "On a device, memory, timing and power are hard limits, not preferences.",
    lookFor: "Checks timing, memory and interrupt behaviour, and what the device does when a limit is reached.",
    synonyms: ["embedded", "firmware", "c++", "rtos", "microcontroller", "robotics", "ros", "sulautettu"],
  },
  "safety-thinking": {
    label: "Safety thinking",
    why: "When software moves hardware or affects health, a quiet failure can hurt someone.",
    lookFor: "Asks what happens on failure and makes sure the system stops in a safe state.",
    synonyms: ["safety", "functional safety", "iso 26262", "iec 61508", "turvallisuus"],
  },
  "test-strategy": {
    label: "Test strategy",
    why: "Time for testing is limited, so the team must test what is most likely to break.",
    lookFor: "Ranks test areas by risk to users, not by ease, and explains what is left untested.",
    synonyms: ["qa", "quality assurance", "test automation", "selenium", "playwright", "cypress", "test plan", "laadunvarmistus"],
  },
  prioritisation: {
    label: "Prioritisation",
    why: "There is always more to do than time, so choosing what not to do matters most.",
    lookFor: "Makes the trade-off explicit and ties it to a user or business outcome.",
    synonyms: ["prioritisation", "prioritization", "roadmap", "backlog", "product management", "priorisointi"],
  },
  "stakeholder-communication": {
    label: "Stakeholder communication",
    why: "Work moves only when the right people understand it and agree.",
    lookFor: "Writes for the reader, states the decision needed, and keeps the message short.",
    synonyms: ["communication", "stakeholder", "stakeholders", "presentation", "viestintä", "sidosryhmä"],
  },
  "risk-management": {
    label: "Risk management",
    why: "Plans fail at the points nobody named in advance.",
    lookFor: "Names the risks that would change the plan and gives each an owner or a check date.",
    synonyms: ["risk", "risk management", "project management", "scrum", "agile", "jira", "riskienhallinta"],
  },
  planning: {
    label: "Planning",
    why: "A plan should make the next two weeks clear and the rest honest.",
    lookFor: "Checks dependencies, sequencing and estimates against the stated deadline.",
    synonyms: ["planning", "delivery", "scheduling", "estimation", "suunnittelu", "aikataulu"],
  },
  "user-research": {
    label: "User research",
    why: "Teams build the wrong thing when they guess what users need.",
    lookFor: "Separates what users said from what they did, and proposes a quick way to test the guess.",
    synonyms: ["user research", "usability", "user testing", "interviews", "käyttäjätutkimus"],
  },
  "interaction-design": {
    label: "Interaction design",
    why: "Small choices in flows and wording decide whether people finish a task.",
    lookFor: "Walks the flow as a user, spots dead ends and unclear wording, and proposes a simpler step.",
    synonyms: ["ux", "ui design", "interaction design", "figma", "prototyping", "wireframe", "käytettävyys"],
  },
  "data-visualisation": {
    label: "Data visualisation",
    why: "A chart that misleads is worse than no chart.",
    lookFor: "Checks scales, baselines, and whether the chart answers the question the reader has.",
    synonyms: ["dashboard", "visualisation", "visualization", "power bi", "tableau", "looker", "reporting", "raportointi"],
  },
  "metrics-definition": {
    label: "Metric definitions",
    why: "Teams act on numbers, so each number has to mean one thing.",
    lookFor: "Asks how each metric is counted, what it excludes, and how it could be gamed.",
    synonyms: ["kpi", "kpis", "metrics definition", "analytics", "business intelligence", "bi", "excel", "analytiikka"],
  },
  "architecture-tradeoffs": {
    label: "Architecture trade-offs",
    why: "Every design buys something and pays for it somewhere else.",
    lookFor: "States what the design gains and what it costs, and when the choice should be revisited.",
    synonyms: ["system design", "microservices", "distributed systems", "software architecture", "design patterns"],
  },
  "scientific-reasoning": {
    label: "Scientific reasoning",
    why: "Claims about new technology need evidence that matches their size.",
    lookFor: "Checks whether the evidence supports the claim and names the control or baseline that is missing.",
    synonyms: ["research", "physics", "quantum", "phd", "scientific", "simulation", "tutkimus", "kvantti"],
  },
  "technical-explanation": {
    label: "Technical explanation",
    why: "Customers and colleagues act on what they understand, not on what is correct.",
    lookFor: "Explains the idea in plain words for the stated reader, without hiding the limits.",
    synonyms: ["documentation", "technical writing", "docs", "explaining", "dokumentaatio"],
  },
  "customer-discovery": {
    label: "Customer discovery",
    why: "A technical sale works when the solution fits the customer's real problem.",
    lookFor: "Asks about the customer's situation before proposing, and is honest about what the product cannot do.",
    synonyms: ["sales", "pre-sales", "presales", "customer discovery", "customer calls", "customer meetings", "solutions", "consulting", "myynti", "asiakas"],
  },
  "writing-clarity": {
    label: "Clear writing",
    why: "Most work is read more often than it is written.",
    lookFor: "Cuts what the reader does not need, puts the key point first, and keeps terms consistent.",
    synonyms: ["writing", "copywriting", "content", "editing", "kirjoittaminen"],
  },
  "ai-assisted-work": {
    label: "Working critically with AI",
    why: "AI tools are allowed and useful, but their output still needs a careful human check.",
    lookFor: "Treats AI output as a draft: checks facts and logic, and says what they verified.",
    synonyms: ["ai tools", "copilot", "chatgpt", "ai-assisted", "using ai", "tekoäly"],
  },
  "bookkeeping-accuracy": {
    label: "Bookkeeping accuracy",
    why: "Small booking errors become wrong taxes and wrong decisions.",
    lookFor: "Checks each entry against the rule that applies and explains the correction.",
    synonyms: ["accounting", "bookkeeping", "reconciliation", "vat", "invoicing", "kirjanpito", "tilinpäätös", "alv"],
  },
  compliance: {
    label: "Rules and compliance",
    why: "Some mistakes are not only costly but against the law.",
    lookFor: "Names the rule that applies and the smallest change that meets it.",
    synonyms: ["compliance", "gdpr", "regulation", "audit", "legal", "tietosuoja"],
  },
  "campaign-analysis": {
    label: "Campaign analysis",
    why: "Marketing budgets should follow what works, and attribution is easy to get wrong.",
    lookFor: "Questions how results were attributed and proposes a fairer comparison.",
    synonyms: ["marketing", "campaign", "seo", "growth", "social media", "markkinointi"],
  },
  "patient-safety": {
    label: "Patient safety",
    why: "In care, an unclear handover or a wrong dose can harm a patient.",
    lookFor: "Spots the step where an error could reach the patient and says how to catch it.",
    synonyms: ["nursing", "patient", "clinical", "care", "healthcare", "hoitotyö", "potilas"],
  },
  "lesson-design": {
    label: "Lesson design",
    why: "A lesson works when every activity serves what learners should be able to do afterwards.",
    lookFor: "Ties activities to the learning goal and checks the plan fits the time and the group.",
    synonyms: ["teaching", "lesson", "curriculum", "pedagogy", "education", "opetus", "pedagogiikka"],
  },
} satisfies Record<string, SkillDefinition>;

export type SkillId = keyof typeof SKILLS;

export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];

export function isSkillId(value: string): value is SkillId {
  return value in SKILLS;
}

export function toSkill(id: SkillId, why?: string): Skill {
  const def = SKILLS[id];
  return { id, label: def.label, why: why ?? def.why };
}
