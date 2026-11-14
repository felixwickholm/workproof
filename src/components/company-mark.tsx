import type { Challenge, Company } from "@/lib/domain/types";
import { cx } from "./ui/cx";

export function companiesOf(challenge: Challenge, companies: Company[]) {
  return challenge.companyIds.map((id) => companies.find((c) => c.id === id)).filter((c): c is Company => Boolean(c));
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** A company tile: the first letter of its name in a small square. */
export function CompanyTile({ company, className }: { company: Company; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-raised font-mono text-[13px] font-semibold text-label",
        className,
      )}
    >
      {initial(company.name)}
    </span>
  );
}

/** Who posted the task: tile and name. A pooled task shows every company. */
export function CompanyMark({ companies }: { companies: Company[] }) {
  if (companies.length === 0) return null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex shrink-0">
        {companies.map((c, i) => (
          <CompanyTile key={c.id} company={c} className={cx(i > 0 && "-ml-1.5 shadow-[0_0_0_2px_var(--mark-gap,var(--color-surface))]")} />
        ))}
      </span>
      <span className="text-footnote min-w-0 truncate font-semibold text-label">{companies.map((c) => c.name).join(" and ")}</span>
    </div>
  );
}
