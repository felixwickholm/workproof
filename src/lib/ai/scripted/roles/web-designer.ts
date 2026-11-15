import type { RoleTemplate } from "../role-template";

export const webDesigner: RoleTemplate = {
  id: "web-designer",
  title: "Web designer",
  level: "degree",
  keywords: [
    "order form", "web designer", "web form", "online form", "form design", "ordering form",
    "verkkosuunnittelija", "tilauslomake",
  ],
  skills: ["finds-confusion", "simple-design", "explains-choice", "customer-focus"],
  cues: {
    "finds-confusion": ["easier to use", "confusing", "people get stuck"],
    "simple-design": ["order form", "fewer steps"],
  },
  why: {
    "finds-confusion": "Three in ten orders still come by phone, because installers get stuck on the form.",
    "simple-design": "Installers order on a phone, in a van or a cold basement, between two jobs.",
    "explains-choice": "Our one web developer builds what you propose, so each change needs a reason.",
    "customer-focus": "Our installers know the pump model, not our product codes.",
  },
  lookFor: {
    "finds-confusion": "Names the exact steps where an installer stops or phones, using what installers say in the material.",
    "simple-design": "Removes or merges steps, and puts the part search and the confirmation where an installer needs them.",
    "explains-choice": "Gives one short reason for each change, tied to a complaint or a number in the material.",
    "customer-focus": "Describes the order from the installer's side: on a phone, with the old part in hand.",
  },
  constraints: [
    "most installers order on a phone with one hand",
    "the web developer has time for only two changes this month",
    "a third of orders are for the same parts as last time",
    "some installers read Finnish as a second language",
  ],
  challenge: {
    minutes: 10,
    title: "Make our order form easier to use",
    format: "make",
    proofKind: "writing",
    brief:
      "We sell spare parts for heat pumps to installers. Installers order on our website, often on a phone in a van or a customer's basement. Many give up and phone us instead. Below is our order form today and what installers tell us about it. How would you make it easier to use? This is a synthetic company.",
    material: {
      kind: "text",
      title: "Our web order form today (synthetic)",
      body: [
        "Step 1 of 4: Log in with your customer number (6 digits, on your invoice).",
        "Step 2 of 4: Product code * (for example HS-4471-B) and quantity. No search by pump model. No pictures.",
        "Step 3 of 4: Delivery address * (typed again for every order). Standard, Express or Pickup. Prices show on the next page.",
        "Step 4 of 4: Order reference * (no help text) and comments. Then SEND.",
        "After SEND: \"Order received.\" No order number, no delivery date, no email.",
        "",
        "What installers tell us:",
        "\"I know the pump model, not your product code.\"",
        "\"Why do I type the address every time?\"",
        "\"I never know if the order went through, so I phone.\"",
        "",
        "3 in 10 orders still come by phone. About 40 calls a day ask \"did my order arrive?\"",
      ].join("\n"),
    },
    deliverable: "Describe your easier form in 5 to 8 short points with a reason for each, then think aloud for one minute.",
    flaws: [
      {
        label: "parts searched by product code alone, not by pump model or picture",
        cues: ["product code", "code", "pump model", "model", "search", "picture", "photo"],
      },
      {
        label: "no order number, delivery date or email after sending",
        cues: ["confirm", "confirmation", "order number", "delivery date", "email", "went through", "phone", "calls"],
      },
      {
        label: "the address typed every time, a required field nobody understands and prices shown late",
        cues: ["address", "saved", "remember", "reference", "price", "prices", "express", "steps", "fields"],
      },
    ],
  },
  taster: {
    title: "Rewrite one form field",
    format: "make",
    proofKind: "writing",
    brief: "This field is on a web shop's order form. Many people leave it empty, and the form will not send.",
    material: {
      kind: "text",
      title: "One field",
      body: ["Ref. no. *", "[ __________ ]"].join("\n"),
    },
    deliverable: "What would you write on this field instead, and why?",
    flaws: [
      {
        label: "a short code as a label that does not say what to type",
        cues: ["ref", "label", "what to type", "example", "help", "optional", "unclear"],
      },
    ],
  },
};
