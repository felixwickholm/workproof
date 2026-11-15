import { EyeOff } from "lucide-react";
import { Fragment } from "react";
import { cx } from "../ui/cx";
import { HIDDEN_TOKEN } from "./mark-hidden";

/**
 * Someone's work as text, with each detail the blind layer removed drawn as a quiet "hidden" pill, or
 * as a grey bar (`bars`), the way a blacked-out document reads.
 */
export function BlindText({ text, className, bars }: { text: string; className?: string; bars?: boolean }) {
  const pieces = text.split(HIDDEN_TOKEN);
  return (
    <p className={cx("whitespace-pre-wrap text-pretty [overflow-wrap:anywhere]", className)}>
      {pieces.map((piece, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            bars ? (
              <span className="mx-0.5 inline-block h-[0.95em] w-[4.5em] rounded-[4px] bg-label/25 align-[-0.1em]">
                <span className="sr-only">hidden</span>
              </span>
            ) : (
              <span className="hidden-token">
                <EyeOff aria-hidden className="size-3" strokeWidth={2} />
                hidden
              </span>
            )
          ) : null}
          {piece}
        </Fragment>
      ))}
    </p>
  );
}
