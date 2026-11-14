import type { SeedProof } from "../types";

/**
 * Work on Polar Byte's order API task, so its reviewer has work waiting to read and some already scored.
 * Synthetic people and work; every point and reason is the company reviewer's.
 */
export const BACKEND_PROOFS: SeedProof[] = [
  {
    id: "proof_orders_01",
    person: "wei",
    challenge: "polarbyte-orders",
    hoursAgo: 40,
    shareWithSimilar: true,
    answer: [
      "Cause: the shop timed out after 3 s and sent the same cart again. The handler charges first and always makes a new order row, so the retry made a second charge and a second order.",
      "Fix:",
      "1. Ask shops to send an idempotency key with each order; use shop_id plus cart_id until they do.",
      "2. Add a unique key on (shop_id, cart_id) and return the existing order on a repeat.",
      "3. Save the order as pending first, then charge, using the key with the payment provider too.",
      "4. Tell the warehouse only after the charge is confirmed.",
      "5. Alert when one cart gets two charges, and refund the two customers today.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, two posts for cart 7731, three seconds apart. The client timed out at three seconds, but our charge took almost a second and the whole thing more than three. So the retry is the shop doing the right thing, and we are the ones who are not safe to retry. Charge first, then a new id every time. Yeah, that's two charges. A unique key on shop and cart would stop the second row. And the payment call needs the same key or the provider charges again anyway.",
      seconds: 1080,
    },
    explainAnswers: [
      "The unique key first, because it stops new double orders today even before shops change anything.",
      "A shop could reuse a cart id after an order, so I would move to a real idempotency key with an expiry as the next step.",
    ],
    decision: {
      companyId: "co-polarbyte",
      kind: "hold",
      points: [5, 4, 4, 3],
      feedback:
        "You found the retry and the charge order quickly, and the key on shop and cart is what we would ship first. The alert could say more about what on-call does next. We will decide after the event.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_orders_02",
    person: "dmytro",
    challenge: "polarbyte-orders",
    hoursAgo: 30,
    shareWithSimilar: false,
    answer: [
      "The problem is that the shop client has a timeout of 3 seconds, which is too short for our API.",
      "Fix: ask shop 118 and the other shops to raise their timeout to 30 seconds, so they do not retry so often.",
      "We could also make the payment call faster with a cache, and add more servers on Monday mornings when traffic is high.",
      "Then the duplicate orders should stop.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "So the shop times out at three seconds and retries. That's the trigger. Three seconds is short for a payment, payments can take time. If they wait longer they won't retry. Maybe thirty seconds. And we could speed up our side, the charge took eight hundred milliseconds, that's slow. Cache something. More servers on busy mornings. I think that covers it, the duplicates come from the retry, so stop the retry.",
      seconds: 620,
    },
    explainAnswers: [
      "The timeout change, because it is the smallest change and the shops can do it today.",
      "If a shop still retried after a network error, we would probably still get a second order.",
    ],
    decision: {
      companyId: "co-polarbyte",
      kind: "pass",
      points: [2, 2, 2, 3],
      feedback:
        "You spotted the timeout and the retry, which is the right start. A longer timeout still lets a retry make a second charge, so the handler itself needs to be safe to call twice. Try a unique key on the order next time.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_orders_03",
    person: "chiamaka",
    challenge: "polarbyte-orders",
    hoursAgo: 14,
    shareWithSimilar: true,
    answer: [
      "Cause: a retry after a client timeout runs the whole handler again. Nothing in the handler or the table knows the cart was already ordered, so we charge and save twice.",
      "Fix:",
      "1. Store an order request row keyed by shop and cart before doing anything else.",
      "2. If the row exists, return the same order id and status, and do not charge.",
      "3. Pass that key to the payment provider as its idempotency key.",
      "4. Log the key on every line so a repeat is easy to find.",
      "5. Find and refund other double charges since Monday.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me line up the timestamps. First post at two point one, charge ok at two point nine, then the client gives up at five and retries. The first order is never saved before the retry, interesting, the save comes after the second post. So both requests are in flight together. A check-then-insert would race, so it has to be a unique constraint, not a select first. And the provider needs the key too. Then a log field for the key so on-call can grep it.",
      seconds: 1210,
    },
    explainAnswers: [
      "The unique row before the charge, because both requests were running at the same time and a simple check would race.",
      "With more time I would look at what the warehouse does with a cancelled duplicate, since it was already notified twice.",
    ],
  },
  {
    id: "proof_orders_04",
    person: "johan",
    challenge: "polarbyte-orders",
    hoursAgo: 5,
    shareWithSimilar: true,
    answer: [
      "The double orders come from the shop retrying, and the API treating the retry as a new order.",
      "Steps:",
      "1. Return 202 quickly with a pending order id, and do the charge and warehouse call in a background job.",
      "2. Use cart_id as a unique key in the orders table.",
      "3. In the background job, check the charge status with the provider before charging.",
      "4. Add a dashboard of orders per cart per hour, with an alert above one.",
      "Short-term: refund the two customers and tell shop 118 what happened.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "So the request is slow, the client gives up, retries. Two things: make it fast and make it safe. Fast, return early and do the work in a job. Safe, a unique key. Cart id alone, hmm, is cart id unique across shops, probably not, but let me just put it. Then the job checks with the payment provider. And a dashboard, orders per cart, alert above one. And someone should call shop 118 today, they had angry customers.",
      seconds: 900,
    },
    explainAnswers: [
      "The background job, because the timeout is what starts every double order.",
      "I was not sure if cart ids repeat across shops; if they do, the key needs the shop id too.",
    ],
  },
];
