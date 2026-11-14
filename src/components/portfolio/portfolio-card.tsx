"use client";

import { ChevronRight, Link2 } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { PortfolioCard } from "@/lib/domain/types";
import { BlindText } from "../proof";
import { ScoreView } from "../seeker/score-view";
import { FormatIcon } from "../seeker/task-format";
import { FORMAT_LABEL } from "../words";
import { cx } from "../ui/cx";
import { Switch } from "../ui/switch";
import { Tag } from "../ui/tag";
import { eventDate } from "./filter";

/** What the owner can change on one card. Absent on a shared link. */
export interface CardControls {
  onLink: (on: boolean) => Promise<void>;
  onDecisionShown: (shown: boolean) => Promise<void>;
  onCopy: (link: string) => void;
}

const DECISION_WORD = { meet: "Meet", pass: "Not now" } as const;

/** One finished task: where and for whom, the answer, and each reviewer's own points and words. */
export function PortfolioCardView({
  card,
  controls,
  style,
}: {
  card: PortfolioCard;
  controls?: CardControls;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const long = card.answer.length > 280;
  return (
    <article
      aria-label={card.taskTitle}
      className="rise rounded-card bg-surface p-5 min-[900px]:p-7"
      style={style}
    >
      <p className="text-footnote flex flex-wrap items-center gap-x-2 gap-y-1 text-label-2">
        <FormatIcon format={card.format} className="size-4" />
        <span className="font-medium text-label">
          {FORMAT_LABEL[card.format]}
        </span>
        <span aria-hidden>·</span>
        <span>{card.event.name}</span>
        <span aria-hidden>·</span>
        <time dateTime={card.submittedAt}>{eventDate(card.submittedAt)}</time>
      </p>
      <h3 className="text-title-3 mt-2 font-semibold text-pretty text-label">
        {card.taskTitle}
      </h3>
      <p className="text-body mt-0.5 text-label-2">{card.companyName}</p>
      <ul aria-label="Skills" className="mt-3 flex flex-wrap gap-1.5">
        {card.skills.map((s) => (
          <li key={s.id}>
            <Tag>{s.label}</Tag>
          </li>
        ))}
      </ul>

      <section
        aria-label="The answer"
        className="mt-5 border-t border-separator pt-4"
      >
        <p className="text-footnote font-medium text-label-2">
          {controls ? "What I wrote" : "The answer, as the company read it"}
        </p>
        <div className={cx("mt-1.5", long && !open && "line-clamp-4")}>
          <BlindText
            text={card.answer}
            bars
            className="text-body whitespace-pre-line text-label"
          />
        </div>
        {long ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="text-subhead mt-1 font-medium text-link hover:underline"
          >
            {open ? "Show less" : "Show the whole answer"}
          </button>
        ) : null}
      </section>

      <section
        aria-label="Answers from companies"
        className="mt-5 border-t border-separator pt-4"
      >
        {card.responses.length === 0 ? (
          <p className="text-body text-label-2">
            Waiting for a written answer from {card.companyName}.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {card.responses.map((r, i) => (
              <li key={`${r.reviewer}-${i}`}>
                {r.total !== undefined && r.scores ? (
                  <ScoreView total={r.total} scores={r.scores} size="md" className="mb-5" />
                ) : null}
                <blockquote className="font-serif text-[20px] leading-[28px] text-pretty text-label">
                  &ldquo;{r.feedback}&rdquo;
                </blockquote>
                <p className="text-subhead mt-2 flex flex-wrap items-center gap-2 text-label-2">
                  <span className="font-medium text-label">
                    {r.reviewer}, {r.companyName}
                  </span>
                  {r.decision ? (
                    <Tag
                      className={cx(
                        r.decision === "meet" && "bg-peach-wash text-label",
                      )}
                    >
                      {DECISION_WORD[r.decision]}
                    </Tag>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {controls ? <OwnerControls card={card} controls={controls} /> : null}
    </article>
  );
}

function OwnerControls({
  card,
  controls,
}: {
  card: PortfolioCard;
  controls: CardControls;
}) {
  const hasDecision = card.responses.some((r) => r.decision || r.total !== undefined);
  return (
    <div className="mt-5 flex flex-col gap-1 border-t border-separator pt-3">
      <Row
        label="Share this challenge by link"
        hint={
          card.link
            ? "Anyone with the link sees this challenge and the answers. Not your name."
            : "Private. Only you see it."
        }
      >
        <Switch
          checked={Boolean(card.link)}
          onChange={(on) => void controls.onLink(on)}
          label={`Share "${card.taskTitle}" by link`}
        />
      </Row>
      {card.link ? (
        <button
          type="button"
          onClick={() => controls.onCopy(card.link!)}
          className="text-subhead press inline-flex h-11 items-center gap-2 self-start font-medium text-link"
        >
          <Link2 aria-hidden className="size-4" strokeWidth={1.75} />
          Copy the link
        </button>
      ) : null}
      {hasDecision ? (
        <Row
          label="Show the score and decision on links"
          hint={
            card.decisionShown
              ? "Links show the score and Meet or Not now."
              : "Links show the written answer only."
          }
        >
          <Switch
            checked={Boolean(card.decisionShown)}
            onChange={(on) => void controls.onDecisionShown(on)}
            label={`Show the score and decision for "${card.taskTitle}" on links`}
          />
        </Row>
      ) : null}
      {card.proofId ? (
        <Link
          href={`/my-work/${card.proofId}`}
          className="text-subhead group mt-1 inline-flex h-11 items-center gap-1 self-start font-medium text-link"
        >
          Open this work
          <ChevronRight
            aria-hidden
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </Link>
      ) : null}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-subhead font-medium text-label">{label}</p>
        <p className="text-footnote text-pretty text-label-2">{hint}</p>
      </div>
      {children}
    </div>
  );
}
