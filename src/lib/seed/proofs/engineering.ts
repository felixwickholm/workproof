import type { SeedProof } from "../types";

/**
 * Harjula Engineering's wall opening task. Synthetic people and work; the photos show hand sketches, never a
 * face. Harjula has not answered any of them yet: it is the event's quiet employer.
 */
export const ENGINEERING_PROOFS: SeedProof[] = [
  {
    id: "proof_beam_01",
    person: "dmytro",
    challenge: "harjula-opening",
    hoursAgo: 130,
    shareWithSimilar: true,
    answer: [
      "Sketch in the photo. Changes to the note:",
      "- Loads: wall W4b on floor 4 stands right above the opening. It is a line load on the slab and part of it comes down on W4. The draft says nothing stands above, that is wrong.",
      "- Bearing: 100 mm straight on 1968 block is not enough. Concrete padstones under both ends, bearing 200 mm, and check the block under them.",
      "- Order of work: needles through the wall above the opening with props on both sides first, then cut, beam in, grout, props out after the grout has cured.",
      "I did openings like this for four years at Rakennekulma Oy.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/sketch-opening-beam.svg",
      alt: "A hand sketch on squared paper: the wall elevation with a 2.4 m opening, a steel beam above it on concrete padstones at both ends, two props with needles through the wall above, and load arrows from the floor above, labelled W4b.",
    },
    thinkAloud: {
      transcript:
        "Right, the note. Slab load, half on W4, okay, that part is fine. Nothing else stands above... let me check the archive line. No, W4b is right on top of the opening. So the beam is too small, or at least not checked. Then the ends, a hundred millimetres on old block. That's not a bearing, that's a hope. Padstones. And the work order, cut first and then the beam? No. Needles and props first, I'll draw those in red.",
      seconds: 780,
    },
    explainAnswers: [
      "W4b first, because the beam size depends on it and everything else follows from the beam.",
      "One week works if the needles and props go in on Monday and the beam is on site the same day. I would not shorten the time the grout needs before the props come out.",
    ],
  },
  {
    id: "proof_beam_02",
    person: "kwame",
    challenge: "harjula-opening",
    hoursAgo: 100,
    shareWithSimilar: false,
    answer: [
      "The photo shows my sketch of the temporary works, numbered in the order the site team does them:",
      "1. Props under the slab on both sides of W4, 1 m from the wall.",
      "2. Two needles through W4 above the opening, each on two props.",
      "3. Cut the opening.",
      "4. Beam on padstones, grout, wait for the grout to cure, then remove the needles.",
      "The beam needs a check with the wall W4b load. I have designed openings like this in block buildings for nine years, and old block is often not as strong as the drawing says.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/sketch-opening-props.svg",
      alt: "A pencil section sketch on squared paper: wall W4 with two horizontal needles through it, each resting on a prop on both sides, and the opening cut below. Steps 1 to 4 are written in the margin.",
    },
    thinkAloud: {
      transcript:
        "The draft says no props needed. For a two point four metre opening. Okay, so that's where I start. Props first, then needles. Two needles, I think. Maybe three? No, two is enough at this width if they sit close to the ends. Number the steps so the site can't do them in the wrong order. Then the beam. The beam, hmm, I'm not sizing it, I'll just say it needs the W4b load in it.",
      seconds: 640,
    },
    explainAnswers: [
      "The draft left the temporary works out completely, and the cut is the moment the wall above has nothing to stand on.",
      "Then I go up to floor 4 and look at what stands on the slab, and I size the needles for the heaviest case until I know.",
    ],
  },
  {
    id: "proof_beam_03",
    person: "johan",
    challenge: "harjula-opening",
    hoursAgo: 60,
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
    thinkAloud: {
      transcript:
        "So I'll follow the load down, that's what we always do in class. Slab, six and a half kilonewtons, half of it on W4. Wait, the archive drawing at the bottom. There's a wall on floor four, right above. The note says nothing stands above, so the note is wrong. Arrows from W4b down. Into the beam, both ends, block. A hundred millimetres at the end feels short. I don't know the block strength, so I'll ask for a check.",
      seconds: 860,
    },
    explainAnswers: [
      "I started from the loads because the note said nothing stands above, and that is the first thing I could check myself.",
      "Then two smaller beams side by side, each lifted in on its own and bolted together, and each end still on a padstone.",
    ],
  },
];
