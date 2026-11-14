import type { Company } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { companyFacts } from "./format";

/**
 * The four facts a newcomer asks before spending 20 minutes on a task. "line" is one quiet
 * sentence for a card; "grid" is a 2 x 2 list for a detail page.
 */
export function CompanyFacts({ company, variant = "grid", className }: { company: Company; variant?: "line" | "grid"; className?: string }) {
  const facts = companyFacts(company);
  if (variant === "line") {
    return <p className={cx("text-footnote text-label-2", className)}>{facts.map((f) => `${f.label}: ${f.value}`).join(" · ")}</p>;
  }
  return (
    <dl className={cx("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="text-footnote text-label-2">{f.label}</dt>
          <dd className="text-subhead mt-0.5 text-label">{f.value.charAt(0).toUpperCase() + f.value.slice(1)}</dd>
        </div>
      ))}
    </dl>
  );
}
