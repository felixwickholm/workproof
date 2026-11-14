import type { RoleTemplate } from "../role-template";

export const salesAssistant: RoleTemplate = {
  id: "sales-assistant",
  title: "Sales assistant",
  level: "practice",
  keywords: [
    "sales assistant", "shop assistant", "retail", "retail worker", "cashier", "shop",
    "myyjä", "myymälä", "kassa", "kauppa", "kaupan kassa", "hairdresser", "kampaaja", "barber", "säljare",
  ],
  skills: ["serving-customers", "calm-on-the-phone", "plain-language", "prioritisation"],
  why: {
    "serving-customers": "A shop keeps customers when a problem at the till ends with a clear answer.",
    "calm-on-the-phone": "Face to face or on the phone, a calm first sentence stops a small problem from growing.",
  },
  lookFor: {
    "serving-customers": "Finds out what the customer needs, follows the shop's rules, and offers a real next step.",
    prioritisation: "Handles the customer at the till without leaving the queue or the shelf problem unsolved.",
  },
  constraints: [
    "you are alone on the shop floor",
    "the shift manager is on a break for twenty minutes",
    "the till system is down and only card payments work",
    "the customer is in a hurry to catch a bus",
  ],
  challenge: {
    minutes: 15,
    title: "A return without a receipt and a wrong price",
    format: "read",
    proofKind: "voice",
    brief:
      "You work the afternoon shift in a home goods shop. A customer is at the till with a kettle and the shelf label in their hand. Three people wait behind them. Read the situation and the shop rules below. This is a synthetic example.",
    material: {
      kind: "text",
      title: "At the till, 16:40 (synthetic)",
      body: [
        "Customer says:",
        "\"I bought this kettle last week. It leaks. I lost the receipt.",
        "Also, this one on the shelf says 19.90 but you charged me 29.90.\"",
        "",
        "What the till shows",
        "- Kettle, product code 4471: price 29.90 since Monday",
        "- Shelf label (in the customer's hand): 19.90, campaign ended Sunday",
        "",
        "Shop rules",
        "- Faulty product: replace or refund with proof of purchase",
        "- Proof of purchase: receipt, card statement or loyalty card record",
        "- Wrong shelf price: the customer pays the shelf price",
        "- Refunds over 50 EUR need the shift manager",
        "",
        "Queue: three customers waiting",
      ].join("\n"),
    },
    deliverable:
      "Say what you would tell the customer, as you would say it at the till. Only the words are kept, never your voice. Or write it.",
    flaws: [
      {
        label: "a card statement or loyalty record that can replace the lost receipt",
        cues: ["card", "statement", "loyalty", "bank", "proof", "kanta-asiakas", "kortti", "receipt"],
      },
      {
        label: "the old shelf label that the shop has to honour",
        cues: ["shelf", "label", "19.90", "ten euros", "difference", "honour", "honor", "campaign", "hyllyhinta"],
      },
      {
        label: "the waiting queue while one customer needs time",
        cues: ["queue", "waiting", "colleague", "call", "next customer", "one moment", "jono", "help"],
      },
    ],
  },
  taster: {
    title: "One sentence at the till",
    format: "read",
    proofKind: "voice",
    brief: "A customer at the till says this.",
    material: {
      kind: "text",
      title: "Customer",
      body: ["\"The sign says two for five euros.", "You charged me six.\""].join("\n"),
    },
    deliverable: "Say it or write it: what would you say first, and why?",
    flaws: [
      {
        label: "a customer who needs the price checked and fixed before anything else",
        cues: ["check", "sign", "price", "sorry", "fix", "refund", "difference", "look"],
      },
    ],
  },
};
