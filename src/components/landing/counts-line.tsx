import { cx } from "@/components/ui/cx";
import { CountTo } from "./count-to";
import { countParts, type HeroCounts } from "./counts";

/**
 * "47 proofs handed in · 31 written reasons · …": each figure counts up once, and the line reads
 * as plain text. On a phone the four sit in a 2 x 2 grid, so no separator starts a line.
 */
export function CountsLine({ counts, className }: { counts: HeroCounts; className?: string }) {
  return (
    <p className={cx("grid grid-cols-2 gap-x-4 gap-y-1 min-[640px]:flex min-[640px]:flex-wrap min-[640px]:gap-x-0", className)}>
      {countParts(counts).map((part, i) => (
        <span key={part.noun} className="min-[640px]:whitespace-nowrap">
          {i > 0 ? (
            <span aria-hidden className="hidden px-2 text-label-3 min-[640px]:inline">
              ·
            </span>
          ) : null}
          <span className="font-medium text-label">
            <CountTo value={part.value} />
          </span>{" "}
          {part.noun}
        </span>
      ))}
    </p>
  );
}
