import Link from "next/link";
import { cx } from "@/components/ui/cx";

export const PARTNER_LINE = "Built for the City of Espoo challenge, Junction 2026.";
/** Who the events, and so Workprint, are for, and what the page's data is. */
export const AUDIENCE_LINE = "Made for Espoo's talent events for highly educated professionals. Demo data: all people and companies are invented.";
export const DEMO_LINE = "Demo data. All people and companies are invented.";

/** Shows the first image in the light theme and the second in the dark theme. */
const LIGHT_ONLY = "[:root[data-theme=dark]_&]:hidden";
const DARK_ONLY = "hidden [:root[data-theme=dark]_&]:block";

/**
 * The partner lockup for the top bar: Workprint first and larger, then "for" and the City of Espoo
 * logo. From 640px only; a phone shows the Workprint mark and name, and the hero carries the partner.
 */
export function PartnerLockup({ className }: { className?: string }) {
  const img = "h-9 w-auto";
  return (
    <Link href="/" aria-label="Workprint, for City of Espoo, start page" className={cx("flex h-11 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG lockup; no resizing to do */}
      <img src="/brand/lockup-partner-light.svg" alt="Workprint, for City of Espoo" width={250} height={36} className={cx(img, LIGHT_ONLY)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
      <img src="/brand/lockup-partner-dark.svg" alt="Workprint, for City of Espoo" width={250} height={36} className={cx(img, DARK_ONLY)} />
    </Link>
  );
}

/** "for" and the City of Espoo logo (Espoo blue in light, white in dark), then the audience and demo line. */
export function PartnerRow({ className }: { className?: string }) {
  const logo = "h-[26px] w-auto";
  return (
    <div className={cx("flex flex-col gap-2 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-5", className)}>
      <p className="flex shrink-0 items-center gap-2.5 text-[15px] leading-5 text-label-2">
        for
        {/* eslint-disable-next-line @next/next/no-img-element -- the city's own logo file, used as is */}
        <img src="/brand/espoo-logo-blue.svg" alt="City of Espoo" width={51} height={26} className={cx(logo, LIGHT_ONLY)} />
        {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
        <img src="/brand/espoo-logo-white.svg" alt="City of Espoo" width={51} height={26} className={cx(logo, DARK_ONLY)} />
      </p>
      <p className="max-w-[36rem] text-[14px] leading-5 text-pretty text-label-2">{AUDIENCE_LINE}</p>
    </div>
  );
}
