import { Closing, Footer } from "./closing";
import { Comparison } from "./comparison";
import { EventFit } from "./event-fit";
import type { LandingData } from "./data";
import { FairQuestions } from "./fair-questions";
import { Hero } from "./hero";
import { MOTION_CSS } from "./motion-css";
import { PeopleDecide } from "./people-decide";
import { Statement } from "./statement";
import { StorySection } from "./story-section";
import { ThreeSides } from "./three-sides";
import { TopBar } from "./top-bar";
import { WorkMosaic } from "./work-mosaic";

/** The landing page, sections in the copy deck's order. It sits outside the app frame. */
export function LandingPage({ data }: { data: LandingData }) {
  return (
    <div className="lp-root">
      <style href="landing-motion" precedence="default">
        {MOTION_CSS}
      </style>
      <TopBar />
      <main>
        <Hero data={data} />
        <StorySection story={data.story} />
        <WorkMosaic fragments={data.fragments} />
        <ThreeSides data={data} />
        <PeopleDecide />
        <Comparison />
        <Statement />
        <EventFit />
        <FairQuestions />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
