"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Portfolio } from "@/lib/domain/types";
import { riseAt } from "../ui/rise";
import { StatTile } from "../ui/stat-tile";
import { filterCards, NO_FILTER } from "./filter";
import { FilterBar } from "./filter-bar";
import { PortfolioCardView, type CardControls } from "./portfolio-card";
import { SkillBars } from "./skill-bars";

/**
 * The portfolio body, the same for the owner and a shared link: plain facts, the skills shown in work, filters,
 * then one card per task, newest first, each with the reviewer's own score. Nothing here ranks the person or compares them with others.
 */
export function PortfolioView({
  portfolio,
  controlsFor,
  aside,
}: {
  portfolio: Portfolio;
  controlsFor?: (cardId: string) => CardControls;
  aside?: ReactNode;
}) {
  const [filter, setFilter] = useState(NO_FILTER);
  const cards = useMemo(
    () => filterCards(portfolio.cards, filter),
    [portfolio.cards, filter],
  );
  const formats = useMemo(
    () => [...new Set(portfolio.cards.map((c) => c.format))],
    [portfolio.cards],
  );
  const { facts } = portfolio;
  return (
    <div className="flex flex-col gap-6">
      <ul
        aria-label="Facts"
        className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4"
      >
        <li>
          <StatTile label="Challenges done" value={facts.tasks} />
        </li>
        <li>
          <StatTile label="Espoo events" value={facts.events} />
        </li>
        <li>
          <StatTile
            label="Companies that wrote back"
            value={facts.companiesAnswered}
          />
        </li>
        <li>
          <StatTile label="Meet invitations" value={facts.invitations} />
        </li>
      </ul>

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] min-[900px]:items-start min-[900px]:gap-8">
        <aside className="flex flex-col gap-6 min-[900px]:sticky min-[900px]:top-6">
          <section
            aria-labelledby="skills-title"
            className="rise rounded-card bg-surface p-5 min-[900px]:p-6"
            style={riseAt(1)}
          >
            <h2 id="skills-title" className="text-section text-label">
              Skills shown in work
            </h2>
            <p className="text-footnote mt-1 mb-4 text-pretty text-label-2">
              How many challenges asked for each skill. A count, not a level.
            </p>
            <SkillBars skills={portfolio.skills} tasks={facts.tasks} />
          </section>
          {aside}
        </aside>

        <section
          aria-labelledby="work-title"
          className="flex min-w-0 flex-col gap-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="work-title" className="text-section text-label">
              Work, newest first
            </h2>
            <p className="text-footnote tnum text-label-2" aria-live="polite">
              {cards.length} of {portfolio.cards.length}
            </p>
          </div>
          <FilterBar
            skills={portfolio.skills}
            formats={formats}
            value={filter}
            onChange={setFilter}
          />
          {cards.length === 0 ? (
            <p className="text-body rounded-card bg-surface p-6 text-label-2">
              No task fits these filters. Clear a chip or a word to see more.
            </p>
          ) : (
            <ol className="flex flex-col gap-4">
              {cards.map((card, i) => (
                <li key={card.id}>
                  <PortfolioCardView
                    card={card}
                    controls={controlsFor?.(card.id)}
                    style={riseAt(Math.min(i + 2, 8))}
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
