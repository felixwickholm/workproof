import type { SeedProof } from "../types";

/**
 * Synthetic work for the billing line and the reminder redesign.
 * Spoken answers keep only the transcript. Pictures show the work, never a person.
 */
export const CALL_AND_DESIGN_PROOFS: SeedProof[] = [
  {
    id: "proof_call_01",
    person: "hodan",
    challenge: "vesto-bills",
    hoursAgo: 130,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Hei, you're speaking with Hodan. I can see two bills for October on your account, and one of them has already been taken from your bank. I'm sorry, that's our mistake: your move was entered twice, so the system made two contracts.",
      "Here is what I can do right now, while we are on the phone. I cancel the open bill, the one due on the 21st, so it will not be taken. For the 64 euros that was already paid, I send a refund request today. The billing team pays it back within ten working days, and I'll send you a text when it's done.",
      "Is the account number we have still the right one for the refund?",
    ].join("\n\n"),
    explainAnswers: [
      "I started with sorry because the caller has called before. If I explain first, it sounds like an excuse.",
      "If billing was closed until tomorrow I would still cancel the open bill now and promise a call back tomorrow before noon, not the money.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-vesto",
      kind: "meet",
      feedback:
        "You said sorry for our mistake before anything else, and you cancelled the open bill while the caller was still on the line. That is how we want the first half minute to sound. Let us talk at the event about the evening team.",
      hoursToReply: 2.5,
      meeting: "met",
    },
  },
  {
    id: "proof_call_02",
    person: "chiamaka",
    challenge: "vesto-bills",
    hoursAgo: 75,
    shareWithSimilar: false,
    spoken: true,
    answer: [
      "Good afternoon, thank you for calling. Okay so I understand, you got two bills for the same month and you are angry, and honestly I would be too.",
      "Let me look... yes, I see it. The move date went in twice, once on the web and once by phone, so there are two contracts. That's on us.",
      "The second bill I can cancel now. The first one is paid already, so I will ask for a refund, it comes in about two weeks. I can't give a discount, sorry, but I will put a note so this does not happen again.",
      "I only moved from Lagos in March so I know how stressful bills are here when everything is new.",
    ].join("\n\n"),
    explainAnswers: [
      "I wanted the caller to feel heard first, the facts can wait ten seconds.",
      "With twelve people in the queue I would skip the small talk and go straight to cancelling the open bill.",
    ],
    decision: {
      companyId: "co-vesto",
      kind: "pass",
      feedback:
        "Thank you for a calm opening, and for saying clearly that you cannot give a discount. This billing line is answered in Finnish only, so we cannot offer it now. The way you named the double contract in one sentence is something to keep.",
      hoursToReply: 6,
    },
  },
  {
    id: "proof_call_03",
    person: "zainab",
    challenge: "vesto-bills",
    hoursAgo: 44,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Hyvää päivää, asiakaspalvelu, Zainab puhelimessa. Ymmärrän, kaksi laskua samasta kuukaudesta, se ei ole ok.",
      "Katson... joo, muuttopäivä on kirjattu kaksi kertaa, web-lomakkeella ja puhelimessa, so you have two contracts. Meidän virhe.",
      "Peruutan nyt sen avoimen laskun, eräpäivä 21.11, sitä ei veloiteta. Maksettu lasku, 64,20, siitä teen palautuspyynnön, raha tulee tilille kymmenen arkipäivän sisällä. Today I cannot pay it back, but I can send you a confirmation by email right after this call.",
      "Haluatteko että suljen myös sen ylimääräisen sopimuksen samalla?",
    ].join("\n\n"),
    explainAnswers: [
      "I said the cause early because the customer thinks it will happen again. If they know why, they believe it is fixed.",
      "If the system showed a third bill I would stop it before ending the call and tell the customer I did it.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-vesto",
      kind: "pass",
      feedback:
        "You explained the two contracts in words a caller would use, and you closed the extra contract during the call. We filled both billing seats this week, so this is not now. Your proof stays open to other employers who ask for the same skills.",
      hoursToReply: 3.5,
    },
  },
  {
    id: "proof_call_04",
    person: "johan",
    challenge: "vesto-bills",
    hoursAgo: 18,
    shareWithSimilar: true,
    answer: [
      "Written, because I am at work and cannot record here.",
      "\"Hello, this is Johan. I can see the problem straight away: two bills for October because your move was registered twice. I'll cancel the bill that is still open right now. The one that was already paid I will send for a refund, and you get the money back within ten working days. I cannot make it faster than that, but I can call you on the day it is paid.\"",
      "I worked at Puhti Contact in the call centre for two summers while studying at Arcada, so this is a call I have heard many times.",
      "/Johan Sundqvist",
    ].join("\n\n"),
    explainAnswers: [
      "Telling them what I see first shows I have their account open and they do not need to explain again.",
      "If the caller spoke little of either language I would keep the same three facts and say them slower, maybe in Swedish if that helps.",
    ],
  },
  {
    id: "proof_design_01",
    person: "xiaoling",
    challenge: "kuulas-reminder",
    hoursAgo: 100,
    shareWithSimilar: true,
    attachment: {
      kind: "design",
      src: "/demo/reminder-poster.svg",
      alt: "A4 poster. The date and time in large type at the top, in two languages. Below: three numbered steps with simple line icons: bring an ID card, arrive 10 minutes early, call if you cannot come. The phone number sits in a teal box at the bottom.",
    },
    answer: [
      "I made it a poster that also works as a letter. The date and time are the biggest thing, in both languages: ti 18.11. klo 8.15 / Tue 18 Nov at 8:15.",
      "Right under the time: \"Do not eat for 10 hours before. Water is fine.\" In the old letter this was the last line, and I think that is why people come after breakfast.",
      "Then three numbered steps with icons. I removed \"henkilöllisyystodistus\" and wrote \"ID card (henkilökortti, passport)\". The phone number has its hours next to it, I guessed 8-16, the clinic must confirm.",
      "Grid is 12 columns, Inter 48/24/16, teal only on the phone box.",
      "Xiaoling Wu, graphic design, Metropolia 2021",
    ].join("\n\n"),
    explainAnswers: [
      "The fasting rule is the reason tests get redone, so it had to sit next to the time and not at the bottom.",
      "In black and white the teal box becomes a thick black frame, which still works.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "meet",
      feedback:
        "The time is the first thing anyone sees, and the three steps read in a few seconds. We would like to hear how you chose the icons and how you would test the poster with patients.",
      hoursToReply: 1.5,
      meeting: "invited",
    },
  },
  {
    id: "proof_design_02",
    person: "wei",
    challenge: "kuulas-reminder",
    hoursAgo: 52,
    shareWithSimilar: true,
    attachment: {
      kind: "design",
      src: "/demo/reminder-phone.svg",
      alt: "A phone-sized reminder card: a calendar block with the date and time, a map pin with the address and floor, and one large button 'Soita ja siirrä aika / Call to change the time'. Each line has its English translation under it in lighter type.",
    },
    answer: [
      "Most people open this reminder on the phone, so I designed for the phone first. Calendar block on top with the time, then the address with floor, then one big button to call and move the time. English sits under every line in lighter grey so the reader always finds their own language in the same place.",
      "I am in Tallinn now and move to Espoo in January, I tested the card on two friends who are learning the language. Both found the time in under 3 seconds but one missed the fasting rule, so I put it in the calendar block.",
    ].join("\n\n"),
    explainAnswers: [
      "I started from the button because changing the time is the action that saves the clinic a wasted slot.",
      "If it had to fit three languages I would drop the grey English line and let people pick a language at the top.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "pass",
      feedback:
        "The single button for changing the time solves a problem we see at the clinic every week, and you tested it with real readers. Our studio is full until spring, so we cannot take anyone on now. Keep the way you put English under each Finnish line.",
      hoursToReply: 8,
    },
  },
  {
    id: "proof_design_03",
    person: "matilda",
    challenge: "kuulas-reminder",
    hoursAgo: 26,
    shareWithSimilar: false,
    attachment: {
      kind: "design",
      src: "/demo/reminder-letter.svg",
      alt: "A one-page reminder letter with a teal band on top. The time is bold and alone on its line. Pictograms show 'bring ID' and 'no food 10 hours before'. A small floor plan marks the entrance and the lift.",
    },
    answer: [
      "Kept it as a letter since the clinic posts it. Teal band, time alone on one line in bold, then pictograms for ID and fasting. Added a tiny floor plan becuase \"2. kerros\" doesnt help if you cant find the lift.",
      "Removed \"Hyvä asiakas\" and the threat about the visit fee from the top, the fee moves to small print at the end.",
      "Did this one in Figma during my lunch break, the floor plan is a guess.",
    ].join("\n\n"),
    explainAnswers: [
      "The time first, because that is what people check again on the morning of the test.",
      "On a phone I would cut the floor plan and keep only the pictograms.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "pass",
      feedback:
        "Moving the fasting rule next to the time is the change that matters most for this clinic, and the floor plan answers a question patients ask us. The pictograms need a word beside each one for some readers. We cannot take on a new designer until spring.",
      hoursToReply: 0.75,
    },
  },
  {
    id: "proof_design_04",
    person: "iryna",
    challenge: "kuulas-reminder",
    hoursAgo: 9,
    shareWithSimilar: true,
    answer: [
      "I describe it in words, I don't have my laptop here.",
      "Top: a big box with only three things. TUESDAY 18.11. 8:15. NO FOOD AFTER 22:15 THE EVENING BEFORE (water ok). I wrote the clock time instead of \"10 hours\" because counting hours back at night is hard when you are tired.",
      "Middle: where. Rantakaari 9 B, 2nd floor, with a small arrow sign \"Laboratorio / Laboratory\".",
      "Bottom: \"Cannot come? Call 09 000 1234\" and the opening hours, and that you can change the time until the day before.",
      "Every line suomeksi first, then English, same size. Ukrainian or Arabic could go on the back.",
    ].join("\n\n"),
    explainAnswers: [
      "The no-food time is first because the old letter hides it and it is the main reason people must come again.",
      "If only black and white printing, I would use a thick border around the top box instead of colour.",
    ],
  },
];
