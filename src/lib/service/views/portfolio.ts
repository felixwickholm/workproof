import { totalOf } from "@/lib/domain/scoring";
import type {
  Portfolio,
  PortfolioCard,
  PortfolioFacts,
  Skill,
  SkillScore,
} from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import type { PortfolioPrefs } from "@/lib/store/types";
import { ServiceError } from "../support";

/** Where a shared link opens. The token is the whole address: no name, no key. */
export const linkFor = (token: string) => `/work/${token}`;

/** A reviewer's points with each skill's name, for the person to read. */
function labelled(
  scores: readonly SkillScore[],
  skills: readonly Pick<Skill, "id" | "label">[],
): { total: number; scores: (SkillScore & { label: string })[] } {
  return {
    total: totalOf(scores),
    scores: scores.map((s) => ({
      ...s,
      label: skills.find((k) => k.id === s.skillId)?.label ?? s.skillId,
    })),
  };
}

const newestFirst = (a: PortfolioCard, b: PortfolioCard) =>
  b.submittedAt.localeCompare(a.submittedAt);

function prefsOf(
  data: StoreData,
  talentId: string,
): PortfolioPrefs | undefined {
  return data.portfolios?.find((p) => p.talentId === talentId);
}

/**
 * Every finished event task of one person, newest first: this event's work and earlier events' records.
 * `forOwner` keeps the person's own words, every decision and every score; otherwise the words the company read,
 * and a decision and score only where the person chose to show them. A score is the reviewer's own points for
 * this one piece of work: nothing compares the person with anyone else. Practice tasks have no company, so they are not here.
 */
export function portfolioCards(
  data: StoreData,
  talentId: string,
  forOwner: boolean,
): PortfolioCard[] {
  const shown = new Set(prefsOf(data, talentId)?.decisionShown ?? []);
  const companyName = (id: string) =>
    data.companies.find((c) => c.id === id)?.name ?? "An Espoo company";

  const current = data.submissions
    .filter((s) => s.talentId === talentId)
    .flatMap((submission): PortfolioCard[] => {
      const challenge = data.challenges.find(
        (c) => c.id === submission.challengeId,
      );
      const proof = data.proofs.find((p) => p.proofId === submission.id);
      if (!challenge || !proof || challenge.kind !== "event") return [];
      const showDecision = forOwner || shown.has(submission.id);
      return [
        {
          id: submission.id,
          proofId: submission.id,
          event: { name: data.event.name, date: data.event.date },
          companyName: challenge.companyIds.map(companyName).join(" and "),
          taskTitle: challenge.title,
          format: challenge.format,
          skills: challenge.coreSkills.map(({ id, label }) => ({ id, label })),
          answer: forOwner ? submission.answer : proof.work,
          submittedAt: submission.submittedAt,
          responses: data.decisions
            .filter((d) => d.proofId === submission.id)
            .map((d) => ({
              reviewer: d.reviewer,
              companyName: companyName(d.companyId),
              feedback: d.feedback,
              ...(showDecision && d.decision !== "hold"
                ? { decision: d.decision }
                : {}),
              ...(showDecision && d.scores?.length
                ? labelled(d.scores, challenge.coreSkills)
                : {}),
            })),
        },
      ];
    });

  const earlier = (data.history ?? [])
    .filter((w) => w.talentId === talentId)
    .map((w): PortfolioCard => ({
      id: w.id,
      event: w.event,
      companyName: w.companyName,
      taskTitle: w.taskTitle,
      format: w.format,
      skills: w.skills,
      answer: w.answer,
      submittedAt: w.submittedAt,
      responses: [
        {
          reviewer: w.reviewer,
          companyName: w.companyName,
          feedback: w.feedback,
          ...(forOwner || shown.has(w.id)
            ? { decision: w.decision, ...labelled(w.scores, w.skills) }
            : {}),
        },
      ],
    }));

  return [...current, ...earlier].sort(newestFirst);
}

/** Plain counts over the cards given. An invitation counts only where its decision is visible. */
function factsOf(cards: readonly PortfolioCard[]): PortfolioFacts {
  const responses = cards.flatMap((c) => c.responses);
  return {
    tasks: cards.length,
    events: new Set(cards.map((c) => `${c.event.name}|${c.event.date}`)).size,
    companiesAnswered: new Set(responses.map((r) => r.companyName)).size,
    invitations: responses.filter((r) => r.decision === "meet").length,
  };
}

/** Tasks per skill, most tasks first, then by name. It says where the person has shown work, never how well. */
function skillsOf(cards: readonly PortfolioCard[]): Portfolio["skills"] {
  const bySkill = new Map<
    string,
    { id: string; label: string; tasks: number }
  >();
  for (const card of cards) {
    for (const skill of card.skills) {
      const entry = bySkill.get(skill.id) ?? {
        id: skill.id,
        label: skill.label,
        tasks: 0,
      };
      entry.tasks += 1;
      bySkill.set(skill.id, entry);
    }
  }
  return [...bySkill.values()].sort(
    (a, b) => b.tasks - a.tasks || a.label.localeCompare(b.label),
  );
}

/** The person's own portfolio, with their links and choices. Built from their private key. */
export function buildPortfolio(data: StoreData, talentId: string): Portfolio {
  const prefs = prefsOf(data, talentId);
  const linkOf = (cardId: string | null) => {
    const found = prefs?.links.find((l) => l.cardId === cardId);
    return found ? linkFor(found.token) : null;
  };
  const shown = new Set(prefs?.decisionShown ?? []);
  const cards = portfolioCards(data, talentId, true).map((card) => ({
    ...card,
    decisionShown: shown.has(card.id),
    link: linkOf(card.id),
  }));
  return {
    facts: factsOf(cards),
    skills: skillsOf(cards),
    cards,
    link: linkOf(null),
  };
}

/**
 * What a shared link shows: the whole portfolio or one card, with the words the company read and no name,
 * contact or key. A link the person removed, or a card that is gone, is not found.
 */
export function buildSharedPortfolio(
  data: StoreData,
  token: string,
): Portfolio {
  for (const prefs of data.portfolios ?? []) {
    const link = prefs.links.find((l) => l.token === token);
    if (!link) continue;
    const cards = portfolioCards(data, prefs.talentId, false).filter(
      (c) => link.cardId === null || c.id === link.cardId,
    );
    if (cards.length === 0) break;
    return { facts: factsOf(cards), skills: skillsOf(cards), cards };
  }
  throw new ServiceError(404, "This link is not shared any more");
}
