"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Company } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/** The first word of a company name, so three fit side by side on a phone. */
export function shortName(company: Company) {
  return company.name.split(" ")[0];
}

/** Segmented control: switching company is one tap. */
export function CompanySwitcher({
  companies,
  value,
  onChange,
  label = "Company",
  className,
}: {
  companies: Company[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div role="radiogroup" aria-label={label} className={cx("flex rounded-full bg-surface p-1", className)}>
      {companies.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            onClick={() => onChange(c.id)}
            className={cx(
              "relative h-11 min-w-0 flex-1 rounded-full px-3 text-subhead font-semibold transition-colors duration-150",
              active ? "text-label" : "text-label-2 active:text-label",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`${label}-pill`}
                aria-hidden
                className="absolute inset-0 highlight rounded-full bg-raised"
                transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              />
            ) : null}
            <span className="relative block truncate">{shortName(c)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CompanySwitcherSkeleton() {
  return <div aria-hidden className="h-[52px] rounded-full bg-surface" />;
}
