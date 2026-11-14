import type { PortfolioCard, TaskFormat } from "@/lib/domain/types";

export interface PortfolioFilter {
  /** Skill ids. A card shows when it has any of them; none picked shows every card. */
  skills: string[];
  format: TaskFormat | "all";
  /** Words to find in the task, the company or the answer. */
  text: string;
}

export const NO_FILTER: PortfolioFilter = {
  skills: [],
  format: "all",
  text: "",
};

/** Keeps the date order the cards came in (newest first); a filter only removes. */
export function filterCards(
  cards: readonly PortfolioCard[],
  filter: PortfolioFilter,
): PortfolioCard[] {
  const words = filter.text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter((card) => {
    if (filter.format !== "all" && card.format !== filter.format) return false;
    if (
      filter.skills.length &&
      !card.skills.some((s) => filter.skills.includes(s.id))
    )
      return false;
    if (!words.length) return true;
    const haystack = [
      card.taskTitle,
      card.companyName,
      card.event.name,
      card.answer,
      ...card.skills.map((s) => s.label),
    ]
      .join(" ")
      .toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

/** "14 Nov 2026", the same on server and client. */
export function eventDate(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T12:00:00Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
}
