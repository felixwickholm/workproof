import type { RoleTemplate } from "../role-template";

export const hardwareTestEngineer: RoleTemplate = {
  id: "hardware-test-engineer",
  title: "Hardware and embedded test engineer",
  level: "degree",
  keywords: [
    "hardware test engineer", "embedded test engineer", "hardware engineer", "electronics engineer", "electronics",
    "pcb", "test bench", "validation engineer", "hardware testing", "electronics design", "elektroniikka",
    "elektroniikkasuunnittelija", "laitesuunnittelija", "elektroniikkainsinööri",
  ],
  skills: ["embedded-constraints", "testing", "showing-the-work", "safety-thinking"],
  cues: {
    testing: ["measurements", "probe", "multimeter", "fault finding"],
    "showing-the-work": ["bench work", "on the bench"],
  },
  why: {
    "embedded-constraints": "A sensor line can die in the cable, the connector, the board or the firmware, and each needs a different fix.",
    "showing-the-work": "On a bench, the order of the measurements decides whether you find the fault or make a new one.",
  },
  lookFor: {
    testing: "Measures from the sensor end towards the processor, one point at a time, and says what each reading means.",
    "safety-thinking": "Limits the bench supply current and checks for a short before powering the board.",
    "showing-the-work": "Shows each probe point in order and says which reading would move the search to the next point.",
  },
  constraints: [
    "the board has no test points near the connector",
    "the spare sensor is from a different batch",
    "the robot has to be back at the site by 14:00",
    "the oscilloscope is in use by another team",
  ],
  challenge: {
    title: "Find the dead sensor line on this board",
    format: "build",
    proofKind: "video",
    brief:
      "One of our pick robots stopped at a cold-storage site: the gripper's sensor S3 reads zero. The field team swapped the sensor, and S3 still reads zero. The sensor board is now on your bench with the note below, which an AI assistant summarised from the field ticket. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Bench note, gripper sensor board rev C (synthetic)",
      body: [
        "Board: gripper sensor board rev C, from robot 7",
        "Supply: 24 V in, 3.3 V regulator on the board",
        "Sensors S1-S4 on connector J3, pins 1-4. Shared ground on pin 6.",
        "Each line: J3 pin, 1 kΩ resistor, filter capacitor, ADC input",
        "",
        "Field ticket (AI summary)",
        "- S3 reads 0 in the log since 03:12. S1, S2 and S4 normal.",
        "- Sensor S3 swapped at 09:40. Still 0.",
        "- Robot works in a -25 °C freezer. Cable bent hard at the gripper.",
        "",
        "Suggested bench steps (AI draft)",
        "- Power the board at 24 V, current limit at maximum.",
        "- Measure the ADC input first. If it is 0 V, the processor is faulty.",
        "- Order a new processor board.",
        "",
        "On the bench: supply, multimeter, oscilloscope, spare harness",
      ].join("\n"),
    },
    deliverable:
      "Film 30 seconds of how you probe the board to find the dead line. Hands and board only, not your face. Or describe it in words or by voice. Tell us the order of your measurements and what each reading would tell you.",
    flaws: [
      {
        label: "the board powered at full current limit before checking for a short",
        cues: ["current limit", "limit", "short", "maximum", "smoke", "fuse", "low current", "100 ma", "resistance first"],
      },
      {
        label: "measuring at the processor first and blaming it, instead of following the line from the connector",
        cues: ["j3", "pin 3", "connector", "resistor", "capacitor", "follow", "from the sensor", "continuity", "1 k"],
      },
      {
        label: "the cold, bent harness, the likelier cause once a new sensor did not help",
        cues: ["harness", "cable", "bent", "cold", "crimp", "spare harness", "wire", "freezer"],
      },
    ],
  },
  taster: {
    title: "Read one bench note",
    format: "review",
    proofKind: "writing",
    brief: "A note left on the test bench.",
    material: {
      kind: "text",
      title: "Bench note",
      body: [
        "Sensor S2 reads zero.",
        "New sensor fitted: still zero.",
        "Next step: replace the main board.",
      ].join("\n"),
    },
    deliverable: "What would you check before replacing the main board, and why?",
    flaws: [
      {
        label: "a board replaced before the cable and the connector were checked",
        cues: ["cable", "connector", "harness", "wire", "continuity", "multimeter", "measure", "crimp", "pin"],
      },
    ],
  },
};
