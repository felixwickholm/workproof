import type { SeedProof } from "../types";

/**
 * Halla Supply's "make our order form easier to use" task. Synthetic people and work. The three newest
 * answers arrive just after Mikko's, so his is the oldest one waiting for Halla.
 */
export const ORDER_FORM_PROOFS: SeedProof[] = [
  {
    id: "proof_ai_01",
    person: "joonas",
    challenge: "halla-order-form",
    hoursAgo: 70,
    shareWithSimilar: true,
    answer: [
      "Add a chat window to the form, so installers can ask for help at any step.",
      "Add a progress bar at the top that shows the four steps.",
      "Add help text under every field, and a short video on how to order.",
      "Make the buttons bigger and use our brand colours.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, four steps. People give up, so they need more help. A chat window, yes, they can ask someone right there. A progress bar, so they know where they are and how much is left. Help text under everything. Maybe a short video too, people like videos. Buttons bigger, colours brighter. That should do it. Done.",
      seconds: 360,
    },
    explainAnswers: [
      "I started with the chat because installers phone us anyway, so they can chat instead.",
      "If there is time for only two changes, I would do the chat and the progress bar.",
    ],
    decision: {
      companyId: "co-halla",
      kind: "pass",
      points: [2, 2, 2, 3],
      feedback:
        "You saw that installers need help, and you wrote clearly. Your changes add a chat, a video and more text, so the form gets longer, and you do not say which complaint each one fixes. For this role we need someone who makes the form simpler first, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_ai_02",
    person: "ravi",
    challenge: "halla-order-form",
    hoursAgo: 66,
    shareWithSimilar: true,
    answer: [
      "Three changes, most calls first.",
      "1. After sending, show the order number and the delivery date, and send them by email. About 40 calls a day ask only this.",
      "2. A search box for the pump model, then a picture list of its parts. Installers know the model, not HS-4471-B.",
      "3. Save the address and customer number after the first order, and show the delivery prices next to each choice.",
      "Then remove the Order reference star. Nobody knows what it is, and it blocks the send.",
      "Check it by watching three installers order on their own phones, and count the calls in the first month.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Right. What makes people phone? The quotes say it. Did my order arrive, forty calls a day. So the confirmation is first, it's cheap too. Then the product code. At my last job at Rantalinja Oy we had the same, people searched by model. Address, save it. Prices on the next page, move them up. Order reference, that star, just drop it. And test it with real installers on their phones.",
      seconds: 600,
    },
    explainAnswers: [
      "The confirmation first, because it is the cheapest change and it answers most of the calls.",
      "If most installers order with one hand, I would put the model search at the top with a large field and nothing else.",
    ],
    decision: {
      companyId: "co-halla",
      kind: "meet",
      points: [5, 4, 5, 4],
      feedback:
        "You started from the calls and the installers' own words, and you gave a reason for each change. Watching three installers order on their phones is exactly how we want to check it. Let us talk about how you would start.",
      hoursToReply: 3,
      meeting: "met",
      followUpAgreed: true,
      hired: true,
    },
  },
  {
    id: "proof_ai_03",
    person: "sari",
    challenge: "halla-order-form",
    hoursAgo: 0.65,
    shareWithSimilar: true,
    answer: [
      "I would keep the four steps but make each one calmer to read.",
      "Larger text and more space between fields, so it works on a phone.",
      "A short line of help under Product code: where to find the code on the old part.",
      "Show the delivery prices on the same page as the choice.",
      "After sending, show a clear thank-you page with the order number.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me see. Four steps, it's a lot, but splitting is not bad on a phone. The text is tiny probably. Product code, they don't know it, so tell them where it is on the part. Hmm, or a search? That's a bigger change. I studied at Haaga-Helia and we did a form like this in a course project. Prices, move them. Thank-you page with a number. Okay.",
      seconds: 480,
    },
    explainAnswers: [
      "The help line under Product code, because that is where installers stop first.",
      "If the developer has time for two changes, I would do the help line and the order number.",
    ],
  },
  {
    id: "proof_ai_04",
    person: "linh",
    challenge: "halla-order-form",
    hoursAgo: 0.42,
    shareWithSimilar: false,
    answer: [
      "Search by pump model instead of product code. Installers know the model, not the code.",
      "Save the address after the first order, so nobody types it again.",
      "Show an order number at the end, because now installers phone to ask if the order arrived.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Product code, nobody knows it, they said so. Search by model. Address typed every time, save it. And no order number, that's why they phone. Three things, and they are the ones the installers say themselves. I'm not sure about the reference field, maybe it's needed for their accounting, so I'll leave it as it is for now.",
      seconds: 270,
    },
    explainAnswers: [
      "The model search, because an installer cannot order at all without the right code.",
      "If a third of orders repeat, I would add a button to order the last parts again.",
    ],
  },
  {
    id: "proof_ai_05",
    person: "matilda",
    challenge: "halla-order-form",
    hoursAgo: 0.17,
    shareWithSimilar: true,
    spoken: true,
    answer:
      "So, the installer is standing in a basement with the broken part in their hand, right? Let them take a photo of the part and the pump's type plate, and someone at Halla finds the code. Then the form is only: photo, quantity, send. The address is saved. After sending they get the order number and the date by text message, because they are not reading email in a basement. The product code search can stay for people who know it. I think the photo is the real fix for the phone calls.",
    thinkAloud: {
      transcript:
        "Hmm, everyone will say search by model. But they're in a basement. What do they have? The part. A phone. So a photo. Someone at Halla reads it. That's more work for Halla though. Hmm. Still fewer calls. Text message, not email. Matilda here, by the way, I'm recording this from my kitchen in Kallio, sorry about the noise.",
      seconds: 390,
    },
    explainAnswers: [
      "I started there because a photo is the one thing every installer already has.",
      "If the developer has time for two changes, I would do the photo order and the text message.",
    ],
    spokenFollowUps: true,
  },
];
