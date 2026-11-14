"use client";

import { createContext, useContext } from "react";

interface ShellApi {
  /** Fades the page content out before a mode switch navigates. */
  beginSwitch: () => void;
  /** Fades the content back in once the new mode's page is in place. */
  endSwitch: () => void;
}

export const ShellContext = createContext<ShellApi>({ beginSwitch: () => {}, endSwitch: () => {} });

export function useShell() {
  return useContext(ShellContext);
}
