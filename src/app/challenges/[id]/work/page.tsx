import { Suspense } from "react";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkFlow } from "./work-flow";

export default function WorkPage({ params }: PageProps<"/challenges/[id]/work">) {
  return (
    <Suspense fallback={<WorkSkeleton />}>
      <WorkFlow params={params} />
    </Suspense>
  );
}

function WorkSkeleton() {
  return (
    <Screen>
      <div aria-busy className="mt-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="mt-6 h-48 rounded-inner bg-surface" />
      </div>
    </Screen>
  );
}
