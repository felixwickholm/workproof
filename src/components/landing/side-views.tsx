import type { ReactNode } from "react";
import { FairnessPanel } from "@/components/city/fairness-panel";
import { formatHours } from "@/components/city/format";
import { MeetingOpener } from "@/components/company/meeting-opener";
import { EspooFlowMap } from "@/components/espoo-map";
import { BlindText, FeedbackQuote, PipelineBar, TaskCard } from "@/components/proof";
import { CompanyMark } from "@/components/ui/avatar";
import { ProofKindTag } from "@/components/ui/tag";
import { StatTile } from "@/components/ui/stat-tile";
import type { LandingData } from "./data";

/**
 * A real screen region in a thin frame, with a second, smaller real fragment laid over its lower
 * corner and tilted by a degree. No browser chrome: the product itself is the picture.
 */
function LayeredScreen({ screen, over, label }: { screen: ReactNode; over: ReactNode; label: string }) {
  return (
    <figure aria-label={label} className="relative pb-2">
      <div className="rounded-[30px] border border-separator bg-ground p-2 min-[640px]:p-2.5">{screen}</div>
      <div className="relative z-10 -mt-16 ml-auto w-[88%] max-w-[400px] rotate-[1.5deg] rounded-[24px] shadow-[0_18px_48px_-12px_rgba(0,0,0,0.28)] min-[640px]:-mr-3 min-[640px]:w-[62%] min-[1024px]:-mr-6">
        {over}
      </div>
    </figure>
  );
}

/** The app's own surface with its greeting as the large title, then its panels. */
function AppScreen({ greeting, children }: { greeting: string; children: ReactNode }) {
  return (
    <div data-ui className="rounded-[22px] bg-surface p-4 pb-20 min-[640px]:p-6 min-[640px]:pb-20">
      <p className="px-1 font-serif text-[26px] leading-[30px] tracking-[-0.01em] text-pretty text-label min-[640px]:text-[30px] min-[640px]:leading-[34px]">
        {greeting}
      </p>
      <div className="mt-5 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <p className="px-1 text-[14px] leading-5 font-semibold text-label">{children}</p>;
}

const INSET = "rounded-[18px] bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]";

/** Olena's home (her passport and today's tasks), with Anna's invitation laid over it. */
export function SeekerView({ seeker }: { seeker: LandingData["seeker"] }) {
  const { invitation } = seeker;
  const screen = (
    <AppScreen greeting={`Good morning, ${seeker.firstName}. ${seeker.fact}`}>
      <div className={`${INSET} flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3`}>
        <span className="text-[14px] leading-5 font-semibold text-label">Your passport</span>
        <span className="text-[14px] leading-5 text-label-2 tnum">
          {seeker.counts.proofs} proofs · {seeker.counts.readByPeople} read by people · {seeker.counts.writtenAnswers} written answers
        </span>
      </div>
      <PanelTitle>Tasks open today</PanelTitle>
      {seeker.tasks.map((task) => (
        <TaskCard
          key={task.challenge.id}
          variant="row"
          challenge={task.challenge}
          companies={seeker.companies}
          href={`/challenges/${task.challenge.id}`}
          mine={task.mine}
        />
      ))}
    </AppScreen>
  );
  const over = invitation ? (
    <article className={`${INSET} p-5`}>
      <div className="mb-4 flex items-center gap-3">
        <CompanyMark company={{ id: invitation.companyName, name: invitation.companyName }} size="sm" />
        <p className="text-[14px] leading-5 text-label-2">
          {invitation.sector} · {invitation.district} · {invitation.slot}
        </p>
      </div>
      <FeedbackQuote reviewer={invitation.reviewer} companyName={invitation.companyName} feedback={invitation.feedback} decision="meet" />
      <div className="mt-5 flex flex-wrap gap-2" aria-hidden>
        <span className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-accent-ink">Accept and share my name</span>
        <span className="inline-flex h-10 items-center rounded-full bg-fill px-5 text-[15px] font-semibold text-label">Later</span>
      </div>
    </article>
  ) : null;
  return <LayeredScreen label="Olena's home, with her invitation" screen={screen} over={over} />;
}

/** Kaari Home Care's queue in arrival order, with the card a meeting starts from laid over it. */
export function EmployerView({ employer }: { employer: LandingData["employer"] }) {
  const screen = (
    <AppScreen greeting={employer.greeting}>
      <div className={`${INSET} p-4`}>
        <PanelTitle>Next in your queue</PanelTitle>
        <p className="mt-0.5 px-1 text-[13px] leading-[18px] text-label-2">Work only. No names, no photos, no scores.</p>
        <ul className="mt-3 flex flex-col gap-2">
          {employer.queue.map((proof) => (
            <li key={proof.proofId} className="rounded-[14px] bg-surface px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[15px] leading-5 font-semibold text-label">{proof.label}</span>
                <ProofKindTag kind={proof.proofKind} className="h-6 px-2.5 text-caption" />
              </div>
              <p className="mt-1 truncate text-[14px] leading-5 text-label">{proof.challengeTitle}</p>
              <BlindText text={proof.work.split("\n")[0]} className="mt-0.5 line-clamp-1 text-[14px] leading-5 text-label-2" />
            </li>
          ))}
        </ul>
      </div>
      <div className={`${INSET} p-4`}>
        <PanelTitle>From task to meeting</PanelTitle>
        <PipelineBar stages={employer.pipeline} className="mt-4" />
      </div>
    </AppScreen>
  );
  return <LayeredScreen label="The employer's queue, with the meeting opener" screen={screen} over={<MeetingOpener explain={employer.opener} />} />;
}

/** The city's outcome tiles and the map of work reaching companies, with the fairness audit laid over them. */
export function CityView({ city, map }: { city: LandingData["city"]; map: LandingData["map"] }) {
  const { totals } = city;
  const screen = (
    <AppScreen greeting={city.greeting}>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Median reply time" value={formatHours(totals.medianHoursToFirstAnswer)} caption="From proof sent to first answer." className="bg-raised" />
        <StatTile label="Meetings confirmed by both sides" value={totals.meetingsConfirmedByBoth} caption="Both tapped We met. No survey." className="bg-raised" />
      </div>
      <div className={`${INSET} grid items-center gap-4 p-4 min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]`}>
        <div>
          <PanelTitle>Proofs reaching companies</PanelTitle>
          <p className="mt-1 px-1 text-[14px] leading-5 text-label-2">Each line is one proof on its way to an employer. Labels, never names.</p>
        </div>
        <EspooFlowMap variant="compact" companies={map.companies} flows={map.flows} className="mx-auto w-full max-w-[190px]" />
      </div>
    </AppScreen>
  );
  const over = <FairnessPanel fairness={city.fairness} totals={totals} className="bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]" />;
  return <LayeredScreen label="The city's outcomes, with the fairness audit" screen={screen} over={over} />;
}
