"use client";

import { useEffect, useRef } from "react";

const KEY = "flowStep";
const PATH = "flowPath";

/** The flow step stored in a history entry, if the entry belongs to the page now showing. */
function stepIn(state: unknown): string | null {
  const entry = state as Record<string, unknown> | null;
  const value = entry?.[KEY];
  return typeof value === "string" && entry?.[PATH] === window.location.pathname ? value : null;
}

/**
 * Gives each step of a flow its own browser history entry on the same URL, so the phone's back
 * gesture and the browser buttons move between steps instead of leaving the flow.
 * `onPop` receives the step the browser moved to.
 */
export function useFlowHistory(step: string, onPop: (step: string) => void) {
  const onPopRef = useRef(onPop);
  useEffect(() => {
    onPopRef.current = onPop;
  });

  const mounted = useRef(false);
  useEffect(() => {
    const state = window.history.state as Record<string, unknown> | null;
    const first = !mounted.current;
    mounted.current = true;
    if (stepIn(state) === step) return;
    // A fresh mount (or a reload) marks the entry it landed on; later steps add entries.
    const mark = { [KEY]: step, [PATH]: window.location.pathname };
    if (first) window.history.replaceState({ ...state, ...mark }, "");
    else window.history.pushState(mark, "");
  }, [step]);

  useEffect(() => {
    const listener = (event: PopStateEvent) => {
      const popped = stepIn(event.state);
      if (popped) onPopRef.current(popped);
    };
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
}

/** The on-screen back button: one history entry back, so it matches the browser's back. */
export function backInFlow(fallback: () => void) {
  if (stepIn(window.history.state)) window.history.back();
  else fallback();
}
