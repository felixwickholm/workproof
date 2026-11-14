"use client";

import { useCallback, useEffect, useState } from "react";
import { RESET_EVENT } from "@/components/shell/demo-actions";
import { currentTalentId } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

/**
 * Loads data for whoever the seeker side acts as (the demo person, or the visitor's own key).
 * Reloads after a demo reset, and after `refresh()` when the identity changes.
 */
export function useSeekerData<T>(load: (talentId: string) => Promise<T>, deps: unknown[] = []) {
  const [version, setVersion] = useState(0);
  const resource = useResource(async () => load(await currentTalentId()), [version, ...deps]);
  const { reload } = resource;

  useEffect(() => {
    const onReset = () => void reload();
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [reload]);

  /** Starts over with an empty screen, for a new identity. */
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { ...resource, refresh };
}
