import { cx } from "@/components/ui/cx";
import { NAME_RULE, SCORE_HOW, SCORE_RULE } from "./copy";
import { ArrowLink, BAND, FRAME, reveal } from "./parts";

/** The one rule about scores, at display size, with how it works in one sentence. */
export function ScoreRule() {
  const [first, second] = SCORE_RULE.split(/(?<=\.)\s/);
  return (
    <section aria-labelledby="rule-title" className="bg-surface">
      <div className={cx(FRAME, BAND, "grid gap-x-10 gap-y-6 min-[1024px]:grid-cols-12 min-[1024px]:items-end")}>
        <h2
          id="rule-title"
          className="font-serif text-[40px] leading-[1.02] tracking-[-0.02em] text-balance text-label min-[640px]:text-[60px] min-[1100px]:text-[76px] min-[1024px]:col-span-7"
          {...reveal(0)}
        >
          {first}
          <br />
          <span className="text-label-2">{second}</span>
        </h2>
        <div className="min-[1024px]:col-span-5 min-[1024px]:pb-2" {...reveal(1)}>
          <p className="text-[19px] leading-[28px] text-pretty text-label min-[640px]:text-[21px] min-[640px]:leading-[30px]">
            {SCORE_HOW} {NAME_RULE}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6">
            <ArrowLink href="/how-it-works" className="text-[17px]">
              How it works
            </ArrowLink>
            <ArrowLink href="/for-judges" className="text-[17px]">
              Evidence for judges
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
