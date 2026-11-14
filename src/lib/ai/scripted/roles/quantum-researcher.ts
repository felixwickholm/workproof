import type { RoleTemplate } from "../role-template";

export const quantumResearcher: RoleTemplate = {
  id: "quantum-researcher",
  title: "Quantum and deep-tech researcher",
  keywords: [
    "quantum", "qubit", "quantum computing", "deep tech", "deep-tech", "physicist", "research scientist",
    "phd researcher", "kvantti", "kvanttitutkija", "kvanttilaskenta", "tutkija", "fyysikko",
  ],
  skills: ["scientific-reasoning", "experiment-design", "technical-explanation", "ai-assisted-work"],
  why: {
    "scientific-reasoning": "Our customers and investors act on our results, so each claim has to match its evidence.",
    "experiment-design": "A result without a baseline or error bars cannot tell progress from noise.",
  },
  lookFor: {
    "scientific-reasoning": "Checks whether the data supports the claim and names the missing control or baseline.",
    "experiment-design": "Proposes a concrete rerun or comparison that would settle the question.",
  },
  constraints: [
    "you had machine time for only one more run",
    "the summary would be read by investors, not physicists",
    "the chip was recalibrated between the two runs",
    "the paper deadline was in three days",
  ],
  challenge: {
    title: "Review an AI-drafted results summary",
    format: "review",
    brief:
      "We tested a new error mitigation method on our 20-qubit chip. A teammate asked an AI assistant to turn the lab notes into the summary below for our newsletter to partners. It goes out on Friday. Please check whether the claims hold.",
    material: {
      kind: "text",
      title: "Results summary: error mitigation trial",
      body: [
        "Method: we ran the 12-qubit benchmark circuit with our new mitigation method.",
        "Circuit: 12 qubits, depth 40, two-qubit gate error about 0.6%.",
        "Run date: Tuesday, after the weekly recalibration.",
        "Hardware: the same chip as in August, with two couplers replaced in October.",
        "",
        "Result: average circuit fidelity 0.91 with mitigation.",
        "Previous result without mitigation (run in August): 0.78.",
        "Number of runs: 1 run of 2,000 shots.",
        "",
        "Conclusion: the new method improves fidelity by 17% and removes the",
        "main source of error on our hardware. We expect the same gain on",
        "larger circuits and on our next-generation 100-qubit chip.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this goes out, and why? List the changes in order of importance.",
    flaws: [
      {
        label: "the comparison with an August baseline on a differently calibrated chip",
        cues: ["baseline", "august", "recalibrat", "same day", "same conditions", "control", "side by side", "different conditions"],
      },
      {
        label: "a single run with no error bars",
        cues: ["one run", "single run", "1 run", "error bar", "variance", "uncertainty", "repeat", "noise", "confidence interval", "statistic"],
      },
      {
        label: "the claim that the gain carries over to larger circuits and chips",
        cues: ["extrapolat", "larger circuits", "100-qubit", "generali", "overclaim", "not shown", "next-generation", "removes the main source"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a lab claim",
    format: "review",
    brief: "An AI assistant summarised a colleague's measurement for a slide.",
    material: {
      kind: "text",
      title: "Slide text",
      body: [
        "Qubit coherence time: 210 microseconds.",
        "This is twice the previous chip.",
        "Measured on the one qubit that worked well this week.",
      ].join("\n"),
    },
    deliverable: "Would you put this claim on the slide as written? Why or why not?",
    flaws: [
      {
        label: "a claim drawn from one selected qubit",
        cues: ["one qubit", "single qubit", "selected", "cherry", "cherry-pick", "all qubits", "median", "average", "representative"],
      },
    ],
  },
};
