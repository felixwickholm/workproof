import type { SeedProof } from "../types";

/**
 * Work on the challenges the other Espoo companies wrote out in full, so their top-work lists are not empty.
 * Synthetic people and work; every point and reason is the company reviewer's.
 */
export const EXTRA_PROOFS: SeedProof[] = [
  {
    id: "proof_churn_01",
    person: "veera",
    challenge: "lumo-churn",
    hoursAgo: 120,
    shareWithSimilar: true,
    answer: [
      "1. Drop the 94% accuracy line. Only 6% of customers left, so a model that says 'nobody leaves' also gets 94%. Lead with the top 1 000 instead: 410 of them really left, about seven times the base rate.",
      "2. Test on a later period. The test rows come from the same 12 months the model learned from, so we do not know how it does next quarter.",
      "3. Change the voucher plan. 'Days since last visit' may just find people who already left. Send vouchers to a random half of the flagged group, so the client can see whether the voucher changes anything.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Ninety-four percent, sounds great, but six percent left. So the dumb model that says nobody leaves is at ninety-four too. That line has to go. Four hundred ten of a thousand, that's the real number, that's like seven times the base rate. Test set, random twenty percent of the same twelve months. Hmm, so no time split. That's a problem for a forecast. And days since last visit, that's almost the label itself. If they haven't come for two months they're gone already. Voucher for everyone, no control group. I'd hold back half.",
      seconds: 610,
    },
    explainAnswers: [
      "Accuracy first, because the client will repeat that number in their own meetings.",
      "If the client cannot wait for a new test, I would still keep a control group, so the voucher money teaches us something.",
    ],
    decision: {
      companyId: "co-lumo",
      kind: "meet",
      points: [5, 4, 5, 4],
      feedback:
        "You caught the accuracy trap and the missing time split, and the control group for the vouchers is exactly what we would propose. Your note is short enough to read out in the meeting. We would like to meet you.",
      hoursToReply: 3,
      meeting: "met",
      followUpAgreed: true,
    },
  },
  {
    id: "proof_churn_02",
    person: "arjun",
    challenge: "lumo-churn",
    hoursAgo: 70,
    shareWithSimilar: true,
    answer: [
      "The accuracy figure is misleading because the classes are unbalanced: 94% is what you get by predicting that nobody leaves.",
      "I would report precision for the top 1 000 (41%) and recall, and show a lift chart.",
      "I would also add a confidence interval for the 41%.",
      "The voucher plan looks fine, but it should be checked with the marketing team first.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Class imbalance, classic. Six percent positive. So accuracy is useless here. Precision at a thousand is forty-one percent. Recall, we don't know the total number who left in the test, wait, six percent of the test set, I don't know the size. Okay, I'll just say report recall. Lift chart is what clients understand. Confidence interval on the forty-one, with a thousand rows that's about plus minus three. Voucher plan, not really my area, I'll say check with marketing.",
      seconds: 480,
    },
    explainAnswers: [
      "The imbalance, because everything else in the summary depends on reading the right number.",
      "With more time I would rebuild the test set, but I did not think of the time split in the first pass.",
    ],
    decision: {
      companyId: "co-lumo",
      kind: "hold",
      points: [4, 2, 4, 3],
      feedback:
        "You read the accuracy trap fast and named the right numbers to show instead. You missed that the test rows come from the training months, and the voucher plan needs a test, not marketing's opinion. We will come back to you after the event.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_churn_03",
    person: "tomasz",
    challenge: "lumo-churn",
    hoursAgo: 30,
    shareWithSimilar: false,
    answer: [
      "The summary is mostly good. I would make three small changes.",
      "First, write 'accuracy 94 percent' in bold, because clients like a clear number.",
      "Second, add which features the model uses, so the client trusts it.",
      "Third, the voucher could be 5 EUR instead of 10 EUR to save money, because the model already finds the right customers.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, a summary for a client. Ninety-four percent is high, that's good, I would put it first. Strongest signal days since last visit, makes sense, people who don't come are leaving. Four hundred ten out of a thousand, okay. Voucher ten euros for everyone flagged, that's maybe ten thousand euros. Could be five euros. I think the summary is fine, just needs a bit more on the features so the client trusts the model.",
      seconds: 360,
    },
    explainAnswers: [
      "The voucher size, because it is the part that costs the client money.",
      "If the client asked how sure we are, I would say the accuracy is high, so quite sure.",
    ],
    decision: {
      companyId: "co-lumo",
      kind: "pass",
      points: [2, 2, 2, 3],
      feedback:
        "Your note is clear and you thought about the client's money. The 94% is the number we most need to remove: with 6% leaving, saying nobody leaves gives the same figure. It is not now for this role.",
      hoursToReply: 4,
    },
  },
  {
    id: "proof_late_01",
    person: "nora",
    challenge: "routa-late",
    hoursAgo: 100,
    shareWithSimilar: true,
    answer: [
      "Finding: Tuesday routes leave the Kera depot 35 minutes later and carry 5 to 7 more stops than other days. Both happen because frozen goods are loaded on Tuesdays only. The late deliveries are a loading problem, not a driving problem.",
      "Next check: compare Tuesday lateness per stop number. If the first stops are on time and the last ones late, it is the extra stops; if all are late, it is the departure.",
      "Also: two weeks miss six vans, so I would rerun the numbers without those weeks.",
      "Chart: lateness by stop number, one line per weekday, Tuesday in colour.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Tuesday seventeen percent, everything else under ten. What's different on Tuesday? More stops, thirty-one. Later departure, seven forty. And frozen goods at Kera, only Tuesday. So the frozen loading pushes the departure and maybe adds stops. Two causes, I can't tell which yet. Split by stop number, that separates them. Oh, and the GPS swap, six vans missing two Tuesdays. Could go either way, I'll flag it. Chart, one line per day, stop number on the bottom.",
      seconds: 560,
    },
    explainAnswers: [
      "The departure time first, because it is the one thing the depot can change by next Tuesday.",
      "If the customer wants an answer on Friday, I would give the loading finding and say the stop split comes next week.",
    ],
    decision: {
      companyId: "co-routa",
      kind: "meet",
      points: [4, 4, 5, 5],
      feedback:
        "You tied the late Tuesdays to the frozen loading and found a clean way to split the two causes. The chart you describe is the one we would show the customer. We would like to meet you.",
      hoursToReply: 3,
      meeting: "accepted",
    },
  },
  {
    id: "proof_late_02",
    person: "lauri",
    challenge: "routa-late",
    hoursAgo: 60,
    shareWithSimilar: true,
    answer: [
      "Tuesdays are late because there are more stops: 31 instead of about 25. More stops take more time.",
      "I would tell the customer to move some Tuesday deliveries to Monday or Wednesday, which have the fewest late deliveries.",
      "In the data I would check the average delivery time per stop for each day.",
      "I would show a bar chart of late deliveries per weekday.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Tuesday is the outlier, seventeen percent. Stops per van thirty-one on Tuesday, that's six more. So that's the reason, more stops more time. Move some stops to Monday, Monday has four percent. Bar chart per weekday, simple. Frozen goods, hmm, maybe that's why there are more stops. Departure seven forty, that's later too. I'll keep it simple and go with the stops, that's the clearest number for the customer.",
      seconds: 400,
    },
    explainAnswers: [
      "The stops, because they are the biggest difference in the table.",
      "If the customer could not move deliveries, I would ask for one more van on Tuesdays.",
    ],
    decision: {
      companyId: "co-routa",
      kind: "pass",
      points: [2, 3, 3, 4],
      feedback:
        "Your advice is easy for a customer to follow. You saw the later departure but did not use it, and you did not flag the six missing vans, so the finding may be the wrong one. It is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_late_03",
    person: "fatima",
    challenge: "routa-late",
    hoursAgo: 9,
    shareWithSimilar: true,
    answer: [
      "Before I trust the 17%, I would remove the two weeks where six vans have no Tuesday data, because the missing vans could be the late ones or the early ones.",
      "With that caveat: Tuesday vans leave 35 minutes later, and the only Tuesday difference at the depot is the frozen load. That alone explains much of the delay.",
      "Next: query departure time against lateness for Tuesday routes only.",
      "For the customer: one chart of departure time against share of late stops, by weekday.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Wait, first, the data. Two weeks, six vans missing on Tuesdays, GPS swap. That's a hole right in the day we're asking about. I want that out before I say anything. Then, departure seven forty versus seven oh five. Thirty-five minutes. Frozen goods only on Tuesday at Kera. That's my main suspect. Stops thirty-one, also higher. I'd check departure against lateness with a query, Tuesday only. Chart, departure against late share.",
      seconds: 520,
    },
    explainAnswers: [
      "The data gap first, because a finding from broken weeks could send the depot after the wrong fix.",
      "If the gap weeks show the same pattern, I would say so and keep them in.",
    ],
  },
  {
    id: "proof_forecast_01",
    person: "sanni",
    challenge: "kuura-forecast",
    hoursAgo: 110,
    shareWithSimilar: true,
    answer: [
      "1. 'In' is a 12-month average, but the bakery is seasonal: December was 95 000 and January 41 000 last year. January is likely about 20 000 short of the forecast.",
      "2. The loan payment of 3 500 a month is missing from 'Out'.",
      "3. The Q4 VAT of about 9 000 falls in February and is not shown.",
      "For the credit team: with last year's pattern, January is close to zero or negative and February is negative after VAT. The bakery can likely repay, but it needs the December cash kept in the account. A payment break in February is worth discussing.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Same number every month, sixty-two thousand. That's an average. Bakery in December, ninety-five. January forty-one. So the average hides the season completely. January in is maybe forty-one, out forty-eight, that's minus seven already. Plus the loan, three five. Minus ten and a half. February, VAT nine thousand. Hmm. And the loan payment isn't in out at all. So the forecast says plus fourteen every month and the truth is minus in January. I'd still lend, but with a plan.",
      seconds: 640,
    },
    explainAnswers: [
      "The seasonal sales first, because they change the sign of January.",
      "If the bakery had no savings from December, I would suggest a smaller loan or a later first payment.",
    ],
    decision: {
      companyId: "co-kuura",
      kind: "meet",
      points: [5, 5, 4, 4],
      feedback:
        "You found all three problems and turned them into a clear answer for the credit team. The payment break in February is a practical idea. We would like to meet you.",
      hoursToReply: 4,
    },
  },
  {
    id: "proof_forecast_02",
    person: "dmytro",
    challenge: "kuura-forecast",
    hoursAgo: 40,
    shareWithSimilar: true,
    answer: [
      "The forecast does not include the loan payment of 3 500 per month, so net is 10 500, not 14 000.",
      "VAT of 9 000 in February makes February net 1 500.",
      "The averages could be updated with the latest month.",
      "For the credit team: the bakery stays positive in all three months even after the loan, so the risk is low and the loan can be approved.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let's add what's missing. Loan, three five a month. Fourteen minus three five, ten five. VAT in February, nine thousand, so one five. Still positive. Okay, so the bakery is fine. In is the average, sixty-two, should maybe be updated. December ninety-five, January forty-one, that's the history line. Average is about right then. So I'd tell them low risk, approve.",
      seconds: 450,
    },
    explainAnswers: [
      "The missing loan payment, because it is a cost the bakery will surely pay.",
      "If sales dropped, the bakery would still have some room in December and January.",
    ],
    decision: {
      companyId: "co-kuura",
      kind: "hold",
      points: [3, 4, 3, 3],
      feedback:
        "You added the loan and the VAT correctly and showed your sums. You read past the seasonal sales, so January looks positive when it is likely negative. We will come back to you after the event.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_outage_01",
    person: "kofi",
    challenge: "pilvi-outage",
    hoursAgo: 140,
    shareWithSimilar: true,
    answer: [
      "Last night your web shop showed a security warning for 43 minutes and could not take orders. The cause was an expired certificate on our load balancer.",
      "Automatic renewal had failed for 30 days, and the warnings went to an old mailbox nobody reads. We had no alert for an expiring certificate, so we learned about it from your support team.",
      "We fixed it at 23:45 by installing a new certificate.",
      "What we change: renewal failures now go to our on-call alerts, we alert 14 days before any certificate expires, and we check every customer's certificates this week.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, so the CTO wants what, why, and what changes. Timeline first. Twenty-two fifty-eight expiry, twenty-three forty-five fixed, that's forty-seven minutes. Customers saw a warning from twenty-three oh one. No alert, that's the real problem. And renewal failing for thirty days into a dead mailbox. So two fixes, the mailbox routing and an expiry alert. And check the other customers, it could happen tomorrow somewhere else. No names, no blame.",
      seconds: 500,
    },
    explainAnswers: [
      "The missing alert, because the renewal can fail again for other reasons.",
      "If the CTO asked for compensation, I would pass it to our account manager and not promise anything in this note.",
    ],
    decision: {
      companyId: "co-pilvi",
      kind: "meet",
      points: [5, 5, 5, 4],
      feedback:
        "Your note says what happened, why, and what changes, in words a CTO can forward. You also thought of the other customers. We would like to meet you.",
      hoursToReply: 2,
      meeting: "met",
      followUpAgreed: true,
      hired: true,
    },
  },
  {
    id: "proof_outage_02",
    person: "eetu",
    challenge: "pilvi-outage",
    hoursAgo: 80,
    shareWithSimilar: true,
    answer: [
      "Incident summary: at 22:58 the TLS certificate on the load balancer expired. The ACME renewal job had been failing for 30 days due to a DNS challenge error, and notifications were sent to a deprecated mailbox.",
      "MTTD 33 minutes, MTTR 47 minutes. Root cause: missing monitoring on certificate expiry.",
      "Action items: add a Prometheus exporter for certificate expiry, route ACME failures to PagerDuty, and write a runbook.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Certificate expired, classic. Renewal failed thirty days, probably DNS challenge or rate limit. MTTD is twenty-three thirty-one minus twenty-two fifty-eight, thirty-three minutes. MTTR forty-seven. Root cause is no monitoring on expiry. Action items, exporter, route to paging, runbook. The CTO is technical so I'll keep the terms. Done, that's a standard postmortem.",
      seconds: 300,
    },
    explainAnswers: [
      "Monitoring first, because without it we only learn from customers.",
      "If the CTO is not technical, I would add one line at the top in plain words.",
    ],
    decision: {
      companyId: "co-pilvi",
      kind: "pass",
      points: [4, 4, 2, 2],
      feedback:
        "Your fixes are right and the timeline is exact. The note is written for engineers, and the DNS error is a guess stated as fact. The customer needs plain words first. It is not now.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_visit_01",
    person: "yuki",
    challenge: "kajo-visit",
    hoursAgo: 96,
    shareWithSimilar: true,
    answer: [
      "First screen, top to bottom:",
      "Allergies, in a red band at the top, never hidden.",
      "Today's medicines only, in the order they are given, with a large tick for each.",
      "One line from the last visit note.",
      "One big Start visit button, at the bottom where a gloved thumb reaches.",
      "Everything else (full plan, all notes, print, share) goes behind one More button.",
      "Questions for the nurses: Can you find today's medicines without scrolling? Can you press Start with gloves on? What do you miss from the old screen?",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Standing up, gloves, twenty minutes. So big targets and only what matters at the door. Allergies at the bottom in grey, that's dangerous, they go to the top. Fourteen medicines, but today's are what, three or four? Only today's. Last ten notes, the nurse needs the last one, one line. Six buttons, they only need start. Print, share, settings, all into a more menu. Then I'd test it with three nurses, standing, gloves on, real tablet.",
      seconds: 580,
    },
    explainAnswers: [
      "The allergies first, because a missed allergy can hurt a patient.",
      "If nurses missed the full medicine list, I would add it as a second tab, not on the first screen.",
    ],
    decision: {
      companyId: "co-kajo",
      kind: "hold",
      points: [5, 4, 4, 4],
      feedback:
        "Moving the allergies to the top and keeping only today's medicines is exactly what our nurses asked for. Your test questions are specific and easy to run. We will come back to you after the event.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_visit_02",
    person: "mateo",
    challenge: "kajo-visit",
    hoursAgo: 5,
    shareWithSimilar: true,
    answer: [
      "I would split the screen into three cards: Patient, Today and History.",
      "Patient: name, door code and allergies with a warning icon.",
      "Today: the medicines due on this visit, with a check box for each and a voice note button for gloved hands.",
      "History: the last note, with a link to the rest.",
      "I would ask three nurses to do one real visit with a paper copy of the screen and mark what they never looked at.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Too much on one screen. Cards, three cards, patient, today, history. Allergies should be near the name, with an icon, maybe red. Gloves, typing is hard, so a voice note would help. Medicines, only today's, check them off. History, last note only. Testing, paper prototype on a real visit, ask them to mark what they never look at. That's cheap and real.",
      seconds: 470,
    },
    explainAnswers: [
      "Today's medicines, because that is what the nurse came to do.",
      "If the tablet had no network, the voice note would wait on the device until the visit ends.",
    ],
  },
  {
    id: "proof_level_01",
    person: "johan",
    challenge: "revontuli-level",
    hoursAgo: 130,
    shareWithSimilar: true,
    answer: [
      "Level 12 is not just harder, it is the first level with a timer: tries jump from 1.6 to 4.2, and the finish rate falls from 85% to 61%.",
      "Also, 70% of players who quit after a loss saw an ad. The ad after a loss may push them out more than the level does.",
      "Test: split new players into three groups for two weeks. Group 1 as now, group 2 with a longer timer, group 3 with no ad after a loss on level 12. Watch day-7 return rate, not just the level finish rate.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Sixty-one percent finish versus eighty-five. Tries jump from one point six to four point two. First timer. Okay, so it's new mechanics, not just hard. But then the ad. Seventy percent of quitters saw an ad after losing. Losing and then an ad, that's a bad moment. So two suspects. I'd test both separately. Three groups. And the right number is whether they come back in a week, not only whether they finish twelve.",
      seconds: 540,
    },
    explainAnswers: [
      "The ad after a loss, because changing it is cheap and the design team had not looked at it.",
      "If we could only run one test, I would test the ad, because it touches every level after 12 too.",
    ],
    decision: {
      companyId: "co-revontuli",
      kind: "meet",
      points: [5, 5, 4, 4],
      feedback:
        "You spotted that the ad after a loss may be the real problem, and your test keeps the two causes apart. Watching the day-7 return is the number we care about. We would like to meet you.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_level_02",
    person: "nadia",
    challenge: "revontuli-level",
    hoursAgo: 50,
    shareWithSimilar: true,
    answer: [
      "Level 12 is too hard: 4.2 tries on average and only 61% finish. Levels 10 and 11 are much easier.",
      "I agree with the design team that it should be easier. The timer could be 20% longer.",
      "Test: give the longer timer to 10% of players for one week and compare the finish rate.",
      "If the finish rate goes over 80%, release it to everyone.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, level twelve. Sixty-one percent finish. Four point two tries. That's a big jump from eleven. So it's too hard, the design team is right. Timer, first level with a timer, so the timer is probably the hard part. Make it longer, twenty percent. Test it on ten percent of players. Finish rate above eighty, roll out. The ad thing, seventy percent, I'm not sure what to do with that.",
      seconds: 380,
    },
    explainAnswers: [
      "The timer, because it is the new thing on level 12.",
      "If the finish rate went up but players still left, I would look at the ads next.",
    ],
    decision: {
      companyId: "co-revontuli",
      kind: "pass",
      points: [3, 2, 4, 3],
      feedback:
        "Your test is clean and easy to run. You noticed the ads but left them out, and the finish rate alone will not tell us whether players stay. It is not now.",
      hoursToReply: 4,
    },
  },
];
