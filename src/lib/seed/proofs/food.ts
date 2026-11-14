import type { SeedProof } from "../types";

/** Merituuli Foods' allergen task. Synthetic people and work; photos show the bench, never people. */
export const FOOD_PROOFS: SeedProof[] = [
  {
    id: "proof_food_01",
    person: "thiago",
    challenge: "merituuli-swab",
    hoursAgo: 22,
    shareWithSimilar: true,
    answer: [
      "First, before any swab: the 1,800 cartons are on hold. They are labelled milk-free and made after a positive result, so they stay in the warehouse until the re-test and a product test are back. I call the warehouse and production before 10:00.",
      "Bench set-up in the photo:",
      "1. New kit lot. 2207 failed its positive control, so its negatives mean nothing.",
      "2. Positive and negative control run first, on the same kit.",
      "3. Surfaces dry for 10 minutes after sanitiser. A wet surface can hide protein.",
      "4. Swab all six filler nozzles, the nozzle 3 gasket and the valve seat, not only nozzle 3.",
      "I worked at Sabor Verde Alimentos in São Paulo for five years and ran its allergen programme. Thiago",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lab-bench-swabs.svg",
      alt: "A lab bench from above: a rack of eight labelled swab tubes for nozzles N1 to N6, a gasket and a valve seat, two control tubes marked plus and minus, a timer set to 10 minutes and a printed re-test checklist with the first line ticked.",
    },
    explainAnswers: [
      "Cartons labelled milk-free could be on a school lunch table tomorrow while we are still testing the line.",
      "Then line 2 runs a product that contains milk until the new kits come, and the oat drink waits for a clean result. The cartons stay on hold either way.",
    ],
    decision: {
      companyId: "co-merituuli",
      kind: "meet",
      feedback:
        "You put the 1,800 cartons on hold before touching a swab, and you threw out the kit lot with the failed control. That is the order we wanted. Come and walk the line 2 changeover with our quality team.",
      hoursToReply: 3,
      meeting: "met",
    },
  },
  {
    id: "proof_food_02",
    person: "linh",
    challenge: "merituuli-swab",
    hoursAgo: 17,
    shareWithSimilar: false,
    answer: [
      "My photo shows the controls I run before the real swabs: the positive control from a new kit, a negative, and a spiked swab where I put a drop of the milk dessert on a clean steel coupon. If the kit cannot find that, it cannot clear the line.",
      "I would not trust a faint line as residue. A faint line on lateral flow is a positive.",
      "Re-swab after the surface is dry, nozzle 3 and the nozzles next to it.",
      "My MSc in food science is from Hanoi, and I did my thesis on milk protein tests.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lab-bench-controls.svg",
      alt: "Five lateral flow test cassettes in a row on a white bench, labelled with handwritten tape: positive control, negative control, spiked coupon, nozzle 3 and nozzle 2. A small steel coupon and a dropper bottle sit beside them.",
    },
    explainAnswers: [
      "Without the controls, a clean result could just mean the kit does not work. Lot 2207 already failed once.",
      "Then the line restarts on a product with milk, and the oat drink waits until the controls and the re-swab are clean.",
    ],
    decision: {
      companyId: "co-merituuli",
      kind: "pass",
      feedback:
        "The spiked coupon is a check we have not used and will add to our procedure. Your plan did not say what happens to the cartons already packed, and in this role that call comes first. Please keep reading a faint line as a positive.",
      hoursToReply: 5.5,
    },
  },
  {
    id: "proof_food_03",
    person: "mariana",
    challenge: "merituuli-swab",
    hoursAgo: 11,
    shareWithSimilar: true,
    answer: [
      "Hello, I moved from Porto in August and this is my first task in Finland. I am a microbiologist, so I set up the bench in the teaching lab where I volunteer.",
      "The checklist in the photo, in my order: hold the cartons and tell the warehouse. New kit lot, controls first. Wait until the steel is dry. Swab nozzle 3, the other nozzles and the gaskets, because the gasket is where milk hides after cleaning.",
      "If the re-test is clean but the first one was positive, I would still test a few cartons before release.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lab-bench-checklist.svg",
      alt: "A steel tray on a lab bench with six sealed swabs, a box of nitrile gloves and a clipboard with a handwritten checklist: hold cartons, call warehouse, new kit lot, controls, dry surface, all nozzles and gaskets.",
    },
    explainAnswers: [
      "Cartons labelled milk-free could leave the warehouse while we are still testing. A clean re-test now does not prove the line was clean at 06:00.",
      "Then it restarts with a product that contains milk. The milk-free run waits for my result.",
    ],
  },
  {
    id: "proof_food_04",
    person: "minh",
    challenge: "merituuli-swab",
    hoursAgo: 6,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Okay so first, the kit. Lot 2207 failed the positive control, so I do not use it, I open a new lot.",
      "Then I wait for the surface to dry, the AI says swab right after the sanitiser, that is wrong, the sanitiser can block the test.",
      "And I swab more places, the nozzles and the seals.",
      "I was in quality at a dairy plant in Vietnam for six years, milk on a changeover was my daily problem. Thank you.",
    ].join("\n"),
    explainAnswers: [
      "A kit that cannot see milk gives a clean result that means nothing, and the line would restart on it.",
      "If one pallet has shipped already, I call the customer today and ask them to hold it.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-merituuli",
      kind: "pass",
      feedback:
        "You named the failed control and the wet surface, and the call to the customer about the pallet is what we would do. The plan did not hold the cartons still in our own warehouse, and this role makes that call alone at night. A short written plan next time would help us see your order of steps.",
      hoursToReply: 2,
    },
  },
];
