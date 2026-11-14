import type { MyTableInvite, TableInvite } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { inviteCheck, shownNameProblem } from "./table-rules";

export const TABLE_INVITE_ACTION = "Invited from the table";

const NOT_YOURS = "Only the person who sent this proof can read or answer its invitation";

/** The practice proof behind a table row, or a 404. An event proof never takes part in the table's loop. */
function practiceProof(data: StoreData, proofId: string) {
  const proof = findOrThrow(data.proofs, (p) => p.proofId === proofId, "Proof");
  const challenge = data.challenges.find((c) => c.id === proof.challengeId);
  if (challenge?.kind !== "taster") throw new ServiceError(409, "Only practice proofs from this table can be invited here");
  return proof;
}

/** The proof's author proves it with their private key; nobody else reads the invitation or answers it. */
function authorsInvite(data: StoreData, proofId: string, key: string): TableInvite | undefined {
  practiceProof(data, proofId);
  const submission = data.submissions.find((s) => s.id === proofId);
  if (!key || submission?.talentId !== key) throw new ServiceError(403, NOT_YOURS);
  return data.tableInvites?.find((i) => i.proofId === proofId);
}

const forAuthor = (invite: TableInvite | undefined): MyTableInvite =>
  invite ? { invite: { status: invite.status, host: invite.host, message: invite.message } } : {};

/**
 * The person hosting the table invites the author of one practice proof. One invitation per proof,
 * written like an employer's decision: a named person and two sentences. No name is shown yet.
 */
export async function inviteFromTable(proofId: string, input: { host: string; message: string }): Promise<MyTableInvite> {
  const host = input.host.trim();
  const message = input.message.trim();
  const problem = inviteCheck(host, message).waitingFor;
  if (problem) throw new ServiceError(400, problem);

  return getStore().update((data) => {
    const proof = practiceProof(data, proofId);
    data.tableInvites ??= [];
    if (data.tableInvites.some((i) => i.proofId === proofId)) throw new ServiceError(409, "This proof already has an invitation");
    const invite: TableInvite = { proofId, host, message, status: "invited", invitedAt: clock.now().toISOString() };
    data.tableInvites.push(invite);
    appendAudit(data, {
      actor: "human",
      by: host,
      action: TABLE_INVITE_ACTION,
      detail: `${proof.label}: asked to meet in writing. The name stays hidden unless the person accepts.`,
    });
    return forAuthor(invite);
  });
}

/** The invitation for one of the visitor's own practice proofs, with the host's words; empty while there is none. */
export async function myTableInvite(proofId: string, key: string): Promise<MyTableInvite> {
  return forAuthor(authorsInvite(await getStore().read(), proofId, key));
}

function openInvite(data: StoreData, proofId: string, key: string): TableInvite {
  const invite = authorsInvite(data, proofId, key);
  if (!invite) throw new ServiceError(404, "This proof has no invitation");
  return invite;
}

/**
 * The author accepts. This is the moment a name is given and consented to: the first name is stored
 * now, only on the invitation, and only the table screen shows it. Answering twice changes nothing.
 */
export async function acceptTableInvite(proofId: string, key: string, firstName: string): Promise<MyTableInvite> {
  const problem = shownNameProblem(firstName);
  if (problem) throw new ServiceError(400, problem);

  return getStore().update((data) => {
    const invite = openInvite(data, proofId, key);
    if (invite.status === "declined") throw new ServiceError(409, "You already said not now to this invitation");
    if (invite.status === "accepted") return forAuthor(invite);
    invite.status = "accepted";
    invite.shownName = firstName.trim();
    const proof = practiceProof(data, proofId);
    appendAudit(data, {
      actor: "human",
      by: "Talent",
      action: "Accepted a table invitation",
      detail: `${proof.label} accepted ${invite.host}'s invitation. The first name is shown on the table screen.`,
    });
    return forAuthor(invite);
  });
}

/** The author says not now. No name is stored, now or later. */
export async function declineTableInvite(proofId: string, key: string): Promise<MyTableInvite> {
  return getStore().update((data) => {
    const invite = openInvite(data, proofId, key);
    if (invite.status === "accepted") throw new ServiceError(409, "You already accepted this invitation");
    if (invite.status === "declined") return forAuthor(invite);
    invite.status = "declined";
    const proof = practiceProof(data, proofId);
    appendAudit(data, {
      actor: "human",
      by: "Talent",
      action: "Declined a table invitation",
      detail: `${proof.label} said not now to ${invite.host}. The name was never shown.`,
    });
    return forAuthor(invite);
  });
}
