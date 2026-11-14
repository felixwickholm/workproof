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
  skills: ["calm-on-the-phone", "stakeholder-communication", "prioritisation", "customer-discovery"],
  cues: {
    "calm-on-the-phone": ["late deliveries", "unhappy clients", "difficult calls"],
    "stakeholder-communication": ["suppliers", "frame agreements", "account plans"],
    "customer-discovery": ["client needs", "clients' projects"],
  },
  why: {
    "calm-on-the-phone": "A client who hears excuses first stops listening, and the frame agreement is up for renewal.",
    "customer-discovery": "The client's real deadline is their own customer's, and you can only help once you know it.",
  },
  lookFor: {
    "calm-on-the-phone": "Owns the delay in plain words in the first sentences, without blaming the supplier.",
    prioritisation: "Offers the part delivery that covers the client's first need and promises only what is confirmed.",
    "customer-discovery": "Asks what the client's site needs first before offering anything.",
  },
  constraints: [
    "the supplier cannot confirm a date until Monday",
    "the client asks for a discount on the whole order",
    "the 120 valves in stock are promised to another client as well",
    "the client's managing director joins the call after one minute",
  ],
  challenge: {
    title: "A client's delivery is two weeks late. Say your first 30 seconds",
    format: "explain",
    proofKind: "voice",
    brief:
      "You manage key accounts at a company that makes valves and controls for building automation. A client calls about an order that is two weeks late. Below is what your screen shows when the call connects. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Account view at call start (synthetic)",
      body: [
        "Client: building automation integrator, frame agreement since 2021",
        "Renewal: March. About 40% of the client's yearly purchases.",
        "",
        "Order 4471: 400 control valves DN25",
        "- Promised delivery: 3 November",
        "- Now: 17 November (casting delay at our supplier)",
        "- Supplier date not yet confirmed in writing",
        "",
        "Client's project (notes from the last meeting)",
        "- Hospital extension, handover on 28 November",
        "- Phase 1 needs 120 valves, phase 2 the rest in December",
        "",
        "You may offer",
        "- 120 valves DN25 from our own stock, shipped on Friday",
        "- Express freight at our cost",
        "Only with the sales director: discounts, or a date the supplier",
        "has not confirmed in writing",
      ].join("\n"),
    },
    deliverable:
      "Record your first 30 seconds of the call, as you would say it. Only the words are kept, never your voice. Or write it.",
    flaws: [
      {
        label: "the 120 valves in stock that cover phase 1 by Friday",
        cues: ["120", "stock", "friday", "phase 1", "part delivery", "partial", "first part"],
      },
      {
        label: "a promise of 17 November before the supplier has confirmed it",
        cues: ["confirm", "not yet", "17", "promise", "in writing", "monday", "call you back", "date"],
      },
      {
        label: "the client's own deadline, which the call can start by asking about",
        cues: ["hospital", "28", "handover", "your project", "what do you need", "site", "deadline", "ask"],
      },
    ],
  },
  taster: {
    title: "Answer one client who has waited too long",
    format: "explain",
    proofKind: "voice",
    brief: "A client calls you and says this, word for word.",
    material: {
      kind: "text",
      title: "Client",
      body: [
        "\"Your delivery is late again.",
        "My site team is standing still today.",
        "I need to know what you will do.\"",
      ].join("\n"),
    },
    deliverable: "Say it or write it: what is the first sentence you would say, and why that one?",
    flaws: [
      {
        label: "a client who needs the delay owned and a concrete next step before any explanation",
        cues: ["sorry", "today", "right now", "what i can do", "site", "call you", "confirm", "next step"],
      },
    ],
  },
};
