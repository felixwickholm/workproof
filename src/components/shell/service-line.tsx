import { cx } from "../ui/cx";

/**
 * "Business Espoo · Talent services": names the city service this runs in, in words only. The city's own
 * mark stays in `PartnerLine`; this never copies the Business Espoo logo.
 */
export function ServiceLine({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={cx(
        "flex items-center gap-2 text-caption whitespace-nowrap",
        className,
      )}
    >
      <span aria-hidden className="h-4 w-1 shrink-0 rounded-full bg-peach" />
      <span className="font-semibold text-label">Business Espoo</span>
      {compact ? null : (
        <span className="truncate text-label-2">Talent services</span>
      )}
    </p>
  );
}
