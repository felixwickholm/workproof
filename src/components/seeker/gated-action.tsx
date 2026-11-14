import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";

type ButtonProps = ComponentProps<typeof Button>;

/** A 52px pill for the action a screen exists for: Start, Meet, I'm done, Send. */
export function BigButton({ className, ...props }: ButtonProps) {
  return <Button {...props} className={cx("h-[52px]! px-6! text-[16px]!", className)} />;
}

/**
 * A main action that waits for the person. While locked it stays in the accent at 40%, so it reads
 * as the way forward, and the rule that unlocks it is printed right next to it instead of a grey dead end.
 */
export function GatedAction({
  locked,
  reason,
  className,
  layout = "stack",
  ...props
}: ButtonProps & {
  locked: boolean;
  /** The unlock rule, for example "Write your answer to continue." */
  reason: string;
  /** "stack" puts the rule under the button; "row" puts it beside the button from 640px. */
  layout?: "stack" | "row";
}) {
  const row = layout === "row";
  return (
    <div className={cx("flex flex-col gap-2", row && "min-[640px]:flex-row-reverse min-[640px]:items-center min-[640px]:gap-4", className)}>
      <BigButton
        {...props}
        disabled={locked || props.disabled}
        className={cx("w-full disabled:bg-accent! disabled:text-accent-ink! disabled:opacity-40", row && "min-[640px]:w-auto")}
      />
      {locked ? <p className={cx("text-footnote text-center text-pretty text-label-2", row && "min-[640px]:flex-1 min-[640px]:text-right")}>{reason}</p> : null}
    </div>
  );
}
