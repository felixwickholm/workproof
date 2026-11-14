import type { RoleTemplate } from "../role-template";

export const childcareWorker: RoleTemplate = {
  id: "childcare",
  title: "Early education worker",
  keywords: [
    "early education", "early childhood education", "early education worker", "childcare", "child care",
    "daycare", "day care", "nanny", "preschool", "kindergarten", "varhaiskasvatus", "varhaiskasvatuksen",
    "päiväkoti", "lastenhoitaja", "esiopetus", "lastentarhanopettaja",
  ],
  skills: ["early-learning", "plain-language", "safety-thinking", "stakeholder-communication"],
  why: {
    "early-learning": "Families trust a group when they know what happened in their child's day, including the hard parts.",
    "safety-thinking": "An allergy or a pick-up mistake can harm a child, so the routine around it has to hold.",
    "plain-language": "Many families read the message in their second or third language, often on a phone.",
  },
  lookFor: {
    "early-learning": "Writes about the day from the children's point of view and keeps the tone warm and calm.",
    "safety-thinking": "Names what went wrong with the snack and the pick-up, and the concrete change to the routine.",
    "plain-language": "Uses short sentences, keeps the facts families need, and leaves out what only staff need.",
  },
  constraints: [
    "the message also goes out in two other languages",
    "one family has already called the director",
    "you have five minutes before the families arrive",
    "the director wants to read it before it goes out",
  ],
  challenge: {
    title: "Review an AI-drafted message to families",
    format: "review",
    proofKind: "writing",
    brief:
      "Our daycare group had a forest day today. Two things went wrong. A colleague asked an AI assistant to draft the message that goes to all families of the group tonight. Please read the notes and the draft before it is sent. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Staff notes and AI draft, Blueberry group (synthetic)",
      body: [
        "Staff notes",
        "- 10:15 snack: oat bars from the shop. Child K (oat allergy on file)",
        "  ate half a bar. Rash on the cheeks, no breathing trouble.",
        "  Family called 10:25, child picked up 11:00.",
        "- 15:40 child M left with an adult not on the pick-up list.",
        "  The adult was the family's neighbour, the family confirmed",
        "  by phone at 15:55. The list was not checked before.",
        "",
        "AI draft",
        "Hello families,",
        "What a lovely forest day! The children built huts and found",
        "mushrooms. We had a small snack incident and one child went",
        "home early, but everything is fine now.",
        "As always, pick-ups went smoothly.",
        "See you tomorrow,",
        "Blueberry group",
      ].join("\n"),
    },
    deliverable:
      "What would you change in the message before it goes to families, and why? You may rewrite it.",
    flaws: [
      {
        label: "an allergy reaction called a small snack incident, with no word on what changes",
        cues: ["allerg", "oat", "snack", "incident", "rash", "label", "check", "ingredients", "reaction"],
      },
      {
        label: "a pick-up outside the list described as smooth",
        cues: ["pick-up", "pickup", "list", "neighbour", "neighbor", "smoothly", "smooth", "check", "adult"],
      },
      {
        label: "details about named children that do not belong in a message to all families",
        cues: ["privacy", "private", "all families", "identify", "separately", "directly", "only the family", "personal"],
      },
    ],
  },
  taster: {
    title: "Read one daycare note",
    format: "review",
    proofKind: "writing",
    brief: "This note is on the board when the afternoon staff arrive.",
    material: {
      kind: "text",
      title: "Note",
      body: [
        "Snack today: banana bread from the new bakery.",
        "Allergy list: see the folder.",
        "Serve at 14:00.",
      ].join("\n"),
    },
    deliverable: "What would you check before 14:00, and why?",
    flaws: [
      {
        label: "a new bakery product served before the ingredients are checked against the allergy list",
        cues: ["ingredient", "allerg", "nut", "egg", "gluten", "folder", "label", "check", "new bakery"],
      },
    ],
  },
};
