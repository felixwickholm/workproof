import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { Challenge, Company, ProofKind } from "@/lib/domain/types";
import { CompanyMark } from "../ui/avatar";
import { cx } from "../ui/cx";
import { PROOF_KIND_LABEL, ProofKindIcon } from "../ui/proof-kind";
import { Tag } from "../ui/tag";
import { answeredLine, clipSkills, companyLine, pooledLine } from "./format";
import { placesState, type PlacesState } from "./places-line";

interface Props {
  challenge: Challenge;
  /** Every company at the event, or just this task's; the card picks the task's own. */
  companies: Company[];
  href: string;
  proofsSent?: number;
  medianReplyHours?: number | null;
  /** The person already sent work for this task. */
  mine?: boolean;
  /** Answers the task still takes. Without it the card says nothing about places. */
  placesLeft?: number;
  /** "card" for a feed; "row" is a dense row, at least 63px, that grows for a two-line title on a phone. */
  variant?: "card" | "row";
  /** A target for the guided walkthrough, `data-tour="<id>"`. */
  tour?: string;
  className?: string;
}

/**
 * A pale hue per kind of work, so a feed of cards has a rhythm without a picture. Six hues 40 degrees
 * or more apart and none violet; code keeps the plain fill. Identity of the kind, never data.
 */
const KIND_HUE: Record<ProofKind, number | null> = { writing: 215, plan: 70, photo: 130, video: 25, voice: 345, design: 175, code: null };

function Sent() {
  return (
    <Tag tone="positive" icon={<Check aria-hidden className="size-3.5" strokeWidth={2.2} />} className="h-6 px-2.5 text-caption">
      Sent
    </Tag>
  );
}

function Marks({ companies }: { companies: Company[] }) {
  return (
    <span className="flex shrink-0">
      {companies.map((c, i) => (
        <CompanyMark key={c.id} company={c} size="sm" className={cx(i > 0 && "-ml-1.5 ring-2 ring-surface")} />
      ))}
    </span>
  );
}

function KindTint({ kind }: { kind: ProofKind }) {
  const hue = KIND_HUE[kind];
  if (hue === null) return <span aria-hidden className="absolute inset-0 bg-fill" />;
  return <span aria-hidden className="mark-tint absolute inset-0 opacity-50" style={{ "--h": hue } as CSSProperties} />;
}

/** "7 of 12 places left" in grey, in ink once three or fewer are left, "Full" when none are. */
function Places({ state, className }: { state: PlacesState; className?: string }) {
  return <span className={cx("text-footnote tnum whitespace-nowrap", state.few ? "font-medium text-label" : "text-label-2", className)}>{state.text}</span>;
}

/**
 * A task in a feed. It leads with the time in ink ("20 min"), because the time is what makes
 * "a task, not a CV" obvious; then what the task is, who posted it and how many places are left.
 * On a card a quiet band names the kind of work, in a pale tint of that kind's own hue.
 * The whole card is one link.
 */
export function TaskCard({ challenge, companies, href, proofsSent, medianReplyHours, mine, placesLeft, variant = "card", tour, className }: Props) {
  const own = companies.filter((c) => challenge.companyIds.includes(c.id));
  const kind = PROOF_KIND_LABEL[challenge.proofKind];
  const places = placesLeft === undefined ? null : placesState(challenge, placesLeft);
  const minutes = `${challenge.minutes} min`;

  if (variant === "row") {
    return (
      <Link
        href={href}
        data-tour={tour}
        className={cx(
          "press flex min-h-[63px] items-center gap-3 rounded-[14px] bg-raised px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--color-separator)] transition-colors duration-150 hover:bg-fill",
          className,
        )}
      >
        <span className="text-subhead tnum w-[52px] shrink-0 font-semibold text-label max-sm:w-[46px] max-sm:text-[14px]">{minutes}</span>
        <span className="min-w-0 flex-1">
          <span className="text-subhead line-clamp-2 font-semibold text-pretty text-label sm:line-clamp-1">{challenge.title}</span>
          <span className="text-footnote flex min-w-0 items-center gap-1.5 text-label-2">
            <ProofKindIcon kind={challenge.proofKind} className="size-3.5" />
            {/* On a phone the icon names the kind, so the employer and the places keep their room. */}
            <span className="truncate">
              <span className="max-sm:sr-only">{kind} · </span>
              {own.map((c) => c.name).join(" and ")}
            </span>
            {places && !mine ? (
              <>
                <span aria-hidden>·</span>
                <Places state={places} />
              </>
            ) : null}
          </span>
        </span>
        {mine ? <Sent /> : <ChevronRight aria-hidden className="size-[18px] shrink-0 text-label-3" strokeWidth={1.8} />}
      </Link>
    );
  }

  const { shown, more } = clipSkills(challenge.coreSkills);
  const footer = [answeredLine(proofsSent, medianReplyHours), pooledLine(own.length)].filter(Boolean).join(" · ");
  return (
    <Link
      href={href}
      data-tour={tour}
      className={cx("press flex flex-col overflow-hidden rounded-card bg-surface transition-colors duration-150 hover:bg-label/[0.06]", className)}
    >
      <span className="relative flex h-10 items-center gap-2 px-5 text-label">
        <KindTint kind={challenge.proofKind} />
        <ProofKindIcon kind={challenge.proofKind} className="relative" />
        <span className="text-footnote relative font-medium">{kind}</span>
        <span className="relative ml-auto">{mine ? <Sent /> : places ? <Places state={places} /> : null}</span>
      </span>
      <span className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <span className="tnum text-[15px] leading-5 font-semibold text-label">{minutes}</span>
        <span className="mt-1 line-clamp-2 text-[19px] leading-[25px] font-semibold tracking-[-0.01em] text-pretty text-label">{challenge.title}</span>
        {own.length ? (
          <span className="mt-3 flex min-w-0 items-center gap-2">
            <Marks companies={own} />
            <span className="text-footnote min-w-0 truncate text-label">{companyLine(own)}</span>
          </span>
        ) : null}
        <span className="mt-4 flex flex-wrap gap-1.5">
          {shown.map((s) => (
            <Tag key={s.id} className="h-6 px-2.5 text-caption">
              {s.label}
            </Tag>
          ))}
          {more > 0 ? <Tag className="h-6 px-2.5 text-caption text-label-2">+{more}</Tag> : null}
        </span>
        {footer ? (
          <span className="mt-auto pt-4">
            <span className="text-footnote block border-t border-separator pt-3 text-label-2">{footer}</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
