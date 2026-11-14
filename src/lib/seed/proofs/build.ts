import type { SeedProof } from "../types";

/** Harjula Build's tiling and wiring tasks. Synthetic people and work; clips show hands and walls, never faces. */
export const BUILD_PROOFS: SeedProof[] = [
  {
    id: "proof_build_01",
    person: "dmytro",
    challenge: "harjula-tiling",
    hoursAgo: 160,
    shareWithSimilar: true,
    answer: [
      "In the video I put the 2 m level on the shower wall in three directions: horizontal, vertical, diagonal. Under the level there is a dip about 4 mm, I mark it with pencil. That needs filling before tiles, by eye you never see it.",
      "Then the moisture. The 92% reading is from before primer, so it says nothing now. I would measure the screed again, it was poured on Friday and that is too fresh for tiles on the floor.",
      "Membrane second coat was Tuesday 12:00, so tiling the wall is ok after Wednesday 12:00, not 7:00. Morning I would do the slope to the drain with a level and tape.",
      "I am still in Tallinn until December, I come to Espoo for work weeks. Dmytro",
    ].join("\n"),
    attachment: {
      kind: "video",
      src: "/demo/tiling-level.webm",
      poster: "/demo/tiling-level.jpg",
      seconds: 30,
      alt: "Hands hold a two-metre level across a bathroom wall. A pencil marks a dip under the level. The waterproofing membrane shows in the corner.",
    },
    explainAnswers: [
      "Flatness first because you check it before any product goes on. After membrane you cannot fix a dip without breaking it.",
      "If the client wants it two days earlier I still keep the drying times and tile the other walls first.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "meet",
      feedback:
        "You checked the wall in three directions and moved the start to Wednesday noon because of the membrane. That is exactly the call our team lead should have made. Let us meet at the site in Espoonlahti.",
      hoursToReply: 8.5,
      meeting: "accepted",
    },
  },
  {
    id: "proof_build_02",
    person: "abdirahman",
    challenge: "harjula-tiling",
    hoursAgo: 44,
    shareWithSimilar: true,
    answer: [
      "Video shows the moisture meter by the floor drain, it reads dry on the wall. Then tape along the floor, the fall to the drain is about 1 cm per metre, that is ok.",
      "But the screed is from Friday, the meter on the wall does not tell about the floor. I would not tile the floor before measuring the screed itself.",
      "Wall flatness I would check with a long level, not by eye.",
    ].join("\n"),
    attachment: {
      kind: "video",
      src: "/demo/tiling-moisture.webm",
      poster: "/demo/tiling-moisture.jpg",
      seconds: 20,
      alt: "Hands press a moisture meter to the wall near the floor drain and the display reads dry. A tape measure lies along the floor slope towards the drain.",
    },
    explainAnswers: [
      "The drain because water has to go there, if the slope is wrong all the tiling is wasted.",
      "If the meter is left at another site, I would wait and borrow one, not guess.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "pass",
      feedback:
        "Measuring the slope to the drain and keeping the floor screed separate from the wall reading are both things our crews skip. Our next tiling site needs a valid wet-room certificate from day one, and the course starts in January. Please send this again after it.",
      hoursToReply: 1.5,
    },
  },
  {
    id: "proof_build_03",
    person: "haider",
    challenge: "harjula-tiling",
    hoursAgo: 12,
    shareWithSimilar: false,
    spoken: true,
    answer: [
      "So, I would not start at seven. The membrane needs twenty-four hours and the second coat was at twelve, so earliest is twelve on Wednesday.",
      "Before that I check the wall with a level, and moisture again, because the old reading is before primer. And the floor slope, nobody measured it.",
      "I did bathrooms for eight years in Erbil before I came here, the same rules, only the products have other names.",
    ].join("\n"),
    explainAnswers: [
      "Because the time is the first thing in the plan that is wrong, and it decides the whole day.",
      "If the flat below has a damp ceiling I stop everything and check the membrane and the drain first.",
    ],
    spokenFollowUps: true,
  },
  {
    id: "proof_build_04",
    person: "tuomas",
    challenge: "harjula-wiring",
    hoursAgo: 60,
    shareWithSimilar: false,
    answer: [
      "Kuvassa rasia auki, johtimet kuorittu samaan mittaan ja kiinni liittimissä. Tester shows 0 V before I touched anything.",
      "Changes to the work order:",
      "- 1.5 mm² cable on a 16 A breaker is not ok. Use 2.5 mm² or change the protection.",
      "- Socket next to the sink needs a 30 mA RCD. F6 has none, so either add one or take the socket from a protected circuit.",
      "- F6 also feeds the bathroom fan according to the label, check that.",
      "- Lock off the breaker and tag it, tenant is home.",
      "- Test: continuity of the protective conductor, insulation resistance, polarity and RCD trip test. A kettle only tells it has power.",
      "Valmistuin sähköasentajaksi 2016, Tuomas H.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/wiring-socket.svg",
      alt: "An open wall box with a double socket. Brown, blue and green-yellow wires are stripped to the same length and fixed in the terminals. A voltage tester next to it shows 0 V.",
    },
    explainAnswers: [
      "Cable size first, because it is the one that can burn in the wall years later and nobody sees it.",
      "If the tenant needs power by evening, I leave the old socket on and connect the new one only after the RCD is in.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "meet",
      feedback:
        "Your list of tests is the one we fill in for the inspection record, and you spotted that F6 also feeds the bathroom fan. We would like to meet this week about the kitchen renovations starting in December.",
      hoursToReply: 0.5,
      meeting: "invited",
    },
  },
  {
    id: "proof_build_05",
    person: "dmytro",
    challenge: "harjula-wiring",
    hoursAgo: 26,
    shareWithSimilar: true,
    answer: [
      "Photo of the board: I lock F6 off with my own padlock and tag, because the tenant is at home and the board is in the hallway.",
      "Then I prove it is dead with the tester at the socket. Only then I open the box.",
      "The circuit has no RCD and the socket is by the sink, so I would ask to change F6 to an RCD breaker.",
      "In Ukraine I worked as electrician 10 years, here I wait for my Finnish qualification papers.",
    ].join("\n"),
    attachment: {
      kind: "photo",
      src: "/demo/wiring-board.svg",
      alt: "A small distribution board with the cover off: main switch, a residual current device and six labelled breakers. One breaker is locked off with a padlock and a tag.",
    },
    explainAnswers: [
      "Lock off first, because the work order says not needed and that is how people get hurt.",
      "If the tester battery is flat I do not start. I go and get a battery.",
    ],
    decision: {
      companyId: "co-harjula",
      kind: "pass",
      feedback:
        "Locking off and proving dead before opening the box is how we want every job to start. On our sites the electrician signs the inspection record, so we need the Finnish qualification in place first. Your tiling proof is still with us, and we meet you about that one.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_build_06",
    person: "abdirahman",
    challenge: "harjula-wiring",
    hoursAgo: 6,
    shareWithSimilar: true,
    answer: [
      "I am not a full electrician yet, I am in my second year at the vocational school, so I describe in words.",
      "The work order is missing three things: the breaker should be locked, not only switched off. The socket by the sink should have RCD. And the cable from lighting is too thin for 16 A.",
      "Test with a proper tester, not with a kettle.",
    ].join("\n"),
    explainAnswers: [
      "I started with the lock because my teacher always says the first job is to stay alive.",
      "If the old wiring has no earth, I would stop and ask the supervisor before connecting anything.",
    ],
  },
];
