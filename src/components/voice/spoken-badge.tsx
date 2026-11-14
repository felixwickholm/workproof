import { AudioLines } from "lucide-react";
import { cx } from "@/components/ui/cx";

/**
 * Marks an answer that was spoken. The reviewer reads only text, so an accent or a voice
 * cannot sway anyone.
 */
export function SpokenBadge({ className }: { className?: string }) {
  return (
    <span
      title="WorkProof stores only the text."
      className={cx("inline-flex h-7 w-fit items-center gap-1.5 rounded-full bg-fill px-3 text-footnote font-medium text-label-2", className)}
    >
      <AudioLines size={16} aria-hidden />
      Spoken answer, shown as text
      <span className="sr-only">. WorkProof stores only the text.</span>
    </span>
  );
}
