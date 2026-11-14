"use client";

import { useEffect } from "react";
import { useResource } from "@/lib/client/use-resource";
import type { CityActions } from "@/lib/service/city-actions";
import { RESET_EVENT } from "../shell/demo-actions";
import { CITY_POLL_MS } from "./use-live-city";

async function loadActions(): Promise<CityActions> {
  const response = await fetch("/api/city/actions", { cache: "no-store" });
  if (!response.ok) throw new Error(`The organiser actions did not load (${response.status}).`);
  return (await response.json()) as CityActions;
}

/** Reminders to draft and the event's rules, kept as live as the overview beside them. */
export function useCityActions() {
  const resource = useResource(loadActions, [], { pollMs: CITY_POLL_MS });
  const { reload } = resource;

  useEffect(() => {
    const onReset = () => void reload();
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [reload]);

  return resource;
}
