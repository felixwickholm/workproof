import type { Company, Decision, SeekerHome, SeekerInvitation, SeekerTask } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { forTalent } from "../for-talent";
import { replyTotals } from "../reply-totals";
import { eventChallenges, HOUR_MS } from "./event";
import { buildPassport } from "./passport";
import { spell, Spell } from "./words";

/** A written answer counts as new for this long. */
const NEW_ANSWER_HOURS = 48;

/**
 * The open tasks, newest first. The same list for everyone: it is not personalised and not ranked
 * by fit, because ranking people's chances would need a profile of them. `mine` only marks work already sent.
 */
function taskFeed(data: StoreData, ownChallengeIds: Set<string>): SeekerTask[] {
  const companies = new Map(data.companies.map((c) => [c.id, c]));
  return eventChallenges(data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
    .map((challenge) => {
      const proofs = data.proofs.filter((p) => p.challengeId === challenge.id);
      return {
        challenge: forTalent(challenge),
        companies: challenge.companyIds.flatMap((id) => companies.get(id) ?? []),
        proofsSent: proofs.length,
        medianReplyHours: replyTotals(proofs, data.decisions).medianHoursToFirstAnswer,
        mine: ownChallengeIds.has(challenge.id),
      };
    });
}

function invitationsFor(data: StoreData, proofIds: Set<string>): SeekerInvitation[] {
  const companies = new Map<string, Company>(data.companies.map((c) => [c.id, c]));
  const owners = new Map(data.challenges.map((c) => [c.id, c.companyIds]));
  return data.meetings
    .filter((m) => proofIds.has(m.proofId))
    .flatMap((meeting) => {
      const company = companies.get(meeting.companyId);
      const decision = data.decisions.find((d) => d.proofId === meeting.proofId && d.companyId === meeting.companyId);
      const proof = data.proofs.find((p) => p.proofId === meeting.proofId);
      if (!company || !decision || !proof) return [];
      return [
        {
          at: decision.decidedAt,
          invitation: {
            meetingId: meeting.id,
            proofId: proof.proofId,
            proofLabel: proof.label,
            companyName: company.name,
            sector: company.sector,
            district: company.district,
            reviewer: decision.reviewer,
            feedback: decision.feedback,
            slot: meeting.slot,
            status: meeting.status,
            viaSecondLook: !(owners.get(proof.challengeId) ?? []).includes(company.id),
          },
        },
      ];
    })
    .sort((a, b) => b.at.localeCompare(a.at))
    .map(({ invitation }) => invitation);
}

/** Today's one fact: an open invitation, else a new written answer, else proofs waiting, else the open tasks. */
function greetingFact(data: StoreData, home: Omit<SeekerHome, "greeting">, proofIds: Set<string>, now: Date): string {
  const open = home.invitations.find((i) => i.status === "invited");
  if (open) return `${open.companyName} wants to meet you.`;

  // An answer that came with an invitation is already told by the invitation.
  const since = now.getTime() - NEW_ANSWER_HOURS * HOUR_MS;
  const invited = (d: Decision) => data.meetings.some((m) => m.proofId === d.proofId && m.companyId === d.companyId);
  const companyName = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "An employer";
  const fresh = data.decisions
    .filter((d) => proofIds.has(d.proofId) && new Date(d.decidedAt).getTime() >= since)
    .filter((d) => !invited(d))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0];
  if (fresh) return `${companyName(fresh.companyId)} wrote you an answer.`;

  const answered = new Set(data.decisions.map((d) => d.proofId));
  const waiting = home.passport.filter((e) => e.challenge.kind === "event" && !answered.has(e.proof.proofId)).length;
  if (waiting === 1) return "Your proof waits for a reader.";
  if (waiting > 1) return `Your ${spell(waiting)} proofs wait for a reader.`;

  const tasks = home.tasks.length;
  return tasks === 1 ? "One task is open today." : `${Spell(tasks)} tasks are open today.`;
}

/** The work seeker's home, for the person behind `talentId` only. */
export function buildSeekerHome(data: StoreData, talentId: string, now: Date): SeekerHome {
  const own = data.submissions.filter((s) => s.talentId === talentId);
  const proofIds = new Set(own.map((s) => s.id));
  const decisions = data.decisions.filter((d) => proofIds.has(d.proofId));
  const passport = buildPassport(data, talentId, now);
  const invitations = invitationsFor(data, proofIds);
  const body = {
    counts: {
      proofs: passport.length,
      readByPeople: new Set(decisions.map((d) => d.proofId)).size,
      writtenAnswers: decisions.length,
      invitations: invitations.length,
    },
    invitations,
    tasks: taskFeed(data, new Set(own.map((s) => s.challengeId))),
    passport,
  };
  const name = data.talents.find((t) => t.id === talentId)?.name.trim();
  return { greeting: { firstName: name ? name.split(/\s+/)[0] : null, fact: greetingFact(data, body, proofIds, now) }, ...body };
}
