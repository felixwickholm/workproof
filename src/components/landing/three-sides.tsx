import { cx } from "@/components/ui/cx";
import type { LandingData } from "./data";
import { FRAME, HEADING, SECTION, reveal } from "./parts";
import { CityView, EmployerView, SeekerView } from "./side-views";
import { ThreeSidesTabs, type Side } from "./three-sides-tabs";

/** The three modes of one event, each with its line, three points and a live view built from the demo data. */
export function ThreeSides({ data }: { data: LandingData }) {
  const sides: Side[] = [
    {
      id: "seeker",
      label: "Looking for work",
      line: "Do a task. A person decides, always with a written reason.",
      points: ["Tasks from Espoo companies", "A proof passport", "Invitations with the reviewer's own words"],
      href: "/seeker",
      view: <SeekerView seeker={data.seeker} />,
    },
    {
      id: "employer",
      label: "Hiring",
      line: "Read work, not CVs.",
      points: [
        "Say your need in one sentence or by voice",
        "10 wishes become 3 to 5 core skills",
        "A blind queue in arrival order",
        "A written reason with every decision",
      ],
      href: "/employer",
      view: <EmployerView employer={data.employer} />,
    },
    {
      id: "city",
      label: "City of Espoo",
      line: "See what happened, not who signed up.",
      points: ["Answers given and answers still owed", "Meetings both sides confirmed", "Tasks and proofs by skill", "A fairness audit"],
      href: "/city",
      view: <CityView city={data.city} map={data.map} />,
    },
  ];

  return (
    <section id="how-it-works" aria-labelledby="sides-title" className={cx(FRAME, SECTION, "scroll-mt-6")}>
      <h2 id="sides-title" className={cx(HEADING, "mb-8 min-[1024px]:mb-12")} {...reveal(0)}>
        Three sides, one event.
      </h2>
      <div {...reveal(1)}>
        <ThreeSidesTabs sides={sides} />
      </div>
    </section>
  );
}
