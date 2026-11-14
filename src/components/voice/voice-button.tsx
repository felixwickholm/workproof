"use client";

import { Mic } from "lucide-react";
import { useState } from "react";
import { cx } from "@/components/ui/cx";
import { VoiceSheet, type VoiceSheetProps } from "./voice-sheet";

type VoiceButtonProps = Omit<VoiceSheetProps, "open" | "onClose"> & {
  /** Default "Answer by voice". Use "Say it instead" next to a text field. */
  label?: string;
  className?: string;
};

/** A 44px round mic button with its label; it opens the voice sheet. */
export function VoiceButton({ label = "Answer by voice", className, ...sheet }: VoiceButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx("press inline-flex min-h-11 items-center gap-3 rounded-full pr-4 text-subhead font-medium text-label", className)}
      >
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-fill text-accent">
          <Mic size={20} />
        </span>
        {label}
      </button>
      <VoiceSheet open={open} onClose={() => setOpen(false)} {...sheet} />
    </>
  );
}
