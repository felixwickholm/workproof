import Link from "next/link";
import { useId } from "react";
import { cx } from "./ui/cx";

/**
 * The W-check: the W of WorkProof is the logo, and its last stroke rises past the cap line and becomes
 * the check. Colours come from theme variables, so one inline drawing follows light and dark: navy
 * letters and a blue check on light, white letters and a peach check on dark (`--logo-ink`, `--logo-check`).
 * Drawn from public/brand/lockup-*.svg; change the logo here and every screen follows.
 */
function WCheck({ ink, check }: { ink: string; check: string }) {
  const id = useId();
  return (
    <>
      <clipPath id={`${id}b`}>
        <rect x="-4" y="12" width="72" height="40" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <rect x="-4" y="1" width="72" height="51" />
      </clipPath>
      <g clipPath={`url(#${id}b)`}>
        <path d="M3.5,2 L16.5,60 L28,14 L39.5,60" fill="none" className={ink} strokeWidth="10" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" />
      </g>
      <g clipPath={`url(#${id}t)`}>
        <path d="M39.5,60 L61,-10" fill="none" className={check} strokeWidth="10" strokeLinecap="butt" strokeLinejoin="miter" />
      </g>
    </>
  );
}

/** The full "WorkProof" lockup, the W-check followed by the name. Decorative: callers name it. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 273.54 64" className={cx("shrink-0", className)}>
      <WCheck ink="stroke-(--logo-ink)" check="stroke-(--logo-check)" />
      <path transform="translate(57.50 52)" className="fill-(--logo-ink)" d={LETTERS} />
    </svg>
  );
}

/** The lockup as a link to the start page, for pages outside the app frame. Inside the frame the sidebar carries it. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="WorkProof, start page" className={cx("flex h-11 items-center text-label in-shell:hidden", className)}>
      <LogoLockup className="h-7 w-auto" />
    </Link>
  );
}

/** The W-check alone on a tile, for small places: a navy tile with a white W on light, a white tile with a navy W on dark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={cx("shrink-0", className)}>
      <rect width="64" height="64" rx="15" className="fill-(--mark-tile)" />
      <g transform="translate(9.2 13.3) scale(0.7)">
        <WCheck ink="stroke-(--mark-ink)" check="stroke-(--mark-check)" />
      </g>
    </svg>
  );
}

/** "orkProof", set after the W. */
const LETTERS =
  "M15.96 -28.86Q19.16 -28.86 21.78 -27.84Q24.4 -26.82 26.27 -24.93Q28.15 -23.05 29.17 -20.34Q30.19 -17.64 30.19 -14.25Q30.19 -10.86 29.17 -8.15Q28.15 -5.43 26.27 -3.53Q24.4 -1.63 21.78 -0.61Q19.16 0.41 15.96 0.41Q12.74 0.41 10.1 -0.61Q7.47 -1.63 5.6 -3.53Q3.72 -5.43 2.69 -8.15Q1.65 -10.86 1.65 -14.25Q1.65 -17.64 2.69 -20.34Q3.72 -23.05 5.6 -24.93Q7.47 -26.82 10.1 -27.84Q12.74 -28.86 15.96 -28.86ZM15.96 -5.29Q19.21 -5.29 20.79 -7.54Q22.36 -9.79 22.36 -14.22Q22.36 -18.64 20.79 -20.88Q19.21 -23.13 15.96 -23.13Q12.63 -23.13 11.05 -20.88Q9.48 -18.64 9.48 -14.22Q9.48 -9.79 11.05 -7.54Q12.63 -5.29 15.96 -5.29ZM41.57 -23.74Q42.92 -26.16 44.69 -27.57Q46.45 -28.97 48.82 -28.97Q50.75 -28.97 51.96 -28.06L51.47 -22.44Q51.33 -21.89 51.04 -21.68Q50.75 -21.47 50.25 -21.47Q49.81 -21.47 48.99 -21.6Q48.16 -21.72 47.44 -21.72Q46.4 -21.72 45.58 -21.42Q44.77 -21.12 44.14 -20.57Q43.5 -20.01 42.99 -19.21Q42.48 -18.41 42.04 -17.39V0H34.43V-28.42H38.92Q40.08 -28.42 40.52 -28.01Q40.96 -27.59 41.16 -26.57ZM62.27 -41.1V-17.78H63.54Q64.26 -17.78 64.67 -17.99Q65.09 -18.19 65.5 -18.75L71.78 -27.13Q72.25 -27.76 72.85 -28.09Q73.44 -28.42 74.35 -28.42H81.3L73.14 -18.06Q72.17 -16.76 70.9 -16.02Q71.54 -15.58 72.01 -15Q72.47 -14.42 72.92 -13.7L81.71 0H74.87Q73.99 0 73.36 -0.29Q72.72 -0.58 72.31 -1.32L65.91 -11.77Q65.53 -12.43 65.11 -12.63Q64.7 -12.82 63.87 -12.82H62.27V0H54.67V-41.1ZM98.75 -20.1Q102.63 -20.1 104.44 -21.97Q106.24 -23.85 106.24 -27.1Q106.24 -28.59 105.79 -29.81Q105.33 -31.04 104.41 -31.91Q103.49 -32.78 102.08 -33.25Q100.68 -33.71 98.75 -33.71H93.51V-20.1ZM98.75 -40Q102.85 -40 105.84 -39.04Q108.84 -38.07 110.76 -36.35Q112.69 -34.62 113.62 -32.25Q114.54 -29.88 114.54 -27.1Q114.54 -24.15 113.58 -21.7Q112.61 -19.24 110.65 -17.48Q108.7 -15.71 105.72 -14.73Q102.74 -13.76 98.75 -13.76H93.51V0H85.24V-40ZM124.96 -23.74Q126.31 -26.16 128.08 -27.57Q129.84 -28.97 132.21 -28.97Q134.14 -28.97 135.35 -28.06L134.86 -22.44Q134.72 -21.89 134.43 -21.68Q134.14 -21.47 133.65 -21.47Q133.2 -21.47 132.38 -21.6Q131.55 -21.72 130.83 -21.72Q129.79 -21.72 128.97 -21.42Q128.16 -21.12 127.53 -20.57Q126.89 -20.01 126.38 -19.21Q125.87 -18.41 125.43 -17.39V0H117.82V-28.42H122.32Q123.47 -28.42 123.91 -28.01Q124.36 -27.59 124.55 -26.57ZM150.21 -28.86Q153.41 -28.86 156.03 -27.84Q158.65 -26.82 160.52 -24.93Q162.4 -23.05 163.42 -20.34Q164.44 -17.64 164.44 -14.25Q164.44 -10.86 163.42 -8.15Q162.4 -5.43 160.52 -3.53Q158.65 -1.63 156.03 -0.61Q153.41 0.41 150.21 0.41Q146.99 0.41 144.36 -0.61Q141.72 -1.63 139.85 -3.53Q137.97 -5.43 136.94 -8.15Q135.91 -10.86 135.91 -14.25Q135.91 -17.64 136.94 -20.34Q137.97 -23.05 139.85 -24.93Q141.72 -26.82 144.36 -27.84Q146.99 -28.86 150.21 -28.86ZM150.21 -5.29Q153.47 -5.29 155.04 -7.54Q156.61 -9.79 156.61 -14.22Q156.61 -18.64 155.04 -20.88Q153.47 -23.13 150.21 -23.13Q146.88 -23.13 145.31 -20.88Q143.74 -18.64 143.74 -14.22Q143.74 -9.79 145.31 -7.54Q146.88 -5.29 150.21 -5.29ZM181.5 -28.86Q184.7 -28.86 187.32 -27.84Q189.94 -26.82 191.81 -24.93Q193.69 -23.05 194.71 -20.34Q195.73 -17.64 195.73 -14.25Q195.73 -10.86 194.71 -8.15Q193.69 -5.43 191.81 -3.53Q189.94 -1.63 187.32 -0.61Q184.7 0.41 181.5 0.41Q178.28 0.41 175.64 -0.61Q173.01 -1.63 171.14 -3.53Q169.26 -5.43 168.23 -8.15Q167.2 -10.86 167.2 -14.25Q167.2 -17.64 168.23 -20.34Q169.26 -23.05 171.14 -24.93Q173.01 -26.82 175.64 -27.84Q178.28 -28.86 181.5 -28.86ZM181.5 -5.29Q184.76 -5.29 186.33 -7.54Q187.9 -9.79 187.9 -14.22Q187.9 -18.64 186.33 -20.88Q184.76 -23.13 181.5 -23.13Q178.17 -23.13 176.6 -20.88Q175.02 -18.64 175.02 -14.22Q175.02 -9.79 176.6 -7.54Q178.17 -5.29 181.5 -5.29ZM201.3 0V-22.96L199.09 -23.35Q198.24 -23.51 197.7 -23.96Q197.16 -24.4 197.16 -25.22V-28.26H201.3V-30.13Q201.3 -32.56 202.05 -34.53Q202.81 -36.5 204.22 -37.86Q205.62 -39.23 207.66 -39.97Q209.7 -40.72 212.27 -40.72Q213.26 -40.72 214.16 -40.59Q215.05 -40.47 215.96 -40.22L215.8 -36.47Q215.74 -35.62 215.07 -35.35Q214.39 -35.09 213.56 -35.09Q212.41 -35.09 211.48 -34.84Q210.56 -34.6 209.92 -34Q209.29 -33.41 208.96 -32.41Q208.63 -31.4 208.63 -29.91V-28.26H215.69V-22.96H208.88V0Z";
