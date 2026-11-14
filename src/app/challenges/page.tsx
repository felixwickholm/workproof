import type { Metadata } from "next";
import { ChallengeList } from "./challenge-list";

export const metadata: Metadata = { title: "Challenges · Tryout" };

export default function ChallengesPage() {
  return <ChallengeList />;
}
