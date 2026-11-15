import Link from "next/link";
import { cx } from "../ui/cx";
import { LogoLockup } from "../wordmark";

/**
 * The top left of the app: the city service first, the Business Espoo logo, and WorkProof
 * under it, the way a city service names itself before the tool. The WorkProof logo is one component
 * (`LogoLockup`), so a new logo is one swap there.
 */
export function Brand({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Business Espoo, WorkProof. Start page" className={cx("press flex flex-col items-start", compact ? "gap-0.5" : "gap-2", className)}>
      {/* The Business Espoo logo as published on businessespoo.fi, used as a mask so it takes the text colour in both themes. */}
      <span
        role="img"
        aria-label="Business Espoo"
        className={cx("block bg-label", compact ? "h-[22px] w-[59px]" : "h-[30px] w-20")}
        style={{ maskImage: "url(/brand/business-espoo-mask.png)", maskSize: "contain", maskRepeat: "no-repeat", WebkitMaskImage: "url(/brand/business-espoo-mask.png)", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat" }}
      />
      <LogoLockup className={cx("w-auto", compact ? "h-5" : "h-8")} />
    </Link>
  );
}
