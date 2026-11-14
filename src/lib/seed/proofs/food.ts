import type { SeedProof } from "../types";

/** Merituuli Kitchen's lunch task. Synthetic people and work; photos show plates, never people. */
export const FOOD_PROOFS: SeedProof[] = [
  {
    id: "proof_food_01",
    person: "thiago",
    challenge: "merituuli-plate",
    hoursAgo: 140,
    shareWithSimilar: true,
    answer: [
      "Photo 1 is the plate, photo 2 is the board and knife I kept apart.",
      "1. The sauce has a roux with wheat flour, so it cannot go on this plate. I made a small pan of the sauce with cornstarch and kept a separate whisk for it.",
      "2. No croutons. They come from the shared fryer with the breaded chicken, so even picking them off is not enough. Salad has only vinaigrette.",
      "3. Bread: one gluten-free roll from the blue box, warmed in its own bag, on its own plate with a green label, and a clean blue board and knife.",
      "Also the allergen line says fish, milk. It should say gluten in the normal sauce, I would fix the card for the next guest.",
      "I worked at Ravintola Kuusi for four years, we had the same problem with sauces. Thiago",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lunch-salmon.svg",
      alt: "Plate from above: baked salmon, boiled potatoes with dill, green salad and a lemon wedge. A gluten-free bread roll sits on its own small plate with a green label. A blue chopping board and knife lie apart at the edge.",
    },
    explainAnswers: [
      "The sauce first, because it looks safe and the card says nothing. Croutons you can see, flour in a sauce you cannot.",
      "Then I would plate this guest first, before the rush, and keep the small pan on the back burner with a lid and a label.",
    ],
    decision: {
      companyId: "co-merituuli",
      kind: "meet",
      feedback:
        "You made a separate sauce instead of leaving it off, and you noticed the allergen line on our card is wrong. We fixed the card the same day. Come and cook one lunch service with us.",
      hoursToReply: 3,
      meeting: "met",
    },
  },
  {
    id: "proof_food_02",
    person: "linh",
    challenge: "merituuli-plate",
    hoursAgo: 52,
    shareWithSimilar: false,
    answer: [
      "I changed the dish a bit. The fish plate has too many risks in a busy line, so I plated the chicken stew from the second line card on rice, with carrots and peas, no sauce from the main pot.",
      "Card on the plate edge says gluteeniton / gluten-free so the waiter does not mix it with the normal plate.",
      "No bread at all, because the bread knife and board are shared. Better nothing than a crumb.",
      "If the guest really wants the salmon, I need to know first if the roux is the only flour. Then ok.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lunch-chicken.svg",
      alt: "Plate from above: chicken and vegetable stew on rice, with steamed carrots and peas. A small card at the plate edge reads 'Gluteeniton / Gluten-free'. No bread on the plate.",
    },
    explainAnswers: [
      "I looked at the shared tools first. In my last kitchen most mistakes came from the bread station.",
      "With more time I would ask the guest if they want the stew or wait ten minutes for a safe salmon plate.",
    ],
    decision: {
      companyId: "co-merituuli",
      kind: "pass",
      feedback:
        "The label at the plate edge is something our waiters asked for last week. The guest ordered the fish plate, and in this job the cook makes the ordered dish safe rather than swapping it. Your rule of no bread when the tools are shared is one we use too.",
      hoursToReply: 5.5,
    },
  },
  {
    id: "proof_food_03",
    person: "mariana",
    challenge: "merituuli-plate",
    hoursAgo: 30,
    shareWithSimilar: true,
    answer: [
      "Hello, I moved from Porto in August and this is my first task in Finland, so sorry for my English.",
      "I did not have salmon at home so I plated the soup of the day the way I would do it: vegetable soup with cream, no flour, I thicken with potato. Crispbread gluten-free on a separate plate so it does not get wet and nobody puts normal bread there.",
      "The ladle stays in its own pot with a label. In a lunch line people use one ladle for two soups and that is the problem.",
      "For the fish plate: sauce with flour, croutons, bread knife. All three I would change.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/lunch-soup.svg",
      alt: "Bowl from above: creamy vegetable soup with herbs, and a gluten-free crispbread on a separate side plate. The ladle rests in its own labelled pot.",
    },
    explainAnswers: [
      "Because the ladle is the thing I saw go wrong most in Portugal, also in good kitchens.",
      "If the line is late I keep the guest's bowl ready first, covered, with the label on it.",
    ],
  },
  {
    id: "proof_food_04",
    person: "minh",
    challenge: "merituuli-plate",
    hoursAgo: 20,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Okay so first the sauce, it has wheat flour, the card says only fish and milk, that is wrong, so this guest gets no sauce or a new one without flour.",
      "Croutons out, they are in the same oil as the chicken.",
      "Bread, I take the gluten-free roll from the freezer and I use a clean knife, not the one at the bread station.",
      "I came to Espoo from Hanoi last year and in my restaurant there we did not have coeliac guests so often, but here I learned it in the hygiene course. Thank you.",
    ].join("\n"),
    explainAnswers: [
      "The sauce because it is hidden, the guest cannot see it.",
      "If there is no time for a new sauce I give lemon and butter on the side. Simple is safe.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-merituuli",
      kind: "pass",
      feedback:
        "You named the sauce, the fryer and the bread knife, and the lemon and butter idea is what we do on busy days. We need someone who can also run the plating of the dish, and a photo or a description of the plate would help us see that. Please send one next time.",
      hoursToReply: 2,
    },
  },
];
