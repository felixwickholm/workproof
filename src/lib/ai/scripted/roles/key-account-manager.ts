import type { RoleTemplate } from "../role-template";

export const keyAccountManager: RoleTemplate = {
  id: "key-account-manager",
  title: "Key account manager",
  level: "degree",
  keywords: [
    "key account manager", "account manager", "key account", "account management", "client manager",
    "customer success manager", "business development manager", "b2b sales", "sales manager",
    "avainasiakaspäällikkö", "asiakkuuspäällikkö", "avainasiakas", "myyntipäällikkö",
  ],
  skills: ["prioritisation", "customer-discovery", "stakeholder-communication", "risk-management", "calm-on-the-phone"],
  cues: {
    "calm-on-the-phone": ["late deliveries", "unhappy clients", "difficult calls"],
    "stakeholder-communication": ["suppliers", "frame agreements", "account plans"],
    "customer-discovery": ["client needs", "clients' projects"],
  },
  why: {
    prioritisation: "We have one free engineer next week and two customers who need that engineer.",
    "customer-discovery": "The real deadline is often the customer's own, and you only learn it by asking.",
    "risk-management": "Each choice costs something. The skill is to know what, and to say it.",
  },
  lookFor: {
    prioritisation: "Picks one customer to wait and ties the choice to what each one loses.",
    "customer-discovery": "Asks or uses each customer's real deadline before deciding.",
    "stakeholder-communication": "Says what the customer who waits is told, and when.",
    "risk-management": "Names the cost of the choice, such as the penalty or the next deal.",
  },
  constraints: [
    "customer A's go-live moves one week earlier",
    "the engineer is ill on Monday",
    "customer B offers to pay for weekend work",
    "your sales director wants customer A served first",
  ],
  challenge: {
    minutes: 10,
    title: "Two customers want the same engineer. Who waits?",
    format: "choose",
    proofKind: "writing",
    brief:
      "We install control systems in buildings, and you look after our key customers. Next week we have one free engineer, Monday to Friday, and two customers want that engineer from Monday. Which customer waits? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Next week (synthetic)",
      body: [
        "Engineer free: Monday to Friday, 5 days.",
        "Customer A needs 4 days. Customer B needs 2 days.",
        "Both asked for Monday.",
      ].join("\n"),
    },
    options: [
      {
        id: "a",
        title: "Customer A: hospital extension",
        body: "A big customer, 40% of our sales, and the contract renews in March. Their system goes live in 9 days, with a penalty of 2 000 EUR for each day late. Their own staff can run some of the tests.",
      },
      {
        id: "b",
        title: "Customer B: school renovation",
        body: "A new customer and our first job for them. The school opens again on Wednesday, and the air handling must work before the pupils come back. They choose a supplier for 12 more schools in the spring.",
      },
    ],
    deliverable: "Pick the customer who waits, and say why and what you tell them.",
    flaws: [
      {
        label: "both jobs fit in the week if customer B goes first",
        cues: ["both", "first two days", "monday and tuesday", "wednesday", "4 days", "2 days", "split", "fit", "6 days", "after"],
      },
      {
        label: "a go-live in 9 days, so customer A can wait two days without a penalty",
        cues: ["9 days", "go-live", "go live", "penalty", "2 000", "own staff", "tests", "march"],
      },
    ],
  },
  taster: {
    title: "Who do you call back first?",
    format: "choose",
    proofKind: "writing",
    brief: "Two customers left a message at the same time.",
    material: {
      kind: "text",
      title: "Two messages",
      body: "You have time for one call before a meeting.",
    },
    options: [
      { id: "a", title: "Customer A", body: "\"Please call me about next year's prices.\"" },
      { id: "b", title: "Customer B", body: "\"Our system stopped this morning. Please call.\"" },
    ],
    deliverable: "Who do you call back first, and why?",
    flaws: [
      {
        label: "a stopped system that costs the customer money every hour",
        cues: ["stopped", "this morning", "urgent", "customer b", "every hour", "prices can wait", "later"],
      },
    ],
  },
};
