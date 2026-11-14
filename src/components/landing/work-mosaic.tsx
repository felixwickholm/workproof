import type { CSSProperties } from "react";
import { AttachmentView, BlindText, taskMeta } from "@/components/proof";
import { cx } from "@/components/ui/cx";
import { ProofKindIcon } from "@/components/ui/proof-kind";
import { SpokenBadge } from "@/components/voice";
import { ROLES } from "@/lib/ai/scripted/roles";
import type { MosaicSlot, WorkFragment } from "./data";
import { MosaicGrid } from "./mosaic-grid";
import { FRAME, HEADING, LEAD, SECTION, reveal } from "./parts";

/**
 * Where each proof sits on the 12-column grid of a laptop, and how many lines of its text show.
 * The cells differ in size on purpose: a photo stands tall, a plan runs wide, a code review is long.
 */
const CELL: Record<MosaicSlot, { place: string; lines: number }> = {
  photo: { place: "min-[1024px]:col-[1/span_4] min-[1024px]:row-[1/span_2]", lines: 4 },
  plan: { place: "min-[1024px]:col-[5/span_5] min-[1024px]:row-[1]", lines: 6 },
  design: { place: "min-[1024px]:col-[10/span_3] min-[1024px]:row-[1/span_2]", lines: 6 },
  video: { place: "min-[1024px]:col-[5/span_5] min-[1024px]:row-[2]", lines: 8 },
  letter: { place: "min-[1024px]:col-[1/span_4] min-[1024px]:row-[3]", lines: 10 },
  voice: { place: "min-[1024px]:col-[5/span_5] min-[1024px]:row-[3]", lines: 10 },
  code: { place: "min-[1024px]:col-[10/span_3] min-[1024px]:row-[3]", lines: 10 },
};

/** Text line height in the cells, in pixels. */
const LINE = 22;

/**
 * Cuts a fragment after a number of lines. The clamp gives the ellipsis; the height cap holds
 * when the work has hard line breaks, which a line clamp alone lets run on.
 */
function clamp(lines: number) {
  return {
    className: cx(
      "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:var(--lines)] max-h-[calc(var(--lines)*var(--line))]",
      // A phone shows the opening of the work only; the cards stack, so every line adds page length.
      "max-[639px]:[-webkit-line-clamp:3] max-[639px]:max-h-[calc(3*var(--line))]",
    ),
    style: { "--lines": lines, "--line": `${LINE}px` } as CSSProperties,
  };
}

/** On a phone the picture is wider than tall and its description keeps to two lines. */
const PHONE_PICTURE = "max-[639px]:[&>div:first-child]:aspect-[16/10] max-[639px]:[&_figcaption>span:first-child]:line-clamp-2";

function Fragment({ fragment, order }: { fragment: WorkFragment; order: number }) {
  const cell = CELL[fragment.slot];
  const text = clamp(cell.lines);
  return (
    <article data-ui className={cx("flex flex-col rounded-card bg-surface p-5", cell.place)} {...reveal(order)}>
      <p className="flex items-center gap-2 text-[13px] leading-[18px] font-medium text-label-2">
        <ProofKindIcon kind={fragment.kind} />
        <span className="tnum">{taskMeta(fragment.minutes, fragment.kind)}</span>
        <span className="ml-auto">{fragment.label}</span>
      </p>
      <h3 className="mt-2 text-[17px] leading-[23px] font-semibold text-pretty text-label">{fragment.taskTitle}</h3>
      <p className="mt-0.5 text-[14px] leading-5 text-label-2">{fragment.companyName}</p>
      {fragment.attachment && fragment.slot !== "video" ? <AttachmentView attachment={fragment.attachment} className={cx("mt-4", PHONE_PICTURE)} /> : null}
      {fragment.attachment && fragment.slot === "video" ? (
        <div className="mt-4 grid gap-4 min-[640px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <AttachmentView attachment={fragment.attachment} size="full" className={PHONE_PICTURE} />
          <div style={text.style} className={cx(text.className, "max-[639px]:hidden")}>
            <BlindText text={fragment.work} className="text-[15px] leading-[22px] text-label" />
          </div>
        </div>
      ) : (
        // On a phone a picture and its description stand for the work; the written part shows from 640px.
        <div className={cx("mt-4", fragment.attachment && "max-[639px]:hidden")}>
          {fragment.spoken ? <SpokenBadge className="mb-3" /> : null}
          <div {...text}>
            <BlindText text={fragment.work} className="text-[15px] leading-[22px] text-label" />
          </div>
        </div>
      )}
    </article>
  );
}

/** Seven real proofs from the demo event, one for each kind of answer, set as an uneven mosaic. */
export function WorkMosaic({ fragments }: { fragments: WorkFragment[] }) {
  return (
    <section aria-labelledby="work-title" className={cx(FRAME, SECTION)}>
      <div className="grid gap-x-8 gap-y-6 min-[1024px]:grid-cols-12 min-[1024px]:items-end">
        <h2 id="work-title" className={cx(HEADING, "min-[1024px]:col-span-6")} {...reveal(0)}>
          Proof for every profession.
        </h2>
        <p className={cx(LEAD, "text-label min-[1024px]:col-span-6 min-[1024px]:pb-2")} {...reveal(1)}>
          Not every expert writes code or essays. A task can be answered with a plan, a photo of a sketch, a 30-second video, a spoken answer or a design. {ROLES.length} professions have their own task today; any other gets the nearest one or a general planning task.
        </p>
      </div>
      <MosaicGrid total={fragments.length}>
        {fragments.map((fragment, i) => (
          <Fragment key={fragment.slot} fragment={fragment} order={(i % 3) + 1} />
        ))}
      </MosaicGrid>
    </section>
  );
}
