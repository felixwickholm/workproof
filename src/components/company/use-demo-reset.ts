"use client";

import { useEffect, useRef } from "react";
import { RESET_EVENT } from "../shell/demo-actions";

/** Runs `onReset` after "Reset demo", so a screen holding client data loads the fresh event. */
export function useOnDemoReset(onReset: () => void) {
  const ref = useRef(onReset);
  useEffect(() => {
    ref.current = onReset;
  });
  useEffect(() => {
    const handler = () => ref.current();
    window.addEventListener(RESET_EVENT, handler);
    return () => window.removeEventListener(RESET_EVENT, handler);
  }, []);
}
