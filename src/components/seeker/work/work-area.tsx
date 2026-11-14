"use client";

import type { ReactNode } from "react";
import type { Challenge } from "@/lib/domain/types";
import { READ_LIMIT, type WorkParts } from "@/lib/think-aloud/answer";
import { markedText, type FixUnit } from "@/lib/think-aloud/fix-units";
import { LIMITS } from "@/lib/http/limits";
import { TaskMaterialView } from "../../proof";
import { cx } from "../../ui/cx";
import { PictureCheck, PictureSlot } from "../picture-slot";
import { ChooseCards } from "./choose-cards";
import { FixMaterial } from "./fix-material";

interface Props {
  challenge: Challenge;
  parts: WorkParts;
  onParts: (patch: Partial<WorkParts>) => void;
  /** Fix: the marked unit's position. */
  mark: number | null;
  onMark: (index: number) => void;
  /** Make with a sketch or design: the picture, and the person's own check of it. */
  picture: string | null;
  onPicture: (value: string | null) => void;
  pictureChecked: boolean;
  onPictureChecked: (value: boolean) => void;
  /** A scripted demo drives the work area; it takes no input. */
  locked?: boolean;
}

/** The writing surface: 18px text on a quiet field, focus drawn as a border, not a glow. */
function Writing({ label, value, onChange, placeholder, rows, maxLength, locked, hint, demo }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  maxLength: number;
  locked?: boolean;
  hint?: ReactNode;
  demo?: string;
}) {
  return (
    <label className="block">
      <span className="text-body mb-2 block font-medium text-label">{label}</span>
      <textarea
        value={value}
        readOnly={locked}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        data-demo-target={demo}
        className="w-full resize-y rounded-inner bg-surface px-5 py-4 text-[18px] leading-[28px] text-label caret-accent outline-none placeholder:text-label-3 shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]"
      />
      {hint}
    </label>
  );
}

function Brief({ challenge, className }: { challenge: Challenge; className?: string }) {
  return <p className={cx("text-[18px] leading-[28px] whitespace-pre-wrap text-pretty text-label", className)}>{challenge.brief}</p>;
}

/** The work area, shaped by the challenge's format: Choose, Make, Fix or Read. */
export function WorkArea(props: Props) {
  const { challenge, parts, onParts, locked } = props;

  if (challenge.format === "choose" && challenge.options) {
    return (
      <div className="flex flex-col gap-6">
        <Brief challenge={challenge} className="max-w-[72ch]" />
        <ChooseCards options={challenge.options} picked={parts.choice} onPick={(choice) => onParts({ choice })} locked={locked} />
        {parts.choice ? (
          <div className="rise flex flex-col gap-4 min-[900px]:max-w-[720px]">
            <p className="text-[24px] leading-[30px] font-semibold text-label">Now say why, out loud.</p>
            <Writing label="A short note (optional)" value={parts.main} onChange={(main) => onParts({ main })} placeholder="One or two lines, if you like" rows={2} maxLength={LIMITS.answer} locked={locked} demo="editor" />
          </div>
        ) : null}
      </div>
    );
  }

  if (challenge.format === "fix" && challenge.material) {
    const pick = (unit: FixUnit, all: FixUnit[]) => {
      props.onMark(unit.index);
      onParts({ marked: markedText(all, unit) });
    };
    return (
      <Split
        left={
          <>
            <Brief challenge={challenge} />
            <p className="text-body mt-4 mb-3 text-label-2">Tap what is wrong.</p>
            <FixMaterial material={challenge.material} marked={props.mark} onMark={pick} locked={locked} />
          </>
        }
        right={
          <div className="flex flex-col gap-4">
            <p className="text-body text-label">
              {parts.marked ? (
                <>
                  You marked: <span className="font-medium">{parts.marked}</span>
                </>
              ) : (
                <span className="text-label-2">Nothing marked yet.</span>
              )}
            </p>
            <Writing label="The fix, in one or two sentences" value={parts.main} onChange={(main) => onParts({ main })} placeholder="What should it say, and why?" rows={5} maxLength={LIMITS.answer} locked={locked} demo="editor" />
          </div>
        }
      />
    );
  }

  if (challenge.format === "read") {
    const over = parts.main.length > READ_LIMIT;
    return (
      <Split
        left={
          <>
            <Brief challenge={challenge} />
            {challenge.material ? <TaskMaterialView material={challenge.material} large className="mt-5" /> : null}
          </>
        }
        right={
          <div className="flex flex-col gap-6">
            <Writing
              label="The one thing the team must know"
              value={parts.main}
              onChange={(main) => onParts({ main })}
              placeholder="One clear sentence"
              rows={4}
              maxLength={READ_LIMIT + 40}
              locked={locked}
              demo="editor"
              hint={
                <span className={cx("text-footnote tnum mt-2 block text-right", over ? "font-medium text-negative" : "text-label-2")}>
                  {parts.main.length} of {READ_LIMIT}
                </span>
              }
            />
            <Writing label="What I would check next (optional)" value={parts.next ?? ""} onChange={(next) => onParts({ next })} placeholder="One line" rows={2} maxLength={400} locked={locked} />
          </div>
        }
      />
    );
  }

  const pictureKind = challenge.proofKind === "photo" ? "photo" : challenge.proofKind === "design" ? "design" : null;
  return (
    <Split
      left={
        <>
          <Brief challenge={challenge} />
          {challenge.material ? <TaskMaterialView material={challenge.material} className="mt-5" /> : null}
          <p className="text-body mt-5 text-label-2">
            You hand in: <span className="text-label">{challenge.deliverable}</span>
          </p>
        </>
      }
      right={
        <div className="flex flex-col gap-4">
          {pictureKind ? (
            <>
              <PictureSlot kind={pictureKind} value={props.picture} onChange={(v) => {
                props.onPicture(v);
                props.onPictureChecked(false);
              }} />
              {props.picture ? <PictureCheck src={props.picture} checked={props.pictureChecked} onChange={props.onPictureChecked} /> : null}
            </>
          ) : null}
          <Writing
            label={pictureKind ? "Say what your picture shows, or write the work" : "Your work"}
            value={parts.main}
            onChange={(main) => onParts({ main })}
            placeholder="Write here"
            rows={pictureKind ? 6 : 14}
            maxLength={LIMITS.answer}
            locked={locked}
            demo="editor"
          />
        </div>
      }
    />
  );
}

/** Material on the left, the person's answer on the right; stacked on a phone. */
function Split({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[900px]:gap-10">
      <div className="min-w-0">{left}</div>
      <div className="min-w-0 min-[900px]:sticky min-[900px]:top-28 min-[900px]:self-start">{right}</div>
    </div>
  );
}
