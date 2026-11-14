import { cx } from "@/components/ui/cx";
import { FRAME, HEADING, SECTION, reveal } from "./parts";

/** Most recruiting AI against Workprint, row by row. */
export const COMPARISON = [
  ["Reads a CV or a profile", "Reads 20 minutes of real work"],
  ["An algorithm gives a match score", "A person decides and signs it"],
  ["AI interviews or ranks people", "AI only drafts tasks and questions"],
  ["Silence after you apply", "A written reason with every decision; unanswered work is tracked as owed"],
  ["The city counts sign-ups", "The city sees meetings both sides confirmed"],
] as const;

/** A real table: the left column muted, Workprint's column in full ink. */
export function Comparison() {
  return (
    <section aria-labelledby="different-title" className={cx(FRAME, SECTION, "grid gap-x-8 gap-y-8 min-[1024px]:grid-cols-12")}>
      <h2 id="different-title" className={cx(HEADING, "min-[1024px]:col-span-4")} {...reveal(0)}>
        Different on purpose.
      </h2>
      <div className="min-[1024px]:col-span-8" {...reveal(1)}>
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="w-1/2 pr-4 pb-4 text-[15px] leading-5 font-medium text-label-2">
                Most recruiting AI
              </th>
              <th scope="col" className="w-1/2 pb-4 text-[15px] leading-5 font-semibold text-label">
                Workprint
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map(([them, us]) => (
              <tr key={us} className="border-t border-separator">
                <td className="py-5 pr-4 align-top text-[17px] leading-[24px] text-label-2 min-[640px]:text-[19px] min-[640px]:leading-[26px]">{them}</td>
                <th
                  scope="row"
                  className="py-5 align-top text-[19px] leading-[25px] font-semibold tracking-[-0.01em] text-label min-[640px]:text-[24px] min-[640px]:leading-[30px]"
                >
                  {us}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
