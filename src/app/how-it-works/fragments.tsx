import { ArrowDown, CameraOff, Check, EyeOff, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import type { HowItWorksData } from "./kit/data";
import { BlindText, FeedbackQuote } from "@/components/proof";
import { cx } from "@/components/ui/cx";
import type { StepId } from "./content";

/** A product card as it looks in the app: raised, hairline edge, the app's own radius. */
function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-[18px] bg-raised p-4 shadow-[inset_0_0_0_1px_var(--color-separator)] min-[640px]:p-5", className)}>{children}</div>;
}

const PILL = "inline-flex h-8 items-center gap-1.5 rounded-full bg-fill px-3 text-[15px] font-medium text-label";

/** Step 1: the job-ad field, then the challenge drafted from it, with the person who approved it. */
function AdFragment({ story }: { story: HowItWorksData["story"] }) {
  return (
    <div className="flex flex-col gap-2">
      <Card className="flex items-center gap-3 py-3 min-[640px]:py-3.5">
        <Link2 aria-hidden className="size-5 shrink-0 text-label-2" strokeWidth={1.75} />
        <span className="text-[17px] text-label-2">Paste your job ad link</span>
      </Card>
      <ArrowDown aria-hidden className="mx-auto size-5 text-label-3" strokeWidth={1.75} />
      <Card>
        <p className="text-[15px] leading-[21px] text-label-2">Draft · {story.minutes} minutes</p>
        <p className="mt-1 text-[20px] leading-[27px] font-semibold tracking-[-0.01em] text-pretty text-label">{story.taskTitle}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {story.skills.map((s) => (
            <li key={s.label} className={PILL}>
              {s.label}
            </li>
          ))}
        </ul>
        {story.approvedBy ? (
          <p className="mt-4 flex items-center gap-2 text-[15px] leading-[21px] text-label">
            <Check aria-hidden className="size-4 text-positive" strokeWidth={2.25} />
            Approved by {story.approvedBy}
          </p>
        ) : null}
      </Card>
    </div>
  );
}

/** Step 2: the recording bar and the person's own thinking, as the reviewer later reads it. */
function WorkFragment({ story }: { story: HowItWorksData["story"] }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <span className={PILL}>
          <span aria-hidden className="size-2.5 rounded-full bg-negative" />
          Recording screen and voice
        </span>
        <span className={PILL}>
          <CameraOff aria-hidden className="size-4" strokeWidth={1.75} />
          No camera
        </span>
      </div>
      {story.thinking ? <BlindText text={story.thinking} className="mt-4 line-clamp-4 font-serif text-[20px] leading-[28px] text-label" /> : null}
    </Card>
  );
}

/** Step 3: the blind proof with the reviewer's points per skill, 1 to 5, and the total out of 10. */
function ScoreFragment({ story }: { story: HowItWorksData["story"] }) {
  const scored = story.skills.some((s) => s.points !== null);
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[20px] leading-[26px] font-semibold text-label">{story.label}</span>
        <span className={PILL}>
          <EyeOff aria-hidden className="size-4" strokeWidth={1.75} />
          Name hidden
        </span>
      </div>
      <BlindText text={story.blind.split("\n")[0] ?? ""} className="mt-3 line-clamp-2 text-[17px] leading-[26px] text-label-2" />
      <ul className="mt-4 flex flex-col gap-2.5 border-t border-separator pt-4">
        {story.skills.map((skill) => (
          <li key={skill.label} className="flex items-center justify-between gap-3">
            <span className="min-w-0 text-[17px] leading-[23px] text-label">{skill.label}</span>
            <span className="flex shrink-0 items-center gap-1" aria-label={skill.points === null ? "Not scored yet" : `${skill.points} of 5`}>
              {[1, 2, 3, 4, 5].map((p) => (
                <span key={p} className={cx("size-3 rounded-full", skill.points !== null && p <= skill.points ? "bg-label" : "bg-label/15")} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-[15px] leading-[21px] text-label-2">
        <span>
          Scored by {story.reviewer}, {story.companyName}
        </span>
        {scored && story.total !== null ? (
          <span>
            <span className="text-[34px] leading-[40px] text-label tnum">{story.total}</span> / 10
          </span>
        ) : (
          <span>1 to 5 points for each skill</span>
        )}
      </p>
    </Card>
  );
}

/** Step 4: the invitation as the person gets it, with the reviewer's own words. */
function InviteFragment({ invitation }: { invitation: HowItWorksData["invitation"] }) {
  if (!invitation) return null;
  return (
    <Card>
      <FeedbackQuote reviewer={invitation.reviewer} companyName={invitation.companyName} feedback={invitation.feedback} decision="meet" />
      <div aria-hidden className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-[16px] font-semibold text-accent-ink">Accept and share my name</span>
        <span className="inline-flex h-11 items-center rounded-full bg-fill px-5 text-[16px] font-semibold text-label">Not now</span>
      </div>
    </Card>
  );
}

/** Step 5: the meeting at the event, then the two things the company marks after it. */
function TalkFragment({ invitation }: { invitation: HowItWorksData["invitation"] }) {
  const rows = ["We met at the event", "Follow-up agreed"];
  return (
    <Card>
      <p className="text-[15px] leading-[21px] text-label-2">First talk, face to face</p>
      <p className="mt-1 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-label">{invitation?.slot ?? "Sat 13:30, Table 1"}</p>
      <ul className="mt-4 flex flex-col gap-2 border-t border-separator pt-4">
        {rows.map((row) => (
          <li key={row} className="flex items-center gap-3 text-[17px] leading-[24px] text-label">
            <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-positive-wash text-positive-ink">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
            {row}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Step 6: the event's steps as the city counts them, each proof once. */
function CityFragment({ impact }: { impact: HowItWorksData["impact"] }) {
  const rows = [
    { label: "Took a challenge", value: impact.took },
    { label: "Scored by a person", value: impact.scored },
    { label: "Invited", value: impact.invited },
    { label: "Met at the event", value: impact.met },
    { label: "Follow-up agreed", value: impact.followUps },
    { label: "Hired", value: impact.hires },
  ];
  const most = Math.max(1, impact.took);
  return (
    <Card>
      <span className="inline-flex h-7 items-center rounded-full bg-fill px-3 text-[14px] font-medium text-label">Demo data</span>
      <dl className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1">
            <dt className="text-[17px] leading-[23px] text-label">{row.label}</dt>
            <dd className="text-[22px] leading-[26px] text-label tnum">{row.value}</dd>
            <div aria-hidden className="col-span-2 h-2 rounded-full bg-fill">
              <div className="h-2 rounded-full bg-label/80" style={{ width: `${(row.value / most) * 100}%` }} />
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** The live product fragment beside each step, built from the demo event. */
export function StepFragment({ id, data }: { id: StepId; data: HowItWorksData }) {
  switch (id) {
    case "ad":
      return <AdFragment story={data.story} />;
    case "work":
      return <WorkFragment story={data.story} />;
    case "score":
      return <ScoreFragment story={data.story} />;
    case "invite":
      return <InviteFragment invitation={data.invitation} />;
    case "talk":
      return <TalkFragment invitation={data.invitation} />;
    case "city":
      return <CityFragment impact={data.impact} />;
  }
}
