import { cx } from "../ui/cx";
import { Skeleton } from "../ui/skeleton";

/** A flat block in the shape of the panel it stands in for. */
function Block({ className }: { className: string }) {
  return (
    <div className={cx("rounded-card bg-surface p-5", className)}>
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

/** The city page while it loads: the greeting, four tiles and the panels at their final sizes. */
export function CitySkeleton() {
  return (
    <div aria-busy aria-label="Loading the event overview" className="@container">
      <Skeleton className="h-9 w-full max-w-[640px] min-[900px]:h-12" />
      <Skeleton className="mt-3 h-4 w-full max-w-[520px]" />
      <div className="mt-8 grid grid-cols-2 gap-4 min-[900px]:mt-12 @min-[640px]:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[128px] rounded-card bg-surface" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 @min-[960px]:grid-cols-12">
        <Block className="h-[520px] @min-[960px]:col-span-8" />
        <Block className="h-[360px] @min-[960px]:col-span-4 @min-[960px]:h-[520px]" />
        <Block className="h-[480px] @min-[960px]:col-span-6" />
        <Block className="h-[480px] @min-[960px]:col-span-6" />
      </div>
    </div>
  );
}
