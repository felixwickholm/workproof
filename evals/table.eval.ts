import { beforeAll, describe, expect, it } from "vitest";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import { GET as mineRoute } from "@/app/api/table/mine/route";
import { POST as acceptRoute } from "@/app/api/table/proofs/[proofId]/accept/route";
import { POST as declineRoute } from "@/app/api/table/proofs/[proofId]/decline/route";
import { POST as inviteRoute } from "@/app/api/table/proofs/[proofId]/invite/route";
import { GET as tableRoute } from "@/app/api/table/proofs/route";
import { POST as tasterRoute } from "@/app/api/taster/route";
import type { Challenge, MyTableInvite, OwnProof, TableProof } from "@/lib/domain/types";
import { VISITOR_KEY_HEADER } from "@/lib/service/table-rules";
import { getStore } from "@/lib/store";
import { call, record } from "./helpers";

const EVAL = "7 Table screen";
const HOST = "Rami";
const INVITATION = "Your plan for the shared board caught my eye. I would like to hear how you check the sauce.";

/** Visitors who write who they are into the answer itself and skip the name step, the worst case for a public screen. */
const VISITORS = [
  { key: "t_eval_table_mikko_41c2", answer: "hi im Mikko from Lahti, mikko@example.org. I would keep the gluten-free bread on its own board." },
  { key: "t_eval_table_ahmed_7d90", answer: "Ahmed Al-Sayed here, 34, tel +358 40 123 4567, ahmed.s@example.org. Loop needs a timeout or the motor is never cut." },
  { key: "t_eval_table_saimi_2b8e", answer: "Saimi Korhonen, call 040 765 4321. I would ask the guest first and plate on a clean board." },
];
const SECRETS = ["Mikko", "Lahti", "mikko@example.org", "Ahmed", "Al-Sayed", "+358 40 123 4567", "ahmed.s@example.org", "Saimi", "Korhonen", "040 765 4321"];
/** Fields a public row may carry, and nothing else. */
const ROW_KEYS = ["invite", "label", "proofId", "proofKind", "submittedAt", "taskTitle"];

/** A route call as the proof's author: their own key in its header, never in the address or body. */
async function asAuthor<T>(handler: (request: Request, ctx: never) => Promise<Response>, key: string, options: { path?: string; body?: unknown; params?: Record<string, string> } = {}) {
  const request = new Request(`http://localhost${options.path ?? "/api"}`, {
    method: options.path ? "GET" : "POST",
    headers: { "content-type": "application/json", ...(key ? { [VISITOR_KEY_HEADER]: key } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const invoke = handler as unknown as (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
  const response = await invoke(request, { params: Promise.resolve(options.params ?? {}) });
  return { status: response.status, json: (await response.json()) as T };
}

const tableText = async () => JSON.stringify((await call<TableProof[]>(tableRoute)).json);

describe("Eval 7: the public table screen", () => {
  const proofs: OwnProof[] = [];

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    const taster = (await call<Challenge>(tasterRoute, { body: { dreamJob: "Chef" } })).json;
    for (const visitor of VISITORS) {
      const sent = await call<{ proof: OwnProof }>(submissionsRoute, {
        body: {
          challengeId: taster.id,
          talent: { id: visitor.key, name: "", contact: "" },
          answer: visitor.answer,
          explain: [{ question: "Why?", answer: "One shared board undoes the rest of the plate." }],
          shareWithSimilar: false,
        },
      });
      proofs.push(sent.json.proof);
    }
  });

  it("shows labels and tasks only: no names, emails or phone numbers from the answers", async () => {
    const rows = (await call<TableProof[]>(tableRoute)).json;
    const text = JSON.stringify(rows);
    const leaked = SECRETS.filter((secret) => text.includes(secret));
    const extraKeys = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key) => !ROW_KEYS.includes(key));
    const ok = rows.length >= VISITORS.length && leaked.length === 0 && extraKeys.length === 0;
    record(EVAL, "no free text on the public screen", `${leaked.length} of ${SECRETS.length} names, emails and numbers found; extra fields: ${extraKeys.join(", ") || "none"}`, ok);
    expect(leaked).toEqual([]);
    expect(extraKeys).toEqual([]);
  });

  it("lets only the author read the invitation, and shows a name only after their yes", async () => {
    const [mikko] = proofs;
    const author = VISITORS[0].key;
    const params = { proofId: mikko.proofId };
    const mine = `/api/table/mine?proofId=${mikko.proofId}`;

    const invited = await call<MyTableInvite>(inviteRoute, { body: { host: HOST, message: INVITATION }, params });
    const again = await call(inviteRoute, { body: { host: HOST, message: INVITATION }, params });
    const stranger = await asAuthor(mineRoute, "t_guess", { path: mine });
    const noKey = await asAuthor(mineRoute, "", { path: mine });
    const read = await asAuthor<MyTableInvite>(mineRoute, author, { path: mine });
    const beforeYes = await tableText();
    const strangerAccept = await asAuthor(acceptRoute, "t_guess", { body: { firstName: "Mikko" }, params });
    const accepted = await asAuthor<MyTableInvite>(acceptRoute, author, { body: { firstName: "Mikko" }, params });
    const row = (await call<TableProof[]>(tableRoute)).json.find((r) => r.proofId === mikko.proofId);

    const ok =
      invited.status === 200 &&
      again.status === 409 &&
      stranger.status === 403 &&
      noKey.status === 403 &&
      strangerAccept.status === 403 &&
      read.json.invite?.message === INVITATION &&
      !beforeYes.includes("Mikko") &&
      !beforeYes.includes(INVITATION) &&
      accepted.json.invite?.status === "accepted" &&
      row?.invite?.shownName === "Mikko";
    record(
      EVAL,
      "name only after the person's yes",
      `second invite HTTP ${again.status}; stranger read HTTP ${stranger.status}, accept HTTP ${strangerAccept.status}; name on screen before yes: ${beforeYes.includes("Mikko")}, after: ${row?.invite?.shownName ?? "none"}`,
      ok,
    );
    expect(ok).toBe(true);
  });

  it("keeps a declined person unnamed, and refuses an event proof", async () => {
    const saimi = proofs[2];
    const params = { proofId: saimi.proofId };
    await call(inviteRoute, { body: { host: HOST, message: INVITATION }, params });
    const declined = await asAuthor<MyTableInvite>(declineRoute, VISITORS[2].key, { params });
    const lateAccept = await asAuthor(acceptRoute, VISITORS[2].key, { body: { firstName: "Saimi" }, params });
    const text = await tableText();
    const data = await getStore().read();
    const events = new Set(data.challenges.filter((c) => c.kind === "event").map((c) => c.id));
    const eventProof = data.proofs.find((p) => events.has(p.challengeId));
    const event = await call(inviteRoute, { body: { host: HOST, message: INVITATION }, params: { proofId: eventProof?.proofId ?? "" } });

    const ok = declined.json.invite?.status === "declined" && lateAccept.status === 409 && !text.includes("Saimi") && event.status === 409;
    record(EVAL, "decline stores nothing", `declined; a later accept HTTP ${lateAccept.status}; name on screen: ${text.includes("Saimi")}; event proof invite HTTP ${event.status}`, ok);
    expect(ok).toBe(true);
  });
});
