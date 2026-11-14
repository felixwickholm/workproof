import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { cx } from "@/components/ui/cx";
import { DISPLAY, FRAME, reveal } from "./parts";
import { DEMO_LINE, PARTNER_LINE } from "./quiet-line";
import { StartActions } from "./tour-button";

/** What the demo runs on, by name. Optional services are marked as such. */
export const BUILT_WITH = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Vitest",
  "Playwright",
  "AI: Claude or Gemini, optional",
  "Voice: Web Speech API or ElevenLabs, optional",
] as const;

const FOOT_LINK = "inline-flex min-h-11 items-center text-[15px] font-medium text-label underline-offset-4 hover:underline";

/** The closing line at display size and the same three ways in as the hero. */
export function Closing() {
  return (
    <section aria-labelledby="close-title" className={cx(FRAME, "flex flex-col items-center py-16 text-center min-[1024px]:py-24")}>
      <h2 id="close-title" className={cx(DISPLAY, "max-[639px]:text-[34px]")} {...reveal(0)}>
        Work first. Names last.
        <br />
        People decide.
      </h2>
      <div className="mt-10 w-full min-[480px]:w-auto" {...reveal(1)}>
        <StartActions center />
      </div>
    </section>
  );
}

/** Partner and demo lines, the evidence links and what the demo is built with. */
export function Footer() {
  return (
    <footer className="bg-surface">
      <div className={cx(FRAME, "grid gap-x-8 gap-y-8 py-12 min-[1024px]:grid-cols-12 min-[1024px]:py-16")}>
        <div className="min-[1024px]:col-span-6">
          <Wordmark />
          <p className="mt-3 text-[15px] leading-[22px] text-label">{PARTNER_LINE}</p>
          <p className="text-[15px] leading-[22px] text-label-2">{DEMO_LINE}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 min-[1024px]:col-span-6 min-[1024px]:justify-end">
          <Link href="/for-judges" className={FOOT_LINK}>
            Evidence for judges
          </Link>
          <a href="/llms.txt" className={FOOT_LINK}>
            llms.txt
          </a>
        </nav>
        <p className="text-[14px] leading-[22px] text-label-2 min-[1024px]:col-span-12">Built with {BUILT_WITH.join(" · ")}</p>
      </div>
    </footer>
  );
}
