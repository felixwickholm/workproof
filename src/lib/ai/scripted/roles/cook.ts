import type { RoleTemplate } from "../role-template";

export const cook: RoleTemplate = {
  id: "cook",
  title: "Cook",
  level: "practice",
  keywords: [
    "cook", "chef", "line cook", "sous chef", "kitchen", "restaurant", "catering", "barista", "cafe", "café",
    "kokki", "keittiö", "ravintola", "ravintolakokki", "suurtalouskokki",
  ],
  skills: ["food-safety", "serving-customers", "showing-the-work", "prioritisation"],
  cues: {
    prioritisation: ["fast", "quick", "on the line", "lunch rush"],
    "food-safety": ["clean", "station", "allergens", "cold chain"],
  },
  why: {
    "food-safety": "A guest who cannot eat an ingredient reacts to traces of it, not only to what can be seen.",
    "showing-the-work": "The food looks the same either way. The steps around it decide whether it is safe.",
  },
  lookFor: {
    "food-safety": "Finds where the allergen could reach the food, from the ingredients to shared tools, and keeps it apart.",
    "serving-customers": "Tells the guest plainly what was changed and what the order now contains.",
  },
  constraints: [
    "the gluten-free bread runs out at noon",
    "two more guests ask for the same dish at once",
    "the lunch line is twenty minutes behind",
    "the only clean fryer is the shared one",
  ],
  challenge: {
    title: "Plate today's lunch for a guest with coeliac disease",
    format: "build",
    proofKind: "photo",
    brief:
      "A regular lunch guest has coeliac disease and ordered today's fish plate. Our kitchen app wrote the line card below from the recipe system. Please plate the lunch for this guest, or plan exactly how you would, using the card and the kitchen notes. This is a synthetic example from a training kitchen.",
    material: {
      kind: "text",
      title: "Line card, Wednesday lunch (synthetic)",
      body: [
        "Fish plate",
        "- Baked salmon, lemon and dill",
        "- Boiled potatoes",
        "- Cream sauce with dill (roux: butter and wheat flour)",
        "- Green salad with croutons and vinaigrette",
        "- Bread basket on the side",
        "",
        "Allergens (auto-filled): fish, milk",
        "",
        "Kitchen notes",
        "- Croutons are fried in the shared fryer with the breaded chicken.",
        "- Gluten-free rolls are in the freezer, top shelf, blue box.",
        "- Bread knife and board stay at the bread station.",
        "- Sauce is made once at 10:30 for the whole lunch.",
        "",
        "Guest note: coeliac disease, no other allergies.",
      ].join("\n"),
    },
    deliverable:
      "Take one photo of the plate from above, and one of anything you kept apart. Not of people. Or describe it in words or by voice. Tell us what you changed from the line card and why.",
    flaws: [
      {
        label: "a sauce thickened with wheat flour while the allergen line leaves gluten out",
        cues: ["sauce", "roux", "flour", "wheat", "allergen", "gluten", "thicken"],
      },
      {
        label: "croutons from the shared fryer on the salad",
        cues: ["crouton", "fryer", "salad", "breaded", "oil"],
      },
      {
        label: "the bread knife and board shared with ordinary bread",
        cues: ["knife", "board", "bread", "cross", "separate", "basket", "own plate"],
      },
    ],
  },
  taster: {
    title: "Check one café order",
    format: "review",
    proofKind: "writing",
    brief: "This order note comes from the café till.",
    material: {
      kind: "text",
      title: "Order note",
      body: [
        "Oat latte and a slice of carrot cake.",
        "Guest says: nut allergy, quite strong.",
        "Cake label: may contain traces of nuts.",
        "Milk frother: last used for almond milk.",
      ].join("\n"),
    },
    deliverable: "Tell us in words or by voice: what would you do before serving this order, and why?",
    flaws: [
      {
        label: "a cake that may contain nuts and a frother last used for almond milk",
        cues: ["cake", "traces", "may contain", "almond", "frother", "clean", "rinse", "ask", "nut"],
      },
    ],
  },
};
