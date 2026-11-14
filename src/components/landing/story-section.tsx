import { BlindCompare } from "@/components/proof";
import { cx } from "@/components/ui/cx";
import { STORY_LINES, storyTitle } from "./copy";
import type { StoryProof } from "./data";
import { BAND, FRAME, HEADING, reveal } from "./parts";
import { PhoneCap } from "./phone-cap";

/**
 * The story as merit: a headline with the reviewer's own total and two short sentences, beside the
 * live slider between what she wrote and what the company reads. All of it read from the seed.
 */
export function StorySection({ story }: { story: StoryProof }) {
  const [first, second] = storyTitle(story.total);
  return (
    <section aria-labelledby="story-title" className="bg-surface">
      <div className={cx(FRAME, BAND, "grid gap-x-10 gap-y-8 min-[1024px]:grid-cols-12 min-[1024px]:items-start")}>
        {/* The story tour's first step lights this block. */}
        <div data-tour="olena-story" className="min-[1024px]:sticky min-[1024px]:top-10 min-[1024px]:col-span-5">
          <h2 id="story-title" className={HEADING} {...reveal(0)}>
            {first}
            <br />
            {second}
          </h2>
          <ol className="mt-6 flex flex-col gap-3" {...reveal(1)}>
            {STORY_LINES.map((line) => (
              <li key={line} className="text-[19px] leading-[28px] text-pretty text-label min-[640px]:text-[21px] min-[640px]:leading-[30px]">
                {line}
              </li>
            ))}
          </ol>
        </div>
        <div className="min-[1024px]:col-span-7" {...reveal(1)}>
          <PhoneCap label="Show the whole answer">
            <BlindCompare
              original={story.original}
              blind={story.blind}
              hiddenCount={story.hiddenCount}
              labels={[`What ${story.personFirstName} wrote`, `What ${story.companyName} reads`]}
            />
          </PhoneCap>
        </div>
      </div>
    </section>
  );
}
