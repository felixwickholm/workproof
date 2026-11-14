"use client";

import { useEffect } from "react";
import { useResource } from "@/lib/client/use-resource";
import { RESET_EVENT } from "../shell/demo-actions";

/** Often enough that the booth screen moves within seconds of a phone sending work. */
export const CITY_POLL_MS = 5000;

/**
 * City data kept live: polled every 5 s while the tab is visible, reloaded when the tab regains focus
 * and after a demo reset. Every listener and timer is removed on unmount.
 */
export function useLive<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const resource = useResource(load, deps, { pollMs: CITY_POLL_MS });
  const { reload } = resource;

  useEffect(() => {
    const onReset = () => void reload();
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [reload]);

  return resource;
}
