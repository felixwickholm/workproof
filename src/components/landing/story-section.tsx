import { BlindCompare, FeedbackQuote } from "@/components/proof";
import { cx } from "@/components/ui/cx";
import type { StoryProof } from "./data";
import { FRAME, HEADING, LEAD, SECTION, reveal } from "./parts";
import { PhoneCap } from "./phone-cap";

/** What a CV filter knows about Olena: three lines, none of them her work. */
const CV_LINES = ["Cleaner, 2023–now", "Degree: not recognised in Finland", "140 applications · 0 interviews"] as const;

function CvFragment() {
  return (
    <div data-ui className="rounded-card bg-surface px-5 py-4 min-[640px]:p-6">
      <p className="text-[13px] leading-[18px] font-medium text-label-2">CV as a filter sees it</p>
      <ul className="mt-2 flex flex-col gap-1 min-[640px]:mt-3 min-[640px]:gap-2">
        {CV_LINES.map((line) => (
          <li key={line} className="text-[15px] leading-5 text-label-3 tnum min-[640px]:text-[17px] min-[640px]:leading-6">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Olena's story, then the live thing: her real answer from the demo event on a slider between
 * what she wrote and what the company reads. Built on the server from the seed and the blind layer.
 */
export function StorySection({ story }: { story: StoryProof }) {
  const firstName = "Olena";
  const reviewerFirst = story.reviewer.split(" ")[0];
  return (
    <section aria-labelledby="story-title" className={cx(FRAME, SECTION)}>
      <div className="grid gap-x-8 gap-y-5 min-[640px]:gap-y-10 min-[1024px]:grid-cols-12 min-[1024px]:grid-rows-[auto_1fr]">
        {/* The walkthrough's first step lights her story and what a CV filter sees: one screen tall. */}
        <div data-tour="olena-story" className="min-[1024px]:col-span-5 min-[1024px]:row-start-1">
          <h2 id="story-title" className={HEADING} {...reveal(0)}>
            Doctor in Kyiv.
            <br />
            Cleaner in Espoo.
          </h2>
          <p className={cx(LEAD, "mt-4 text-label max-[639px]:text-[16px] max-[639px]:leading-6 min-[640px]:mt-6")} {...reveal(1)}>
            {firstName} was a doctor of internal medicine for 11 years. In Espoo she cleans offices at night. She sent 140 applications and got no interview.
            Her CV says cleaner, and names a degree nobody here knows.
          </p>
          <div className="mt-5 min-[640px]:mt-8" {...reveal(2)}>
            <CvFragment />
          </div>
        </div>

        <div className="min-[1024px]:col-span-7 min-[1024px]:col-start-6 min-[1024px]:row-span-2 min-[1024px]:row-start-1 min-[1024px]:pt-2">
          <div {...reveal(1)}>
            <PhoneCap label="Show the whole answer">
              <BlindCompare
                original={story.original}
                blind={story.blind}
                hiddenCount={story.hiddenCount}
                labels={[`What ${firstName} wrote`, `What the company reads: ${story.label}`]}
              />
            </PhoneCap>
          </div>
          <p className="mt-3 text-[14px] leading-5 text-label-2 max-[639px]:hidden min-[640px]:mt-4 min-[640px]:text-[15px] min-[640px]:leading-[22px]" {...reveal(2)}>
            <span className="min-[640px]:hidden">Switch between the two views</span>
            <span className="hidden min-[640px]:inline">Drag</span> to see what the blind layer hides: {story.hiddenCount} details, before any person or AI
            model reads it.
          </p>
        </div>

        <div className="flex flex-col gap-4 min-[640px]:gap-6 min-[1024px]:col-span-5 min-[1024px]:row-start-2" {...reveal(3)}>
          <p className="text-[16px] leading-6 text-label min-[640px]:text-[17px] min-[640px]:leading-[26px]">
            {reviewerFirst} at {story.companyName} read {story.label} and asked to meet. Only after {firstName} said yes did {reviewerFirst} see her name.
          </p>
          <FeedbackQuote reviewer={story.reviewer} companyName={story.companyName} feedback={story.feedback} decision="meet" />
        </div>
      </div>
    </section>
  );
}
