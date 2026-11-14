import type { RoleTemplate } from "../role-template";

export const projectManager: RoleTemplate = {
  id: "project-manager",
  title: "Technical project manager",
  level: "degree",
  keywords: [
    "project manager", "technical project manager", "project management", "delivery manager",
    "program manager", "scrum master", "projektipäällikkö", "projektinhallinta", "projektikoordinaattori",
  ],
  skills: ["planning", "risk-management", "stakeholder-communication", "prioritisation"],
  why: {
    planning: "The customer pilot date is fixed, so the plan has to be honest about what fits.",
    "risk-management": "This project depends on a supplier and a security review, and both can slip.",
  },
  lookFor: {
    planning: "Checks the order of tasks and dependencies against the fixed date.",
    "risk-management": "Names the risks that would move the date and gives each an owner or a check.",
  },
  constraints: [
    "the supplier confirms the API one week late",
    "one of the two backend developers is away for two weeks",
    "the customer asks to move the pilot one week earlier",
    "the security review team can only start in week 5",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-drafted project plan",
    format: "fix",
    proofKind: "plan",
    brief:
      "We are connecting our billing service to a customer's fleet sensor platform. The pilot starts on 2 March and the date cannot move. A colleague used an AI assistant to draft the plan below. It goes to the customer tomorrow. Please read it before it does.",
    material: {
      kind: "text",
      title: "Sensor integration plan, 8 weeks",
      body: [
        "Week   Task                                   Owner",
        "1      Kick-off with customer                 Aino (PM)",
        "1-2    Design data mapping                    Backend team",
        "2-4    Build integration service              Backend team",
        "3      Receive sensor API access from vendor  (not set)",
        "4-5    Build alerts in the app                Mobile team",
        "6      Security review                        IT security",
        "7      Customer acceptance testing            Customer",
        "8      Pilot go-live on 2 March               Aino (PM)",
        "",
        "Assumptions",
        "- Vendor API documentation is complete",
        "- Customer testers are available in week 7",
        "",
        "Risks",
        "- None identified at this stage",
        "",
        "Status reporting: monthly email to the customer.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this plan goes to the customer, and why? Keep it to the changes that matter most.",
    flaws: [
      {
        label: "the build that starts in week 2 while vendor API access arrives in week 3",
        cues: ["api access", "vendor", "week 3", "dependency", "depends", "before access", "blocked", "order"],
      },
      {
        label: "the missing owner for the vendor API access",
        cues: ["owner", "not set", "nobody", "who is responsible", "unassigned", "no owner"],
      },
      {
        label: "a plan with no buffer and no named risks",
        cues: ["buffer", "slack", "no risks", "none identified", "contingency", "margin", "slip", "monthly"],
      },
    ],
  },
  taster: {
    title: "Check a status update",
    format: "fix",
    proofKind: "writing",
    brief: "This status update goes to a customer today.",
    material: {
      kind: "text",
      title: "Status update",
      body: [
        "Overall status: green.",
        "Integration service: 60% done.",
        "Vendor API access: still waiting, asked again on Monday.",
        "Go-live: on track for 2 March.",
      ].join("\n"),
    },
    deliverable: "What would you change in this update before it goes out, and why?",
    flaws: [
      {
        label: "a green status while a blocking dependency is still open",
        cues: ["green", "waiting", "amber", "blocked", "dependency", "on track", "risk", "honest"],
      },
    ],
  },
};
