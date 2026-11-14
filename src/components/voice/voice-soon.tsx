import { Mic } from "lucide-react";
import { cx } from "@/components/ui/cx";

/**
 * A quiet marker that answering by voice is planned. It is plain text, not a control: every flow works
 * by typing, and nothing here asks for a microphone.
 */
export function VoiceSoon({ className }: { className?: string }) {
  return (
    <span data-voice-soon className={cx("inline-flex items-center gap-1.5 text-footnote text-label-3 select-none", className)}>
      <Mic aria-hidden size={16} strokeWidth={1.75} />
      Voice coming soon
    </span>
  );
}
