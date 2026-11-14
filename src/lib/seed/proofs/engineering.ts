import type { SeedProof } from "../types";

/**
 * Tuulos Robotics' sensor board task and Harjula Engineering's wall opening task. Synthetic people and work;
 * the clip shows hands and a board, the photos show hand sketches, never a face.
 */
export const ENGINEERING_PROOFS: SeedProof[] = [
  {
    id: "proof_board_01",
    person: "dmytro",
    challenge: "tuulos-board",
    hoursAgo: 90,
    shareWithSimilar: true,
    answer: [
      "In the clip, step by step:",
      "1. Board unpowered. Resistance from 3.3 V to ground first, no short. Then the supply goes on at 24 V with the limit at 100 mA, not at maximum.",
      "2. Probe J3 pin 3 with the sensor connected: 0 V. Pin 2, the working line: 1.8 V. So the signal never reaches the board.",
      "3. Power off, continuity from the sensor end to J3 pin 3 through the harness: open when I bend it near the gripper.",
      "So the fault is the harness, most likely a cracked crimp from the cold. The processor is fine, no need to order a board.",
      "Ten years testing measuring instruments in Kharkiv before 2022. Dmytro",
    ].join("\n"),
    attachment: {
      kind: "video",
      src: "/demo/board-probe.webm",
      poster: "/demo/board-probe.jpg",
      seconds: 24,
      alt: "Hands in gloves hold multimeter probes on a green sensor board. The red probe moves from pin 3 to pin 2 of a white connector and the meter reads 0.00 V, then 1.80 V. Then the harness is bent near the connector while the meter beeps on and off.",
    },
    explainAnswers: [
      "Because a short on a board at full current turns one dead line into a dead board. If the meter shows a few ohms instead of kilo-ohms, I stop there.",
      "Not much changes: this fault is a missing voltage, and a multimeter finds that. I would need the scope only if the line showed noise instead of zero.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "meet",
      feedback:
        "You set the current limit before powering the board and followed the line from the connector instead of blaming the processor. Bending the harness while measuring found the crack our field team missed. Let us meet at the lab in Kera.",
      hoursToReply: 8.5,
      meeting: "invited",
    },
  },
  {
    id: "proof_board_02",
    person: "daniel",
    challenge: "tuulos-board",
    hoursAgo: 44,
    shareWithSimilar: true,
    answer: [
      "No clip from me, I describe it in words.",
      "I would not start at the ADC. I start where the field team already changed something: the sensor end. If the new sensor still reads zero, the fault is between the sensor and the board.",
      "With power off: continuity on the S3 wire from the sensor plug to J3 pin 3, while moving the cable at the bend. Then the 1 kΩ resistor. Only then power on, at a low current limit, and measure at the ADC pin.",
      "I studied electronics engineering in Enugu before I moved into backend work.",
    ].join("\n"),
    explainAnswers: [
      "Because a continuity test with the power off cannot damage anything, and the swap already told us the sensor is fine.",
      "If the spare sensor is from a different batch, I would check its output on S1 first, where the line is known to work.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      feedback:
        "Moving the cable while you test continuity is exactly how this fault shows up, and starting from the sensor end is the right order. This role spends most days at the test bench with our oscilloscope, and we need someone who has done that work recently. Your backend proof for Kivira is a good place to keep going.",
      hoursToReply: 1.5,
    },
  },
  {
    id: "proof_board_03",
    person: "kristjan",
    challenge: "tuulos-board",
    hoursAgo: 12,
    shareWithSimilar: false,
    spoken: true,
    answer: [
      "So, I would not power it at maximum current, I set the limit low, maybe one hundred milliamps, and check there is no short first.",
      "Then I measure from the connector, pin three against the shared ground on pin six, and compare with pin two, which works.",
      "And honestly the cable is my first guess, the robot was in minus twenty-five and the cable was bent, and the new sensor did not help.",
      "I did my bachelor's in mechatronics at TalTech before I went into data work.",
    ].join("\n"),
    explainAnswers: [
      "Because the current limit is the one step that cannot be undone if I skip it. The rest is finding the fault.",
      "Then I check the spare on a line that works first, so a different output level does not look like a fault.",
    ],
    spokenFollowUps: true,
  },
  {
    id: "proof_beam_01",
    person: "tuomas",
    challenge: "harjula-opening",
    hoursAgo: 60,
    shareWithSimilar: false,
    answer: [
      "Luonnos kuvassa. Changes to the note:",
      "- Loads: wall W4b on floor 4 stands right above the opening. It is a line load on the slab and part of it comes down on W4. The AI draft says nothing stands above, that is wrong.",
      "- Bearing: 100 mm straight on 1968 block is not enough. Concrete padstones under both ends, bearing 200 mm, and check the block under them.",
      "- Order of work: needles through the wall above the opening with props on both sides first, then cut, beam in, grout, props out after the grout has cured.",
      "Valmistuin rakennusinsinööriksi 2016, Tuomas H.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/sketch-opening-beam.svg",
      alt: "A hand sketch on squared paper: the wall elevation with a 2.4 m opening, a steel beam above it on concrete padstones at both ends, two props with needles through the wall above, and load arrows from the floor above, labelled W4b.",
    },
    explainAnswers: [
      "W4b first, because the beam size depends on it and everything else follows from the beam.",
      "One week works if the needles and props go in on Monday and the beam is on site the same day. I would not shorten the time the grout needs before the props come out.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "meet",
      feedback:
        "Your sketch shows the needles and props before the cut, the padstones and the load from W4b, and a site team could build from it. We would like to meet this week about the balcony and opening projects starting in December.",
      hoursToReply: 0.5,
      meeting: "invited",
    },
  },
  {
    id: "proof_beam_02",
    person: "haider",
    challenge: "harjula-opening",
    hoursAgo: 26,
    shareWithSimilar: true,
    answer: [
      "The photo shows my sketch of the temporary works, numbered in the order the site team does them:",
      "1. Props under the slab on both sides of W4, 1 m from the wall.",
      "2. Two needles through W4 above the opening, each on two props.",
      "3. Cut the opening.",
      "4. Beam on padstones, grout, wait for the grout to cure, then remove the needles.",
      "The beam needs a check with the wall W4b load. I designed openings like this in concrete block buildings in Erbil for nine years, the old block is often not as strong as the drawing says.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/sketch-opening-props.svg",
      alt: "A pencil section sketch on squared paper: wall W4 with two horizontal needles through it, each resting on a prop on both sides, and the opening cut below. Steps 1 to 4 are written in the margin.",
    },
    explainAnswers: [
      "The AI draft left the temporary works out completely, and the cut is the moment the wall above has nothing to stand on.",
      "Then I go up to floor 4 and look at what stands on the slab, and I size the needles for the heaviest case until I know.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "pass",
      feedback:
        "Your sequence for the temporary works is clear enough to hand to a site team as it is. In this role the designer signs the structural drawings for the building permit, and that needs a Finnish designer qualification we cannot wait for this winter. Please send this again once the qualification is in progress.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_beam_03",
    person: "abdirahman",
    challenge: "harjula-opening",
    hoursAgo: 6,
    shareWithSimilar: true,
    answer: [
      "I am in my last year of civil engineering at Metropolia, so this is my sketch of the loads.",
      "The note forgets W4b. A partition on the slab above the opening adds a line load, so the beam carries the slab and the wall. I drew the load path: W4b, slab, beam, both ends, block, down to the foundation.",
      "The ends need more than 100 mm. I would ask for a bearing check on the old block, and padstones.",
      "And nobody should cut before the wall is propped.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/sketch-opening-loads.svg",
      alt: "A hand sketch on squared paper of a load path: arrows from wall W4b on the floor above down through the slab into a beam over the opening, then into both ends and down the wall. Notes in the margin read padstones and check bearing.",
    },
    explainAnswers: [
      "I started from the loads because the AI draft said nothing stands above, and that is the first thing I could check myself.",
      "Then two smaller beams side by side, each lifted in on its own and bolted together, and each end still on a padstone.",
    ],
  },
];
