import type { SeedProof } from "../types";

/**
 * Synthetic work for the late delivery call and the reminder redesign.
 * Spoken answers keep only the transcript. Pictures show the work, never a person.
 */
export const CALL_AND_DESIGN_PROOFS: SeedProof[] = [
  {
    id: "proof_call_01",
    person: "hodan",
    challenge: "vesto-delivery",
    hoursAgo: 47,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Hi, this is Hodan. Before anything else: yes, order 4471 is late, it should have been with you on the 3rd, and that is on us, not on you.",
      "Can I ask one thing first: what does your site need this month? I have your hospital handover on the 28th in my notes.",
      "Here is what I can do today. We have 120 of the DN25 valves in our own stock. I can ship them on Friday with express freight at our cost, so phase 1 is covered.",
      "For the other 280 I do not have a date I trust yet. I will call you on Monday with the supplier's written date, and not before.",
    ].join("\n\n"),
    explainAnswers: [
      "I asked about the site before offering anything, because the 120 valves only help if phase 1 is what is blocking them.",
      "Then I would not offer them on this call. I would check with my colleague first and promise the client an answer within the hour.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-vesto",
      kind: "meet",
      feedback:
        "You owned the delay in the first sentence, asked about the hospital handover before offering anything, and promised a date only after the supplier confirms. That is how we want this call to sound. Let us talk at the event about the integrator accounts.",
      hoursToReply: 2.5,
      meeting: "met",
    },
  },
  {
    id: "proof_call_02",
    person: "chiamaka",
    challenge: "vesto-delivery",
    hoursAgo: 46,
    shareWithSimilar: false,
    spoken: true,
    answer: [
      "Good afternoon, thank you for calling. I understand, the valves were due on the 3rd and your team is waiting, and honestly I would be frustrated too.",
      "The delay is from our supplier's casting, and I am sorry it reached you. The new date is the 17th. I can also send 120 valves from our stock this Friday so your team can start.",
      "I cannot give a discount myself, but I will ask my director today.",
      "I looked after hospital supply accounts for a medical distributor in Lagos for four years, so I know a late delivery stops a whole site.",
    ].join("\n\n"),
    explainAnswers: [
      "The client needs a date to plan the site, so I gave the one in the system. I see now it is not confirmed, so next time I would promise a written date on Monday instead.",
      "If the 120 valves were promised to another client too, I would check with my director before offering them, not after.",
    ],
    decision: {
      companyId: "co-vesto",
      kind: "pass",
      feedback:
        "Thank you for a calm opening, and for offering the 120 valves from stock. The 17th is not yet confirmed by the supplier, and in this role a date we have to take back costs the client's trust. Our integrator clients also call in Finnish, which this role needs from the first day.",
      hoursToReply: 6,
    },
  },
  {
    id: "proof_call_03",
    person: "hanna",
    challenge: "vesto-delivery",
    hoursAgo: 44,
    shareWithSimilar: true,
    spoken: true,
    answer: [
      "Hei, Hanna Vestolta. Tiedän miksi soitat, tilaus 4471 on kaksi viikkoa myöhässä, ja se on meidän vastuulla.",
      "Ennen kuin lupaan mitään: mitä työmaa tarvitsee ensin? Muistiinpanoissa on sairaalan luovutus 28. päivä.",
      "Varastossa on 120 venttiiliä, ne lähtevät perjantaina pikarahtina meidän kustannuksella. The rest I cannot promise today, the supplier has not confirmed in writing. I will call you on Monday with a date I can stand behind.",
    ].join("\n\n"),
    explainAnswers: [
      "The handover date tells me what the client needs first, so I start there. I check it by asking them before I offer anything, because the stock valves help only if phase 1 is what stops them.",
      "Then I offer what I can confirm today, express freight for the rest once the supplier confirms, and I ask my colleague whether the stock can be split.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-vesto",
      kind: "pass",
      feedback:
        "You owned the delay, asked about the site first and kept the date open until the supplier confirms, which is how we want this call handled. We filled both key account roles this week, so this is not now. Your proof stays open to other employers who ask for the same skills.",
      hoursToReply: 3.5,
    },
  },
  {
    id: "proof_call_04",
    person: "johan",
    challenge: "vesto-delivery",
    hoursAgo: 18,
    shareWithSimilar: true,
    answer: [
      "Written, because I am at work and cannot record here.",
      "\"Hello, this is Johan. You are right to call, order 4471 is two weeks late and I am sorry. I see your hospital handover is on the 28th. What I can do now: 120 valves from our own stock leave on Friday, freight on us, so phase 1 can go ahead. The rest depends on our supplier, and I will not give you a date until I have it in writing. You will hear from me on Monday either way.\"",
      "I studied international business at Arcada and did inside sales for a ventilation wholesaler for three years.",
      "/Johan Sundqvist",
    ].join("\n\n"),
    explainAnswers: [
      "Saying the handover date back to the client shows I know their project and they do not need to explain it again.",
      "I would say that discounts are decided by our sales director and that I will take it to her today. I would not trade a discount against the date.",
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
      "People open a reminder to find when to come, so the time must be the first thing they see. I would check it by asking three people new to Finnish to find the time and the fasting rule, and timing them.",
      "The time and the numbered steps stay the same in every language. Each language gets its own line under the Finnish one, and I would test that the longest one still fits.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "meet",
      feedback:
        "The time is the first thing anyone sees, and the three steps read in a few seconds. We would like to hear how you chose the icons and how you would test the poster with patients.",
      hoursToReply: 1.5,
      // She said no: she took another design job the same week. The studio never sees her name.
      meeting: "declined",
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
      "Most people would get a layout made for paper on a small screen, zoom in, and miss the fasting rule at the bottom.",
      "It already starts from the phone. I would check that the time, the fasting rule and the button fit on the first screen without scrolling.",
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
      "I had only my phone, so words were the honest way to show the design. The no-food time comes first in it, because the old letter hides it.",
      "If only black and white printing, I would use a thick border around the top box instead of colour.",
    ],
  },
];
