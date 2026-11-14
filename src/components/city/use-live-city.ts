"use client";

import { useEffect } from "react";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { RESET_EVENT } from "../shell/demo-actions";

/** Often enough that the booth screen moves within seconds of a phone sending a proof. */
export const CITY_POLL_MS = 5000;

/**
 * The event overview, kept live: polled every 5 s while the tab is visible, reloaded when the tab
 * regains focus and after a demo reset. Every listener and timer is removed on unmount.
 */
export function useLiveCity() {
  const resource = useResource(() => api.city(), [], { pollMs: CITY_POLL_MS });
  const { reload } = resource;

  useEffect(() => {
    const onReset = () => void reload();
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [reload]);

  return resource;
}
