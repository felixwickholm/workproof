import { Closing, Footer } from "./closing";
import type { LandingData } from "./data";
import { EventFlow } from "./event-flow";
import { Hero } from "./hero";
import { MapSection } from "./map-section";
import { MOTION_CSS } from "./motion-css";
import { ScoreRule } from "./score-rule";
import { StorySection } from "./story-section";
import { TopBar } from "./top-bar";

/**
 * The landing page: a front door, then a short tail. The long explanation lives in the tour and on
 * /how-it-works. It sits outside the app frame.
 */
export function LandingPage({ data }: { data: LandingData }) {
  return (
    <div className="lp-root">
      <style href="landing-motion" precedence="default">
        {MOTION_CSS}
      </style>
      <TopBar />
      <main>
        <Hero data={data} />
        <MapSection data={data} />
        <StorySection story={data.story} />
        <EventFlow />
        <ScoreRule />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
