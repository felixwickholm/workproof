import type { RoleTemplate } from "../role-template";

export const uxDesigner: RoleTemplate = {
  id: "ux-designer",
  title: "UX designer",
  keywords: [
    "ux designer", "ui designer", "product designer", "interaction designer", "ux", "ui/ux",
    "service designer", "käyttöliittymäsuunnittelija", "ux-suunnittelija", "palvelumuotoilija",
  ],
  skills: ["interaction-design", "accessibility", "user-research", "writing-clarity", "ai-assisted-work"],
  why: {
    "interaction-design": "People book these appointments on a phone, often in a hurry.",
    accessibility: "Some of our users are older or use screen readers. If they cannot book, they call instead.",
  },
  lookFor: {
    "interaction-design": "Walks through the flow as a user and names the step where people get stuck.",
    accessibility: "Names who is blocked by each issue and proposes a concrete fix.",
  },
  constraints: [
    "the developers can change only the copy, not the layout, this sprint",
    "half of the users book on a desktop computer at the clinic",
    "you could watch three people use it tomorrow",
    "the app must also work in Swedish",
  ],
  challenge: {
    title: "Review an AI-written booking flow spec",
    format: "review",
    brief:
      "We run online booking for a chain of physiotherapy clinics. A designer used an AI assistant to write the spec for the new mobile booking flow. Developers start on it Monday. Please read it as a user would meet it.",
    material: {
      kind: "text",
      title: "Booking flow spec v2",
      body: [
        "Screen 1: Choose service",
        "List of 14 services, sorted by internal service code.",
        "",
        "Screen 2: Choose time",
        "Calendar shows free slots in green and full slots in red. No other marker.",
        "",
        "Screen 3: Your details",
        "Fields: name, phone, email, social security number.",
        "Placeholder text inside each field acts as the label.",
        "",
        "Screen 4: Confirm",
        "Button: \"Submit\"",
        "After tap: spinner for up to 10 seconds, then the home screen.",
        "",
        "Error handling",
        "If the slot was taken meanwhile: \"Error 409. Try again.\"",
        "",
        "Cancellation",
        "Users call the clinic to cancel.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before developers start, and why? Order the changes by how many people they affect.",
    flaws: [
      {
        label: "free and full slots told apart by colour alone",
        topic: "how free and full slots are shown",
        cues: ["colour", "color", "red", "green", "colour blind", "color blind", "contrast", "screen reader"],
      },
      {
        label: "placeholder text used as field labels",
        topic: "the form field labels",
        cues: ["placeholder", "label", "disappear", "screen reader", "forget what"],
      },
      {
        label: "no confirmation after booking and an error message that does not help",
        topic: "the confirmation and error messages",
        cues: ["confirmation", "home screen", "409", "error message", "what happened", "booked", "next step", "try again"],
      },
    ],
  },
  taster: {
    title: "Read one button",
    format: "review",
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
    deliverable: "What would you change on this screen, and why?",
    flaws: [
      {
        label: "a button label that does not say it will charge the user",
        topic: "the button label",
        cues: ["ok", "label", "pay", "charge", "button", "unclear", "what happens"],
      },
    ],
  },
};
