"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/client/api";
import { getIdentity, switchToOwnIdentity, switchToPersona } from "@/lib/client/local";
import { cx } from "@/components/ui/cx";

const noop = () => () => {};

/** The demo person's first name from the session ("Mikko"), once it is known. */
export function usePersonaName(): { first: string; full: string } | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    api
      .demoSession()
      .then((session) => live && setName(session.persona.name))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return name ? { first: name.split(/\s+/)[0] ?? name, full: name } : null;
}

/** "persona" or "me", read in the browser only; the server renders the persona line. */
function useIdentity() {
  return useSyncExternalStore(noop, getIdentity, () => "persona" as const);
}

/**
 * A quiet line under the greeting: whose account this is, and the switch between the demo person
 * and the visitor's own (empty) account. `onSwitch` reloads the screen's data.
 */
export function IdentityLine({ onSwitch, className }: { onSwitch: () => void; className?: string }) {
  const persona = usePersonaName();
  const identity = useIdentity();
  const [, rerender] = useState(0);
  const first = persona?.first ?? "Mikko";

  const change = (next: "me" | "persona") => {
    if (next === "me") switchToOwnIdentity();
    else switchToPersona();
    rerender((n) => n + 1);
    onSwitch();
  };

  return (
    <p className={cx("text-subhead flex flex-wrap items-center gap-x-2 gap-y-1 text-label-2", className)}>
      {identity === "persona" ? (
        <>
          <span>Demo account: {first}.</span>
          <button type="button" onClick={() => change("me")} className="press font-medium text-label underline decoration-label-3 underline-offset-4 hover:decoration-label">
            Start as yourself
          </button>
        </>
      ) : (
        <>
          <span>This is your own account on this device.</span>
          <button type="button" onClick={() => change("persona")} className="press font-medium text-label underline decoration-label-3 underline-offset-4 hover:decoration-label">
            Back to {first}, the demo person
          </button>
        </>
      )}
    </p>
  );
}
