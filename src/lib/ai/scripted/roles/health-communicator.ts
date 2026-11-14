import type { RoleTemplate } from "../role-template";

export const healthCommunicator: RoleTemplate = {
  id: "health-communicator",
  title: "Health communicator",
  level: "degree",
  keywords: [
    "health communicator", "health communication", "patient letters", "patient letter", "medical writer", "health writer",
    "journalist", "content writer", "copywriter", "terveysviestintä", "toimittaja", "viestintäsuunnittelija",
  ],
  skills: ["plain-language", "patient-safety", "writing-clarity", "stakeholder-communication"],
  why: {
    "plain-language": "A patient who misreads a result letter either worries for nothing or misses the step that matters.",
    "patient-safety": "The letter is often the only place the next step is written down.",
  },
  lookFor: {
    "plain-language": "Turns lab terms into everyday words and keeps each value next to what it means for the reader.",
    "patient-safety": "Puts the one result that needs action first and says exactly what the patient does next.",
    "writing-clarity": "Cuts what the patient does not need and keeps the facts a doctor would want kept.",
  },
  constraints: [
    "the letter also goes out as a text message of a few lines",
    "many readers use a translation app on the letter",
    "the doctor insists on keeping the reference ranges",
    "the phone line is open only two hours a day",
  ],
  challenge: {
    title: "Rewrite this result letter so a patient understands it",
    format: "write",
    proofKind: "writing",
    brief:
      "Our clinic sends lab results by letter after a health check. Patients call us because they do not understand them, and some miss the one thing they need to do. A doctor wrote the letter below with an AI assistant. This is a synthetic patient. Please rewrite it for the patient.",
    material: {
      kind: "text",
      title: "Result letter (synthetic)",
      body: [
        "Laboratory results, health check 3.11.",
        "",
        "Dear patient,",
        "Your laboratory investigations have been completed and evaluated.",
        "B-Hb 138 g/l (ref. 117-155). fP-Gluk 6.4 mmol/l (ref. 4.0-6.0),",
        "consistent with impaired fasting glycaemia (IFG).",
        "P-TSH 2.1 mU/l (ref. 0.5-3.6).",
        "fP-Kol-LDL 4.9 mmol/l (ref. < 3.0).",
        "fP-Trigly 1.4 mmol/l (ref. < 1.7).",
        "",
        "Results otherwise within reference limits.",
        "No acute measures are indicated.",
        "",
        "Lifestyle modification is advised. A control sample is to be taken",
        "within 3 months and a follow-up appointment arranged with the nurse.",
        "For further information contact the clinic by telephone.",
      ].join("\n"),
    },
    deliverable:
      "Rewrite the letter in plain language for the patient, in under 150 words. Keep every fact they need to act on.",
    flaws: [
      {
        label: "the high LDL cholesterol and the follow-up hidden at the end",
        cues: ["ldl", "cholesterol", "kolesterol", "4.9", "follow-up", "control sample", "3 months", "book", "appointment"],
      },
      {
        label: "lab terms and abbreviations a patient cannot read",
        cues: ["ifg", "glycaemia", "glucose", "sugar", "abbreviation", "jargon", "fp-", "b-hb", "reference"],
      },
      {
        label: "no phone number, hours or clear next step",
        cues: ["phone number", "hours", "telephone", "call", "next step", "who books", "contact"],
      },
    ],
  },
  taster: {
    title: "Rewrite one line of a result letter",
    format: "write",
    proofKind: "writing",
    brief: "This line is from a synthetic lab result letter.",
    material: {
      kind: "text",
      title: "One line",
      body: "fP-Gluk 6.4 mmol/l, consistent with impaired fasting glycaemia. Lifestyle modification advised.",
    },
    deliverable: "How would you say this to the patient in two plain sentences?",
    flaws: [
      {
        label: "a borderline result written in terms only staff understand",
        cues: ["sugar", "glucose", "slightly", "higher", "a bit", "food", "exercise", "plain"],
      },
    ],
  },
};
