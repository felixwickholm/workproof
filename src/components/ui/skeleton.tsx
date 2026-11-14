import { cx } from "./cx";

/** A flat placeholder bar at the size of the content it stands in for. No shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx("block rounded-full bg-fill", className)} />;
}
