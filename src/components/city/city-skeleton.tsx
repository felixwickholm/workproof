import type { ReactNode } from "react";
import { cx } from "../ui/cx";
import { Skeleton } from "../ui/skeleton";

/** A flat panel in the shape of the one it stands in for, with its title bar. */
function Block({ className, children }: { className: string; children?: ReactNode }) {
  return (
    <div className={cx("rounded-card bg-surface p-5 min-[900px]:p-8", className)}>
      <Skeleton className="h-5 w-48" />
      {children}
    </div>
  );
}

/** A chart card's bars while it loads: seven rows of shrinking length, as the funnel looks. */
function Bars() {
  return (
    <div className="mt-8 flex flex-col gap-5">
      {["w-full", "w-3/5", "w-1/3", "w-1/5", "w-1/6", "w-1/12", "w-6"].map((w) => (
        <Skeleton key={w} className={`h-4 ${w}`} />
      ))}
    </div>
  );
}

/** The city page while it loads: the greeting, then the four graphs, then companies hiring now and the map. */
export function CitySkeleton() {
  return (
    <div aria-busy aria-label="Loading the event overview">
      <Skeleton className="h-9 w-full max-w-[640px] min-[900px]:h-14" />
      <Skeleton className="mt-3 h-4 w-56" />
      <div className="mt-8 grid grid-cols-1 gap-4 min-[900px]:mt-12 min-[1100px]:grid-cols-12">
        <Block className="h-[440px] min-[1100px]:col-span-7">
          <Bars />
        </Block>
        <Block className="h-[440px] min-[1100px]:col-span-5">
          <Bars />
        </Block>
        <Block className="h-[480px] min-[1100px]:col-span-7" />
        <Block className="h-[480px] min-[1100px]:col-span-5">
          <Bars />
        </Block>
        <Block className="h-[520px] min-[1100px]:col-span-7" />
        <Block className="h-[520px] min-[1100px]:col-span-5" />
      </div>
    </div>
  );
}
