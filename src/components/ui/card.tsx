import type { ReactNode } from "react";
import { cx } from "./cx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-card bg-surface p-5", className)}>{children}</div>;
}

/** Small uppercase label above a section or inside a card. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-eyebrow font-semibold uppercase text-label-2", className)}>{children}</p>;
}

export function Section({ label, children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mt-8", className)}>
      {label ? <Eyebrow className="mb-2 px-5">{label}</Eyebrow> : null}
      {children}
    </section>
  );
}
