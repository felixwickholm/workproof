import type { RoleTemplate } from "../role-template";

export const homeCareCoordinator: RoleTemplate = {
  id: "home-care-coordinator",
  title: "Care team coordinator (nursing or medical degree)",
  level: "degree",
  keywords: [
    "care team coordinator", "care team leader", "nurse coordinator", "home care coordinator", "home care", "home care worker", "care coordinator", "care visits", "care worker",
    "personal care assistant", "kotihoito", "kotihoidon", "kotihoitaja", "hoiva-avustaja", "hoivatyö",
  ],
  skills: ["care-visit-planning", "patient-safety", "prioritisation", "stakeholder-communication", "calm-on-the-phone"],
  cues: {
    "care-visit-planning": ["visits", "the day", "sick", "cover", "rota"],
    "stakeholder-communication": ["evening shift", "next shift", "shift notes", "notes", "handover"],
    "calm-on-the-phone": ["families", "relatives", "worried"],
  },
  why: {
    "patient-safety": "A visit that moves can mean a missed dose or a fall nobody sees.",
    "stakeholder-communication": "Clients and families plan their day around the visit, so a change needs a call.",
    "calm-on-the-phone": "A family member who hears about a change first from the client is worried before the call starts.",
  },
  lookFor: {
    "care-visit-planning": "Keeps the visits where a delay could harm someone and moves the ones that can wait a day.",
    "patient-safety": "Spots the medicine or the client situation that makes a visit time-critical and says why.",
    "calm-on-the-phone": "Says who is called before the change, and what they are told in plain words.",
  },
  constraints: [
    "a third carer can come only after 11:00",
    "the daughter you planned to call does not answer",
    "the hospital calls about the client who came home yesterday",
    "the medicine dispenser alarm goes off during your first visit",
  ],
  challenge: {
    title: "Two carers are off sick. Plan tomorrow's visits",
    format: "plan",
    proofKind: "plan",
    brief:
      "Tomorrow morning two of our carers are off sick. Leena and Tomi can do six visits before noon between them, but nine are booked. The office used an AI assistant to draft a plan, and it goes to the carers' phones at 7:00. This is a synthetic list from our training material. Please plan the morning as the coordinator.",
    material: {
      kind: "text",
      title: "Morning visits, Wednesday (synthetic)",
      body: [
        "08:00  Client A  insulin before breakfast, checks glucose",
        "08:30  Client B  shower help, weekly",
        "08:30  Client C  home from hospital yesterday, new blood thinner dose,",
        "                 check the dispenser and any bruising",
        "09:00  Client D  memory disorder, alone at home, morning medicines and breakfast",
        "09:30  Client E  shopping, list ready on the table",
        "10:00  Client F  eye drops and breakfast, daughter often visits on Wednesdays",
        "10:30  Client G  wound dressing every other day, last done yesterday",
        "11:00  Client H  lunch and noon medicines",
        "11:30  Client I  outdoor walk",
        "",
        "AI draft for the six slots",
        "Keep: A, B, E, F, G, H",
        "Move to the afternoon: C, D, I",
        "Calls: none needed, clients are used to changes",
      ].join("\n"),
    },
    deliverable:
      "Write the morning plan: which six visits stay, which move, and who you call first. Give one reason for each change. Write it, or say it and we keep only the text.",
    flaws: [
      {
        label: "the client with a new blood thinner dose moved to the afternoon",
        cues: ["blood thinner", "client c", "bleeding", "bruis", "dispenser", "hospital", "dose", "warfarin", "anticoag"],
      },
      {
        label: "the client with a memory disorder, alone at home, left without morning medicines",
        cues: ["client d", "memory", "dementia", "alone", "morning medicines", "breakfast", "forget"],
      },
      {
        label: "the shower and shopping visits kept while nobody is called",
        cues: ["shower", "shopping", "client b", "client e", "call", "daughter", "family", "can wait", "tell"],
      },
    ],
  },
  taster: {
    title: "One carer is late. Who comes first?",
    format: "plan",
    proofKind: "plan",
    brief: "One carer is 40 minutes late. These three visits are booked at 8:00 (synthetic).",
    material: {
      kind: "text",
      title: "Visits at 8:00",
      body: [
        "Client A: shopping, list ready.",
        "Client B: insulin before breakfast.",
        "Client C: vacuuming.",
      ].join("\n"),
    },
    deliverable: "Which visit would you do first, and what would you tell the other two?",
    flaws: [
      {
        label: "the insulin visit that cannot wait while the others can",
        cues: ["insulin", "client b", "breakfast", "glucose", "sugar", "first"],
      },
    ],
  },
};
