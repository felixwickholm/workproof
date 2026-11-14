import type { RoleTemplate } from "../role-template";

export const uxDesigner: RoleTemplate = {
  id: "ux-designer",
  title: "UX or service designer",
  level: "degree",
  keywords: [
    "ux designer", "ui designer", "product designer", "interaction designer", "ux", "ui/ux",
    "service designer", "ux researcher", "user researcher", "design researcher", "käyttöliittymäsuunnittelija", "ux-suunnittelija", "palvelumuotoilija",
  ],
  skills: ["interaction-design", "accessibility", "writing-clarity", "user-research", "ai-assisted-work"],
  why: {
    "interaction-design": "Many residents book only a few times a year, so every visit feels like the first one.",
    accessibility: "Many residents are older, and some read Finnish as a second language.",
    "writing-clarity": "Every word on the screen should say what happens next.",
    "user-research": "People who give up do not complain. They call the caretaker instead.",
  },
  lookFor: {
    "interaction-design": "Walks the screen as a first-time user and names the step where they stop.",
    accessibility: "Names who is blocked by each problem and proposes a concrete fix.",
    "writing-clarity": "Rewrites labels and buttons in everyday words that say what happens next.",
    "user-research": "Says how to check the changes with a few real residents.",
  },
  constraints: [
    "the developers can change only the words this month, not the layout",
    "half of the residents book on a shared computer in the lobby",
    "you could watch three residents book tomorrow",
    "the screen must also work on a small, old phone",
  ],
  challenge: {
    minutes: 10,
    title: "Make this booking screen easier. Change three things",
    format: "make",
    proofKind: "design",
    brief:
      "We design apps for housing companies. In this one, residents book the shared sauna and laundry room. First-time users often give up and call the caretaker. Which three changes would help a first-time user book the right time? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Book a room, phone screen (synthetic)",
      body: [
        "[ Room  v ]   SAU-1, SAU-2, LAU-A, LAU-B",
        "[ Date  v ]  [ Time  v ]",
        "Apartment code *  ______   (on your rental contract)",
        "[ SUBMIT ]",
        "",
        "At the bottom, small grey text:",
        "\"Sauna times cost 6 EUR, billed with the rent. Laundry ends at 21:00.\"",
        "",
        "After SUBMIT: the form clears. No message.",
      ].join("\n"),
    },
    deliverable: "Sketch or describe three changes, and say why each one helps a first-time user.",
    flaws: [
      {
        label: "rooms named by codes instead of words people know",
        cues: ["code", "sau-1", "lau-a", "names", "sauna", "laundry", "plain words"],
      },
      {
        label: "the price and closing time hidden in small grey text",
        cues: ["6 eur", "price", "cost", "grey", "gray", "small text", "bottom", "21:00"],
      },
      {
        label: "no message after booking, so people do not know if it worked",
        cues: ["message", "confirm", "confirmation", "clears", "submit", "what happens", "booked"],
      },
    ],
  },
  taster: {
    title: "Rewrite one button",
    format: "make",
    proofKind: "writing",
    brief: "This is the last step of a payment flow in a parking app.",
    material: {
      kind: "text",
      title: "Payment screen",
      body: [
        "Parking zone 3, 2 hours",
        "Total: 6.40 EUR",
        "[ OK ]   [ Cancel ]",
      ].join("\n"),
    },
    deliverable: "What would you write on the button instead, and why?",
    flaws: [
      {
        label: "a button label that does not say it will charge the user",
        cues: ["ok", "label", "pay", "charge", "button", "unclear", "what happens"],
      },
    ],
  },
};
