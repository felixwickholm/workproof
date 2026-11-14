import { errorText } from "@/lib/client/api";
import { Button } from "./button";

/** One plain sentence about what failed, and a retry. */
export function ErrorState({ error, what, onRetry }: { error: unknown; what: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card bg-surface p-5">
      <p className="text-headline font-semibold">Could not load {what}.</p>
      <p className="text-subhead mt-1 text-label-2">{errorText(error)}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
