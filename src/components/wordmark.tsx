import Link from "next/link";
import { cx } from "./ui/cx";

/**
 * The lockup: the tile, then "WorkProof" in the sans at 600. No accent full stop; the teal lives on the
 * tile's bar only. Inside the app frame the sidebar and switcher carry the name, so page bars drop their copy.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="WorkProof, start page"
      className={cx("flex h-11 items-center gap-2 text-[20px] leading-none font-semibold tracking-[-0.025em] text-label in-shell:hidden", className)}
    >
      <LogoMark className="size-7" />
      WorkProof
    </Link>
  );
}

/** The product mark: a covered name (the bar) above the work (the W), on an ink tile. Same drawing as the favicon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={cx("shrink-0", className)}>
      <rect width="64" height="64" rx="14" className="fill-label" />
      <g transform="translate(8.96 7.56) scale(0.72)">
        <rect x="5.25" y="5" width="22.5" height="8" rx="2" className="fill-(--logo-dot)" />
        <path className="fill-ground" d={W_PATH} />
      </g>
    </svg>
  );
}

/** Four straight bars, flat ends. */
const W_PATH = "M5.25 21h8.5L25 59h-8.5zM27.75 21h8.5L25 59h-8.5zM27.75 21h8.5L47.5 59H39zM50.25 21h8.5L47.5 59H39z";
