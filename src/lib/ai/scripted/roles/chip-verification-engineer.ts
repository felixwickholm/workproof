import type { RoleTemplate } from "../role-template";

export const chipVerificationEngineer: RoleTemplate = {
  id: "chip-verification-engineer",
  title: "Chip design or verification engineer",
  level: "degree",
  keywords: [
    "chip design", "chip designer", "verification engineer", "design verification", "asic", "asic engineer", "fpga engineer",
    "rtl", "rtl engineer", "digital design engineer", "physical design", "semiconductor", "soc", "timing closure",
    "piirisuunnittelija", "piirisuunnittelu", "puolijohde", "verifiointi",
  ],
  skills: ["timing-analysis", "digital-design", "prioritisation", "technical-explanation", "code-review"],
  cues: {
    "timing-analysis": ["sign-off", "clock targets", "paths that fail"],
    "digital-design": ["tape-outs", "blocks"],
    prioritisation: ["try first"],
  },
  why: {
    "timing-analysis": "A path that misses timing fails on every chip we make, so it must be found before the design is sent to the factory.",
    "digital-design": "The fix is in the logic: a step moved, a stage added, or less work in one clock cycle.",
    prioritisation: "Some fixes cost speed for the whole chip. The first thing to try should cost the least.",
  },
  lookFor: {
    "timing-analysis": "Names the failing paths and their negative slack, and leaves the paths that pass alone.",
    "digital-design": "Proposes a change to the logic and says what it costs, such as one more cycle of delay.",
    prioritisation: "Tries the change that fixes the path for the least cost before slowing the clock.",
    "technical-explanation": "Explains the fix so a project manager understands what it means for the schedule.",
  },
  constraints: [
    "the block may not take one more clock cycle",
    "the design goes to the factory in two weeks",
    "the hold slack gets worse after your change",
    "the customer needs the full 800 MHz",
  ],
  challenge: {
    minutes: 15,
    title: "Which part of this chip is too slow?",
    format: "read",
    proofKind: "writing",
    brief:
      "We design chips for radio equipment. Our multiply block must run at 800 MHz, and here is last night's timing report. Which path fails, and what would you try first? This is a synthetic report.",
    material: {
      kind: "text",
      title: "Timing report, block mac_unit, clock 800 MHz, period 1.250 ns (synthetic)",
      body: [
        "Corner: slow, 0.72 V, 125 °C. Setup check. Times in ns.",
        "",
        "Path  From          To                    Required  Arrival   Slack",
        "1     acc_reg[31]   out_reg[31]             1.180     1.105    0.075",
        "2     a_reg[7]      mult/prod_reg[15]       1.180     1.342   -0.162  VIOLATED",
        "3     b_reg[3]      mult/prod_reg[12]       1.180     1.301   -0.121  VIOLATED",
        "4     cfg_reg[2]    fsm/state_reg[1]        1.180     0.640    0.540",
        "5     in_valid      in_reg[0]               1.180     1.170    0.010",
        "",
        "Path 2 in detail",
        "  a_reg[7] clock to output           0.090",
        "  16 x 16 multiplier, one stage      1.020",
        "  rounding adder                     0.180",
        "  wire to prod_reg                   0.052",
        "",
        "Hold check: all paths met. Worst hold slack +0.021.",
        "Designer's note: \"We can drop the clock to 700 MHz if needed.\"",
      ].join("\n"),
    },
    deliverable: "Name the failing path and by how much, then say what you would try first and what it costs.",
    flaws: [
      {
        label: "paths 2 and 3 fail setup through the one-stage multiplier",
        cues: ["path 2", "path 3", "-0.162", "-0.121", "0.162", "multiplier", "mult", "setup", "violated"],
      },
      {
        label: "the rounding adder that can move to the next stage",
        cues: ["adder", "rounding", "0.180", "pipeline", "retim", "next stage", "register", "extra stage"],
      },
      {
        label: "a slower clock that would cost speed for the whole block",
        cues: ["700", "clock", "frequency", "slow down", "throughput", "last resort"],
      },
    ],
  },
  taster: {
    title: "Which path fails?",
    format: "read",
    proofKind: "writing",
    brief: "Two lines from a timing report. Clock 1 GHz, so 1.0 ns per cycle (synthetic).",
    material: {
      kind: "text",
      title: "Timing report",
      body: [
        "Path A: required 0.93 ns, arrival 0.95 ns",
        "Path B: required 0.93 ns, arrival 0.60 ns",
      ].join("\n"),
    },
    deliverable: "Which path fails, and by how much?",
    flaws: [
      {
        label: "path A arrives 0.02 ns too late",
        cues: ["path a", "0.02", "20 ps", "late", "negative", "fails"],
      },
    ],
  },
};
