import Link from "next/link";
import { cx } from "../ui/cx";
import { LogoLockup } from "../wordmark";

/**
 * The top left of the app: the city service first, "Business Espoo" with its peach bar, and WorkProof
 * under it, the way a city service names itself before the tool. The WorkProof logo is one component
 * (`LogoLockup`), so a new logo is one swap there.
 */
export function Brand({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Business Espoo, WorkProof. Start page" className={cx("press flex flex-col items-start", compact ? "gap-0.5" : "gap-2", className)}>
      <span className={cx("flex items-center gap-2 font-heading font-bold whitespace-nowrap text-label", compact ? "text-[13px] leading-4" : "text-[17px] leading-5")}>
        <span aria-hidden className={cx("w-1 shrink-0 rounded-full bg-peach", compact ? "h-3" : "h-4")} />
        Business Espoo
      </span>
      <LogoLockup className={cx("w-auto", compact ? "h-5" : "h-8")} />
    </Link>
  );
}
