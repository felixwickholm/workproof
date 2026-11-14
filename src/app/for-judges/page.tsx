import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { ArchitectureDiagram } from "./architecture";
import { EVAL_RESULTS, EVAL_TESTS, FIGURES, UNIT_TESTS, VERIFIED_ON } from "./evidence";
import { AI_DOES, AI_NEVER, BLIND_MISSES, BOOTH, BRIEF_QUOTES, CHECK_PATH, CRITERIA, LIMITS, PAINS, SUMMARY } from "./facts";

export const metadata: Metadata = {
  title: { absolute: "Evidence for judges · WorkProof" },
  description:
    "How WorkProof meets the City of Espoo criteria: what was built, where to see it, where it is in the code, and the test and eval numbers. Limits included.",
  alternates: { canonical: "/for-judges" },
};

const FRAME = "mx-auto w-full max-w-[1100px] px-4 min-[640px]:px-8";
const H2 = "mt-16 font-serif text-[32px] leading-[36px] tracking-[-0.01em] text-label min-[640px]:text-[40px] min-[640px]:leading-[44px]";
const P = "mt-4 max-w-[70ch] text-[17px] leading-[27px] text-label";
const TH = "border-b border-control py-3 pr-4 text-left align-bottom text-[14px] leading-5 font-semibold text-label";
const TD = "border-b border-separator py-3 pr-4 align-top text-[15px] leading-[22px] text-label";

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[6px] bg-fill px-1.5 py-0.5 font-mono text-[13px] break-words">{children}</code>;
}

function Paths({ paths }: { paths: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {paths.map((p) => (
        <li key={p}>
          {p.startsWith("/") ? (
            <Link href={p} className="underline underline-offset-2">
              {p}
            </Link>
          ) : (
            <Code>{p}</Code>
          )}
        </li>
      ))}
    </ul>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-5 text-[17px] leading-[26px] text-label">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** A server-rendered evidence page: every claim with where to see it, where it is in the code and its number. */
export default function ForJudgesPage() {
  return (
    <>
      <header className={`${FRAME} flex h-[72px] items-center gap-2`}>
        <Wordmark className="mr-auto" />
        <Link href="/" className="inline-flex h-11 items-center px-3 text-[15px] text-label-2 hover:text-label">
          Back to the start page
        </Link>
        <ThemeToggle />
      </header>

      <main className={`${FRAME} pt-8 pb-24`}>
        <h1 className="font-serif text-[44px] leading-[1] tracking-[-0.02em] text-label min-[640px]:text-[64px]">Evidence for judges</h1>
        <p className="mt-6 max-w-[70ch] text-[19px] leading-[30px] text-label">{SUMMARY}</p>
        <p className="mt-4 text-[15px] leading-[22px] text-label-2">
          Made for Espoo&apos;s talent events for highly educated professionals, where a degree from abroad too often goes unread. Built for the City of Espoo challenge, Junction 2026. Demo data. All people and companies are invented. Numbers checked on {VERIFIED_ON}.
        </p>

        <p className="mt-6 max-w-[70ch] text-[17px] leading-[27px] text-label">
          <span className="font-semibold">{FIGURES.plantedReached}</span> planted identity details reached a reviewer.{" "}
          <span className="font-semibold">{FIGURES.secondSetHidden}</span> identity forms hidden in a harder second case set; the {BLIND_MISSES.length} misses are{" "}
          {BLIND_MISSES.join(", ")}.
        </p>

        <section aria-labelledby="check">
          <h2 id="check" className={H2}>
            Check it in 2 minutes
          </h2>
          <ol className="mt-4 flex max-w-[70ch] list-decimal flex-col gap-2 pl-5 text-[17px] leading-[26px] text-label">
            {CHECK_PATH.map((step) => (
              <li key={step.path}>
                <Link href={step.path} className="font-medium underline underline-offset-2">
                  {step.path}
                </Link>
                : {step.what}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="booth">
          <h2 id="booth" className={H2}>
            Shaped at the Espoo booth
          </h2>
          <p className={P}>{BOOTH.intro}</p>
          <ul className="mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-5 text-[17px] leading-[26px] text-label">
            {BOOTH.answers.map((a) => (
              <li key={a.risk}>
                <span className="font-semibold">{a.risk}</span> {a.answer}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="brief">
          <h2 id="brief" className={H2}>
            The challenge in the City of Espoo&apos;s words
          </h2>
          {BRIEF_QUOTES.map((quote) => (
            <blockquote key={quote} className="mt-5 max-w-[70ch] border-l-2 border-accent pl-4 text-[18px] leading-[28px] text-label">
              {quote}
            </blockquote>
          ))}
        </section>

        <section aria-labelledby="criteria">
          <h2 id="criteria" className={H2}>
            How WorkProof meets each criterion
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={TH}>
                    Criterion
                  </th>
                  <th scope="col" className={TH}>
                    What we built
                  </th>
                  <th scope="col" className={TH}>
                    Where to see it
                  </th>
                  <th scope="col" className={TH}>
                    Where in code
                  </th>
                  <th scope="col" className={TH}>
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {CRITERIA.map((row) => (
                  <tr key={row.criterion}>
                    <th scope="row" className={`${TD} w-[150px] text-left font-semibold`}>
                      {row.criterion} ({row.weight})
                    </th>
                    <td className={TD}>{row.built}</td>
                    <td className={TD}>
                      <Paths paths={row.routes} />
                    </td>
                    <td className={TD}>
                      <Paths paths={row.code} />
                    </td>
                    <td className={TD}>{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-12 text-[22px] leading-[28px] font-semibold text-label">The brief&apos;s recurring pains</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={TH}>
                    Pain named in the brief
                  </th>
                  <th scope="col" className={TH}>
                    What WorkProof does
                  </th>
                  <th scope="col" className={TH}>
                    Where in code
                  </th>
                  <th scope="col" className={TH}>
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {PAINS.map((row) => (
                  <tr key={row.pain}>
                    <th scope="row" className={`${TD} w-[220px] text-left font-semibold`}>
                      {row.pain}
                    </th>
                    <td className={TD}>{row.built}</td>
                    <td className={TD}>
                      <Paths paths={row.code} />
                    </td>
                    <td className={TD}>{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-12 text-[22px] leading-[28px] font-semibold text-label">Limits</h3>
          <List items={LIMITS} />
        </section>

        <section aria-labelledby="ai">
          <h2 id="ai" className={H2}>
            What the AI does and never does
          </h2>
          <h3 className="mt-6 text-[18px] leading-6 font-semibold text-label">Does</h3>
          <List items={AI_DOES} />
          <h3 className="mt-6 text-[18px] leading-6 font-semibold text-label">Never does</h3>
          <List items={AI_NEVER} />
          <p className={P}>
            The guard is in <Code>src/lib/guard/no-judgement.ts</Code>. WorkProof has no automated decision feature. A decision is recorded with the name of a reviewer registered for the company and a written reason. This demo has no sign-in, so the name is not verified.
          </p>
        </section>

        <section aria-labelledby="evals">
          <h2 id="evals" className={H2}>
            Evals
          </h2>
          <p className={P}>
            On {VERIFIED_ON}: <Code>{UNIT_TESTS.command}</Code> ran {UNIT_TESTS.tests} unit tests in {UNIT_TESTS.files} files, {UNIT_TESTS.passed} passed.{" "}
            <Code>{EVAL_TESTS.command}</Code> ran {EVAL_TESTS.tests} eval tests in {EVAL_TESTS.files} files, {EVAL_TESTS.passed} passed. No API keys are needed
            for either.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={TH}>
                    Suite
                  </th>
                  <th scope="col" className={TH}>
                    Check
                  </th>
                  <th scope="col" className={TH}>
                    Result
                  </th>
                  <th scope="col" className={TH}>
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {EVAL_RESULTS.map((row) => (
                  <tr key={row.check}>
                    <td className={TD}>{row.suite}</td>
                    <td className={TD}>{row.check}</td>
                    <td className={`${TD} font-semibold tabular-nums`}>{row.result}</td>
                    <td className={TD}>
                      <Code>{row.file}</Code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="try">
          <h2 id="try" className={H2}>
            Try it in 2 minutes
          </h2>
          <ul className="mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-5 text-[17px] leading-[26px] text-label">
            <li>
              <Link href="/?tour=1" className="underline underline-offset-2">
                The guided walkthrough
              </Link>
              : Olena&apos;s story from task to meeting, in nine steps.
            </li>
            <li>
              <Link href="/try" className="underline underline-offset-2">
                A 2-minute task
              </Link>
              : answer one task and see the blind proof a company would read.
            </li>
            <li>
              <Link href="/seeker" className="underline underline-offset-2">
                Looking for work
              </Link>
              ,{" "}
              <Link href="/employer" className="underline underline-offset-2">
                Hiring
              </Link>{" "}
              and{" "}
              <Link href="/city" className="underline underline-offset-2">
                City of Espoo
              </Link>
              : the three modes.
            </li>
          </ul>
        </section>

        <section aria-labelledby="architecture">
          <h2 id="architecture" className={H2}>
            Architecture
          </h2>
          <p className={P}>
            One Next.js app. Pages and the JSON API call the service rules. The rules pass work through the blind layer before anyone reads it (rules remove known personal details; some can remain), check every AI
            output with the guard, and keep each visitor&apos;s demo copy in memory.
          </p>
          <div className="mt-6">
            <ArchitectureDiagram />
          </div>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy" className={H2}>
            Data and privacy
          </h2>
          <List
            items={[
              "No account and no CV. The person's private key is kept in their own browser.",
              "Reviewers and AI models read work only after the blind layer: known personal details are removed by rules, and some can remain. Responses to companies and the city carry no talent id.",
              "Accepting shows the name and contact to that company only. The organiser sees slots and labels, never names.",
              "Second look is off until the person turns it on, and can be withdrawn.",
              "Voice is turned into text; WorkProof stores only the text. Pictures are re-encoded in the browser and the server refuses a JPEG that still carries EXIF data.",
              "Each visitor's demo copy lives in memory and is dropped after 12 hours.",
            ]}
          />
        </section>

        <section aria-labelledby="synthetic">
          <h2 id="synthetic" className={H2}>
            Synthetic data statement
          </h2>
          <p className={P}>
            Every person, company, task, proof and decision in the demo is invented, including Olena Kovalenko and the ten employers of &ldquo;Espoo Talent
            Day&rdquo;. Email addresses use example.org and phone numbers are placeholders. Any likeness to a real person or company is accidental. The seed is
            in <Code>src/lib/seed</Code>.
          </p>
          <p className="mt-8 text-[15px] leading-[22px] text-label-2">
            A plain-text summary for language models is at{" "}
            <a href="/llms.txt" className="underline underline-offset-2">
              /llms.txt
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
