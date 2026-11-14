import type { RoleTemplate } from "../role-template";

export const graphicDesigner: RoleTemplate = {
  id: "graphic-designer",
  title: "Graphic designer",
  keywords: [
    "graphic designer", "graphic design", "graafikko", "graafinen suunnittelija", "visual designer",
    "illustrator", "kuvittaja", "designer", "layout designer", "brand designer", "photographer", "valokuvaaja",
  ],
  skills: ["visual-design", "plain-language", "accessibility", "user-research"],
  why: {
    "visual-design": "A reminder works when the reader finds the time and the one thing to do before anything else.",
    "plain-language": "Many readers are new to Finnish. Short words and one idea per line let them act without help.",
    accessibility: "Some readers have low vision or read on a small phone, and they still have to arrive on time.",
  },
  lookFor: {
    "visual-design": "Puts the time, the place and the fasting rule where the eye lands first, and explains each layout choice.",
    "plain-language": "Replaces the official phrases with everyday words and keeps every fact from the original.",
    accessibility: "Keeps text large, contrast high and meaning clear without colour alone.",
  },
  constraints: [
    "the reminder has to fit on a phone screen",
    "the clinic can print only in black and white",
    "the same layout must work in three languages",
    "the clinic logo and address block cannot move",
  ],
  challenge: {
    title: "Redesign this appointment reminder for people new to Finnish",
    format: "build",
    proofKind: "design",
    brief:
      "Our client, a health clinic, sends this reminder before a blood test. Many patients come on the wrong day or have eaten, and the test has to be redone. Many of them are new to Finnish. Redesign the reminder so it works on paper and on a phone. Keep every fact. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Current reminder (synthetic)",
      body: [
        "MUISTUTUS / REMINDER",
        "",
        "Hyvä asiakas,",
        "",
        "Teille on varattu aika laboratorioon paastoverikokeeseen,",
        "joka suoritetaan ti 18.11. klo 8.15 osoitteessa Rantakaari 9 B,",
        "2. kerros, Espoo. Ajanvarauksen siirto tai peruutus tulee",
        "suorittaa viimeistään edellisenä arkipäivänä puhelimitse",
        "numeroon 09 000 1234, muussa tapauksessa käyntimaksu",
        "voidaan periä. Pyydämme Teitä saapumaan 10 minuuttia ennen",
        "varattua aikaa ja ottamaan mukaan henkilöllisyystodistuksen.",
        "",
        "Huom. Näytteenotto edellyttää 10 tunnin ravinnotta oloa.",
        "Veden juonti on sallittua.",
        "",
        "In English: you have a laboratory appointment. Please see",
        "the Finnish text for details.",
      ].join("\n"),
    },
    deliverable:
      "Upload one image of your redesign, as an image or a sketch on paper. Or describe the layout in words or by voice.",
    flaws: [
      {
        label: "the date and time buried in the middle of a long sentence",
        cues: ["time", "date", "8.15", "8:15", "18.11", "tuesday", "first", "top", "large", "bigger", "aika"],
      },
      {
        label: "the fasting rule left to the very end, after the reader has stopped reading",
        cues: ["fast", "eat", "food", "10 hours", "ten hours", "water", "ravinnotta", "paasto", "syö"],
      },
      {
        label: "official phrases, an English line with no facts, and a phone number with no opening hours",
        cues: ["official", "plain", "simple", "english", "hours", "phone", "call", "opening", "suoritetaan", "henkilöllisyystodistus"],
      },
    ],
  },
  taster: {
    title: "Fix one line of a notice",
    format: "build",
    proofKind: "design",
    brief: "This line is at the bottom of a notice taped to a clinic door.",
    material: {
      kind: "text",
      title: "Notice",
      body: [
        "Sisäänkäynti remontin ajan C-ovesta.",
        "(small grey text, bottom right)",
      ].join("\n"),
    },
    deliverable: "Sketch it or describe it: how would you change this notice so nobody walks to the wrong door?",
    flaws: [
      {
        label: "the one instruction that matters, set small and grey where nobody looks",
        cues: ["bigger", "large", "top", "arrow", "contrast", "door c", "c-ovi", "english", "plain", "colour", "color"],
      },
    ],
  },
};
