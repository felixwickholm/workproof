import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { cx } from "@/components/ui/cx";
import { FRAME } from "./parts";
import { PartnerLockup } from "./quiet-line";

/** The three ways into the demo, by mode label. Each opens that mode's home. */
export const AUDIENCES = [
  { href: "/seeker", label: "Looking for work" },
  { href: "/employer", label: "Hiring" },
  { href: "/city", label: "City of Espoo" },
] as const;

const LINK = "hidden h-11 items-center px-3 text-[15px] text-label-2 transition-colors duration-150 hover:text-label min-[1024px]:flex";

/**
 * A small segmented control of links: who are you? On a laptop it sits in the bar; on a phone it
 * takes its own row under the wordmark, full width.
 */
function AudienceSwitch({ className }: { className?: string }) {
  return (
    <nav aria-label="Open the demo as" className={cx("rounded-full bg-fill p-1", className)}>
      <ul className="flex">
        {AUDIENCES.map((a, i) => (
          <li key={a.href} className="flex flex-1 items-center">
            {i > 0 ? <span aria-hidden className="h-4 w-px bg-label/12" /> : null}
            <Link
              href={a.href}
              className="press flex h-9 flex-1 items-center justify-center rounded-full px-3 text-[14px] font-medium whitespace-nowrap text-label transition-colors duration-150 hover:bg-raised max-[379px]:px-2 max-[379px]:text-[13px]"
            >
              {a.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The partner lockup (on a phone the Workprint mark and name only), the audience switch, two quiet
 * links and the theme switch. Plain, on the page ground.
 */
export function TopBar() {
  return (
    <header className={cx(FRAME, "flex flex-wrap items-center gap-x-1 pt-3 pb-1 min-[768px]:h-[72px] min-[768px]:flex-nowrap min-[768px]:py-0")}>
      <Wordmark className="mr-auto min-[640px]:hidden" />
      <PartnerLockup className="mr-auto max-[639px]:hidden" />
      <AudienceSwitch className="order-last mt-2 mb-1 w-full min-[768px]:order-none min-[768px]:mt-0 min-[768px]:mb-0 min-[768px]:mr-2 min-[768px]:w-auto" />
      <nav aria-label="Page" className="contents">
        <Link href="#how-it-works" className={LINK}>
          How it works
        </Link>
        <Link href="/for-judges" className={LINK}>
          For judges
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
