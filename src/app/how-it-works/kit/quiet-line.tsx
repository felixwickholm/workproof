import Link from "next/link";
import { cx } from "@/components/ui/cx";
import { LogoLockup } from "@/components/wordmark";

/** Shows the first image in the light theme and the second in the dark theme. */
const LIGHT_ONLY = "[:root[data-theme=dark]_&]:hidden";
const DARK_ONLY = "hidden [:root[data-theme=dark]_&]:block";

/**
 * The partner lockup for the top bar: WorkProof first and larger, then "for" and the City of Espoo
 * logo. From 640px only; a phone shows the WorkProof mark and name, and the first screen's foot
 * carries the partner. The WorkProof lockup is the shared inline logo, so it follows the theme.
 */
export function PartnerLockup({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="WorkProof, for City of Espoo, start page" className={cx("flex h-11 items-center gap-3", className)}>
      <LogoLockup className="h-8 w-auto" />
      <ForEspoo />
    </Link>
  );
}

/** "for" and the City of Espoo logo: Espoo blue in light, white in dark. */
export function ForEspoo({ className }: { className?: string }) {
  const logo = "h-[26px] w-auto";
  return (
    <p className={cx("flex shrink-0 items-center gap-2.5 text-[15px] leading-5 text-label-2", className)}>
      for
      {/* eslint-disable-next-line @next/next/no-img-element -- the city's own logo file, used as is */}
      <img src="/brand/espoo-logo-blue.svg" alt="City of Espoo" width={51} height={26} className={cx(logo, LIGHT_ONLY)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
      <img src="/brand/espoo-logo-white.svg" alt="City of Espoo" width={51} height={26} className={cx(logo, DARK_ONLY)} />
    </p>
  );
}
