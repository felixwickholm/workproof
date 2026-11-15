import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Footer } from "./kit/footer";
import { loadHowItWorksData } from "./kit/load";
import { MOTION_CSS } from "./kit/motion-css";
import { ArrowLink, BAND, FRAME, HEADING, SECTION, reveal } from "./kit/parts";
import { TopBar } from "./kit/top-bar";
import { StartActions } from "./kit/start-actions";
import { cx } from "@/components/ui/cx";
import { AI_DOES, AI_NEVER, COMPARISON, FAIR_QUESTIONS, PRECEDENT, PROMISE, SIDES, STEPS } from "./content";
import { StepFragment } from "./fragments";

const description =
  "Companies see how well people do the real work before they meet them. How WorkProof works, in six steps. Demo data.";

export const metadata: Metadata = pageMeta({ title: "How it works", description, path: "/how-it-works" });

const SUB = "text-[19px] leading-[28px] text-pretty text-label-2 min-[640px]:text-[21px] min-[640px]:leading-[31px]";

/** The six steps, each beside a live fragment of the screen where it happens. */
async function Steps() {
  const data = await loadHowItWorksData();
  return (
    <ol className="flex flex-col">
      {STEPS.map((step, i) => (
        <li
          key={step.id}
          className="grid gap-x-10 gap-y-5 border-t border-separator py-10 min-[1024px]:grid-cols-12 min-[1024px]:items-center min-[1024px]:py-14"
          {...reveal(0)}
        >
          <div className="min-[1024px]:col-span-5">
            <span aria-hidden className="block font-serif text-[56px] leading-[56px] text-label-3 tnum min-[1024px]:text-[72px] min-[1024px]:leading-[72px]">
              {i + 1}
            </span>
            <h3 className="mt-3 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-balance text-label min-[640px]:text-[34px] min-[640px]:leading-[40px]">
              {step.headline}
            </h3>
            <p className={cx(SUB, "mt-3")}>{step.sentence}</p>
          </div>
          <div className="rounded-[28px] bg-surface p-3 min-[640px]:p-5 min-[1024px]:col-span-7">
            <StepFragment id={step.id} data={data} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="lp-root">
      <style href="landing-motion" precedence="default">
        {MOTION_CSS}
      </style>
      <TopBar />
      <main>
        <section aria-labelledby="how-title" className={cx(FRAME, "pt-6 pb-4 min-[1024px]:pt-12")}>
          <h1 id="how-title" className="font-serif text-[44px] leading-[1.02] tracking-[-0.02em] text-label min-[640px]:text-[64px] min-[1100px]:text-[80px]">
            How WorkProof works
          </h1>
          <p className="mt-5 max-w-[44rem] text-[24px] leading-[32px] font-semibold tracking-[-0.015em] text-pretty text-label min-[640px]:text-[30px] min-[640px]:leading-[38px]">
            {PROMISE}
          </p>
          <p className={cx(SUB, "mt-3 max-w-[38rem]")}>Six steps, from a job ad to a follow-up. People score the work. The AI never does.</p>
        </section>

        <section aria-label="The six steps" className={cx(FRAME, "pb-8 min-[1024px]:pb-16")}>
          <Steps />
        </section>

        <section aria-labelledby="sides-title" className="bg-surface">
          <div className={cx(FRAME, BAND)}>
            <h2 id="sides-title" className={HEADING} {...reveal(0)}>
              What each side gets.
            </h2>
            <div className="mt-8 grid gap-x-8 gap-y-10 min-[900px]:grid-cols-3 min-[1024px]:mt-12">
              {SIDES.map((side) => (
                <div key={side.id} className="border-t border-separator pt-5" {...reveal(1)}>
                  <h3 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-label">{side.title}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {side.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[18px] leading-[26px] text-pretty text-label">
                        <Check aria-hidden className="mt-1 size-5 shrink-0 text-label-2" strokeWidth={2} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={side.href}
                    aria-label={side.cta}
                    className="press mt-5 inline-flex h-11 items-center rounded-full bg-raised px-5 text-[16px] font-semibold text-label shadow-[inset_0_0_0_1px_var(--color-separator)] hover:shadow-[inset_0_0_0_1.5px_var(--color-control)]"
                  >
                    Open this view
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="ai-title" className={cx(FRAME, SECTION)}>
          <h2 id="ai-title" className={HEADING} {...reveal(0)}>
            What the AI does, and never does.
          </h2>
          <div className="mt-8 grid gap-6 min-[768px]:grid-cols-2 min-[1024px]:mt-12">
            <div className="rounded-[28px] bg-surface p-6 min-[1024px]:p-8" {...reveal(1)}>
              <h3 className="text-[22px] leading-[28px] font-semibold text-label">The AI does</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {AI_DOES.map((line) => (
                  <li key={line} className="flex gap-3 text-[19px] leading-[28px] text-pretty text-label">
                    <Check aria-hidden className="mt-1 size-5 shrink-0 text-positive" strokeWidth={2.25} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] bg-surface p-6 min-[1024px]:p-8" {...reveal(2)}>
              <h3 className="text-[22px] leading-[28px] font-semibold text-label">The AI never</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {AI_NEVER.map((line) => (
                  <li key={line} className="flex gap-3 text-[19px] leading-[28px] text-pretty text-label">
                    <X aria-hidden className="mt-1 size-5 shrink-0 text-negative" strokeWidth={2.25} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="questions-title" className="bg-surface">
          <div className={cx(FRAME, BAND)}>
            <h2 id="questions-title" className={HEADING} {...reveal(0)}>
              Fair questions.
            </h2>
            <dl className="mt-8 grid gap-x-12 min-[1024px]:mt-12 min-[1024px]:grid-cols-2">
              {FAIR_QUESTIONS.map(({ question, answer }, i) => (
                <div key={question} className="border-t border-separator py-5 min-[1024px]:py-6" {...reveal((i % 2) + 1)}>
                  <dt className="text-[20px] leading-[27px] font-semibold tracking-[-0.01em] text-pretty text-label min-[640px]:text-[22px] min-[640px]:leading-[29px]">
                    {question}
                  </dt>
                  <dd className="mt-2 text-[18px] leading-[27px] text-pretty text-label-2">{answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="different-title" className={cx(FRAME, SECTION, "grid gap-x-8 gap-y-8 min-[1024px]:grid-cols-12")}>
          <h2 id="different-title" className={cx(HEADING, "min-[1024px]:col-span-4")} {...reveal(0)}>
            Different on purpose.
          </h2>
          <div className="min-[1024px]:col-span-8" {...reveal(1)}>
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="w-1/2 pr-4 pb-4 text-[16px] leading-[22px] font-medium text-label-2">
                    Most recruiting AI
                  </th>
                  <th scope="col" className="w-1/2 pb-4 text-[16px] leading-[22px] font-semibold text-label">
                    WorkProof
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([them, us]) => (
                  <tr key={us} className="border-t border-separator">
                    <td className="py-5 pr-4 align-top text-[17px] leading-[24px] text-label-2 min-[640px]:text-[19px] min-[640px]:leading-[27px]">{them}</td>
                    <th
                      scope="row"
                      className="py-5 align-top text-[18px] leading-[25px] font-semibold tracking-[-0.01em] text-label min-[640px]:text-[22px] min-[640px]:leading-[29px]"
                    >
                      {us}
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="A Finnish precedent" className={cx(FRAME, "pb-6")}>
          <p
            className="max-w-[60rem] border-t border-separator pt-10 font-serif text-[28px] leading-[34px] tracking-[-0.01em] text-pretty text-label min-[640px]:text-[38px] min-[640px]:leading-[46px]"
            {...reveal(0)}
          >
            {PRECEDENT.before} <span lang="fi">{PRECEDENT.term}</span>. <span className="text-label-2">{PRECEDENT.after}</span>
          </p>
        </section>

        <section aria-labelledby="next-title" className={cx(FRAME, "flex flex-col items-center py-16 text-center min-[1024px]:py-24")}>
          <h2 id="next-title" className={HEADING} {...reveal(0)}>
            See it for yourself.
          </h2>
          <div className="mt-8 w-full min-[480px]:w-auto" {...reveal(1)}>
            <StartActions center />
          </div>
          <ArrowLink href="/for-judges" className="mt-2 text-[17px]">
            Evidence for judges
          </ArrowLink>
        </section>
      </main>
      <Footer />
    </div>
  );
}
