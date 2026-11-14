import { randomUUID } from "node:crypto";
import { getStore, type StoreData } from "@/lib/store";
import type { PortfolioPrefs } from "@/lib/store/types";
import { withdrawRecommendations } from "./recommendations";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { linkFor, portfolioCards } from "./views/portfolio";

/**
 * Turns Second look on or off for one proof. Only the author can do it, with their talent id.
 * Off removes the proof from every Second look queue and takes back unanswered recommendations; decisions already made stay.
 */
export async function setSharing(
  proofId: string,
  talentId: string,
  share: boolean,
): Promise<{ proofId: string; sharing: boolean }> {
  return getStore().update((data) => {
    const submission = findOrThrow(
      data.submissions,
      (s) => s.id === proofId,
      "Proof",
    );
    if (submission.talentId !== talentId)
      throw new ServiceError(
        403,
        "Only the person who wrote this proof can change who sees it",
      );
    const challenge = data.challenges.find(
      (c) => c.id === submission.challengeId,
    );
    if (challenge?.kind !== "event")
      throw new ServiceError(
        409,
        "A practice proof is never shown to employers",
      );
    if (submission.shareWithSimilar !== share) {
      submission.shareWithSimilar = share;
      if (!share) withdrawRecommendations(data, proofId);
      const label =
        data.proofs.find((p) => p.proofId === proofId)?.label ?? "A proof";
      appendAudit(data, {
        actor: "human",
        by: "Talent",
        action: share ? "Recorded consent" : "Withdrew consent",
        detail: share
          ? `${label} may be shown to other employers with the same core skills if the first employer says not now or does not answer in time.`
          : `${label} is no longer shown through Second look. Decisions already made stay.`,
      });
    }
    return { proofId, sharing: submission.shareWithSimilar };
  });
}

/** The person's portfolio choices, made on first use. */
function prefsFor(data: StoreData, talentId: string): PortfolioPrefs {
  data.portfolios ??= [];
  let prefs = data.portfolios.find((p) => p.talentId === talentId);
  if (!prefs) {
    prefs = { talentId, links: [], decisionShown: [] };
    data.portfolios.push(prefs);
  }
  return prefs;
}

/** Only cards in the person's own portfolio can be shared; anyone else's id reads as not found. */
function assertOwnCard(
  data: StoreData,
  talentId: string,
  cardId: string | null,
): void {
  const cards = portfolioCards(data, talentId, true);
  if (
    cardId === null ? cards.length === 0 : !cards.some((c) => c.id === cardId)
  )
    throw new ServiceError(404, "Work not found");
}

/**
 * Makes or ends a link to one card (`cardId`) or the whole portfolio (null). Everything is private until the
 * person makes a link. The link shows the work and the written answers, never the person's name or contact.
 */
export async function setPortfolioLink(
  talentId: string,
  cardId: string | null,
  on: boolean,
): Promise<{ cardId: string | null; link: string | null }> {
  return getStore().update((data) => {
    assertOwnCard(data, talentId, cardId);
    const prefs = prefsFor(data, talentId);
    const existing = prefs.links.find((l) => l.cardId === cardId);
    if (on && !existing) {
      prefs.links.push({
        token: randomUUID().replace(/-/g, ""),
        cardId,
        createdAt: clock.now().toISOString(),
      });
      appendAudit(data, {
        actor: "human",
        by: "Talent",
        action: "Shared work by link",
        detail: cardId
          ? "A person made a link to one piece of their work."
          : "A person made a link to their portfolio.",
      });
    }
    if (!on && existing) {
      prefs.links = prefs.links.filter((l) => l !== existing);
      appendAudit(data, {
        actor: "human",
        by: "Talent",
        action: "Ended a link",
        detail: "A person ended a link to their work. It no longer opens.",
      });
    }
    const token = prefs.links.find((l) => l.cardId === cardId)?.token;
    return { cardId, link: token ? linkFor(token) : null };
  });
}

/** Whether the person's links show the decision on one card. Off by default: the feedback is shown, the decision is not. */
export async function setDecisionShown(
  talentId: string,
  cardId: string,
  shown: boolean,
): Promise<{ cardId: string; decisionShown: boolean }> {
  return getStore().update((data) => {
    assertOwnCard(data, talentId, cardId);
    const prefs = prefsFor(data, talentId);
    prefs.decisionShown = prefs.decisionShown.filter((id) => id !== cardId);
    if (shown) prefs.decisionShown.push(cardId);
    return { cardId, decisionShown: shown };
  });
}
