import type { SeedProof } from "../types";

/**
 * Work for the timing-report challenge the city made for Kide Silicon from its job ad. The company has not
 * opened the challenge yet, so every proof here still waits: "We made a challenge for you."
 */
export const CHIP_PROOFS: SeedProof[] = [
  {
    id: "proof_chip_01",
    person: "ravi",
    challenge: "kide-timing",
    hoursAgo: 110,
    shareWithSimilar: true,
    answer: [
      "Fails: path 2 (-0.162 ns) and path 3 (-0.121 ns). Both go through the 16x16 multiplier in one stage.",
      "Try first: move the rounding adder (0.180 ns) into the next register stage. Path 2 then arrives at 1.162 ns against 1.180 required, so +0.018 ns. Tight, so I would re-run all corners.",
      "If that is not enough: split the multiplier into two pipeline stages. Clean margin, but one more cycle of latency, so the block owner must agree.",
      "Last choice: 700 MHz. It fixes everything and slows the whole block by 12.5%.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, two violated lines. Path two, minus 0.162, path three, minus 0.121, both into prod_reg, so it's the multiplier. Let me look at the detail. Clock to Q 0.09, multiplier 1.02, adder 0.18, wire 0.05. If the adder goes to the next stage, 1.342 minus 0.180 is 1.162. Required 1.180. So plus 0.018. That's thin. Hmm, would I trust that at the slow corner? It is the slow corner. Okay, adder first, pipeline second, clock last.",
      seconds: 620,
    },
    explainAnswers: [
      "The adder move costs the least: no extra cycle if the next stage has room, and the clock stays at 800 MHz.",
      "If the block may not take one more cycle, the pipeline split is out, so I would push the adder move and check the next stage's own slack.",
    ],
  },
  {
    id: "proof_chip_02",
    person: "mei",
    challenge: "kide-timing",
    hoursAgo: 41,
    shareWithSimilar: false,
    answer: [
      "Path 2 fails by 0.162 ns. Path 3 fails by 0.121 ns. Same cause: the full multiply plus rounding in one cycle.",
      "First I would retime the rounding adder into the following stage. On paper that leaves +0.018 ns on path 2, which is very little margin.",
      "Cost: the stage after prod_reg gets 0.180 ns more work, so I would check its slack before anyone celebrates.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Mei here, starting. So the report... five paths, two red. Path two and three. Both end in mult. Okay so the multiplier is 1.020 by itself, that's most of the 1.25 period already. The adder after it, 0.180. If I take the adder out, path two is fine, just barely. But wait, where does the adder go? Into the next stage, and that stage has its own timing. I don't see it here. So I'd ask for that path before I promise anything.",
      seconds: 540,
    },
    explainAnswers: [
      "I started with the two violated lines, because everything else in the report passes.",
      "If the design goes to the factory in two weeks, I would take the adder move now and keep the pipeline split ready as a backup.",
    ],
  },
  {
    id: "proof_chip_03",
    person: "daniel",
    challenge: "kide-timing",
    hoursAgo: 95,
    shareWithSimilar: true,
    answer: [
      "The easy fix is in the designer's note: run at 700 MHz. The period becomes 1.429 ns and path 2 at 1.342 ns passes with room.",
      "Paths 2 and 3 are the ones that fail now. Nothing in the logic has to change, so it is quick.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, timing report. I did a course on this but it was a while ago. Violated, path two and three. Negative slack. So what makes it pass? Either the path gets shorter or the clock gets slower. The note says 700 is fine. One over 700 megahertz is, uh, 1.43 nanoseconds. Path two is 1.34. Yes, that passes. Path three also. Okay, that's the simplest, I'll write that.",
      seconds: 330,
    },
    explainAnswers: [
      "The note said 700 MHz was allowed, and it fixes both paths in one step.",
      "If the customer needs the full 800 MHz, then I would have to change the logic instead, maybe split the multiplier.",
    ],
  },
  {
    id: "proof_chip_04",
    person: "wei",
    challenge: "kide-timing",
    hoursAgo: 19,
    shareWithSimilar: true,
    answer: [
      "1. Failing: paths 2 and 3, setup, worst -0.162 ns. Hold is clean.",
      "2. Root cause: 16x16 multiply (1.020) plus rounding adder (0.180) in one cycle of 1.250.",
      "3. Try first: move the rounding adder after prod_reg. Path 2 goes to +0.018 ns. Path 3 should land near +0.059 ns.",
      "4. Cost: zero extra latency if the next stage has 0.18 ns spare. If not, a full pipeline stage in the multiplier, which adds one cycle.",
      "5. Do not drop to 700 MHz unless the product can lose 12.5% throughput.",
      "Check after the change: hold on the new register, worst hold is only +0.021 today.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Right. Setup only, hold says met. Path two worst. Let me add it up myself, 0.090 plus 1.020 plus 0.180 plus 0.052, 1.342, matches. Path three is 1.301, so it's the same structure, a shorter input bit. If the adder moves, path three is 1.301 minus 0.180, 1.121... wait, I assumed it has the same adder, it ends in prod_reg too so yes. Plus 0.059. Fine. And a new register means new hold paths, and hold is only 0.021 now. Write that down.",
      seconds: 780,
    },
    explainAnswers: [
      "I checked the sum of path 2 myself first, because a fix built on a misread report is wasted.",
      "If the hold slack gets worse after the change, I would add a small delay cell on the short path rather than undo the move.",
    ],
  },
  {
    id: "proof_chip_05",
    person: "xiaoling",
    challenge: "kide-timing",
    hoursAgo: 77,
    shareWithSimilar: false,
    answer: [
      "Two paths fail setup at 800 MHz: path 2 by 0.162 ns and path 3 by 0.121 ns, both through the multiplier.",
      "I would add a pipeline register inside the multiplier, so the 16x16 multiply is split in two halves. That gives a lot of margin.",
      "The cost is one extra clock cycle of latency for the whole mac_unit, and some area for the extra flops. The rest of the system has to know the result comes one cycle later.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "In my master's at Aalto we always just pipelined when the multiplier was too slow, so that's my first thought. Okay but is that the cheapest? Path two is short by 0.162. The multiplier is 1.02, half of that is around 0.5 per stage, so yes, lots of margin. Latency plus one. Hmm, I should say that clearly, someone downstream counts cycles. Path five, plus 0.010, that's close but it passes, leave it.",
      seconds: 480,
    },
    explainAnswers: [
      "Pipelining fixes both failing paths with room, so the next run will not fail again by a few picoseconds.",
      "If the block may not take one more clock cycle, I would look at moving only the rounding adder instead.",
    ],
  },
  {
    id: "proof_chip_06",
    person: "dmytro",
    challenge: "kide-timing",
    hoursAgo: 63,
    shareWithSimilar: true,
    answer: [
      "Path 2 fails, slack -0.162 ns. Path 3 fails, -0.121 ns. Path 5 is +0.010, which I count as a warning, not a pass, at the slow corner.",
      "First try: move the rounding adder to the next stage, path 2 gets +0.018.",
      "But two of the five paths would then sit under 0.02 ns. I would tell the team that this block has almost no margin and ask for a pipeline split before the factory date.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Path two, path three, red. Easy. Path five, hmm, plus 0.010. That's ten picoseconds. Technically it passes. But one more buffer on the input and it's gone. So I'll mention it. Now the fix. Adder out, plus 0.018. Okay. So after the fix I have two paths with nothing to spare. I don't like that. Better to say it now than at sign-off.",
      seconds: 560,
    },
    explainAnswers: [
      "I started with what fails, then looked at what almost fails, because those are the next run's failures.",
      "If the design goes to the factory in two weeks, I would do the adder move now and still flag path 5 in the sign-off notes.",
    ],
  },
  {
    id: "proof_chip_07",
    person: "kristjan",
    challenge: "kide-timing",
    hoursAgo: 7,
    shareWithSimilar: false,
    answer: "Paths 2 and 3 fail. Path 2 is the worst at -0.162 ns. I would move the rounding adder to the next stage first, because it keeps 800 MHz and needs no extra cycle if the next stage has time.",
    thinkAloud: {
      transcript:
        "Okay, I have a few minutes. Violated, violated. Two and three. The detail shows only path two. Multiplier, adder. Take out the adder, 0.18, that's more than 0.162, so it passes. Done. Oh, and three is less negative, so if two passes, three passes too, same adder. Yeah. Should I check path five? Plus 0.010, it passes, leave it. Write it short, they can ask me later.",
      seconds: 310,
    },
    explainAnswers: [
      "The adder is the one piece I can move without touching the multiplier itself.",
      "If the customer needs the full 800 MHz, this is still my answer, because the clock stays the same.",
    ],
  },
  {
    id: "proof_chip_08",
    person: "minh",
    challenge: "kide-timing",
    hoursAgo: 101,
    shareWithSimilar: false,
    answer: [
      "Failing paths: 2, 3 and 5. Path 5 has only 0.010 ns, which is below what our flow would accept.",
      "For paths 2 and 3 I would split the multiplier into two stages. For path 5, add a register on the in_valid input.",
      "Both changes add latency, so the protocol around the block needs a check.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "So path five is in_valid to in_reg, slack 0.010, and in my last job anything under 0.050 was a fail. So that's three paths. Two and three, multiplier. Pipeline it. Five, it comes from an input port, so the delay outside the chip is part of it. A flop on the input. That's two cycles extra in total. Hmm. Okay, I'll say the latency needs checking.",
      seconds: 450,
    },
    explainAnswers: [
      "I treated every path under our usual margin as failing, because a tight path at sign-off often fails on silicon.",
      "If the block may not take one more clock cycle, I would only fix paths 2 and 3 by moving the adder, and leave path 5 as it is.",
    ],
  },
  {
    id: "proof_chip_09",
    person: "samuel",
    challenge: "kide-timing",
    hoursAgo: 52,
    shareWithSimilar: true,
    answer: [
      "Path 2 and path 3 fail setup through mult. Worst slack -0.162 ns at the slow corner.",
      "My order: (1) retime the rounding adder after prod_reg, about +0.018 ns on path 2. (2) If the tools cannot place it well, a two-stage multiplier. (3) A slower clock only if the product owner agrees, because 700 MHz takes 12.5% of the throughput from every user of this block.",
      "I would also re-run the fast corner after (1) and (2), to see the hold slack on the new flops.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "At Piirtola Oy we had almost this exact block, a MAC at 750. So, two failing paths, both end in the multiplier register. The cheap fix is the adder. 0.180 away, 1.162 arrival. Positive, barely. Then I think about what can go wrong. Placement. If the tool puts the new flop far away, the wire eats the margin. So I'd have the pipeline split ready. And the clock is last, because it's a product decision, not mine.",
      seconds: 700,
    },
    explainAnswers: [
      "I started with the cheapest fix that keeps the clock and the latency, and kept the costly ones as backups.",
      "If the hold slack gets worse after the change, I would fix hold with delay cells on the short paths, which is a small change late in the project.",
    ],
  },
  {
    id: "proof_chip_10",
    person: "tomasz",
    challenge: "kide-timing",
    hoursAgo: 33,
    shareWithSimilar: true,
    answer: [
      "Path 2: required 1.180, arrival 1.342, fails by 0.162 ns. Path 3 fails by 0.121 ns.",
      "The multiplier alone takes 1.020 ns out of 1.250. That is the problem: a 16x16 multiply does not fit one cycle at 800 MHz in this corner, with anything after it.",
      "I would pipeline the multiplier. The adder move gives +0.018 ns, which I would not ship on a path that already depends on the slowest corner.",
      "Cost: one more cycle. Most MAC users can live with that.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, numbers first. 1.020 for the multiply. Period 1.25, setup takes 0.07, so I have 1.18. Clock to Q 0.09. That leaves 1.09 for logic, and the multiply alone is 1.02. Basically no room. The adder trick gives eighteen picoseconds. No, I don't want to live on eighteen picoseconds. Not at the slow corner, not with placement still moving. Pipeline it, say the latency, one more cycle. Yeah, that's my answer.",
      seconds: 510,
    },
    explainAnswers: [
      "I started from the budget of the cycle, because it shows the multiplier itself is the problem.",
      "If the block may not take one more cycle, I would take the adder move and ask for a faster multiplier cell from the library.",
    ],
  },
  {
    id: "proof_chip_11",
    person: "kwame",
    challenge: "kide-timing",
    hoursAgo: 89,
    shareWithSimilar: false,
    answer: [
      "The report shows path 2 and path 3 as violated. I think these are hold problems, because the data arrives later than required.",
      "I would add buffers on these paths to fix it, and then run the timing report again to check.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Arrival 1.342, required 1.180. So it arrives too late. Late is... hold? No, hmm. Hold is when it's too early. I think. The bottom says hold is met. So maybe this is setup. I'm not sure. In the lab course we added buffers when timing failed. I'll say buffers, buffers fix timing. Okay, I'll write it like that and ask someone.",
      seconds: 360,
    },
    explainAnswers: [
      "I started with the paths marked violated because the report flags them.",
      "If the design goes to the factory in two weeks, I would ask a senior engineer to check my fix before the run.",
    ],
  },
  {
    id: "proof_chip_12",
    person: "yusuf",
    challenge: "kide-timing",
    hoursAgo: 115,
    shareWithSimilar: true,
    answer: [
      "Two setup violations, both into mult/prod_reg: path 2 at -0.162 ns and path 3 at -0.121 ns.",
      "What I try first is moving the rounding adder one stage later. It costs nothing in clock speed, and only latency if the next stage has no room for 0.180 ns.",
      "What I would tell the project manager: we can keep 800 MHz. Worst case we add one cycle of delay. We should not lower the clock.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "I'm doing this at home in Leppävaara, with tea, so let's go. Two red lines. Path two, path three. Both the multiplier. The detail, the adder is 0.18. If that moves, path two is just over. Okay. Now, how do I say this to someone who isn't a chip person? Keep the speed, maybe one cycle of delay. Don't slow the clock. That's it.",
      seconds: 600,
    },
    explainAnswers: [
      "I started with the fix that keeps the speed, because the speed is what the customer pays for.",
      "If the customer needs the full 800 MHz, this plan already keeps it, so nothing changes.",
    ],
  },
  {
    id: "proof_chip_13",
    person: "haider",
    challenge: "kide-timing",
    hoursAgo: 26,
    shareWithSimilar: false,
    answer: [
      "Path 2 fails setup by 0.162 ns. Path 3 has the same cause.",
      "Fix: move the rounding adder after the register. New arrival 1.162 ns, slack +0.018 ns.",
      "Risk: the margin is thin, so check the stage after it and the other corners before sign-off.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Path two, worst one. Let me just do that one properly. Clock to Q, multiplier, adder, wire. The adder can go. 1.342 minus 0.18. 1.162. Okay, plus 0.018. Path three, I didn't look, um, it's smaller, it'll be fine too probably. Same register at the end. I'll only write path two, keep it clean, and say the margin is thin.",
      seconds: 400,
    },
    explainAnswers: [
      "Path 2 is the worst one, so if it passes, the others with the same cause should pass too.",
      "If the hold slack gets worse after the change, I would add a delay on the short hold path.",
    ],
  },
  {
    id: "proof_chip_14",
    person: "oskari",
    challenge: "kide-timing",
    hoursAgo: 70,
    shareWithSimilar: true,
    answer: [
      "Failing: 2 (-0.162) and 3 (-0.121). Passing but tight: 5 (+0.010). Hold all met.",
      "Option A, move the adder: +0.018 on path 2, no clock change. Option B, two-stage multiplier: big margin, +1 cycle latency. Option C, 700 MHz: passes, but every operation is 12.5% slower.",
      "I try A first because it is the smallest change. If the next run shows A fails at placement, I go to B. C only with a product decision.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, let me sort this in three options, that's easier to read later. A, B, C. A is the adder. Wait, does moving the adder change path three as much? Both end at prod_reg, so yes. B, pipeline. C, the clock, the designer suggested it, but that's the whole block slower. And path five, ten picoseconds, I'll mention it but not fix it.",
      seconds: 660,
    },
    explainAnswers: [
      "I wrote all three options with their cost, so the team can pick fast if the first one fails.",
      "If the design goes to the factory in two weeks, I would start A and B in parallel runs, so we do not lose a week.",
    ],
  },
  {
    id: "proof_chip_15",
    person: "tuomas",
    challenge: "kide-timing",
    hoursAgo: 46,
    shareWithSimilar: false,
    answer: [
      "Path 2 fails: the multiply plus rounding needs 1.342 ns, and 1.180 ns is available. Path 3 fails for the same reason.",
      "First I would try a faster multiplier architecture, like a Booth-encoded or Wallace tree version, if the library has one. Then the adder move.",
      "I did not look at changing the clock, since the block is meant to run at 800 MHz.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "In my thesis at LUT I built a Wallace tree multiplier, so of course that's my first idea, ha. Okay, but is it realistic two weeks before the factory? Maybe not. Let me also write the adder idea. 0.18, yes that covers 0.162. Hmm, path three, same thing. Okay. I'll put the multiplier first anyway, it's the real fix, and the adder second.",
      seconds: 720,
    },
    explainAnswers: [
      "The multiplier is 1.020 ns of the path, so making it faster fixes the root of the problem.",
      "If the design goes to the factory in two weeks, I would swap the order and move the adder first, because a new multiplier needs new verification.",
    ],
  },
  {
    id: "proof_chip_16",
    person: "johan",
    challenge: "kide-timing",
    hoursAgo: 83,
    shareWithSimilar: true,
    answer: "Lower the clock to 700 MHz as the designer says. Then all paths pass and nothing in the RTL changes, which is the safest thing two weeks before the factory. Paths 2 and 3 are the ones failing now, both by more than 0.1 ns.",
    thinkAloud: {
      transcript:
        "Okay so there's a failing path, two failing. The designer's note says 700 is possible. Changing RTL this late is risky, every change needs new simulation. Slower clock, nothing changes in the logic. That's what I would do. Hmm, is 700 enough for the product? The note says if needed, so I guess yes. I won't do the math on the paths, 700 is a lot slower.",
      seconds: 300,
    },
    explainAnswers: [
      "A clock change needs no new logic, so nothing new can break in the design.",
      "If the customer needs the full 800 MHz, then I would have to move the rounding adder instead.",
    ],
  },
  {
    id: "proof_chip_17",
    person: "leila",
    challenge: "kide-timing",
    hoursAgo: 12,
    shareWithSimilar: true,
    answer: [
      "Paths 2 and 3 miss setup by 162 ps and 121 ps. Both are the same logic cone: a_reg/b_reg into a single-stage 16x16 multiply, then rounding, into prod_reg.",
      "First try: retime the rounding adder past prod_reg. Path 2 lands at +18 ps. That is a real fix only if the downstream stage absorbs 180 ps, so I would check that path in the same run.",
      "Second: two-stage multiply, one cycle more latency.",
      "I would not take 700 MHz, it gives away 100 MHz to fix two paths.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me think in picoseconds, it's easier. 162 short. Adder is 180. So moving it gives 18 spare. But the adder doesn't disappear, it lands in the next stage. What's in the next stage? Not in the report. Okay so the honest answer is, try it, and look at the next stage in the same run. Second option, pipeline. And the clock, no, that's the whole chip paying for two paths.",
      seconds: 640,
    },
    explainAnswers: [
      "I started with the move that keeps both the clock and, maybe, the latency, and named the one thing that could break it.",
      "If the block may not take one more clock cycle, the pipeline option is gone, so the adder move has to work, and I would check the next stage first.",
    ],
  },
  {
    id: "proof_chip_18",
    person: "abdirahman",
    challenge: "kide-timing",
    hoursAgo: 58,
    shareWithSimilar: false,
    answer: [
      "The failing path is path 2, from a_reg[7] to the multiplier register. It is late by 0.162 ns.",
      "Path 3 also fails by 0.121 ns.",
      "I would try to make the wire shorter first by placing prod_reg closer to the multiplier. The wire is 0.052 ns.",
      "If that is not enough, I would ask the designer about 700 MHz.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay. Path two. The detail has four parts. Which one can I change easily? The wire. 0.052. Move the register closer. Wait, that's only 0.052, and I need 0.162. That's not enough. Hmm. So then the clock. Or... the adder, 0.18, could that be somewhere else? I'm not sure you can just move it. I'll say wire first, then ask about the clock.",
      seconds: 500,
    },
    explainAnswers: [
      "The wire looked like the part I could change without touching the logic.",
      "If the customer needs the full 800 MHz, the clock option is gone, so I would ask a designer if the adder can move to the next stage.",
    ],
  },
  {
    id: "proof_chip_19",
    person: "priya",
    challenge: "kide-timing",
    hoursAgo: 3,
    shareWithSimilar: true,
    answer: [
      "Two paths fail setup: 2 (-0.162 ns) and 3 (-0.121 ns), both through the multiplier. Hold is met.",
      "First: move the rounding adder into the next stage. It fixes path 2 with +0.018 ns and keeps 800 MHz.",
      "Because +0.018 is so small, I would also prepare the two-stage multiplier and ask the system team now if one extra cycle of latency is acceptable, so we are not asking two days before the factory date.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Priya, thinking aloud, okay. Five paths. Path one passes, four passes easily, five passes, just. Two and three fail. So it's the multiplier register. Adder, 0.18. Yes, that's the first move. But I want a plan B ready, because eighteen picoseconds... and plan B needs a yes from someone about latency. Better to ask that today, not next week. Okay, adder first, pipeline ready, clock stays.",
      seconds: 580,
    },
    explainAnswers: [
      "I read all five paths first, so I knew which were failing and which were only tight.",
      "If the design goes to the factory in two weeks, asking about latency today is what makes the backup usable in time.",
    ],
  },
  {
    id: "proof_chip_20",
    person: "nadia",
    challenge: "kide-timing",
    hoursAgo: 106,
    shareWithSimilar: false,
    answer: [
      "Paths 2 and 3 fail setup. The multiplier takes 1.020 ns of a 1.180 ns budget.",
      "My first try is a two-stage pipeline in the multiplier, because the adder move leaves only +0.018 ns.",
      "Cost: one cycle of latency and about 32 extra flip-flops.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Two failing. I'll do the math on the adder idea. 0.162 needed, 0.180 gained. Eighteen picoseconds left. No, too thin for me. Pipeline. How many flops? The product is 32 bits, so 32 flops in the middle, roughly. Hmm, maybe more, the partial products are wider. Okay, about 32, I'll say about, the tool will tell. One cycle more. Fine. Write it short.",
      seconds: 420,
    },
    explainAnswers: [
      "I wanted a fix with margin, so the next timing run does not fail on something small.",
      "If the block may not take one more clock cycle, I would go back to the adder move and accept the thin margin.",
    ],
  },
];
