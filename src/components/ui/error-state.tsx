import { ApiError, errorText } from "@/lib/client/api";
import { Button } from "./button";

interface Props {
  error: unknown;
  what: string;
  onRetry: () => void;
  /** Where to go when the thing does not exist. Defaults to the first screen. */
  away?: { href: string; label: string };
}

/** One plain sentence about what failed, and a retry. A missing item gets a way out instead. */
export function ErrorState({ error, what, onRetry, away = { href: "/", label: "Back to the start" } }: Props) {
  if (error instanceof ApiError && error.status === 404) {
    return (
      <div role="alert" className="rounded-card bg-surface p-5">
        <p className="text-headline font-semibold">We could not find {what}.</p>
        <p className="text-subhead mt-1 text-label-2">The link may be old, or it was taken down.</p>
        <Button href={away.href} variant="secondary" size="sm" className="mt-4">
          {away.label}
        </Button>
      </div>
    );
  }
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
