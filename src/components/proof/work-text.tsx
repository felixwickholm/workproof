import { EyeOff } from "lucide-react";
import { Fragment } from "react";
import { cx } from "../ui/cx";
import { HIDDEN_TOKEN } from "./mark-hidden";

/** Someone's work as text, with each detail the blind layer removed drawn as a quiet "hidden" pill. */
export function BlindText({ text, className }: { text: string; className?: string }) {
  const pieces = text.split(HIDDEN_TOKEN);
  return (
    <p className={cx("whitespace-pre-wrap text-pretty", className)}>
      {pieces.map((piece, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className="hidden-token">
              <EyeOff aria-hidden className="size-3" strokeWidth={2} />
              hidden
            </span>
          ) : null}
          {piece}
        </Fragment>
      ))}
    </p>
  );
}
