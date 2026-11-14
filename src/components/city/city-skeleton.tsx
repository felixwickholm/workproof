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

/** The city page while it loads: the greeting, the funnel's six steps, the challenge rows, the map and the demand. */
export function CitySkeleton() {
  return (
    <div aria-busy aria-label="Loading the event overview">
      <Skeleton className="h-9 w-full max-w-[640px] min-[900px]:h-14" />
      <Skeleton className="mt-3 h-4 w-56" />
      <div className="mt-8 flex flex-col gap-4 min-[900px]:mt-12">
        <Block className="h-[300px]">
          <div className="mt-8 hidden grid-cols-7 gap-6 min-[900px]:grid">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i}>
                <Skeleton className="h-11 w-16" />
                <Skeleton className="mt-3 h-4 w-24" />
              </div>
            ))}
          </div>
        </Block>
        <Block className="h-[480px]">
          <div className="mt-6 flex flex-col gap-6">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-5 w-full max-w-[520px]" />
            ))}
          </div>
        </Block>
        <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-12">
          <Block className="h-[520px] min-[1100px]:col-span-7" />
          <Block className="h-[520px] min-[1100px]:col-span-5" />
        </div>
      </div>
    </div>
  );
}
