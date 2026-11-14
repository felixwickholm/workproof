"use client";

import { useEffect, useState } from "react";
import { keyboardInset } from "./try-copy";

/** Pixels the on-screen keyboard covers, from `visualViewport`; 0 on a laptop or without the API. */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => setInset(keyboardInset(window.innerHeight, viewport.height, viewport.offsetTop));
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}
