"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "./cx";

/** Sticky top bar: clear at rest, glass with a hairline once the page scrolls under it. */
export function TopBar({ children, className }: { children: ReactNode; className?: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <header
      data-scrolled={scrolled || undefined}
      className={cx("top-bar pt-safe sticky top-0 z-20", className)}
    >
      {children}
    </header>
  );
}
