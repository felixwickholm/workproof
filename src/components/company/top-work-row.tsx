"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { Skill, TopProof } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { Button } from "../ui/button";
import { cx } from "../ui/cx";
import { Popover } from "../ui/popover";
import { proofHref } from "./format";
import { formatTotal, workCode, workLabel } from "../words";
import { rowState } from "./hiring-words";
import { SkillMarks } from "./skill-marks";

interface Props {
  /** The row's place on the list, 1 for the highest total. */
  rank: number;
  row: TopProof;
  skills: readonly Skill[];
  /** Turns a scored, undecided work into an invitation. Only offered while the work is on hold. */
  onInvite: () => void;
  inviting: boolean;
  onShare: () => void;
  inviteTour?: string;
}

/**
 * One scored work on a challenge's leaderboard: the neutral label (the name only after the person said
 * yes), the total out of 10 with a thin bar, each skill's points, the reviewer's reason as one quiet line,
 * who scored it, where it stands and the next action. Sharing sits behind the ⋯ menu.
 */
export function TopWorkRow({ rank, row, skills, onInvite, inviting, onShare, inviteTour }: Props) {
  const [menu, setMenu] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const named = row.identity && row.meeting && (row.meeting.status === "accepted" || row.meeting.status === "met");
  const hold = row.decision.decision === "hold";

  return (
    <li className="grid gap-4 py-6 min-[1000px]:grid-cols-[32px_140px_minmax(0,1fr)_280px_auto] min-[1000px]:items-center min-[1000px]:gap-6">
      <p aria-label={`Place ${rank}`} className="tnum hidden text-[22px] leading-[44px] text-label-2 min-[1000px]:block">
        {rank}
      </p>
      <div className="flex items-center gap-4 min-[1000px]:block">
        <span aria-hidden className="tnum text-title-3 w-6 text-label-2 min-[1000px]:hidden">
          {rank}
        </span>
        <p className="tnum text-[40px] leading-[44px] font-normal text-label">
          {formatTotal(row.total)}
          <span className="text-subhead ml-1 text-label-2">of 10</span>
        </p>
        <span aria-hidden className="block h-1 w-full max-w-[140px] overflow-hidden rounded-full bg-fill min-[1000px]:mt-2">
          <span className="block h-full rounded-full bg-label" style={{ width: `${row.total * 10}%` }} />
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-title-3 font-semibold text-label">{workLabel(row.proof.label)}</p>
        {named ? (
          <p className="text-body mt-0.5 font-medium text-accent">
            {workCode(row.proof.label)} is {row.identity?.name}
          </p>
        ) : null}
        <p className="text-body mt-1 text-label">{rowState(row)}</p>
        <p title={row.decision.feedback} className="text-subhead mt-1 truncate text-label-2">
          &ldquo;{row.decision.feedback}&rdquo;
        </p>
        <p className="text-footnote mt-1 text-label-2">
          Scored by {row.decision.reviewer} · <TimeAgo at={row.decision.decidedAt} />
        </p>
      </div>

      <SkillMarks scores={row.scores} skills={skills} />

      <div className="flex items-center gap-2 min-[1000px]:justify-end">
        {hold ? (
          <Button size="sm" onClick={onInvite} loading={inviting} tour={inviteTour} className="flex-1 min-[1000px]:flex-none min-[1000px]:px-6">
            Invite
          </Button>
        ) : (
          <Button href={proofHref(row.proof.proofId)} variant="secondary" size="sm" className="flex-1 min-[1000px]:flex-none min-[1000px]:px-6">
            Open
          </Button>
        )}
        <div className="relative">
          <button
            ref={trigger}
            type="button"
            aria-label={`More for ${workLabel(row.proof.label)}`}
            aria-haspopup="menu"
            aria-expanded={menu}
            aria-controls={menu ? menuId : undefined}
            onClick={() => setMenu((open) => !open)}
            className="press flex size-11 items-center justify-center rounded-full text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label"
          >
            <MoreHorizontal aria-hidden className="size-5" strokeWidth={1.75} />
          </button>
          <Popover id={menuId} open={menu} onClose={() => setMenu(false)} trigger={trigger} className="right-0 left-auto w-[260px] origin-top-right">
            <div role="menu" aria-label={`More for ${workLabel(row.proof.label)}`}>
              {hold ? <MenuLink href={proofHref(row.proof.proofId)}>Open the work</MenuLink> : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  onShare();
                }}
                className={menuItem}
              >
                Share with another company
              </button>
            </div>
          </Popover>
        </div>
      </div>
    </li>
  );
}

const menuItem = cx("text-body flex min-h-11 w-full items-center rounded-[12px] px-3 text-left text-label transition-colors duration-150 hover:bg-fill focus-visible:bg-fill");

function MenuLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} role="menuitem" className={menuItem}>
      {children}
    </Link>
  );
}
